import { supabase } from './supabase'

export const TRIAL_DAYS = 7
export const PLAN_NAME = 'DriverCash PRO'

// Planos de assinatura do Mercado Pago (links de checkout do preapproval_plan)
export const PLANS = [
  {
    key: 'mensal',
    label: 'Mensal',
    price: Number(import.meta.env.VITE_MP_PRICE_MENSAL || 19.9),
    period: '/mês',
    url: import.meta.env.VITE_MP_CHECKOUT_MENSAL || ''
  },
  {
    key: 'anual',
    label: 'Anual',
    price: Number(import.meta.env.VITE_MP_PRICE_ANUAL || 0),
    period: '/ano',
    url: import.meta.env.VITE_MP_CHECKOUT_ANUAL || '',
    highlight: import.meta.env.VITE_MP_ANUAL_DESTAQUE || ''
  }
].filter((p) => p.url)

export const CHECKOUT_URL = PLANS[0]?.url || ''

/** Consulta o Mercado Pago pelo e-mail do usuário e libera o acesso se houver assinatura ativa. */
export async function verifyPayment(mpEmail) {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) return { ok: false, message: 'Sessão expirada. Entre novamente.' }

  const res = await fetch('/.netlify/functions/mp-verify', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({ mpEmail: mpEmail || '' })
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) return { ok: false, message: body.message || body.error || 'Não foi possível verificar agora.' }
  return { ok: true, ...body }
}

const DAY = 86400000

/**
 * Calcula a situação de acesso do usuário.
 * Retorna { state, daysLeft, periodEnd }
 *   state: 'active' | 'trial' | 'expired'
 */
export function computeAccess(subscription, profileCreatedAt, now = Date.now()) {
  if (subscription?.status === 'active') {
    const end = subscription.current_period_end ? new Date(subscription.current_period_end).getTime() : null
    if (!end || end > now) {
      return { state: 'active', daysLeft: end ? Math.ceil((end - now) / DAY) : null, periodEnd: end }
    }
  }

  const created = profileCreatedAt ? new Date(profileCreatedAt).getTime() : now
  const trialEnd = created + TRIAL_DAYS * DAY
  if (trialEnd > now) {
    return { state: 'trial', daysLeft: Math.ceil((trialEnd - now) / DAY), periodEnd: trialEnd }
  }

  return { state: 'expired', daysLeft: 0, periodEnd: null }
}
