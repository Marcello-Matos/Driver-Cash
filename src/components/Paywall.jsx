import React, { useState } from 'react'
import { Truck, Check, Lock, LogOut, RefreshCw, ExternalLink, Star } from 'lucide-react'
import { useStore } from '../store'
import { PLANS, PLAN_NAME, verifyPayment } from '../lib/billing'
import { brl } from '../lib/utils'

const FEATURES = [
  'Ganhos, despesas e lucro real por dia e por mês',
  'Controle de combustível e manutenção',
  'Metas mensais e resumo diário',
  'Relatórios, gráficos e calendário',
  'Acesso pelo celular (app instalável)'
]

export default function Paywall() {
  const { session, subscription, signOut, reload } = useStore()
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
      : 'Seu período de teste terminou'

  const subtitle = status === 'past_due'
    ? 'Identificamos um problema na cobrança da sua assinatura. Regularize no Mercado Pago para continuar.'
    : status === 'canceled' || status === 'refunded'
      ? 'Sua assinatura foi cancelada. Assine novamente para voltar a usar o DriverCash.'
      : 'Esperamos que tenha gostado dos 7 dias grátis! Assine para continuar controlando seus ganhos.'

  async function handleVerify() {
    setChecking(true)
    setMsg(null)
    const r = await verifyPayment(mpEmail)
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

  return (
    <div className="app-shell min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
      <div className="w-full max-w-md card p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-11 h-11 rounded-xl bg-brand-500 flex items-center justify-center text-white"><Truck size={24} /></div>
          <div className="text-2xl font-extrabold">Driver<span className="text-brand-500">Cash</span></div>
        </div>

        <div className="flex items-center gap-2 text-amber-500 font-semibold mb-1">
          <Lock size={18} /> {title}
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
                href={p.url}
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

          <button onClick={signOut} className="btn-ghost w-full justify-center text-sm text-slate-500 mt-2">
            <LogOut size={15} /> Sair
          </button>
        </div>
      </div>
    </div>
  )
}
