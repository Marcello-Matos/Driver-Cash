import React from 'react'
import { Database, Truck } from 'lucide-react'

export default function ConfigNeeded() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
      <div className="w-full max-w-xl card p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-11 h-11 rounded-xl bg-brand-500 flex items-center justify-center text-white"><Truck size={24} /></div>
          <div className="text-2xl font-extrabold">Driver<span className="text-brand-500">Cash</span></div>
        </div>

        <div className="flex items-center gap-2 text-amber-500 font-semibold mb-2">
          <Database size={20} /> Configuração do Supabase necessária
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Para usar o banco de dados na nuvem, preencha as chaves do seu projeto Supabase no arquivo <code className="px-1 rounded bg-slate-100 dark:bg-slate-700">.env</code> e reinicie o servidor.
        </p>

        <ol className="text-sm space-y-3 list-decimal list-inside text-slate-600 dark:text-slate-300">
          <li>Crie um projeto grátis em <b>supabase.com</b>.</li>
          <li>No painel: <b>SQL Editor → New query</b>, cole o conteúdo de <code className="px-1 rounded bg-slate-100 dark:bg-slate-700">supabase/schema.sql</code> e clique em <b>Run</b>.</li>
          <li>Em <b>Project Settings → API</b>, copie a <b>Project URL</b> e a chave <b>anon public</b>.</li>
          <li>Cole no arquivo <code className="px-1 rounded bg-slate-100 dark:bg-slate-700">.env</code>:
            <pre className="mt-2 p-3 rounded-lg bg-slate-900 text-slate-100 text-xs overflow-x-auto">VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon</pre>
          </li>
          <li>Pare o servidor (Ctrl+C) e rode <code className="px-1 rounded bg-slate-100 dark:bg-slate-700">npm run dev</code> novamente.</li>
        </ol>
      </div>
    </div>
  )
}
