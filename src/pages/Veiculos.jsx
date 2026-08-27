import React, { useState } from 'react'
import { Plus, Pencil, Trash2, Car } from 'lucide-react'
import { useStore } from '../store'
import { numberBR } from '../lib/utils'
import { SectionCard, Modal, EmptyState } from '../components/ui'

const empty = () => ({ name: '', brand: '', model: '', plate: '', year: '', color: '', odometer: '' })

export default function Veiculos() {
  const store = useStore()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty())

  const openNew = () => { setEditing(null); setForm(empty()); setOpen(true) }
  const openEdit = (v) => { setEditing(v.id); setForm({ ...v }); setOpen(true) }
  const save = () => {
    const payload = { ...form, year: Number(form.year || 0), odometer: Number(form.odometer || 0) }
    if (editing) store.updateVehicle(editing, payload)
    else store.addVehicle(payload)
    setOpen(false)
  }
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className="space-y-6">
      <SectionCard
        title="Meus veículos"
        action={<button className="btn-primary" onClick={openNew}><Plus size={16} /> Novo veículo</button>}
      >
        {store.vehicles.length === 0 ? (
          <EmptyState icon={Car} title="Nenhum veículo cadastrado" subtitle="Cadastre seu carro para vincular ganhos e despesas." action={<button className="btn-primary" onClick={openNew}><Plus size={16} /> Adicionar veículo</button>} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {store.vehicles.map((v) => (
              <div key={v.id} className="card p-5 flex gap-4">
                <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center"><Car size={26} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-bold truncate">{v.name || v.model || 'Veículo'}</div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(v)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><Pencil size={15} /></button>
                      <button onClick={() => store.deleteVehicle(v.id)} className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-500"><Trash2 size={15} /></button>
                    </div>
                  </div>
                  <div className="text-sm text-slate-400">{[v.brand, v.model].filter(Boolean).join(' · ')}</div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-50 dark:bg-slate-700/40 rounded-lg py-2"><div className="font-bold text-sm">{v.plate || '—'}</div><div className="text-slate-400">Placa</div></div>
                    <div className="bg-slate-50 dark:bg-slate-700/40 rounded-lg py-2"><div className="font-bold text-sm">{v.year || '—'}</div><div className="text-slate-400">Ano</div></div>
                    <div className="bg-slate-50 dark:bg-slate-700/40 rounded-lg py-2"><div className="font-bold text-sm">{numberBR(v.odometer)}</div><div className="text-slate-400">Km</div></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Editar veículo' : 'Novo veículo'}
        footer={<>
          <button className="btn-ghost" onClick={() => setOpen(false)}>Cancelar</button>
          <button className="btn-primary" onClick={save}>Salvar</button>
        </>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><label className="label">Apelido</label><input className="input" value={form.name} onChange={set('name')} placeholder="Ex.: Meu Onix" /></div>
          <div><label className="label">Marca</label><input className="input" value={form.brand} onChange={set('brand')} placeholder="Chevrolet" /></div>
          <div><label className="label">Modelo</label><input className="input" value={form.model} onChange={set('model')} placeholder="Onix Plus" /></div>
          <div><label className="label">Placa</label><input className="input" value={form.plate} onChange={set('plate')} placeholder="ABC-1D23" /></div>
          <div><label className="label">Ano</label><input type="number" className="input" value={form.year} onChange={set('year')} placeholder="2022" /></div>
          <div><label className="label">Cor</label><input className="input" value={form.color} onChange={set('color')} placeholder="Prata" /></div>
          <div><label className="label">Km atual</label><input type="number" className="input" value={form.odometer} onChange={set('odometer')} placeholder="0" /></div>
        </div>
      </Modal>
    </div>
  )
}
