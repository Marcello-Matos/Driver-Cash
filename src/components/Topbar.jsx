import React from 'react'
import { Menu, ChevronLeft, ChevronRight, Sun, Moon, Bell, Calendar } from 'lucide-react'
import { useStore } from '../store'
import { MONTH_NAMES } from '../lib/utils'

export function useSelectedMonth() {
  const { settings } = useStore()
  const [y, m] = settings.currentMonth.split('-').map(Number)
  return { year: y, month: m - 1 }
}

export default function Topbar({ title, onToggleSidebar }) {
  const { settings, setSettings, toggleTheme } = useStore()
  const [year, month] = settings.currentMonth.split('-').map(Number)
  const monthIdx = month - 1

  const changeMonth = (dir) => {
    let m = monthIdx + dir
    let y = year
    if (m < 0) { m = 11; y -= 1 }
    if (m > 11) { m = 0; y += 1 }
    setSettings({ currentMonth: `${y}-${String(m + 1).padStart(2, '0')}` })
  }

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 px-4 sm:px-6">
      <button
        className="lg:hidden text-slate-500 hover:text-slate-800 dark:hover:text-white"
        onClick={onToggleSidebar}
      >
        <Menu size={22} />
      </button>

      <h1 className="font-bold text-lg hidden sm:block">{title}</h1>

      {/* Month navigator */}
      <div className="mx-auto flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-1 py-1">
        <button
          onClick={() => changeMonth(-1)}
          className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex items-center gap-2 px-3 font-semibold text-sm min-w-[140px] justify-center">
          <Calendar size={16} className="text-brand-500" />
          {MONTH_NAMES[monthIdx]} / {year}
        </div>
        <button
          onClick={() => changeMonth(1)}
          className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          title="Alternar tema"
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
        >
          {settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand-500 text-white text-[9px] flex items-center justify-center font-bold">3</span>
        </button>
      </div>
    </header>
  )
}
