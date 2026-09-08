import { supabase } from './supabase'

export const TRIAL_DAYS = 7
export const PLAN_NAME = 'DriverCash PRO'

// Limites do plano Gratuito
export const FREE_EXPENSES_PER_DAY = 3
// Páginas exclusivas do Pro (as demais são liberadas no Gratuito)
export const PRO_PAGES = ['hoje', 'combustivel', 'manutencao', 'relatorios', 'calendario']
export const isProPage = (page) => PRO_PAGES.includes(page)

// Planos de assinatura do Mercado Pago (links de checkout do preapproval_plan)
// Os links são públicos e ficam como padrão; variáveis VITE_MP_* podem sobrescrever.
export const PLANS = [
  {
    key: 'mensal',
    label: 'Mensal',
    price: Number(import.meta.env.VITE_MP_PRICE_MENSAL || 19.9),
    period: '/mês',
    url: import.meta.env.VITE_MP_CHECKOUT_MENSAL || 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=be7b89bf048745a592101cdde7223bf4'
  },
  {
    key: 'anual',
    label: 'Anual',
    price: Number(import.meta.env.VITE_MP_PRICE_ANUAL || 149.9),
    period: '/ano',
    url: import.meta.env.VITE_MP_CHECKOUT_ANUAL || 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=ba0e78feb7834fb1a2c48d7ac5f99354',
    highlight: import.meta.env.VITE_MP_ANUAL_DESTAQUE || '2 meses grátis'
  }
].filter((p) => p.url)

export const CHECKOUT_URL = PLANS[0]?.url || ''

/**
 * Libera o acesso consultando o Mercado Pago.
 * - preapprovalId: id devolvido pelo MP no redirecionamento pós-pagamento (vincula direto à conta)
 * - mpEmail: e-mail alternativo da conta MP (fallback pelo botão "Já paguei")
 */
export async function verifyPayment({ mpEmail = '', preapprovalId = '' } = {}) {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) return { ok: false, message: 'Sessão expirada. Entre novamente.' }

  const res = await fetch('/.netlify/functions/mp-verify', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({ mpEmail, preapprovalId })
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) return { ok: false, message: body.message || body.error || 'Não foi possível verificar agora.' }
  return { ok: true, ...body }
}

const DAY = 86400000

// E-mails com acesso Pro permanente (dono/dev do software)
export const OWNER_EMAILS = ['marcellomatosxads@gmail.com']
export const isOwnerEmail = (email) => OWNER_EMAILS.includes((email || '').trim().toLowerCase())

/**
 * Calcula a situação de acesso do usuário.
 * Retorna { state, isPro, daysLeft, periodEnd }
 *   state: 'active' (assinante) | 'trial' (7 dias com tudo do Pro) | 'free' (plano Gratuito)
 */
export function computeAccess(subscription, profileCreatedAt, email = '', now = Date.now()) {
  if (isOwnerEmail(email)) {
    return { state: 'active', isPro: true, daysLeft: null, periodEnd: null }
  }

  if (subscription?.status === 'active') {
    const end = subscription.current_period_end ? new Date(subscription.current_period_end).getTime() : null
    if (!end || end > now) {
      return { state: 'active', isPro: true, daysLeft: end ? Math.ceil((end - now) / DAY) : null, periodEnd: end }
    }
  }

  const created = profileCreatedAt ? new Date(profileCreatedAt).getTime() : now
  const trialEnd = created + TRIAL_DAYS * DAY
  if (trialEnd > now) {
    return { state: 'trial', isPro: true, daysLeft: Math.ceil((trialEnd - now) / DAY), periodEnd: trialEnd }
  }

  return { state: 'free', isPro: false, daysLeft: 0, periodEnd: null }
}
