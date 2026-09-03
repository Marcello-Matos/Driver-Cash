import React, { useState } from 'react'
import { Truck, Mail, Lock, User, Loader2 } from 'lucide-react'
import { useStore } from '../store'

export default function Auth() {
  const { signIn, signUp } = useStore()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [ok, setOk] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setMsg(''); setOk(''); setBusy(true)
    let err
    if (mode === 'login') err = await signIn(email.trim(), password)
    else err = await signUp(email.trim(), password, name.trim() || 'Motorista')
    setBusy(false)
    if (err) {
      setMsg(traduzErro(err))
    } else if (mode === 'signup') {
      setOk('Conta criada! Se a confirmação de e-mail estiver ativa, verifique sua caixa de entrada. Caso contrário, já pode entrar.')
      setMode('login')
    }
  }

  return (
    <div className="app-shell flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-11 h-11 rounded-xl bg-brand-500 flex items-center justify-center text-white"><Truck size={24} /></div>
          <div className="text-2xl font-extrabold text-slate-800 dark:text-white">Driver<span className="text-brand-500">Cash</span></div>
        </div>

        <div className="card p-6">
          <h1 className="text-lg font-bold mb-1">{mode === 'login' ? 'Entrar na sua conta' : 'Criar sua conta'}</h1>
          <p className="text-sm text-slate-400 mb-5">Controle financeiro para motoristas de aplicativo.</p>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="label">Nome</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input className="input pl-9" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
                </div>
              </div>
            )}
            <div>
              <label className="label">E-mail</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" required className="input pl-9" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />
              </div>
            </div>
            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" required minLength={6} className="input pl-9" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
              </div>
            </div>

            {msg && <div className="text-sm text-rose-500 bg-rose-50 dark:bg-rose-500/10 rounded-lg px-3 py-2">{msg}</div>}
            {ok && <div className="text-sm text-brand-600 bg-brand-50 dark:bg-brand-500/10 rounded-lg px-3 py-2">{ok}</div>}

            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy && <Loader2 size={16} className="animate-spin" />}
              {mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-slate-500">
            {mode === 'login' ? 'Ainda não tem conta?' : 'Já tem uma conta?'}{' '}
            <button
              className="font-semibold text-brand-500 hover:underline"
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMsg(''); setOk('') }}
            >
              {mode === 'login' ? 'Criar conta' : 'Entrar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function traduzErro(err) {
  const e = err.toLowerCase()
  if (e.includes('invalid login')) return 'E-mail ou senha incorretos.'
  if (e.includes('already registered') || e.includes('already exists')) return 'Este e-mail já está cadastrado.'
  if (e.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.'
  if (e.includes('password')) return 'Senha inválida (mínimo 6 caracteres).'
  return err
}
