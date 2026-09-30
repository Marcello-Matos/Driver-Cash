import crypto from 'node:crypto'
import { env, supabaseAdmin } from './_mp.js'

// Documentação: https://developer.uber.com/docs/drivers/introduction
const AUTH_BASE = 'https://auth.uber.com/oauth/v2'
const SCOPES = 'partner.accounts partner.trips partner.payments'
const PAGE_LIMIT = 50
const MAX_PAGES = 20
const MILES_TO_KM = 1.609344
const DAY = 86400000
const FIRST_SYNC_DAYS = 30
const RESYNC_OVERLAP_DAYS = 2
// Brasil (America/Sao_Paulo) é UTC-3 fixo desde 2019
const TZ = 'America/Sao_Paulo'
const TZ_OFFSET = '-03:00'

const apiBase = () =>
  env('UBER_SANDBOX') === 'true' ? 'https://sandbox-api.uber.com' : 'https://api.uber.com'

export function uberConfig() {
  const clientId = env('UBER_CLIENT_ID')
  const clientSecret = env('UBER_CLIENT_SECRET')
  const redirectUri = env('UBER_REDIRECT_URI')
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('UBER_CLIENT_ID / UBER_CLIENT_SECRET / UBER_REDIRECT_URI ausentes')
  }
  return { clientId, clientSecret, redirectUri }
}

export const isUberConfigured = () =>
  !!(env('UBER_CLIENT_ID') && env('UBER_CLIENT_SECRET') && env('UBER_REDIRECT_URI'))

// URL do app para onde o callback devolve o usuário
export function appUrl() {
  const explicit = env('APP_URL', env('URL'))
  if (explicit) return explicit.replace(/\/$/, '')
  return new URL(uberConfig().redirectUri).origin
}

// ---------------------------------------------------------------- state OAuth
// state = userId.timestamp.assinatura (HMAC com o client secret): liga o callback ao usuário
const sign = (payload) =>
  crypto.createHmac('sha256', uberConfig().clientSecret).update(payload).digest('base64url')

export function createState(userId) {
  const payload = `${userId}.${Date.now()}`
  return `${payload}.${sign(payload)}`
}

export function readState(state) {
  const parts = String(state || '').split('.')
  if (parts.length !== 3) return null
  const [userId, ts, sig] = parts
  const expected = sign(`${userId}.${ts}`)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  if (Date.now() - Number(ts) > 15 * 60 * 1000) return null
  return userId
}

export function authorizeUrl(userId) {
  const { clientId, redirectUri } = uberConfig()
  const q = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    scope: SCOPES,
    redirect_uri: redirectUri,
    state: createState(userId)
  })
  return `${AUTH_BASE}/authorize?${q}`
}

