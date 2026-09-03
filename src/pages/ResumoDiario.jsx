import React, { useMemo, useState } from 'react'
import {
  Target, Wallet, Gauge, DollarSign, Receipt, MapPin, Clock,
  ArrowUpRight, ArrowDownRight, ListChecks
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import { useStore } from '../store'
import { computeDay, dailySeries, weeklySeries, shiftDateISO } from '../lib/metrics'
import { brl, numberBR, todayISO, daysInMonth, ym } from '../lib/utils'
import { SectionCard } from '../components/ui'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function hoursLabel(h) {
  const hh = Math.floor(h)
  const mm = Math.round((h % 1) * 60)
  return `${hh}h ${String(mm).padStart(2, '0')}m`
}

function DiffTag({ value, unit = 'money', positiveIsGood = true }) {
  if (value == null || Number.isNaN(value)) return null
  const isUp = value >= 0
  const good = positiveIsGood ? isUp : !isUp
  const formatted = unit === 'money' ? brl(Math.abs(value))
    : unit === 'km' ? `${numberBR(Math.abs(value))} km`
    : unit === 'hours' ? hoursLabel(Math.abs(value))
    : numberBR(Math.abs(value))
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${good ? 'text-emerald-400' : 'text-rose-400'}`}>
      {isUp ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
      {isUp ? '+' : '-'}{formatted}
    </span>
  )
}

function StatCard({ icon: Icon, iconBg, label, value, subtitle, diff }) {
  return (
    <div className="rounded-2xl bg-slate-800/60 border border-slate-700/60 p-3 sm:p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-400">{label}</span>
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white ${iconBg}`}>
          <Icon size={13} />
        </div>
      </div>
      <div className="text-lg sm:text-xl font-extrabold text-white">{value}</div>
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>{subtitle}</span>
        {diff}
      </div>
    </div>
  )
}

