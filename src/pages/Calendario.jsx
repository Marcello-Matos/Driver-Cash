import React, { useMemo } from 'react'
import { useStore } from '../store'
import { useSelectedMonth } from '../components/Topbar'
import { monthEarnings, monthExpenses } from '../lib/metrics'
import { brl, daysInMonth, MONTH_NAMES } from '../lib/utils'
import { SectionCard } from '../components/ui'

const WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function Calendario() {
  const store = useStore()
  const { year, month } = useSelectedMonth()

  const byDay = useMemo(() => {
    const earns = monthEarnings(store.earnings, year, month)
    const exps = monthExpenses(store.expenses, year, month)
    const map = {}
    const total = daysInMonth(year, month)
    for (let d = 1; d <= total; d++) map[d] = { ganhos: 0, despesas: 0 }
    earns.forEach((e) => { map[Number(e.date.split('-')[2])].ganhos += Number(e.gross || 0) })
    exps.forEach((e) => { map[Number(e.date.split('-')[2])].despesas += Number(e.amount || 0) })
    return map
  }, [store, year, month])

  const total = daysInMonth(year, month)
  const firstWeekday = new Date(year, month, 1).getDay()
  const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)]

  return (
    <SectionCard title={`Calendário — ${MONTH_NAMES[month]} / ${year}`}>
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
        {WEEK.map((w) => <div key={w} className="text-center text-[11px] sm:text-xs font-semibold text-slate-400">{w}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />
          const info = byDay[d]
          const net = info.ganhos - info.despesas
          const worked = info.ganhos > 0 || info.despesas > 0
          return (
            <div key={i} className={`rounded-lg sm:rounded-xl border p-1 sm:p-2 min-h-[56px] sm:min-h-[80px] text-[10px] sm:text-xs overflow-hidden
              ${worked ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30' : 'border-dashed border-slate-200 dark:border-slate-700/50'}`}>
              <div className="font-bold text-slate-500">{d}</div>
              {worked && (
                <div className="mt-1 space-y-0.5">
                  {info.ganhos > 0 && <div className="hidden sm:block text-brand-500 font-medium truncate">+{brl(info.ganhos)}</div>}
                  {info.despesas > 0 && <div className="hidden sm:block text-rose-500 truncate">-{brl(info.despesas)}</div>}
                  <div className={`font-bold truncate ${net >= 0 ? 'text-brand-600 dark:text-brand-400 sm:text-slate-700 sm:dark:text-slate-200' : 'text-rose-500'}`}>{brl(net)}</div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}
