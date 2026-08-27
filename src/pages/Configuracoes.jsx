import React, { useState } from 'react'
import { User, Palette, Database, RefreshCw, Trash2, Sun, Moon, LogOut, Camera, Loader2 } from 'lucide-react'
import { useStore } from '../store'
import { SectionCard } from '../components/ui'

export default function Configuracoes() {
  const store = useStore()
  const [name, setName] = useState(store.profile.name)
  const [role, setRole] = useState(store.profile.role)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)

  const saveProfile = () => {
    store.setProfile({ name, role })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const url = await store.uploadAvatar(file)
    setUploading(false)
    e.target.value = ''
    if (!url) return
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="relative">
            {store.profile.avatar_url ? (
              <img
                src={store.profile.avatar_url}
                alt="Foto do perfil"
                className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-brand-500 flex items-center justify-center text-white text-xl font-semibold">
                {store.profile.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
              </div>
            )}
            <label className="absolute bottom-0 right-0 p-1.5 bg-slate-800 dark:bg-slate-700 rounded-full text-white cursor-pointer shadow hover:bg-slate-700 transition">
              <Camera size={14} />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} disabled={uploading} />
            </label>
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white">
                <Loader2 size={20} className="animate-spin" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            {store.error && (
              <div className="text-sm text-red-500 mb-2">{store.error}</div>
            )}
            <div className="font-semibold text-lg leading-tight">{store.profile.name}</div>
            <div className="text-sm text-slate-400 truncate">{store.session?.user?.email}</div>
            <div className="text-xs text-slate-500 mt-0.5">{store.profile.role}</div>
          </div>
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
