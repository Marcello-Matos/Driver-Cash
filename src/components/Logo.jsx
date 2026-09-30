import React from 'react'

/*
  Logo animado do DriverCash, baseado na arte enviada pelo cliente
  (img/drivercash_vector.svg): tile verde com caminhao em traço branco.
  Animacao leve: suspensao balancando, rodas girando e pulso de brilho.
  Respeita prefers-reduced-motion (ver index.css).
*/
export default function LogoMark({ size = 40, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={`dcg-logo-tile ${className}`}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="dcg-tile" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#2be07d" />
          <stop offset="1" stopColor="#12a75c" />
        </linearGradient>
      </defs>

      {/* ladrilho verde com canto arredondado */}
      <rect width="48" height="48" rx="10" fill="url(#dcg-tile)" />

      {/* carroceria com suspensao leve (nao inclui as rodas) */}
      <g className="dcg-truck-body" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.12 30.72V21.84h22.32l7.44 7.68v8.16H9.12Z" />
        <path d="M31.44 21.84v7.68h7.44" />
        <path d="M9.12 30.72h-3.84M42.72 30.72h3.12" />
      </g>

      {/* eixos fixos no chao */}
      <g stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
        <path d="M9.12 37.68h-2.88M38.88 37.68h4.32" />
      </g>

      {/* rodas girando devagar */}
      {[17.28, 34.32].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="37.68" r="3.6" fill="none" stroke="#fff" strokeWidth="2.2" />
          <g className="dcg-wheel" stroke="#fff" strokeWidth="1.4" strokeLinecap="round">
            <path d={`M${cx - 2.3} 37.68h4.6M${cx} 35.38v4.6`} />
          </g>
        </g>
      ))}
    </svg>
  )
}
