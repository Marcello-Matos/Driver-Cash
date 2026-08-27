import React, { useMemo } from 'react'
import {
  Wallet, Receipt, DollarSign, Clock, CalendarDays, Car, MapPin,
  Timer, TrendingUp, Route, Gauge, Info, Trophy, TrendingDown
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { useStore } from '../store'
import { useSelectedMonth } from '../components/Topbar'
import { computeMonth, prevMonth, delta } from '../lib/metrics'
import { brl, numberBR, shortDateBR } from '../lib/utils'
import { KpiCard, SectionCard } from '../components/ui'

function SummaryTile({ icon: Icon, label, value, hint }) {
  return (
    <div className="flex flex-col items-center text-center gap-1 py-3">
      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-brand-500">
        <Icon size={18} />
      </div>
      <div className="text-lg font-extrabold mt-1">{value}</div>
      <div className="text-xs font-medium text-slate-600 dark:text-slate-300">{label}</div>
      {hint && <div className="text-[11px] text-slate-400">{hint}</div>}
    </div>
  )
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl bg-slate-900 text-white text-xs px-3 py-2 shadow-lg">
      <div className="font-semibold mb-1">Dia {label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          {p.name}: {brl(p.value)}
        </div>
      ))}
    </div>
  )
}

export default function Dashboard({ goTo }) {
  const store = useStore()
  const { year, month } = useSelectedMonth()

  const m = useMemo(() => computeMonth(store, year, month), [store, year, month])
  const pm = prevMonth(year, month)
  const prev = useMemo(() => computeMonth(store, pm.year, pm.month), [store, pm.year, pm.month])

  const dGross = delta(m.totalGross, prev.totalGross)
  const dExp = delta(m.totalExpenses, prev.totalExpenses)
  const dNet = delta(m.netProfit, prev.netProfit)
  const dPerHour = delta(m.perHour, prev.perHour)

  const hoursLabel = `${Math.floor(m.hours)}h ${Math.round((m.hours % 1) * 60)}m`

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard icon={Wallet} iconBg="bg-brand-500" label="Ganhos no mês" value={brl(m.totalGross)} delta={dGross} deltaLabel="vs mês anterior" subtitle="—" />
        <KpiCard icon={Receipt} iconBg="bg-rose-500" label="Total de despesas" value={brl(m.totalExpenses)} delta={dExp} deltaLabel="vs mês anterior" subtitle="—" />
        <KpiCard icon={DollarSign} iconBg="bg-brand-500" label="Lucro líquido" value={brl(m.netProfit)} delta={dNet} deltaLabel="vs mês anterior" subtitle="—" />
        <KpiCard icon={Clock} iconBg="bg-blue-500" label="Lucro por hora" value={brl(m.perHour)} delta={dPerHour} deltaLabel="vs mês anterior" subtitle={`${hoursLabel} trabalhadas`} />
      </div>

      {/* Resumo + Evolução */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SectionCard title="Resumo do mês">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2 divide-slate-100">
            <SummaryTile icon={CalendarDays} label="Dias trabalhados" value={m.workedDays} hint={`de ${m.totalDays} dias`} />
            <SummaryTile icon={Car} label="Corridas" value={numberBR(m.trips)} hint="total no mês" />
            <SummaryTile icon={MapPin} label="Km rodados" value={`${numberBR(m.km)} km`} hint="total no mês" />
            <SummaryTile icon={Timer} label="Horas online" value={hoursLabel} hint="tempo total" />
            <SummaryTile icon={TrendingUp} label="Ganho por dia" value={brl(m.perDay)} hint="média diária" />
            <SummaryTile icon={Clock} label="Ganho por hora" value={brl(m.perHour)} hint="média por hora" />
            <SummaryTile icon={Route} label="Ganho por km" value={brl(m.perKm)} hint="média por km" />
            <SummaryTile icon={Gauge} label="Custo por km" value={brl(m.costPerKm)} hint="média por km" />
          </div>
        </SectionCard>

        <SectionCard title="Evolução de ganhos e despesas">
          <div className="flex items-center gap-4 mb-2 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-brand-500" />Ganhos (R$)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500" />Despesas (R$)</span>
          </div>
          <div className="h-[260px] -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={m.daily} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gGanhos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gDespesas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="ganhos" name="Ganhos" stroke="#22c55e" strokeWidth={2} fill="url(#gGanhos)" />
                <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#f43f5e" strokeWidth={2} fill="url(#gDespesas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* Categorias + Meta + Lançamentos */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <CategoryCard categories={m.categories} total={m.totalExpenses} />
        <GoalCard net={m.netProfit} goal={m.goal} pct={m.goalPct} remaining={m.goalRemaining} onEdit={() => goTo('metas')} />
        <RecentCard recent={m.recent} onSeeAll={() => goTo('ganhos')} />
      </div>

      {/* Dica do mês */}
      <div className="card p-4 flex items-start gap-3 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30">
        <Info size={20} className="text-blue-500 mt-0.5 shrink-0" />
        <p className="text-sm text-slate-600 dark:text-slate-300">
          <b>Dica do mês:</b>{' '}
          {dPerHour != null && dPerHour >= 0
            ? `Seu lucro por hora aumentou ${dPerHour.toFixed(1)}% comparado ao mês passado. Ótimo trabalho!`
            : 'Acompanhe seu custo por km e priorize horários de maior demanda para aumentar seu lucro por hora.'}
        </p>
      </div>
    </div>
  )
}

