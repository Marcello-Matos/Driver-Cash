import React, { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, TrendingUp } from 'lucide-react'
import { useStore } from '../store'
import { useSelectedMonth } from '../components/Topbar'
import { monthEarnings } from '../lib/metrics'
import { brl, numberBR, formatDateBR, todayISO, PLATFORMS } from '../lib/utils'
import { SectionCard, Modal, EmptyState, Badge } from '../components/ui'

const empty = () => ({
  date: todayISO(), platform: 'UberX', gross: '', trips: '', km: '', hours: '', vehicleId: '', note: ''
})

export default function Ganhos() {
  const store = useStore()
  const { year, month } = useSelectedMonth()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty())

  const rows = useMemo(
    () => monthEarnings(store.earnings, year, month).sort((a, b) => (a.date < b.date ? 1 : -1)),
    [store.earnings, year, month]
  )

  const totals = rows.reduce((a, r) => ({
    gross: a.gross + Number(r.gross || 0),
    trips: a.trips + Number(r.trips || 0),
    km: a.km + Number(r.km || 0),
    hours: a.hours + Number(r.hours || 0)
  }), { gross: 0, trips: 0, km: 0, hours: 0 })

  const openNew = () => { setEditing(null); setForm(empty()); setOpen(true) }
  const openEdit = (r) => { setEditing(r.id); setForm({ ...r }); setOpen(true) }

  const save = () => {
    const payload = {
      ...form,
      gross: Number(form.gross || 0),
      trips: Number(form.trips || 0),
      km: Number(form.km || 0),
      hours: Number(form.hours || 0)
    }
    if (editing) store.updateEarning(editing, payload)
    else store.addEarning(payload)
    setOpen(false)
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatMini label="Total de ganhos" value={brl(totals.gross)} />
        <StatMini label="Corridas" value={numberBR(totals.trips)} />
        <StatMini label="Km rodados" value={`${numberBR(totals.km)} km`} />
        <StatMini label="Horas online" value={`${totals.hours.toFixed(1)}h`} />
      </div>

      <SectionCard
        title="Ganhos do mês"
        action={<button className="btn-primary" onClick={openNew}><Plus size={16} /> Novo ganho</button>}
      >
        {rows.length === 0 ? (
          <EmptyState icon={TrendingUp} title="Nenhum ganho registrado" subtitle="Adicione suas corridas diárias para acompanhar seus ganhos." action={<button className="btn-primary" onClick={openNew}><Plus size={16} /> Adicionar ganho</button>} />
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400 border-b border-slate-100 dark:border-slate-700">
                  <th className="py-2 px-2">Data</th>
                  <th className="py-2 px-2">Plataforma</th>
                  <th className="py-2 px-2 text-right">Corridas</th>
                  <th className="py-2 px-2 text-right">Km</th>
                  <th className="py-2 px-2 text-right">Horas</th>
                  <th className="py-2 px-2 text-right">Ganho</th>
                  <th className="py-2 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-2.5 px-2 whitespace-nowrap">{formatDateBR(r.date)}</td>
                    <td className="py-2.5 px-2"><Badge color="green">{r.platform}</Badge></td>
                    <td className="py-2.5 px-2 text-right">{r.trips}</td>
                    <td className="py-2.5 px-2 text-right">{numberBR(r.km)}</td>
                    <td className="py-2.5 px-2 text-right">{Number(r.hours).toFixed(1)}h</td>
                    <td className="py-2.5 px-2 text-right font-semibold text-brand-500">{brl(r.gross)}</td>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500"><Pencil size={15} /></button>
                        <button onClick={() => store.deleteEarning(r.id)} className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-500"><Trash2 size={15} /></button>
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
        title={editing ? 'Editar ganho' : 'Novo ganho'}
        footer={<>
          <button className="btn-ghost" onClick={() => setOpen(false)}>Cancelar</button>
          <button className="btn-primary" onClick={save}>Salvar</button>
        </>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="label">Data</label><input type="date" className="input" value={form.date} onChange={set('date')} /></div>
          <div>
            <label className="label">Plataforma</label>
            <select className="input" value={form.platform} onChange={set('platform')}>
              {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div><label className="label">Valor recebido (R$)</label><input type="number" step="0.01" className="input" value={form.gross} onChange={set('gross')} placeholder="0,00" /></div>
          <div><label className="label">Nº de corridas</label><input type="number" className="input" value={form.trips} onChange={set('trips')} placeholder="0" /></div>
          <div><label className="label">Km rodados</label><input type="number" className="input" value={form.km} onChange={set('km')} placeholder="0" /></div>
          <div><label className="label">Horas online</label><input type="number" step="0.1" className="input" value={form.hours} onChange={set('hours')} placeholder="0" /></div>
          <div className="sm:col-span-2"><label className="label">Observação</label><input className="input" value={form.note} onChange={set('note')} placeholder="Opcional" /></div>
        </div>
      </Modal>
    </div>
  )
}

function StatMini({ label, value }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-xl font-extrabold mt-1">{value}</div>
    </div>
  )
}
