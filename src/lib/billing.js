export const TRIAL_DAYS = 7
export const PLAN_PRICE = 19.9
export const PLAN_NAME = 'DriverCash PRO'
export const CHECKOUT_URL = import.meta.env.VITE_HOTMART_CHECKOUT_URL || ''

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
