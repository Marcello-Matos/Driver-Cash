import { json, supabaseAdmin } from './_mp.js'
import { isUberConfigured, authorizeUrl, syncConnection, userFromRequest } from './_uber.js'

// Endpoint do app. Body: { action: 'status' | 'connect' | 'sync' | 'disconnect' }
export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' })

  let body = {}
  try { body = await req.json() } catch { /* sem corpo */ }
  const action = body.action || 'status'

  try {
    const user = await userFromRequest(req)
    if (!user) return json(401, { error: 'Sessão inválida' })

    if (!isUberConfigured()) {
      return json(action === 'status' ? 200 : 503, {
        configured: false,
        connected: false,
        message: 'Integração com a Uber ainda não configurada no servidor.'
      })
    }

    const admin = supabaseAdmin()
    const { data: conn } = await admin.from('uber_connections').select('*').eq('user_id', user.id).maybeSingle()

    if (action === 'connect') {
      return json(200, { url: authorizeUrl(user.id) })
    }

    if (action === 'disconnect') {
      await admin.from('uber_connections').delete().eq('user_id', user.id)
      return json(200, { ok: true, connected: false })
    }

    if (action === 'sync') {
      if (!conn) return json(400, { error: 'Conta Uber não conectada.' })
      try {
        const result = await syncConnection(admin, conn)
        return json(200, { ok: true, ...result })
      } catch (err) {
        return json(err.code === 'unauthorized' ? 403 : 502, { ok: false, error: err.message })
      }
    }

    // status
    return json(200, {
      configured: true,
      connected: !!conn,
      driverName: conn?.driver_name || null,
      connectedAt: conn?.connected_at || null,
      lastSyncAt: conn?.last_sync_at || null,
      lastSyncStatus: conn?.last_sync_status || null,
      lastSyncError: conn?.last_sync_error || null
    })
  } catch (err) {
    console.error('uber', err)
    return json(500, { error: err.message })
  }
}
