import React from 'react'

/*
  Icones customizados no estilo do modelo enviado pelo cliente:
  traço azul arredondado (currentColor) + detalhes com gradiente amarelo→laranja.
  Vetoriais (SVG), nítidos em qualquer tela/densidade.
  API compativel com lucide-react (props size e className) para troca facil.
*/

function GradientDefs({ id }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fde047" />
        <stop offset="55%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
  )
}

const base = {
  fill: 'none',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function HomeIcon({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <GradientDefs id="g-home" />
      {/* corpo da casa */}
      <path
        d="M4 10.6 12 4l8 6.6V19.4a1.4 1.4 0 0 1-1.4 1.4H5.4A1.4 1.4 0 0 1 4 19.4Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      {/* porta com gradiente */}
      <path
        d="M10 20.8v-5.4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5.4Z"
        fill="url(#g-home)"
      />
    </svg>
  )
}

export function ClockIcon({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <GradientDefs id="g-clock" />
      {/* mostrador */}
      <circle cx="12" cy="12" r="8.6" stroke="currentColor" strokeWidth="1.8" />
      {/* ponteiros com gradiente */}
      <path d="M12 7.4V12l3.2 2.1" stroke="url(#g-clock)" strokeWidth="2" />
      {/* pino central */}
      <circle cx="12" cy="12" r="1.1" fill="url(#g-clock)" stroke="none" />
    </svg>
  )
}

export function TrendingIcon({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <GradientDefs id="g-trend" />
      {/* linha de crescimento */}
      <path
        d="M3.4 17.6 9 12l3.6 3.6 7.4-7.4"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      {/* ponta da seta com gradiente */}
      <path d="M14.6 8h5.4v5.4" stroke="url(#g-trend)" strokeWidth="2" />
    </svg>
  )
}

export function ReceiptIcon({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <GradientDefs id="g-receipt" />
      {/* corpo do recibo com base serrilhada */}
      <path
        d="M6 3.6h12a.9.9 0 0 1 .9.9v15.7l-2.45-1.5-2.45 1.5-2.45-1.5-2.45 1.5-2.45-1.5L4.2 20.2V4.5a.9.9 0 0 1 .9-.9Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      {/* linhas de texto com gradiente */}
      <path d="M8.4 8.6h7.2M8.4 12.2h4.4" stroke="url(#g-receipt)" strokeWidth="2" />
    </svg>
  )
}

export function MenuIcon({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <GradientDefs id="g-menu" />
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" />
      {/* destaque no meio */}
      <circle cx="12" cy="12" r="0" />
    </svg>
  )
}
