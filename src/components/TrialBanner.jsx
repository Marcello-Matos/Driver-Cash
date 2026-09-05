import React from 'react'
import { Sparkles, AlertTriangle, ExternalLink } from 'lucide-react'
import { useStore } from '../store'
import { CHECKOUT_URL } from '../lib/billing'

export default function TrialBanner() {
  const { access } = useStore()

  const isTrial = access.state === 'trial'
  const expiringSoon = access.state === 'active' && access.daysLeft != null && access.daysLeft <= 5
  if (!isTrial && !expiringSoon) return null

  const days = access.daysLeft
  const text = isTrial
    ? `Teste grátis: ${days} ${days === 1 ? 'dia restante' : 'dias restantes'}.`
    : `Sua assinatura vence em ${days} ${days === 1 ? 'dia' : 'dias'}.`

  return (
    <div className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium
      ${isTrial ? 'bg-brand-500/15 text-brand-700 dark:text-brand-300' : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'}`}>
      {isTrial ? <Sparkles size={15} className="shrink-0" /> : <AlertTriangle size={15} className="shrink-0" />}
      <span className="flex-1">{text}</span>
      {CHECKOUT_URL && (
        <a href={CHECKOUT_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold underline underline-offset-2">
          {isTrial ? 'Assinar' : 'Renovar'} <ExternalLink size={12} />
        </a>
      )}
    </div>
  )
}