// ---------------------------------------------------------------- tokens
async function tokenRequest(params) {
  const { clientId, clientSecret, redirectUri } = uberConfig()
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    ...params
  })
  const res = await fetch(`${AUTH_BASE}/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`Uber token ${res.status}: ${data.error_description || data.error || 'erro'}`)
  return data
}

const tokenRow = (t) => ({
  access_token: t.access_token,
  refresh_token: t.refresh_token || null,
  expires_at: t.expires_in ? new Date(Date.now() + Number(t.expires_in) * 1000).toISOString() : null,
  scope: t.scope || null
})

export async function exchangeCode(code) {
  return tokenRow(await tokenRequest({ grant_type: 'authorization_code', code }))
}

async function refreshIfNeeded(admin, conn) {
  const exp = conn.expires_at ? new Date(conn.expires_at).getTime() : null
  if (!exp || exp - Date.now() > 5 * 60 * 1000 || !conn.refresh_token) return conn
  const t = tokenRow(await tokenRequest({ grant_type: 'refresh_token', refresh_token: conn.refresh_token }))
  const next = { ...conn, ...t, refresh_token: t.refresh_token || conn.refresh_token }
  await admin.from('uber_connections').update({
    access_token: next.access_token,
    refresh_token: next.refresh_token,
    expires_at: next.expires_at,
    scope: next.scope
  }).eq('user_id', conn.user_id)
  return next
}

// ---------------------------------------------------------------- API
export async function uberGet(token, path, params = {}) {
  const q = new URLSearchParams(params)
  const res = await fetch(`${apiBase()}${path}${q.toString() ? `?${q}` : ''}`, {
    headers: { Authorization: `Bearer ${token}`, 'Accept-Language': 'pt_BR' }
  })
  if (res.status === 401 || res.status === 403) {
    const err = new Error('A Uber recusou o acesso (app sem aprovação na Driver API ou conexão revogada).')
    err.code = 'unauthorized'
    throw err
  }
  if (!res.ok) throw new Error(`Uber API ${res.status} em ${path}`)
  return res.json()
}

async function fetchAll(token, path, key, fromTime, toTime) {
  const items = []
  for (let page = 0; page < MAX_PAGES; page++) {
    const data = await uberGet(token, path, {
      from_time: String(fromTime),
      to_time: String(toTime),
      limit: String(PAGE_LIMIT),
      offset: String(page * PAGE_LIMIT)
    })
    const list = data[key] || []
    items.push(...list)
    if (list.length < PAGE_LIMIT || items.length >= (data.count ?? Infinity)) break
  }
  return items
}

// ---------------------------------------------------------------- sincronização
const dayFmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' })
const localDay = (unixSeconds) => dayFmt.format(new Date(unixSeconds * 1000))
const startOfLocalDay = (ms) => Date.parse(`${dayFmt.format(new Date(ms))}T00:00:00${TZ_OFFSET}`)

const tripTime = (t) =>
  t.pickup?.timestamp || t.status_changes?.[0]?.timestamp || t.dropoff?.timestamp || null

/** Agrupa pagamentos e corridas por dia (horário de Brasília). */
export function aggregateByDay(payments, trips) {
  const days = {}
  const get = (d) => (days[d] ||= { gross: 0, trips: 0, km: 0, seconds: 0 })

  for (const p of payments) {
    if (!p.event_time) continue
    // amount = repasse líquido; cash_collected = dinheiro recebido direto do passageiro
    get(localDay(p.event_time)).gross += Number(p.amount || 0) + Number(p.cash_collected || 0)
  }
  for (const t of trips) {
    if (t.status && t.status !== 'completed') continue
    const ts = tripTime(t)
    if (!ts) continue
    const d = get(localDay(ts))
    d.trips += 1
    d.km += Number(t.distance || 0) * MILES_TO_KM
    d.seconds += Number(t.duration || 0)
  }
  return days
}

/** Sincroniza os ganhos de um motorista. Retorna { days, from, to }. */
export async function syncConnection(admin, conn) {
  const now = Date.now()
  try {
    conn = await refreshIfNeeded(admin, conn)

    const since = conn.last_sync_at
      ? new Date(conn.last_sync_at).getTime() - RESYNC_OVERLAP_DAYS * DAY
      : now - FIRST_SYNC_DAYS * DAY
    // Sempre começa no início do dia para recalcular o total do dia inteiro
    const fromTime = Math.floor(startOfLocalDay(since) / 1000)
    const toTime = Math.floor(now / 1000)

    const [payments, trips] = await Promise.all([
      fetchAll(conn.access_token, '/v1/partners/payments', 'payments', fromTime, toTime),
      fetchAll(conn.access_token, '/v1/partners/trips', 'trips', fromTime, toTime)
    ])

    const rows = Object.entries(aggregateByDay(payments, trips)).map(([date, d]) => ({
      user_id: conn.user_id,
      date,
      platform: 'Uber',
      gross: Math.round(d.gross * 100) / 100,
      trips: d.trips,
      km: Math.round(d.km * 10) / 10,
      hours: Math.round((d.seconds / 3600) * 10) / 10,
      note: 'Importado da Uber',
      source: 'uber',
      external_id: `uber:${date}`
    }))

    if (rows.length) {
      const { error } = await admin.from('earnings').upsert(rows, { onConflict: 'user_id,external_id' })
      if (error) throw new Error(error.message)
    }

    await admin.from('uber_connections').update({
      last_sync_at: new Date(now).toISOString(),
      last_sync_status: 'ok',
      last_sync_error: null
    }).eq('user_id', conn.user_id)

    return { days: rows.length, from: fromTime, to: toTime }
  } catch (err) {
    await admin.from('uber_connections').update({
      last_sync_status: err.code === 'unauthorized' ? 'unauthorized' : 'error',
      last_sync_error: err.message
    }).eq('user_id', conn.user_id)
    throw err
  }
}

export async function userFromRequest(req) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!token) return null
  const { data, error } = await supabaseAdmin().auth.getUser(token)
  if (error || !data?.user) return null
  return data.user
}
