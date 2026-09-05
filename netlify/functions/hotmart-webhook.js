import { createClient } from '@supabase/supabase-js'

// Eventos da Hotmart (Webhook 2.0) que LIBERAM o acesso
const ACTIVATE = new Set(['PURCHASE_APPROVED', 'PURCHASE_COMPLETE', 'SWITCH_PLAN', 'UPDATE_SUBSCRIPTION_CHARGE_DATE'])
// Eventos que BLOQUEIAM o acesso
const DEACTIVATE = {
  PURCHASE_CANCELED: 'canceled',
  PURCHASE_REFUNDED: 'refunded',
  PURCHASE_CHARGEBACK: 'refunded',
  PURCHASE_EXPIRED: 'canceled',
  PURCHASE_PROTEST: 'past_due',
  PURCHASE_DELAYED: 'past_due',
  SUBSCRIPTION_CANCELLATION: 'canceled'
}

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' })

  const HOTTOK = process.env.HOTMART_HOTTOK
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!HOTTOK || !SUPABASE_URL || !SERVICE_KEY) {
    console.error('Variáveis de ambiente ausentes (HOTMART_HOTTOK, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)')
    return json(500, { error: 'Server misconfigured' })
  }

  let payload
  try {
    payload = await req.json()
  } catch {
    return json(400, { error: 'Invalid JSON' })
  }

  // Webhook 2.0 envia o token no header; a versão 1.0 envia no corpo
  const token = req.headers.get('x-hotmart-hottok') || payload?.hottok
  if (token !== HOTTOK) return json(401, { error: 'Invalid hottok' })

  const event = payload.event || payload.status
  const data = payload.data || payload
  const email = (data.buyer?.email || data.email || '').trim().toLowerCase()
  if (!email) return json(400, { error: 'Missing buyer email' })

  const purchase = data.purchase || {}
  const subscription = data.subscription || {}

  const row = {
    email,
    buyer_name: data.buyer?.name || null,
    plan: subscription.plan?.name || data.product?.name || 'DriverCash PRO',
    hotmart_transaction: purchase.transaction || data.transaction || null,
    hotmart_subscriber: subscription.subscriber?.code || null,
    last_event: event,
    updated_at: new Date().toISOString()
  }

  if (ACTIVATE.has(event)) {
    const nextCharge = purchase.date_next_charge ? new Date(purchase.date_next_charge) : null
    // Se a Hotmart não informar a próxima cobrança, dá 30 dias + 5 de tolerância
    const periodEnd = nextCharge && !Number.isNaN(nextCharge.getTime())
      ? new Date(nextCharge.getTime() + 5 * 86400000)
      : new Date(Date.now() + 35 * 86400000)
    row.status = 'active'
    row.current_period_end = periodEnd.toISOString()
    row.started_at = purchase.approved_date ? new Date(purchase.approved_date).toISOString() : new Date().toISOString()
  } else if (DEACTIVATE[event]) {
    row.status = DEACTIVATE[event]
  } else {
    // Evento que não afeta acesso (ex.: boleto impresso, carrinho abandonado)
    return json(200, { ok: true, ignored: event })
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })
  const { error } = await supabase.from('subscriptions').upsert(row, { onConflict: 'email' })
  if (error) {
    console.error('Supabase error', error)
    return json(500, { error: error.message })
  }

  return json(200, { ok: true, email, status: row.status })
}
