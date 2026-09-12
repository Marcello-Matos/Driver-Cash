import React, { useState } from 'react'
import { FileDown, Loader2, Layers, CalendarRange } from 'lucide-react'
import { useStore } from '../store'
import { exportRelatorioPdf } from '../lib/pdfExport'
import { SectionCard } from '../components/ui'
import { brl, todayISO } from '../lib/utils'

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
