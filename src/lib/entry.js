// Controla a "porta de entrada" do app:
//  - visitante desconhecido sem login -> landing page
//  - retorno do Mercado Pago (?preapproval_id=...) -> guarda o id para vincular à conta após o login
//  - links vindos da landing (?cadastro=1 | ?login=1) -> abre a tela correspondente

export const LANDING_URL = import.meta.env.VITE_LANDING_URL || 'https://driver-cash-web-site.vercel.app/'

const KNOWN_KEY = 'drivercash:known-device'
const PENDING_KEY = 'drivercash:pending-preapproval'

// Retorno da conexão com a Uber (?uber=connected|error&uber_msg=...), consumido uma vez pela tela de Ganhos
let uberReturn = null
export function consumeUberReturn() {
  const r = uberReturn
  uberReturn = null
  return r
}

export function markKnownDevice() {
  try { localStorage.setItem(KNOWN_KEY, '1') } catch { /* ignore */ }
}
export function isKnownDevice() {
  try { return localStorage.getItem(KNOWN_KEY) === '1' } catch { return false }
}

// App instalado na tela inicial (PWA standalone): nunca redireciona para a landing.
// O ícone tem armazenamento próprio (principalmente no iPhone), então o aparelho
// pareceria "desconhecido" mesmo depois do login — quem instalou quer entrar no app.
function isStandaloneApp() {
  try {
    return window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true // Safari/iOS
  } catch { return false }
}

export function getPendingPreapproval() {
  try { return localStorage.getItem(PENDING_KEY) || '' } catch { return '' }
}
export function setPendingPreapproval(id) {
  try {
    if (id) localStorage.setItem(PENDING_KEY, id)
    else localStorage.removeItem(PENDING_KEY)
  } catch { /* ignore */ }
}

/**
 * Lê os parâmetros da URL uma única vez ao abrir o app, limpa a URL e devolve
 * { authMode: 'login' | 'signup' | null, fromPayment: boolean, redirectToLanding: boolean }
 */
export function readEntry() {
  const url = new URL(window.location.href)
  const p = url.searchParams

  const preapprovalId = p.get('preapproval_id') || ''
  const fromPayment = !!preapprovalId || p.get('from') === 'mp' || p.get('pago') === '1'
  const wantsSignup = p.has('cadastro') || p.get('mode') === 'signup'
  const wantsLogin = p.has('login') || p.has('entrar') || p.get('mode') === 'login'

  if (preapprovalId) setPendingPreapproval(preapprovalId)

  const uber = p.get('uber')
  if (uber) {
    uberReturn = { status: uber, message: p.get('uber_msg') || '' }
    window.history.replaceState({}, '', url.pathname)
  }

  const cameFromLink = fromPayment || wantsSignup || wantsLogin
  if (cameFromLink) {
    markKnownDevice()
    // Remove os parâmetros para não reprocessar em um refresh
    window.history.replaceState({}, '', url.pathname)
  }

  return {
    uber: uber || null,
    authMode: fromPayment || wantsSignup ? 'signup' : wantsLogin ? 'login' : null,
    fromPayment,
    redirectToLanding: !cameFromLink && !isKnownDevice() && !isStandaloneApp()
  }
}
