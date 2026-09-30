import { supabaseAdmin } from './_mp.js'
import { isUberConfigured, syncConnection } from './_uber.js'

// Sincronização automática de todos os motoristas conectados (Netlify Scheduled Function)
export const config = { schedule: '0 */3 * * *' }

export default async () => {
  if (!isUberConfigured()) return new Response('uber não configurada', { status: 200 })

  const admin = supabaseAdmin()
  const { data: conns, error } = await admin
    .from('uber_connections')
    .select('*')
    .or('last_sync_status.is.null,last_sync_status.neq.unauthorized')
    .order('last_sync_at', { ascending: true, nullsFirst: true })
    .limit(25)
  if (error) {
    console.error('uber-cron', error.message)
    return new Response(error.message, { status: 500 })
  }

  let ok = 0
  let failed = 0
  for (const conn of conns || []) {
    try { await syncConnection(admin, conn); ok++ } catch (e) { failed++; console.warn('uber-cron', conn.user_id, e.message) }
  }
  console.log(`uber-cron: ${ok} ok, ${failed} falhas`)
  return new Response(JSON.stringify({ ok, failed }), { status: 200 })
}
