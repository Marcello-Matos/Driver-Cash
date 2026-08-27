import React, { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Download } from 'lucide-react'
import { useStore } from '../store'
import { computeMonth } from '../lib/metrics'
import { brl, MONTH_NAMES } from '../lib/utils'
import { SectionCard } from '../components/ui'

export default function Relatorios() {
  const store = useStore()
  const now = new Date()

  const data = useMemo(() => {
    const arr = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const m = computeMonth(store, d.getFullYear(), d.getMonth())
      arr.push({
        mes: `${MONTH_NAMES[d.getMonth()].slice(0, 3)}/${String(d.getFullYear()).slice(2)}`,
        Ganhos: m.totalGross,
        Despesas: m.totalExpenses,
        Lucro: m.netProfit
      })
    }
    return arr
  }, [store])

  const exportCSV = () => {
    const rows = [['Tipo', 'Data', 'Categoria/Plataforma', 'Descrição', 'Valor']]
    store.earnings.forEach((e) => rows.push(['Ganho', e.date, e.platform, e.note || '', e.gross]))
    store.expenses.forEach((e) => rows.push(['Despesa', e.date, e.category, e.description || '', -e.amount]))
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'drivercash-lancamentos.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <SectionCard
        title="Comparativo dos últimos 6 meses"
        action={<button className="btn-primary" onClick={exportCSV}><Download size={16} /> Exportar CSV</button>}
      >
        <div className="h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={50} />
              <Tooltip formatter={(v) => brl(v)} contentStyle={{ borderRadius: 12, border: 'none', background: '#0f172a', color: '#fff' }} />
              <Legend />
              <Bar dataKey="Ganhos" fill="#22c55e" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Despesas" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Lucro" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.slice(-3).map((d) => (
          <div key={d.mes} className="card p-5">
            <div className="text-sm font-bold text-slate-400 uppercase">{d.mes}</div>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Ganhos</span><span className="font-semibold text-brand-500">{brl(d.Ganhos)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Despesas</span><span className="font-semibold text-rose-500">{brl(d.Despesas)}</span></div>
              <div className="flex justify-between border-t border-slate-100 dark:border-slate-700 pt-1 mt-1"><span className="text-slate-500">Lucro</span><span className="font-extrabold">{brl(d.Lucro)}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
