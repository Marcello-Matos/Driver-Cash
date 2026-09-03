import { useEffect } from 'react'

// Conta quantos overlays estao abertos ao mesmo tempo (menu lateral + modal),
// para que fechar um nao libere a rolagem enquanto o outro continua aberto.
let abertos = 0

/**
 * Trava a rolagem do fundo enquanto um menu ou modal esta aberto.
 * No celular, sem isso a pagina de tras rola junto com o dedo e a barra
 * inferior parece se mover.
 */
export function useLockBodyScroll(active) {
  useEffect(() => {
    if (!active) return
    abertos += 1
    document.body.classList.add('no-scroll')
    return () => {
      abertos = Math.max(0, abertos - 1)
      if (abertos === 0) document.body.classList.remove('no-scroll')
    }
  }, [active])
}
