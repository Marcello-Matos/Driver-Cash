import { createClient } from '@supabase/supabase-js'

// Valores públicos padrão (a chave "publishable" é segura para o navegador,
// pois o acesso aos dados é protegido pelas regras RLS do Supabase).
// As variáveis de ambiente do .env têm prioridade, se existirem.
const DEFAULT_URL = 'https://szqfgzixspaoucidrevv.supabase.co'
const DEFAULT_ANON_KEY = 'sb_publishable_1ZyXDzg-F8roLUV0yI0nJA_HcepGvWC'

const url = import.meta.env.VITE_SUPABASE_URL || DEFAULT_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY

// Verdadeiro somente quando as duas variáveis estão preenchidas no .env
export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null
