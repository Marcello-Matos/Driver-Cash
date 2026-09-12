import React, { useState } from 'react'
import { X, Lock, LogOut } from 'lucide-react'
import { ReceiptIcon } from './icons'
import LogoMark from './Logo'
import { useStore } from '../store'
import { isProPage } from '../lib/billing'
import { useLockBodyScroll } from '../lib/useLockBodyScroll'

const NAV = [
  { key: 'dashboard', label: 'Dashboard', img: '/01-crescimento.svg' },
  { key: 'hoje', label: 'Resumo diário', img: '/05-sol.svg' },
  { key: 'ganhos', label: 'Ganhos', img: '/02-dinheiro.svg' },
  { key: 'despesas', label: 'Despesas', icon: ReceiptIcon },
  { key: 'combustivel', label: 'Combustível', img: '/03-combustivel.svg' },
  { key: 'manutencao', label: 'Manutenção', img: '/04-ferramenta.svg' },
  { key: 'veiculos', label: 'Veículos', img: '/12-carro.svg' },
  { key: 'metas', label: 'Metas', img: '/07-meta.svg' },
  { key: 'relatorios', label: 'Relatórios', img: '/06-relatorio.svg' },
  { key: 'exportar', label: 'Exportar PDF', img: '/08-pdf.svg' },
  { key: 'calendario', label: 'Calendário', img: '/09-calendario.svg' },
  { key: 'configuracoes', label: 'Configurações', img: '/10-configuracoes.svg' },
  { key: 'assinatura', label: 'Assinatura', img: '/11-coroa.svg' }
]

export default function Sidebar({ page, setPage, open, onClose }) {
  const { profile, access, signOut } = useStore()
  const [avatarError, setAvatarError] = useState(false)
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
          <LogoMark size={36} className="shrink-0" />
          <div className="leading-tight">
            <div className="font-extrabold text-white text-lg">
              Driver<span className="bg-gradient-to-r from-lime-300 to-teal-300 bg-clip-text text-transparent">Cash</span>
            </div>
            <div className="text-[10px] text-slate-400 -mt-0.5">Controle financeiro para motoristas</div>
          </div>
          <button className="ml-auto lg:hidden text-slate-400" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV.map(({ key, label, img, icon: Icon }) => {
            const active = page === key
            return (
              <button
                key={key}
                onClick={() => setPage(key)}
                className={`nav-btn-3d group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
                  ${active
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                {img ? (
                  <img src={img} alt="" draggable="false"
                    className={`nav-icon-3d w-7 h-7 shrink-0 ${active ? "nav-icon-active" : ""}`} />
                ) : (
                  <Icon size={18} className="shrink-0 transition-transform duration-200 ease-out group-hover:scale-125" />
                )}
                {label}
                {!access.isPro && isProPage(key) && <Lock size={13} className="ml-auto opacity-60" />}
                {key === 'assinatura' && !access.isPro && (
                  <span className="ml-auto text-[10px] font-bold uppercase bg-amber-500 text-white px-1.5 py-0.5 rounded-md">Pro</span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Profile */}
        <div className="p-3 border-t border-slate-800 flex items-center gap-2">
          <button
            onClick={() => setPage('configuracoes')}
            className="flex-1 min-w-0 flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-800 transition"
          >
            <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-semibold overflow-hidden shrink-0">
              {profile.avatar_url && !avatarError ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                initials
              )}
            </div>
            <div className="text-left leading-tight min-w-0">
              <div className="text-sm font-semibold text-white truncate">{profile.name}</div>
              <div className="text-xs text-slate-400 truncate">{profile.role}</div>
            </div>
          </button>
          <button
            onClick={signOut}
            title="Sair da conta"
            className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
    </>
  )
}
