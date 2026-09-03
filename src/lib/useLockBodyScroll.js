import { useEffect } from 'react'

/**
 * Trava a rolagem do fundo enquanto um menu ou modal esta aberto.
 * No celular, sem isso a pagina de tras rola junto com o dedo e a barra
 * inferior parece se mover.
 */
export function useLockBodyScroll(active) {
  useEffect(() => {
    if (!active) return
    document.body.classList.add('no-scroll')
    return () => document.body.classList.remove('no-scroll')
  }, [active])
}
