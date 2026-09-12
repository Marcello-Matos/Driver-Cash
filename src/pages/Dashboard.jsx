import React, { useMemo } from 'react'
import {
  Clock, TrendingUp, Car, DollarSign, Home, BarChart3
} from 'lucide-react'
import { useStore } from '../store'
import { useSelectedMonth } from '../components/Topbar'
import { computeMonth, computeDay } from '../lib/metrics'
import { brl, numberBR } from '../lib/utils'
import { SectionCard } from '../components/ui'

function TodayTile({ icon: Icon, iconBg, label, value }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon size={19} />
      </div>
      <div className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">{label}</div>
      <div className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{value}</div>
    </div>
  )
}

export default function Dashboard({ goTo }) {
  const store = useStore()
  const { year, month } = useSelectedMonth()

  const m = useMemo(() => computeMonth(store, year, month), [store, year, month])

  const firstName = (store.profile.name || '').trim().split(' ')[0] || 'Motorista'
  const now = new Date()
  const h = now.getHours()
  const period = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
  const todayLabel = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  // Metricas do dia atual (fallback: totais do mes)
  const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const day = useMemo(() => computeDay(store, todayISO), [store, todayISO])
  const hasToday = day.recent.length > 0 || day.gross > 0
  const T = hasToday
    ? { hours: day.hours, trips: day.trips, km: day.km, gains: day.gross }
    : { hours: m.hours, trips: m.trips, km: m.km, gains: m.totalGross }
  const ThoursLabel = `${Math.floor(T.hours)}h ${Math.round((T.hours % 1) * 60)}m`

  return (
    <div className="space-y-4">
      {/* Saudacao + botao inicio (no estilo do modelo) */}
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-2xl font-extrabold leading-tight truncate">
            {period}, {firstName}!
          </div>
          <div className="text-sm text-slate-400 capitalize">{todayLabel}</div>
        </div>
        <button
          onClick={() => goTo('hoje')}
          className="w-11 h-11 rounded-full bg-white dark:bg-slate-700 ring-1 ring-slate-200 dark:ring-slate-600 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-200 hover:text-brand-500 transition-colors"
          title="Ir para o resumo diário"
        >
          <Home size={19} />
        </button>
      </div>

      {/* Hero: ganhos no mes (amarelo, no estilo do modelo) */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 p-4 sm:p-5 flex items-center gap-4 shadow-lg shadow-amber-500/20">
        <div className="w-12 h-12 rounded-full bg-black/15 flex items-center justify-center text-white shrink-0">
          <BarChart3 size={22} />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white/90">Ganhos no mês</div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white truncate">{brl(m.totalGross)}</div>
        </div>
      </div>

      {/* Metricas do dia atual (lista, no estilo do modelo) */}
      <SectionCard title={hasToday ? 'Métricas de hoje' : 'Métricas do mês'}>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          <TodayTile icon={Clock} iconBg="bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400" label="Horas online" value={ThoursLabel} />
          <TodayTile icon={TrendingUp} iconBg="bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400" label="Corridas concluídas" value={numberBR(T.trips)} />
          <TodayTile icon={Car} iconBg="bg-orange-100 text-orange-500 dark:bg-orange-500/15 dark:text-orange-400" label="Km rodados" value={`${numberBR(T.km)} km`} />
          <TodayTile icon={DollarSign} iconBg="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400" label={hasToday ? 'Ganhos de hoje' : 'Ganhos no mês'} value={brl(T.gains)} />
        </div>
      </SectionCard>
    </div>
  )
}
