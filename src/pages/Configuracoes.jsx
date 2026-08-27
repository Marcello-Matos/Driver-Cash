import React, { useState } from 'react'
import { User, Palette, Database, RefreshCw, Trash2, Sun, Moon, LogOut } from 'lucide-react'
import { useStore } from '../store'
import { SectionCard } from '../components/ui'

export default function Configuracoes() {
  const store = useStore()
  const [name, setName] = useState(store.profile.name)
  const [role, setRole] = useState(store.profile.role)
  const [saved, setSaved] = useState(false)

  const saveProfile = () => {
    store.setProfile({ name, role })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const confirmReset = () => {
    if (window.confirm('Isso vai substituir todos os dados pelos dados de exemplo. Continuar?')) store.resetData()
  }
  const confirmClear = () => {
    if (window.confirm('Isso vai apagar TODOS os ganhos e despesas. Esta ação não pode ser desfeita. Continuar?')) store.clearAll()
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <SectionCard title="Perfil">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-slate-400"><User size={16} /> {store.session?.user?.email}</div>
          <button className="btn-ghost border border-slate-200 dark:border-slate-600" onClick={store.signOut}><LogOut size={16} /> Sair</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="label">Nome</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><label className="label">Função</label><input className="input" value={role} onChange={(e) => setRole(e.target.value)} /></div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button className="btn-primary" onClick={saveProfile}>Salvar perfil</button>
          {saved && <span className="text-sm text-brand-500 font-medium">Salvo!</span>}
        </div>
      </SectionCard>

      <SectionCard title="Aparência">
        <div className="flex items-center gap-2 text-slate-400 mb-4"><Palette size={16} /> Tema da interface</div>
        <div className="flex gap-3">
          <button onClick={() => store.setSettings({ theme: 'light' })} className={`flex-1 card p-4 flex items-center gap-3 ${store.settings.theme === 'light' ? 'ring-2 ring-brand-500' : ''}`}>
            <Sun size={20} className="text-amber-500" /> <span className="font-medium">Claro</span>
          </button>
          <button onClick={() => store.setSettings({ theme: 'dark' })} className={`flex-1 card p-4 flex items-center gap-3 ${store.settings.theme === 'dark' ? 'ring-2 ring-brand-500' : ''}`}>
            <Moon size={20} className="text-indigo-400" /> <span className="font-medium">Escuro</span>
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Dados">
        <div className="flex items-center gap-2 text-slate-400 mb-4"><Database size={16} /> Seus dados ficam salvos com segurança no Supabase (nuvem)</div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="btn-ghost border border-slate-200 dark:border-slate-600" onClick={confirmReset}><RefreshCw size={16} /> Restaurar dados de exemplo</button>
          <button className="btn-danger" onClick={confirmClear}><Trash2 size={16} /> Apagar todos os lançamentos</button>
        </div>
      </SectionCard>
    </div>
  )
}
