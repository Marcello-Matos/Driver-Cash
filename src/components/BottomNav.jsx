import React, { useState } from 'react'
import { Home, TrendingUp, Receipt, Plus, Menu, Lock, X, Fuel } from 'lucide-react'
import { useStore } from '../store'
import { isProPage } from '../lib/billing'

const LEFT_ITEMS = [
  { key: 'dashboard', label: 'Início', icon: Home },
  { key: 'ganhos', label: 'Ganhos', icon: TrendingUp },
]

const RIGHT_ITEMS = [
  { key: 'despesas', label: 'Despesas', icon: Receipt },
]

function NavButton({ item, active, onClick }) {
  const { icon: Icon, label } = item
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className="relative flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-2xl transition"
    >
      <Icon size={22} strokeWidth={1.8} className={active ? 'text-brand-400' : 'text-slate-400'} />
      <span
        className={`w-1.5 h-1.5 rounded-full transition ${active ? 'bg-brand-400' : 'bg-transparent'}`}
      />
      {label ? <span className="sr-only">{label}</span> : null}
    </button>
  )
}

export default function BottomNav({ page, setPage, onToggleMenu }) {
  const { access } = useStore()
  const [sheetOpen, setSheetOpen] = useState(false)

  const go = (key) => {
    setSheetOpen(false)
    setPage(key)
  }

  return (
    <>
      {/* Barra flutuante estilo "pill" */}
      <nav
        className="fixed left-4 right-4 z-40 lg:hidden"
        style={{ bottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center justify-around rounded-[1.75rem] bg-slate-900 shadow-2xl shadow-black/40 border border-slate-800 px-1 py-1">
          {LEFT_ITEMS.map((item) => (
            <NavButton key={item.key} item={item} active={page === item.key} onClick={() => go(item.key)} />
          ))}

          {/* Botão central elevado "+" */}
          <button
            onClick={() => setSheetOpen(true)}
            title="Adicionar registro"
            aria-label="Adicionar registro"
            className="relative -mt-8 w-14 h-14 shrink-0 rounded-full bg-brand-500 ring-4 ring-slate-900 shadow-lg shadow-brand-500/40 flex items-center justify-center text-white active:scale-95 transition"
          >
            <Plus size={26} strokeWidth={2.4} />
          </button>

          {RIGHT_ITEMS.map((item) => (
            <NavButton key={item.key} item={item} active={page === item.key} onClick={() => go(item.key)} />
          ))}

          <NavButton
            item={{ key: 'mais', label: 'Mais', icon: Menu }}
            active={false}
            onClick={onToggleMenu}
          />
        </div>
      </nav>

      {/* Menu rápido de adição */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setSheetOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="absolute left-4 right-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-4 pb-6"
            style={{ bottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-white">Adicionar registro</span>
              <button
                onClick={() => setSheetOpen(false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-800 transition"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => go('ganhos')}
                className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-slate-800/60 hover:bg-slate-800 transition"
              >
                <span className="w-11 h-11 rounded-full bg-brand-500/15 flex items-center justify-center text-brand-400">
                  <TrendingUp size={20} />
                </span>
                <span className="text-[11px] font-medium text-slate-200">Ganho</span>
              </button>
              <button
                onClick={() => go('despesas')}
                className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-slate-800/60 hover:bg-slate-800 transition"
              >
                <span className="w-11 h-11 rounded-full bg-rose-500/15 flex items-center justify-center text-rose-400">
                  <Receipt size={20} />
                </span>
                <span className="text-[11px] font-medium text-slate-200">Despesa</span>
              </button>
              <button
                onClick={() => go('combustivel')}
                className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-slate-800/60 hover:bg-slate-800 transition"
              >
                <span className="relative w-11 h-11 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-400">
                  <Fuel size={20} />
                  {!access.isPro && isProPage('combustivel') && (
                    <Lock size={10} className="absolute -top-1 -right-1 text-amber-400" />
                  )}
                </span>
                <span className="text-[11px] font-medium text-slate-200">Combustível</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
