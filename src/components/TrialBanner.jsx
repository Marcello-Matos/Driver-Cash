import React from 'react'
import { Sparkles, AlertTriangle, Crown } from 'lucide-react'
import { useStore } from '../store'

export default function TrialBanner({ goTo, page }) {
  const { access } = useStore()
  if (page === 'assinatura') return null

  const isTrial = access.state === 'trial'
  const isFree = access.state === 'free'
  const expiringSoon = access.state === 'active' && access.daysLeft != null && access.daysLeft <= 5
  if (!isTrial && !isFree && !expiringSoon) return null

  const days = access.daysLeft
  const text = isTrial
    ? `Teste grátis do Pro: ${days} ${days === 1 ? 'dia restante' : 'dias restantes'}.`
    : isFree
      ? 'Você está no plano Gratuito.'
      : `Sua assinatura vence em ${days} ${days === 1 ? 'dia' : 'dias'}.`

  const tone = isTrial
    ? 'bg-brand-500/15 text-brand-700 dark:text-brand-300'
    : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
  const Icon = isTrial ? Sparkles : isFree ? Crown : AlertTriangle

  return (
    <div className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium ${tone}`}>
      <Icon size={15} className="shrink-0" />
      <span className="flex-1">{text}</span>
      <button onClick={() => goTo('assinatura')} className="font-semibold underline underline-offset-2">
        {expiringSoon ? 'Renovar' : 'Assinar Pro'}
      </button>
    </div>
  )
}
