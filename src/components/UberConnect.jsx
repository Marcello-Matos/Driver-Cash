import React, { useCallback, useEffect, useState } from 'react'
import { Link2, RefreshCw, Unlink, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'
import { useStore } from '../store'
import { uberCall } from '../lib/uber'
import { consumeUberReturn } from '../lib/entry'

const fmtDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'

export default function UberConnect() {
  const { reload } = useStore()
  const [status, setStatus] = useState(null)
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState(null)

  const loadStatus = useCallback(async () => {
    const r = await uberCall('status')
    setStatus(r.ok ? r : { configured: false, connected: false, message: r.error })
    return r
  }, [])

  useEffect(() => {
    const ret = consumeUberReturn()
    if (ret?.status === 'connected') {
      setNotice({ type: 'ok', text: 'Conta Uber conectada! Seus ganhos dos últimos 30 dias foram importados.' })
      reload()
    } else if (ret?.status === 'error') {
      setNotice({ type: 'error', text: ret.message || 'Não foi possível conectar à Uber.' })
    }
    loadStatus()
  }, [loadStatus, reload])

  const connect = async () => {
    setBusy('connect')
    const r = await uberCall('connect')
    if (r.ok && r.url) { window.location.href = r.url; return }
    setNotice({ type: 'error', text: r.error || 'Integração indisponível.' })
    setBusy('')
  }

  const sync = async () => {
    setBusy('sync')
    setNotice(null)
    const r = await uberCall('sync')
    if (r.ok) {
      setNotice({ type: 'ok', text: r.days ? `${r.days} dia(s) atualizados com os dados da Uber.` : 'Nenhum ganho novo na Uber.' })
      await reload()
    } else {
      setNotice({ type: 'error', text: r.error })
    }
    await loadStatus()
    setBusy('')
  }

  const disconnect = async () => {
    if (!window.confirm('Desconectar sua conta Uber? Os ganhos já importados continuam salvos.')) return
    setBusy('disconnect')
    await uberCall('disconnect')
    await loadStatus()
    setNotice(null)
    setBusy('')
  }

  if (!status) return null
  if (!status.configured && !status.connected) return null

  return (
    <div className="card p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-extrabold text-sm shrink-0">Uber</div>
        <div className="min-w-0">
          <div className="font-semibold">
            {status.connected ? `Uber conectada${status.driverName ? ` · ${status.driverName}` : ''}` : 'Importar ganhos da Uber automaticamente'}
          </div>
          <div className="text-xs text-slate-400">
            {status.connected
              ? status.lastSyncStatus === 'unauthorized'
                ? 'A Uber recusou o acesso. Reconecte sua conta.'
                : `Última sincronização: ${fmtDateTime(status.lastSyncAt)} · atualiza sozinho a cada 3 horas`
              : 'Conecte sua conta de motorista e seus ganhos, corridas e km entram sozinhos.'}
          </div>
          {notice && (
            <div className={`mt-1 text-xs flex items-center gap-1 ${notice.type === 'ok' ? 'text-brand-500' : 'text-rose-500'}`}>
              {notice.type === 'ok' ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />} {notice.text}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {status.connected && status.lastSyncStatus !== 'unauthorized' ? (
          <>
            <button className="btn-primary" onClick={sync} disabled={!!busy}>
              {busy === 'sync' ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} Sincronizar
            </button>
            <button className="btn-ghost" onClick={disconnect} disabled={!!busy} title="Desconectar">
              {busy === 'disconnect' ? <Loader2 size={16} className="animate-spin" /> : <Unlink size={16} />}
            </button>
          </>
        ) : (
          <button className="btn-primary" onClick={connect} disabled={!!busy}>
            {busy === 'connect' ? <Loader2 size={16} className="animate-spin" /> : <Link2 size={16} />}
            {status.connected ? 'Reconectar' : 'Conectar Uber'}
          </button>
        )}
      </div>
    </div>
  )
}
