import { json, supabaseAdmin, searchPreapprovalsByEmail, rowFromPreapproval, upsertSubscription } from './_mp.js'

// Chamado pelo botão "Já paguei, verificar" do app.
// Procura no Mercado Pago uma assinatura autorizada para o e-mail do usuário
// (ou para um e-mail alternativo informado, caso a conta do MP use outro e-mail).
export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' })

  const auth = req.headers.get('authorization') || ''
  const token = auth.replace(/^Bearer\s+/i, '')
  if (!token) return json(401, { error: 'Não autenticado' })

  let body = {}
  try { body = await req.json() } catch { /* sem corpo */ }

  try {
    const admin = supabaseAdmin()
    const { data: userData, error: userErr } = await admin.auth.getUser(token)
    if (userErr || !userData?.user?.email) return json(401, { error: 'Sessão inválida' })

    const appEmail = userData.user.email.trim().toLowerCase()
    const altEmail = (body.mpEmail || '').trim().toLowerCase()
    const emails = [...new Set([appEmail, altEmail].filter(Boolean))]

    let found = null
    for (const email of emails) {
      const list = await searchPreapprovalsByEmail(email)
      found = list.find((p) => p.status === 'authorized') || list.find((p) => p.status === 'paused') || list[0] || null
      if (found && found.status === 'authorized') break
    }

    if (!found) {
      return json(404, { ok: false, message: 'Nenhuma assinatura encontrada para este e-mail no Mercado Pago.' })
    }

    const row = rowFromPreapproval(found, appEmail)
    await upsertSubscription(row)

    return json(200, { ok: true, status: row.status, plan: row.plan, current_period_end: row.current_period_end })
  } catch (err) {
    console.error('mp-verify', err)
    return json(500, { error: err.message })
  }
}
