import crypto from 'node:crypto'
import { json, env, getPreapproval, getAuthorizedPayment, rowFromPreapproval, upsertSubscription } from './_mp.js'

// Valida o header x-signature do Mercado Pago (HMAC SHA-256)
// Documentação: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
function isValidSignature(req, dataId) {
  const secret = env('MP_WEBHOOK_SECRET')
  if (!secret) return true // sem segredo configurado, não valida (útil em testes)

  const signature = req.headers.get('x-signature') || ''
  const requestId = req.headers.get('x-request-id') || ''
  const parts = Object.fromEntries(signature.split(',').map((p) => p.trim().split('=')))
  if (!parts.ts || !parts.v1) return false

  const manifest = `id:${dataId};request-id:${requestId};ts:${parts.ts};`
  const hmac = crypto.createHmac('sha256', secret).update(manifest).digest('hex')
  return hmac === parts.v1
}

export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' })

  const url = new URL(req.url)
  let body = {}
  try { body = await req.json() } catch { /* corpo vazio em alguns testes */ }

  const type = body.type || url.searchParams.get('type') || url.searchParams.get('topic')
  const rawId = body.data?.id ?? url.searchParams.get('data.id') ?? url.searchParams.get('id')
  if (!rawId) return json(200, { ok: true, ignored: 'sem id' })
  const dataId = String(rawId).toLowerCase()

  if (!isValidSignature(req, dataId)) return json(401, { error: 'Assinatura inválida' })

  try {
    let preapprovalId = null

    if (type === 'subscription_preapproval') {
      preapprovalId = rawId
    } else if (type === 'subscription_authorized_payment') {
      const pay = await getAuthorizedPayment(rawId)
      preapprovalId = pay.preapproval_id
    } else {
      // 'payment' e outros tópicos não são necessários para assinaturas
      return json(200, { ok: true, ignored: type })
    }

    if (!preapprovalId) return json(200, { ok: true, ignored: 'sem preapproval_id' })

    const pre = await getPreapproval(preapprovalId)
    const row = rowFromPreapproval(pre)
    await upsertSubscription(row)

    return json(200, { ok: true, email: row.email, status: row.status })
  } catch (err) {
    console.error('mp-webhook', err)
    return json(500, { error: err.message })
  }
}
