import { createClient } from '@supabase/supabase-js'

const MP_API = 'https://api.mercadopago.com'
const GRACE_DAYS = 5
const DAY = 86400000

export const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

export function env(name, fallback) {
  return process.env[name] || fallback
}

export function supabaseAdmin() {
  const url = env('SUPABASE_URL', env('VITE_SUPABASE_URL'))
  const key = env('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY ausentes')
  return createClient(url, key, { auth: { persistSession: false } })
}

async function mpGet(path) {
  const token = env('MP_ACCESS_TOKEN')
  if (!token) throw new Error('MP_ACCESS_TOKEN ausente')
  const res = await fetch(`${MP_API}${path}`, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error(`Mercado Pago ${res.status} em ${path}`)
  return res.json()
}

export const getPreapproval = (id) => mpGet(`/preapproval/${id}`)
export const getAuthorizedPayment = (id) => mpGet(`/authorized_payments/${id}`)

export async function searchPreapprovalsByEmail(email) {
  const q = new URLSearchParams({ payer_email: email, sort: 'date_created:desc', limit: '10' })
  const data = await mpGet(`/preapproval/search?${q}`)
  return data.results || []
}

// Mapeia o status do Mercado Pago para o status usado no app
function mapStatus(mpStatus) {
  switch (mpStatus) {
    case 'authorized': return 'active'
    case 'paused': return 'past_due'
    case 'cancelled': return 'canceled'
    case 'pending': return 'inactive'
    default: return 'inactive'
  }
}

/**
 * Converte uma assinatura (preapproval) do MP em uma linha da tabela subscriptions.
 * `appEmail` é o e-mail de login no app (quando conhecido). Caso contrário usa o payer_email.
 */
export function rowFromPreapproval(pre, appEmail) {
  const payerEmail = (pre.payer_email || '').trim().toLowerCase()
  const email = (appEmail || pre.external_reference || payerEmail || '').trim().toLowerCase()
  const status = mapStatus(pre.status)

  let periodEnd = null
  if (status === 'active') {
    const next = pre.next_payment_date ? new Date(pre.next_payment_date) : null
    periodEnd = next && !Number.isNaN(next.getTime())
      ? new Date(next.getTime() + GRACE_DAYS * DAY)
      : new Date(Date.now() + (30 + GRACE_DAYS) * DAY)
  }

  return {
    email,
    status,
    plan: pre.reason || 'DriverCash PRO',
    provider: 'mercadopago',
    mp_preapproval_id: pre.id,
    payer_email: payerEmail || null,
    last_event: pre.status,
    started_at: pre.date_created || null,
    current_period_end: periodEnd ? periodEnd.toISOString() : null,
    updated_at: new Date().toISOString()
  }
}

export async function upsertSubscription(row) {
  if (!row.email) throw new Error('E-mail ausente na assinatura')
  const { error } = await supabaseAdmin().from('subscriptions').upsert(row, { onConflict: 'email' })
  if (error) throw new Error(error.message)
}
