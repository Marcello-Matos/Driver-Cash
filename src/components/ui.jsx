import React, { useEffect } from 'react'
import { X, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useLockBodyScroll } from '../lib/useLockBodyScroll'

export function KpiCard({ icon: Icon, iconBg, label, value, delta, deltaLabel, subtitle, color }) {
  const up = delta != null && delta >= 0
  const isColored = !!color
  return (
    <div className={`p-4 sm:p-5 flex flex-col gap-2 sm:gap-3 rounded-2xl shadow-sm ${isColored ? `text-white ${color}` : 'card'}`}>
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-white ${isColored ? 'bg-white/20' : iconBg}`}>
          <Icon size={20} />
        </div>
      </div>
      <div>
        <div className={`text-[11px] sm:text-xs font-medium uppercase tracking-wide ${isColored ? 'text-white/80' : 'text-slate-400'}`}>{label}</div>
        <div className="text-xl sm:text-2xl font-extrabold mt-1">{value}</div>
        {delta != null ? (
          <div className={`mt-1 text-xs font-semibold flex items-center gap-1 ${isColored ? 'text-white/90' : (up ? 'text-brand-500' : 'text-rose-500')}`}>
            {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(delta).toFixed(1)}% {deltaLabel}
          </div>
        ) : (
          subtitle && <div className={`mt-1 text-xs ${isColored ? 'text-white/80' : 'text-slate-400'}`}>{subtitle}</div>
        )}
      </div>
    </div>
  )
}

export function SectionCard({ title, action, children, className = '' }) {
  return (
    <div className={`card p-5 ${className}`}>
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          {title && <h2 className="font-bold text-base">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

export function Modal({ open, onClose, title, children, footer }) {
  useLockBodyScroll(open)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg card p-6 modal-panel overflow-y-auto overscroll-contain">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500">
            <X size={20} />
          </button>
        </div>
        {children}
        {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-slate-400 mb-3">
          <Icon size={26} />
        </div>
      )}
      <div className="font-semibold text-slate-700 dark:text-slate-200">{title}</div>
      {subtitle && <div className="text-sm text-slate-400 mt-1 max-w-sm">{subtitle}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Badge({ children, color = 'slate' }) {
  const map = {
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    green: 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300',
    red: 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300'
  }
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[color]}`}>{children}</span>
}
