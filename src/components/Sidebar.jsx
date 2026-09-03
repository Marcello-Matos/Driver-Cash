import React from 'react'
import {
  LayoutDashboard, TrendingUp, Receipt, Fuel, Wrench, Car,
  Target, FileBarChart, CalendarDays, Settings, Truck, X, Sun
} from 'lucide-react'
import { useStore } from '../store'
import { useLockBodyScroll } from '../lib/useLockBodyScroll'

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'hoje', label: 'Resumo diário', icon: Sun },
  { key: 'ganhos', label: 'Ganhos', icon: TrendingUp },
  { key: 'despesas', label: 'Despesas', icon: Receipt },
  { key: 'combustivel', label: 'Combustível', icon: Fuel },
  { key: 'manutencao', label: 'Manutenção', icon: Wrench },
  { key: 'veiculos', label: 'Veículos', icon: Car },
  { key: 'metas', label: 'Metas', icon: Target },
  { key: 'relatorios', label: 'Relatórios', icon: FileBarChart },
  { key: 'calendario', label: 'Calendário', icon: CalendarDays },
  { key: 'configuracoes', label: 'Configurações', icon: Settings }
]

export default function Sidebar({ page, setPage, open, onClose }) {
  const { profile } = useStore()
  const initials = profile.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
  useLockBodyScroll(open)

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 app-screen w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200
          pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 h-16 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white">
            <Truck size={20} />
          </div>
          <div className="leading-tight">
            <div className="font-extrabold text-white text-lg">
              Driver<span className="text-brand-400">Cash</span>
            </div>
            <div className="text-[10px] text-slate-400 -mt-0.5">Controle financeiro para motoristas</div>
          </div>
          <button className="ml-auto lg:hidden text-slate-400" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV.map(({ key, label, icon: Icon }) => {
            const active = page === key
            return (
              <button
                key={key}
                onClick={() => setPage(key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
                  ${active
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <Icon size={18} />
                {label}
              </button>
            )
          })}
        </nav>

        {/* Profile */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={() => setPage('configuracoes')}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-800 transition"
          >
            <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-semibold overflow-hidden shrink-0">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              ) : (
                initials
              )}
            </div>
            <div className="text-left leading-tight">
              <div className="text-sm font-semibold text-white">{profile.name}</div>
              <div className="text-xs text-slate-400">{profile.role}</div>
            </div>
          </button>
        </div>
      </aside>
    </>
  )
}
