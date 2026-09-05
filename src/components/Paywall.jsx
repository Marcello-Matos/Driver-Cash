import React from 'react'
import { Truck, Check, Lock, LogOut, RefreshCw, ExternalLink } from 'lucide-react'
import { useStore } from '../store'
import { CHECKOUT_URL, PLAN_NAME, PLAN_PRICE } from '../lib/billing'
import { brl } from '../lib/utils'

const FEATURES = [
  'Ganhos, despesas e lucro real por dia e por mês',
  'Controle de combustível e manutenção',
  'Metas mensais e resumo diário',
  'Relatórios, gráficos e calendário',
  'Acesso pelo celular (app instalável)'
]

export default function Paywall() {
  const { session, subscription, signOut, reload, loading } = useStore()
  const email = session?.user?.email || ''
  const status = subscription?.status

  const title = status === 'past_due'
    ? 'Pagamento pendente'
    : status === 'canceled' || status === 'refunded'
      ? 'Assinatura encerrada'
      : 'Seu período de teste terminou'

  const subtitle = status === 'past_due'
    ? 'Identificamos um atraso na sua assinatura. Regularize o pagamento para continuar usando o DriverCash.'
    : status === 'canceled' || status === 'refunded'
      ? 'Sua assinatura foi cancelada. Assine novamente para voltar a usar o DriverCash.'
      : 'Esperamos que tenha gostado dos 7 dias grátis! Assine para continuar controlando seus ganhos.'

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
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{subtitle}</p>

        <div className="rounded-2xl border-2 border-brand-500 bg-brand-50 dark:bg-brand-500/10 p-5 mb-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">{PLAN_NAME}</div>
          <div className="flex items-end gap-1 mt-1">
            <span className="text-3xl font-extrabold">{brl(PLAN_PRICE)}</span>
            <span className="text-sm text-slate-500 dark:text-slate-400 mb-1">/mês</span>
          </div>
          <ul className="mt-4 space-y-2">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
                <Check size={16} className="text-brand-500 mt-0.5 shrink-0" /> {f}
              </li>
            ))}
          </ul>
        </div>

        {CHECKOUT_URL ? (
          <a
            href={CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full justify-center py-3 text-base"
          >
            Assinar agora <ExternalLink size={16} />
          </a>
        ) : (
          <div className="text-sm text-center text-amber-500 border border-amber-300 rounded-xl p-3">
            Link de pagamento ainda não configurado.
          </div>
        )}

        <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4">
          Use o e-mail <b className="text-slate-700 dark:text-slate-200">{email}</b> na compra para liberar o acesso automaticamente.
          Pix, cartão ou boleto via Hotmart.
        </p>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button onClick={reload} disabled={loading} className="btn-ghost text-sm">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Já paguei, verificar
          </button>
          <button onClick={signOut} className="btn-ghost text-sm text-slate-500">
            <LogOut size={15} /> Sair
          </button>
        </div>
      </div>
    </div>
  )
}
