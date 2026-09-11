import React from 'react'

/*
  Icones customizados baseados nas artes vetorizadas enviadas pelo cliente (pasta /img).
  Tema neon escuro: tracos azul-claro (currentColor) + gradientes lima->turquesa e azul.
  Vetoriais (SVG inline), nitidos em qualquer tela/densidade.
  API compativel com lucide-react (props size e className).
*/

const GRAD = {
  dash: 'dcg-dash',
  bars: 'dcg-bars',
  paper: 'dcg-paper',
  menu: 'dcg-menu',
}

export function DashboardIcon({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      <defs>
        <linearGradient id={GRAD.dash} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#d8ff4b" />
          <stop offset="1" stopColor="#19d6aa" />
        </linearGradient>
      </defs>
      {/* ladrilho externo */}
      <rect x="2.6" y="2.6" width="18.8" height="18.8" rx="4.6" stroke="currentColor" strokeWidth="1.6" />
      {/* grade 2x2, um quadro preenchido com gradiente */}
      <rect x="6.6" y="6.6" width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="12.9" y="6.6" width="4.5" height="4.5" rx="1.2" fill={`url(#${GRAD.dash})`} />
      <rect x="6.6" y="12.9" width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="12.9" y="12.9" width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

export function SunIcon({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none" strokeLinecap="round">
      {/* nucleo do sol */}
      <circle cx="12" cy="12" r="4.2" fill="#79cfff" stroke="currentColor" strokeWidth="1.5" />
      {/* raios */}
      <g stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2.6v2.8M12 18.6v2.8M2.6 12h2.8M18.6 12h2.8" />
        <path d="M5.4 5.4l2 2M16.6 16.6l2 2M16.6 7.4l2-2M5.4 18.6l2-2" />
      </g>
    </svg>
  )
}

export function ChartIcon({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <linearGradient id={GRAD.bars} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#66baf5" />
          <stop offset="1" stopColor="#1767b0" />
        </linearGradient>
      </defs>
      {/* barras ascendentes */}
      <g fill={`url(#${GRAD.bars})`}>
        <rect x="3.6" y="12" width="4.1" height="7.4" rx="1.1" />
        <rect x="9.95" y="9" width="4.1" height="10.4" rx="1.1" />
        <rect x="16.3" y="5.6" width="4.1" height="13.8" rx="1.1" />
      </g>
      {/* linha de tendencia verde-neon */}
      <path d="M3.2 12.6Q8 10.4 11.4 12T20.6 5.4" stroke="#8dff58" strokeWidth="1.9" />
      <path d="M17.4 4.8h3.4v3.4" stroke="#8dff58" strokeWidth="1.9" />
    </svg>
  )
}

export function ReceiptIcon({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      <defs>
        <linearGradient id={GRAD.paper} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#59bcff" />
          <stop offset="1" stopColor="#0b4c91" />
        </linearGradient>
      </defs>
      {/* papel com base serrilhada */}
      <path
        d="M6.2 3.2h11.6v13.4l-1.95 2.4-1.95-2.4-1.95 2.4-1.95-2.4-1.95 2.4-1.95-2.4V3.2Z"
        fill={`url(#${GRAD.paper})`}
        stroke="#b7d9ed"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* simbolo $ */}
      <text x="12" y="13.8" textAnchor="middle" fill="#d6f1ff" fontSize="8.5" fontWeight="700" fontFamily="Inter, Arial, sans-serif">$</text>
    </svg>
  )
}

export function MenuBarsIcon({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none">
      <defs>
        <linearGradient id={GRAD.menu} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#72c6ff" />
          <stop offset="1" stopColor="#1d5fa8" />
        </linearGradient>
      </defs>
      {/* tres barras arredondadas */}
      <g fill={`url(#${GRAD.menu})`} stroke="#a8dcff" strokeWidth="1">
        <rect x="3.2" y="4.8" width="17.6" height="4" rx="2" />
        <rect x="3.2" y="10" width="17.6" height="4" rx="2" />
        <rect x="3.2" y="15.2" width="17.6" height="4" rx="2" />
      </g>
      <g stroke="#72c6ff" strokeWidth="1.1" opacity=".65" strokeLinecap="round">
        <path d="M6.4 6.8h11.2M6.4 12h11.2M6.4 17.2h11.2" />
      </g>
    </svg>
  )
}
