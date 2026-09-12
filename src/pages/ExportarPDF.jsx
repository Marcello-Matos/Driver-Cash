import React, { useMemo, useState } from 'react'
import { FileDown, Loader2, Layers, CalendarRange } from 'lucide-react'
import { useStore } from '../store'
import { exportRelatorioPdf } from '../lib/pdfExport'
import { SectionCard } from '../components/ui'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts'
import { brl, todayISO, MONTH_NAMES, categoryColor } from '../lib/utils'

export default function ExportarPDF() {
  const { profile, earnings, expenses } = useStore()
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const [mode, setMode] = useState('completo')
  const [from, setFrom] = useState(now.getFullYear() + '-' + mm + '-01')
  const [to, setTo] = useState(todayISO())
  const [busy, setBusy] = useState(false)

  const usePeriod = mode === 'periodo'
  const inRange = (d) => !usePeriod || (d >= from && d <= to)
  const selEarnings = earnings.filter((e) => inRange(e.date))
  const selExpenses = expenses.filter((e) => inRange(e.date))
  const gross = selEarnings.reduce((s, e) => s + Number(e.gross || 0), 0)
  const exp = selExpenses.reduce((s, e) => s + Number(e.amount || 0), 0)
  const invalid = usePeriod && from > to
  const nothing = selEarnings.length === 0 && selExpenses.length === 0

  const chartData = useMemo(() => {
    const arr = []
    const t = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(t.getFullYear(), t.getMonth() - i, 1)
      arr.push({
        key: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'),
        mes: MONTH_NAMES[d.getMonth()].slice(0, 3) + '/' + String(d.getFullYear()).slice(2),
        Ganhos: 0,
        Despesas: 0
      })
    }
    selEarnings.forEach((e) => {
      const b = arr.find((x) => x.key === String(e.date).slice(0, 7))
      if (b) b.Ganhos += Number(e.gross || 0)
    })
    selExpenses.forEach((e) => {
      const b = arr.find((x) => x.key === String(e.date).slice(0, 7))
      if (b) b.Despesas += Number(e.amount || 0)
    })
    return arr.map(({ key, ...r }) => ({ ...r, Lucro: r.Ganhos - r.Despesas }))
  }, [selEarnings, selExpenses])

  const catData = useMemo(() => {
    const byCat = {}
    selExpenses.forEach((e) => {
      const k = e.category || 'Outros'
      byCat[k] = (byCat[k] || 0) + Number(e.amount || 0)
    })
    return Object.keys(byCat)
      .sort((a, b) => byCat[b] - byCat[a])
      .map((k) => ({ name: k, value: byCat[k] }))
  }, [selExpenses])

  const handleExport = () => {
    setBusy(true)
    try {
      exportRelatorioPdf({
        earnings: selEarnings,
        expenses: selExpenses,
        profile,
        period: usePeriod ? { from, to } : null
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className='space-y-6'>
      <SectionCard title='Exportar em PDF'>
        <p className='text-sm text-slate-500 dark:text-slate-400 -mt-2 mb-4'>
          Gera um arquivo PDF com resumo financeiro e todos os lançamentos selecionados. O arquivo é salvo no seu dispositivo.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <button type='button' onClick={() => setMode('completo')}
            className={`text-left p-4 rounded-2xl border-2 transition ${mode === 'completo' ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-brand-300'}`}>
            <div className='flex items-center gap-2 font-semibold'>
              <Layers size={18} className={mode === 'completo' ? 'text-brand-500' : 'text-slate-400'} />
              Relatório completo
            </div>
            <p className='text-sm text-slate-500 dark:text-slate-400 mt-1'>
              Todos os lançamentos registrados no sistema, do primeiro ao último dia.
            </p>
          </button>

          <button type='button' onClick={() => setMode('periodo')}
            className={`text-left p-4 rounded-2xl border-2 transition ${mode === 'periodo' ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-brand-300'}`}>
            <div className='flex items-center gap-2 font-semibold'>
              <CalendarRange size={18} className={mode === 'periodo' ? 'text-brand-500' : 'text-slate-400'} />
              Por período
            </div>
            <p className='text-sm text-slate-500 dark:text-slate-400 mt-1'>
              Escolha a data inicial e final para exportar apenas esse intervalo.
            </p>
          </button>
        </div>


        {usePeriod && (
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4'>
            <div>
              <label className='label'>Data inicial</label>
              <input type='date' className='input' value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div>
              <label className='label'>Data final</label>
              <input type='date' className='input' value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
        )}

        <div className='mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/60 text-sm space-y-1'>
          <div className='flex justify-between'>
            <span className='text-slate-500'>Ganhos incluídos</span>
            <span className='font-semibold text-brand-500'>{selEarnings.length} · {brl(gross)}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-slate-500'>Despesas incluídas</span>
            <span className='font-semibold text-rose-500'>{selExpenses.length} · {brl(exp)}</span>
          </div>
          <div className='flex justify-between border-t border-slate-200 dark:border-slate-700 pt-1 mt-1'>
            <span className='text-slate-500'>Lucro do período</span>
            <span className='font-extrabold'>{brl(gross - exp)}</span>
          </div>
        </div>

        <div className='mt-6 space-y-6'>
          <SectionCard title='Evolução dos últimos 6 meses'>
            <div className='h-[340px]'>
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#94a3b833' vertical={false} />
                  <XAxis dataKey='mes' tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={50} />
                  <Tooltip formatter={(v) => brl(v)} contentStyle={{ borderRadius: 12, border: 'none', background: '#0f172a', color: '#fff' }} />
                  <Legend />
                  <Bar dataKey='Ganhos' fill='#22c55e' radius={[6, 6, 0, 0]} />
                  <Bar dataKey='Despesas' fill='#f43f5e' radius={[6, 6, 0, 0]} />
                  <Bar dataKey='Lucro' fill='#3b82f6' radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          {catData.length > 0 && (
            <SectionCard title='Despesas por categoria'>
              <div className='h-[320px]'>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={catData} dataKey='value' nameKey='name' innerRadius={85} outerRadius={125} paddingAngle={2}>
                      {catData.map((c) => (
                        <Cell key={c.name} fill={categoryColor(c.name)} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => brl(v)} contentStyle={{ borderRadius: 12, border: 'none', background: '#0f172a', color: '#fff' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          )}
        </div>
        {invalid && <p className='text-sm text-rose-500 mt-2'>A data inicial deve ser anterior à data final.</p>}
        {!invalid && nothing && <p className='text-sm text-slate-400 mt-2'>Nenhum lançamento encontrado para o período selecionado.</p>}

        <div className='mt-4'>
          <button className='btn-primary w-full sm:w-auto' onClick={handleExport} disabled={busy || invalid || nothing}>
            {busy ? <Loader2 size={16} className='animate-spin' /> : <FileDown size={16} />}
            {busy ? 'Gerando PDF...' : 'Exportar PDF'}
          </button>
        </div>
      </SectionCard>
    </div>
  )
}