function CategoryCard({ categories, total }) {
  const data = categories.length ? categories : [{ key: 'Sem dados', value: 1, color: '#e2e8f0', pct: 0 }]
  return (
    <SectionCard title="Despesas por categoria">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-[150px] h-[150px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius={52} outerRadius={72} paddingAngle={2} stroke="none">
                {data.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-lg font-extrabold">{brl(total)}</div>
            <div className="text-[11px] text-slate-400">Total</div>
          </div>
        </div>
        <div className="flex-1 space-y-2 min-w-0">
          {categories.length === 0 && <div className="text-sm text-slate-400">Nenhuma despesa registrada.</div>}
          {categories.map((c) => (
            <div key={c.key} className="flex items-center gap-2 text-sm">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.color }} />
              <span className="flex-1 truncate">{c.key}</span>
              <span className="font-semibold">{brl(c.value)}</span>
              <span className="text-slate-400 w-9 text-right">{Math.round(c.pct)}%</span>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  )
}

function GoalCard({ net, goal, pct, remaining, onEdit }) {
  return (
    <SectionCard title="Meta mensal" action={<button onClick={onEdit} className="text-xs font-semibold text-brand-500 hover:underline">Editar</button>}>
      <div className="text-xs text-slate-400 mb-1">Meta: {brl(goal)}</div>
      <div className="text-3xl font-extrabold">{brl(net)}</div>
      <div className="text-sm text-slate-500 mt-1">{Math.round(pct)}% da meta alcançada</div>
      <div className="mt-3 h-2.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-xs text-slate-400 mt-2">
        {remaining > 0 ? `Faltam ${brl(remaining)} para atingir sua meta` : 'Meta atingida! Parabéns!'}
      </div>
      <div className="mt-4 card bg-brand-50 dark:bg-brand-500/10 border-brand-200 dark:border-brand-500/30 p-3 flex items-start gap-2">
        <Trophy size={18} className="text-brand-500 mt-0.5" />
        <div className="text-xs text-slate-600 dark:text-slate-300">
          <b className="text-brand-600 dark:text-brand-300">{pct >= 100 ? 'Meta batida!' : 'Você está indo muito bem!'}</b>
          <div>Continue assim para alcançar sua meta.</div>
        </div>
      </div>
    </SectionCard>
  )
}

function RecentCard({ recent, onSeeAll }) {
  const groups = recent.slice(0, 8).reduce((acc, r) => {
    (acc[r.date] ||= []).push(r)
    return acc
  }, {})
  return (
    <SectionCard title="Últimos lançamentos" action={<button onClick={onSeeAll} className="text-xs font-semibold text-slate-500 hover:text-brand-500 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1">Ver tudo</button>}>
      {recent.length === 0 && <div className="text-sm text-slate-400">Nenhum lançamento neste mês.</div>}
      <div className="space-y-4">
        {Object.entries(groups).map(([date, items]) => (
          <div key={date}>
            <div className="text-xs font-semibold text-slate-400 mb-2">{shortDateBR(date)}</div>
            <div className="space-y-2">
              {items.map((r) => {
                const isGain = r.type === 'ganho'
                return (
                  <div key={r.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${isGain ? 'bg-brand-500' : 'bg-rose-500'}`}>
                      {isGain ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{r.title}</div>
                      {r.meta && <div className="text-xs text-slate-400">{r.meta}</div>}
                    </div>
                    <div className={`text-sm font-semibold ${isGain ? 'text-brand-500' : 'text-rose-500'}`}>
                      {isGain ? '' : '- '}{brl(Math.abs(r.amount))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}
