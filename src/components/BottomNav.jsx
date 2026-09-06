import React from 'react'
import { LayoutDashboard, Sun, TrendingUp, Receipt, Menu, Lock } from 'lucide-react'
import { useStore } from '../store'
import { isProPage } from '../lib/billing'

const ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'hoje', label: 'Hoje', icon: Sun },
  { key: 'ganhos', label: 'Ganhos', icon: TrendingUp },
  { key: 'despesas', label: 'Despesas', icon: Receipt },
]

export default function BottomNav({ page, setPage, onToggleMenu }) {
  const { access } = useStore()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 text-slate-400 border-t border-slate-800 pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {ITEMS.map(({ key, label, icon: Icon }) => {
          const active = page === key
          return (
            <button
              key={key}
              onClick={() => setPage(key)}
              className={`flex flex-col items-center justify-center gap-1 w-16 h-14 rounded-xl text-[10px] font-medium transition
                ${active ? 'text-white bg-slate-800' : 'hover:text-slate-200 hover:bg-slate-800/50'}`}
            >
              <span className="relative">
                <Icon size={20} className={active ? 'text-brand-400' : ''} />
                {!access.isPro && isProPage(key) && (
                  <Lock size={10} className="absolute -top-1 -right-2 text-amber-400" />
                )}
              </span>
              <span>{label}</span>
            </button>
          )
        })}
        <button
          onClick={onToggleMenu}
          className="flex flex-col items-center justify-center gap-1 w-16 h-14 rounded-xl text-[10px] font-medium hover:text-slate-200 hover:bg-slate-800/50 transition"
        >
          <Menu size={20} />
          <span>Mais</span>
        </button>
      </div>
    </nav>
  )
}
