import { json, supabaseAdmin, getPreapproval, searchPreapprovalsByEmail, rowFromPreapproval, upsertSubscription } from './_mp.js'

// Chamado pelo app após o login:
//  - com preapprovalId (retorno do checkout do MP): vincula a assinatura direto à conta
//  - sem id (botão "Já paguei"): procura pela assinatura pelo e-mail do usuário ou e-mail alternativo
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
    const preapprovalId = (body.preapprovalId || '').trim()
    const emails = [...new Set([appEmail, altEmail].filter(Boolean))]

    let found = null
    if (preapprovalId) {
      try {
        const pre = await getPreapproval(preapprovalId)
        // Evita que um id de outra pessoa seja vinculado a uma conta já usada por outro e-mail
        const { data: existing } = await admin.from('subscriptions')
          .select('email').eq('mp_preapproval_id', pre.id).maybeSingle()
        if (!existing || existing.email === appEmail || existing.email === (pre.payer_email || '').toLowerCase()) {
          found = pre
        }
      } catch (e) {
        console.warn('preapproval não encontrado', preapprovalId, e.message)
      }
    }

    for (const email of emails) {
      if (found && found.status === 'authorized') break
      const list = await searchPreapprovalsByEmail(email)
      found = list.find((p) => p.status === 'authorized') || list.find((p) => p.status === 'paused') || list[0] || found
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
