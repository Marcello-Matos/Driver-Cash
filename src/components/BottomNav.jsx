import React from 'react'
import { Lock } from 'lucide-react'
import { DashboardIcon, SunIcon, ChartIcon, ReceiptIcon, MenuBarsIcon } from './icons'
import { useStore } from '../store'
import { isProPage } from '../lib/billing'

const ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
  { key: 'hoje', label: 'Hoje', icon: SunIcon },
  { key: 'ganhos', label: 'Ganhos', icon: ChartIcon },
  { key: 'despesas', label: 'Despesas', icon: ReceiptIcon },
]

const ICON_FX =
  'transition-all duration-200 ease-out group-hover:scale-125 group-active:scale-95 group-hover:drop-shadow-[0_0_6px_rgba(141,255,92,0.65)]'

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
              className={`group flex flex-col items-center justify-center gap-1 w-16 h-14 rounded-xl text-[10px] font-medium transition
                ${active
                  ? 'text-white bg-slate-800 ring-1 ring-emerald-400/30'
                  : 'hover:text-slate-200 hover:bg-slate-800/50'}`}
            >
              <span className="relative">
                <Icon
                  size={22}
                  className={`${ICON_FX} ${active ? 'text-sky-300' : 'text-slate-400 group-hover:text-sky-300'}`}
                />
                {!access.isPro && isProPage(key) && (
                  <Lock size={10} className="absolute -top-1 -right-2 text-amber-400" />
                )}
              </span>
              <span className={`transition-colors ${active ? 'text-emerald-300' : 'group-hover:text-sky-200'}`}>
                {label}
              </span>
            </button>
          )
        })}
        <button
          onClick={onToggleMenu}
          className="group flex flex-col items-center justify-center gap-1 w-16 h-14 rounded-xl text-[10px] font-medium hover:text-slate-200 hover:bg-slate-800/50 transition"
        >
          <MenuBarsIcon size={22} className={`${ICON_FX} text-slate-400 group-hover:text-sky-300`} />
          <span className="transition-colors group-hover:text-sky-200">Mais</span>
        </button>
      </div>
    </nav>
  )
}
