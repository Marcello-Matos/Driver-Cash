import React, { useMemo, useState } from 'react'
import { Target, Trophy } from 'lucide-react'
import { useStore } from '../store'
import { useSelectedMonth } from '../components/Topbar'
import { computeMonth } from '../lib/metrics'
import { brl } from '../lib/utils'
import { SectionCard } from '../components/ui'

export default function Metas() {
  const store = useStore()
  const { year, month } = useSelectedMonth()
  const m = useMemo(() => computeMonth(store, year, month), [store, year, month])
  const [value, setValue] = useState(store.goals.monthly)

  const save = () => store.setGoal(value)

  const dailyTarget = m.goal / m.totalDays
  const dailyNeeded = m.goalRemaining / Math.max(1, m.totalDays - m.workedDays)

  return (
    <div className="space-y-6 max-w-3xl">
      <SectionCard title="Meta mensal de lucro">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="label">Defina sua meta de lucro líquido (R$)</label>
            <input type="number" className="input" value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={save}><Target size={16} /> Salvar meta</button>
        </div>
      </SectionCard>

      <SectionCard title="Progresso do mês">
        <div className="text-3xl font-extrabold">{brl(m.netProfit)}</div>
        <div className="text-sm text-slate-500 mt-1">de {brl(m.goal)} — {Math.round(m.goalPct)}% alcançado</div>
        <div className="mt-3 h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all" style={{ width: `${m.goalPct}%` }} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
          <Info label="Faltam" value={brl(m.goalRemaining)} />
          <Info label="Meta diária" value={brl(dailyTarget)} />
          <Info label="Necessário/dia restante" value={m.goalRemaining > 0 ? brl(dailyNeeded) : brl(0)} />
        </div>

        <div className="mt-6 card bg-brand-50 dark:bg-brand-500/10 border-brand-200 dark:border-brand-500/30 p-4 flex items-start gap-3">
          <Trophy size={22} className="text-brand-500" />
          <div className="text-sm text-slate-600 dark:text-slate-300">
            <b className="text-brand-600 dark:text-brand-300">{m.goalPct >= 100 ? 'Parabéns, meta atingida!' : 'Continue assim!'}</b>
            <div>{m.goalPct >= 100 ? 'Você superou seu objetivo deste mês.' : `Você já alcançou ${Math.round(m.goalPct)}% da sua meta.`}</div>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-4">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-lg font-extrabold mt-1">{value}</div>
    </div>
  )
}
