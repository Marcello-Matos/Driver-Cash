import React, { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Receipt } from 'lucide-react'
import { useStore } from '../store'
import { useSelectedMonth } from '../components/Topbar'
import { monthExpenses } from '../lib/metrics'
import { brl, formatDateBR, todayISO, CATEGORIES, categoryColor } from '../lib/utils'
import { SectionCard, Modal, EmptyState } from '../components/ui'

const empty = () => ({
  date: todayISO(), category: 'Combustível', description: '', amount: '', liters: '', vehicleId: '', note: ''
})

export default function Despesas({ fixedCategory }) {
  const store = useStore()
  const { year, month } = useSelectedMonth()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty())
  const [filter, setFilter] = useState(fixedCategory || 'Todas')

  const all = useMemo(
    () => monthExpenses(store.expenses, year, month).sort((a, b) => (a.date < b.date ? 1 : -1)),
    [store.expenses, year, month]
  )
  const rows = useMemo(() => {
    if (fixedCategory) return all.filter((r) => r.category === fixedCategory)
    return filter === 'Todas' ? all : all.filter((r) => r.category === filter)
  }, [all, filter, fixedCategory])

  const total = rows.reduce((a, r) => a + Number(r.amount || 0), 0)

  const openNew = () => { setEditing(null); setForm({ ...empty(), category: fixedCategory || 'Combustível' }); setOpen(true) }
  const openEdit = (r) => { setEditing(r.id); setForm({ ...r }); setOpen(true) }

  const save = () => {
    const payload = { ...form, amount: Number(form.amount || 0), liters: form.liters ? Number(form.liters) : undefined }
    if (editing) store.updateExpense(editing, payload)
    else store.addExpense(payload)
    setOpen(false)
  }
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4"><div className="text-xs text-slate-400">Total de despesas</div><div className="text-xl font-extrabold mt-1 text-rose-500">{brl(total)}</div></div>
        <div className="card p-4"><div className="text-xs text-slate-400">Lançamentos</div><div className="text-xl font-extrabold mt-1">{rows.length}</div></div>
        <div className="card p-4"><div className="text-xs text-slate-400">Maior despesa</div><div className="text-xl font-extrabold mt-1">{brl(Math.max(0, ...rows.map((r) => Number(r.amount || 0))))}</div></div>
        <div className="card p-4"><div className="text-xs text-slate-400">Média por lançamento</div><div className="text-xl font-extrabold mt-1">{brl(rows.length ? total / rows.length : 0)}</div></div>
      </div>

      <SectionCard
        title={fixedCategory ? `Despesas - ${fixedCategory}` : 'Despesas do mês'}
        action={<div className="flex items-center gap-2">
          {!fixedCategory && (
            <select className="input !w-auto !py-1.5" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="Todas">Todas as categorias</option>
              {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.key}</option>)}
            </select>
          )}
          <button className="btn-primary" onClick={openNew}><Plus size={16} /> Nova despesa</button>
        </div>}
      >
        {rows.length === 0 ? (
          <EmptyState icon={Receipt} title="Nenhuma despesa registrada" subtitle="Cadastre seus gastos com combustível, manutenção e outros." action={<button className="btn-primary" onClick={openNew}><Plus size={16} /> Adicionar despesa</button>} />
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400 border-b border-slate-100 dark:border-slate-700">
                  <th className="py-2 px-2">Data</th>
                  <th className="py-2 px-2">Categoria</th>
                  <th className="py-2 px-2">Descrição</th>
                  <th className="py-2 px-2 text-right">Valor</th>
                  <th className="py-2 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-2.5 px-2 whitespace-nowrap">{formatDateBR(r.date)}</td>
                    <td className="py-2.5 px-2">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: categoryColor(r.category) }} />
                        {r.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-slate-500">{r.description || '—'}{r.liters ? ` · ${r.liters} L` : ''}</td>
                    <td className="py-2.5 px-2 text-right font-semibold text-rose-500">- {brl(r.amount)}</td>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500"><Pencil size={15} /></button>
                        <button onClick={() => store.deleteExpense(r.id)} className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-500"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Editar despesa' : 'Nova despesa'}
        footer={<>
          <button className="btn-ghost" onClick={() => setOpen(false)}>Cancelar</button>
          <button className="btn-primary" onClick={save}>Salvar</button>
        </>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="label">Data</label><input type="date" className="input" value={form.date} onChange={set('date')} /></div>
          <div>
            <label className="label">Categoria</label>
            <select className="input" value={form.category} onChange={set('category')}>
              {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.key}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2"><label className="label">Descrição</label><input className="input" value={form.description} onChange={set('description')} placeholder="Ex.: Posto Shell" /></div>
          <div><label className="label">Valor (R$)</label><input type="number" step="0.01" className="input" value={form.amount} onChange={set('amount')} placeholder="0,00" /></div>
          {form.category === 'Combustível' && (
            <div><label className="label">Litros</label><input type="number" step="0.01" className="input" value={form.liters} onChange={set('liters')} placeholder="0" /></div>
          )}
          <div className="sm:col-span-2"><label className="label">Observação</label><input className="input" value={form.note} onChange={set('note')} placeholder="Opcional" /></div>
        </div>
      </Modal>
    </div>
  )
}
