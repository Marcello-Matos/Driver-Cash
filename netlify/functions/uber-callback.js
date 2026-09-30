import { supabaseAdmin } from './_mp.js'
import { appUrl, readState, exchangeCode, uberGet, syncConnection } from './_uber.js'

// Redirect URI cadastrada no Uber Developer Dashboard:
//   https://SEU-APP.netlify.app/.netlify/functions/uber-callback
export default async (req) => {
  const url = new URL(req.url)
  const back = (status, message = '') => {
    const q = new URLSearchParams({ uber: status })
    if (message) q.set('uber_msg', message.slice(0, 200))
    return Response.redirect(`${appUrl()}/?${q}`, 302)
  }

  try {
    const error = url.searchParams.get('error')
    if (error) return back('error', error === 'access_denied' ? 'Autorização cancelada.' : error)

    const userId = readState(url.searchParams.get('state'))
    if (!userId) return back('error', 'Link de conexão expirado. Tente novamente.')

    const code = url.searchParams.get('code')
    if (!code) return back('error', 'A Uber não retornou o código de autorização.')

    const tokens = await exchangeCode(code)

    let driverId = null
    let driverName = null
    try {
      const me = await uberGet(tokens.access_token, '/v1/partners/me')
      driverId = me.driver_id || me.uuid || null
      driverName = [me.first_name, me.last_name].filter(Boolean).join(' ') || null
    } catch (e) {
      console.warn('uber /partners/me', e.message)
    }

    const admin = supabaseAdmin()
    const row = {
      user_id: userId,
      ...tokens,
      uber_driver_id: driverId,
      driver_name: driverName,
      connected_at: new Date().toISOString(),
      last_sync_at: null,
      last_sync_status: null,
      last_sync_error: null
    }
    const { error: dbErr } = await admin.from('uber_connections').upsert(row, { onConflict: 'user_id' })
    if (dbErr) throw new Error(dbErr.message)

    // Primeira importação (últimos 30 dias); se falhar, o app mostra o erro no status
    try { await syncConnection(admin, row) } catch (e) { console.warn('uber primeira sync', e.message) }

    return back('connected')
  } catch (err) {
    console.error('uber-callback', err)
    return back('error', err.message)
  }
}
