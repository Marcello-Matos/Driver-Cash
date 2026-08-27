import React, { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Já instalado? não mostra.
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
    if (standalone) return
    if (localStorage.getItem('drivercash:hideInstall') === '1') return

    const onPrompt = (e) => {
      e.preventDefault()
      setDeferred(e)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', () => setVisible(false))
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  const install = async () => {
    if (!deferred) return
    deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
    setVisible(false)
  }

  const dismiss = () => {
    localStorage.setItem('drivercash:hideInstall', '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
      <div className="card p-4 flex items-center gap-3 shadow-lg">
        <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0">
          <Download size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm">Instalar o DriverCash</div>
          <div className="text-xs text-slate-400">Adicione à tela inicial e use como um app.</div>
        </div>
        <button className="btn-primary !px-3 !py-1.5 text-xs" onClick={install}>Instalar</button>
        <button onClick={dismiss} className="p-1 text-slate-400 hover:text-slate-600"><X size={16} /></button>
      </div>
    </div>
  )
}
