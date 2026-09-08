import React, { useState } from 'react'
import { Crown, Check, Lock, RefreshCw, ExternalLink, Star, Sparkles, LayoutDashboard } from 'lucide-react'
import { useStore } from '../store'
import { PLANS, PLAN_NAME, FREE_EXPENSES_PER_DAY, verifyPayment, isOwnerEmail } from '../lib/billing'
import { brl } from '../lib/utils'

const FEATURES = [
  'Despesas ilimitadas (Gratuito: até ' + FREE_EXPENSES_PER_DAY + ' por dia)',
  'Resumo diário com lucro por hora e gasto por km',
  'Controle de combustível e manutenção',
  'Relatórios completos e calendário',
  'Histórico ilimitado e exportação CSV'
]

export default function Paywall({ feature, goTo }) {
  const { session, subscription, access, reload } = useStore()
  const email = session?.user?.email || ''
  const status = subscription?.status

  const [showVerify, setShowVerify] = useState(false)
  const [mpEmail, setMpEmail] = useState('')
  const [checking, setChecking] = useState(false)
  const [msg, setMsg] = useState(null)

  const title = status === 'past_due'
    ? 'Pagamento pendente'
    : status === 'canceled' || status === 'refunded'
      ? 'Assinatura encerrada'
      : feature
        ? `${feature} é exclusivo do Pro`
        : access.state === 'trial'
          ? `Você está no teste grátis (${access.daysLeft} ${access.daysLeft === 1 ? 'dia' : 'dias'} restantes)`
          : 'Você está no plano Gratuito'

  if (isOwnerEmail(email)) {
    return (
      <div className="flex items-start justify-center">
        <div className="w-full max-w-md card p-6 sm:p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white"><Crown size={24} /></div>
            <div className="text-xl font-extrabold">{PLAN_NAME}</div>
          </div>
          <div className="flex items-center justify-center gap-2 text-brand-500 font-semibold mb-1">
            <Check size={18} /> Acesso Pro liberado
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Conta do desenvolvedor ({email}) com todos os recursos do Pro desbloqueados permanentemente.
          </p>
        </div>
      </div>
    )
  }

  const subtitle = status === 'past_due'
    ? 'Identificamos um problema na cobrança da sua assinatura. Regularize no Mercado Pago para manter o Pro.'
    : status === 'canceled' || status === 'refunded'
      ? 'Sua assinatura foi cancelada e você voltou para o plano Gratuito. Assine novamente para liberar tudo.'
      : feature
        ? 'Assine o DriverCash PRO para desbloquear este recurso e todos os outros abaixo.'
        : 'Assine o DriverCash PRO e tenha controle total dos seus ganhos.'

  async function handleVerify() {
    setChecking(true)
    setMsg(null)
    const r = await verifyPayment({ mpEmail })
    setChecking(false)
    if (r.ok && r.status === 'active') {
      setMsg({ ok: true, text: 'Assinatura encontrada! Liberando acesso...' })
      await reload()
    } else if (r.ok) {
      setMsg({ ok: false, text: `Assinatura encontrada, mas com status "${r.status}". Verifique o pagamento no Mercado Pago.` })
    } else {
      setMsg({ ok: false, text: r.message })
    }
  }

  // Envia o e-mail do usuário no checkout: o Mercado Pago guarda como external_reference
  // e o webhook libera a conta certa automaticamente, mesmo se pagar com outra conta MP.
  const checkoutUrl = (p) => {
    if (!email) return p.url
    const sep = p.url.includes('?') ? '&' : '?'
    return `${p.url}${sep}payer_email=${encodeURIComponent(email)}&external_reference=${encodeURIComponent(email)}`
  }

  return (
    <div className="flex items-start justify-center">
      <div className="w-full max-w-md card p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white"><Crown size={24} /></div>
          <div className="text-xl font-extrabold">{PLAN_NAME}</div>
        </div>

        <div className="flex items-center gap-2 text-amber-500 font-semibold mb-1">
          {feature ? <Lock size={18} /> : <Sparkles size={18} />} {title}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">{subtitle}</p>

        <ul className="space-y-2 mb-5">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
              <Check size={16} className="text-brand-500 mt-0.5 shrink-0" /> {f}
            </li>
          ))}
        </ul>

        {PLANS.length === 0 ? (
          <div className="text-sm text-center text-amber-500 border border-amber-300 rounded-xl p-3">
            Link de pagamento ainda não configurado.
          </div>
        ) : (
          <div className={`grid gap-3 ${PLANS.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {PLANS.map((p) => (
              <a
                key={p.key}
                href={checkoutUrl(p)}
                target="_blank"
                rel="noopener noreferrer"
                className={`relative rounded-2xl border-2 p-4 flex flex-col items-center text-center transition hover:-translate-y-0.5
                  ${p.key === 'anual'
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                    : 'border-slate-200 dark:border-slate-700 hover:border-brand-400'}`}
              >
                {p.highlight && (
                  <span className="absolute -top-2.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-brand-500 text-white px-2 py-0.5 rounded-full">
                    <Star size={10} /> {p.highlight}
                  </span>
                )}
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{PLAN_NAME}</div>
                <div className="text-sm font-semibold mt-1">{p.label}</div>
                <div className="flex items-end gap-1 mt-2">
                  <span className="text-2xl font-extrabold">{brl(p.price)}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mb-1">{p.period}</span>
                </div>
                <span className="btn-primary w-full justify-center mt-3 text-xs py-2">
                  Assinar <ExternalLink size={13} />
                </span>
              </a>
            ))}
            <div className="col-span-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-4 flex flex-col items-center text-center">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Plano</div>
              <div className="text-sm font-semibold mt-1">Gratuito</div>
              <div className="flex items-end gap-1 mt-2">
                <span className="text-2xl font-extrabold">{brl(0)}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mb-1">para sempre</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Dashboard, ganhos, até {FREE_EXPENSES_PER_DAY} despesas por dia, veículos e metas.
              </p>
              <button
                onClick={() => goTo?.('dashboard')}
                className="btn-primary w-full justify-center mt-3 text-xs py-2"
              >
                <LayoutDashboard size={13} /> Continuar
              </button>
            </div>
          </div>
        )}

        <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4">
          Pague com Pix ou cartão pelo Mercado Pago. Use o e-mail <b className="text-slate-700 dark:text-slate-200">{email}</b> para liberar automaticamente.
        </p>

        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700">
          {!showVerify ? (
            <button onClick={() => setShowVerify(true)} className="btn-ghost w-full justify-center text-sm">
              <RefreshCw size={15} /> Já paguei, verificar
            </button>
          ) : (
            <div className="space-y-2">
              <label className="label">E-mail usado no Mercado Pago (se for diferente do login)</label>
              <input
                className="input"
                type="email"
                placeholder={email}
                value={mpEmail}
                onChange={(e) => setMpEmail(e.target.value)}
              />
              <button onClick={handleVerify} disabled={checking} className="btn-primary w-full justify-center">
                <RefreshCw size={15} className={checking ? 'animate-spin' : ''} /> {checking ? 'Verificando...' : 'Verificar pagamento'}
              </button>
              {msg && (
                <div className={`text-xs text-center ${msg.ok ? 'text-brand-500' : 'text-rose-500'}`}>{msg.text}</div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
