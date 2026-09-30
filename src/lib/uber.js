import { supabase } from './supabase'

// Chama a Netlify Function da integração com a Uber
export async function uberCall(action) {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) return { ok: false, error: 'Sessão expirada. Entre novamente.' }

  try {
    const res = await fetch('/.netlify/functions/uber', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ action })
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) return { ok: false, ...body, error: body.error || body.message || 'Falha na comunicação com o servidor.' }
    return { ok: true, ...body }
  } catch {
    return { ok: false, error: 'Servidor indisponível (a integração só funciona no site publicado na Netlify).' }
  }
}