export default function ResumoDiario({ goTo }) {
  const store = useStore()
  const [chartMode, setChartMode] = useState('diario')
  const today = todayISO()
  const yesterday = shiftDateISO(today, -1)

  const day = useMemo(() => computeDay(store, today), [store, today])
  const prevDay = useMemo(() => computeDay(store, yesterday), [store, yesterday])

  const { year, month } = ym(today)
  const totalDaysInMonth = daysInMonth(year, month)
  const dailyGoal = store.goals?.monthly ? store.goals.monthly / totalDaysInMonth : 0
  const goalPct = dailyGoal ? Math.min(100, (day.net / dailyGoal) * 100) : 0

  const dGross = day.gross - prevDay.gross
  const dExpenses = day.expensesTotal - prevDay.expensesTotal
  const dKm = day.km - prevDay.km
  const dHours = day.hours - prevDay.hours
  const dNet = day.net - prevDay.net
  const dCostPerKm = day.costPerKm - prevDay.costPerKm

  const series = useMemo(
    () => (chartMode === 'diario' ? dailySeries(store, 7, today) : weeklySeries(store, 6, today)),
    [store, chartMode, today]
  )

  const dateLabel = new Date(today + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long'
  })

  return (
    <div className="space-y-4 sm:space-y-6 -m-4 sm:-m-6 p-4 sm:p-6 bg-slate-950 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">{greeting()}, {store.profile.name.split(' ')[0]}! 👋</h1>
          <p className="text-xs text-slate-400 capitalize">{dateLabel}</p>
        </div>
        <button
          onClick={() => goTo('configuracoes')}
          className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-semibold overflow-hidden shrink-0"
        >
          {store.profile.avatar_url ? (
            <img src={store.profile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            store.profile.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
          )}
        </button>
      </div>

      {/* Meta do dia */}
      <div className="rounded-2xl bg-slate-800/60 border border-slate-700/60 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Target size={16} className="text-brand-400" /> Meta do dia
          </div>
          <button onClick={() => goTo('metas')} className="text-xs text-brand-400 hover:underline">Editar meta</button>
        </div>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-300">{brl(dailyGoal)}</span>
          <span className="text-brand-400 font-semibold">{Math.round(goalPct)}% concluída</span>
        </div>
        <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-500" style={{ width: `${goalPct}%` }} />
        </div>
      </div>

      {/* Hero cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-4 text-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/80">GANHO LÍQUIDO HOJE</span>
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center"><Wallet size={16} /></div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold mt-2">{brl(day.net)}</div>
          <div className="mt-1 flex items-center gap-1 text-xs">
            <DiffTag value={dNet} unit="money" />
            <span className="text-white/70">em relação a ontem</span>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 p-4 text-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/80">GASTO POR KM</span>
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center"><Gauge size={16} /></div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold mt-2">{brl(day.costPerKm)}</div>
          <div className="mt-1 flex items-center gap-1 text-xs">
            <DiffTag value={dCostPerKm} unit="money" positiveIsGood={false} />
            <span className="text-white/70">vs ontem</span>
          </div>
        </div>
      </div>

      {/* Small stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={DollarSign} iconBg="bg-emerald-500" label="FATURAMENTO" value={brl(day.gross)} subtitle={`${day.trips} corridas`} diff={<DiffTag value={dGross} unit="money" />} />
        <StatCard icon={Receipt} iconBg="bg-rose-500" label="DESPESAS" value={brl(day.expensesTotal)} subtitle="Hoje" diff={<DiffTag value={dExpenses} unit="money" positiveIsGood={false} />} />
        <StatCard icon={MapPin} iconBg="bg-blue-500" label="KM RODADOS" value={`${numberBR(day.km)} km`} subtitle="Hoje" diff={<DiffTag value={dKm} unit="km" />} />
        <StatCard icon={Clock} iconBg="bg-violet-500" label="TEMPO ONLINE" value={hoursLabel(day.hours)} subtitle="Hoje" diff={<DiffTag value={dHours} unit="hours" />} />
      </div>

      {/* Chart */}
      <SectionCard
        className="!bg-slate-800/60 !border !border-slate-700/60"
        title="Evolução dos ganhos"
        action={
          <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-1">
            <button
              onClick={() => setChartMode('diario')}
              className={`text-xs font-semibold px-3 py-1 rounded-md transition ${chartMode === 'diario' ? 'bg-brand-500 text-white' : 'text-slate-400'}`}
            >Diário</button>
            <button
              onClick={() => setChartMode('semanal')}
              className={`text-xs font-semibold px-3 py-1 rounded-md transition ${chartMode === 'semanal' ? 'bg-brand-500 text-white' : 'text-slate-400'}`}
            >Semanal</button>
          </div>
        }
      >
        <div className="h-[200px] -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gHoje" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v) => brl(v)}
                contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area type="monotone" dataKey="ganhos" name="Ganhos" stroke="#22c55e" strokeWidth={2} fill="url(#gHoje)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      {/* Últimas corridas + Resumo do dia */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SectionCard
          className="!bg-slate-800/60 !border !border-slate-700/60"
          title="Últimos lançamentos"
          action={<button onClick={() => goTo('ganhos')} className="text-xs font-semibold text-brand-400 hover:underline">Ver todas</button>}
        >
          {day.recent.length === 0 && <div className="text-sm text-slate-500">Nenhum lançamento hoje.</div>}
          <div className="space-y-3">
            {day.recent.slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-brand-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{r.platform}{r.km ? ` · ${numberBR(r.km)} km` : ''}</div>
                </div>
                <div className="text-sm font-semibold text-brand-400">{brl(r.gross)}</div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          className="!bg-slate-800/60 !border !border-slate-700/60"
          title="Resumo do dia"
          action={<button onClick={() => goTo('relatorios')} className="text-xs font-semibold text-brand-400 hover:underline">Ver detalhes</button>}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-300"><ListChecks size={15} className="text-brand-400" /> Total de corridas</span>
              <span className="font-semibold text-white">{day.trips}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-300"><MapPin size={15} className="text-blue-400" /> Km rodados</span>
              <span className="font-semibold text-white">{numberBR(day.km)} km</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-300"><Clock size={15} className="text-violet-400" /> Horas online</span>
              <span className="font-semibold text-white">{hoursLabel(day.hours)}</span>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
