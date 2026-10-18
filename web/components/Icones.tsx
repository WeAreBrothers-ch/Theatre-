/* Pictogrammes au trait, 24 × 24, couleur du texte. */

type P = {className?: string}

const base = (className = '') => ({
  className: `icone ${className}`.trim(),
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  'aria-hidden': true,
  focusable: false,
})

export const Fleche = ({className}: P) => (
  <svg {...base(`icone--fleche ${className ?? ''}`)} strokeLinecap="square">
    <path d="M3 12h16M13 6l6 6-6 6" />
  </svg>
)
export const FlecheGauche = ({className}: P) => (
  <svg {...base(className)} strokeLinecap="square">
    <path d="M21 12H5M11 6l-6 6 6 6" />
  </svg>
)
export const Externe = ({className}: P) => (
  <svg {...base(className)} strokeLinecap="square">
    <path d="M7 17 17 7M9 7h8v8" />
  </svg>
)
export const Billet = ({className}: P) => (
  <svg {...base(className)} viewBox="0 0 26 16" strokeWidth={1.8}>
    <path d="M1 1h24v4.1a2.9 2.9 0 0 0 0 5.8V15H1v-4.1a2.9 2.9 0 0 0 0-5.8z" />
    <path d="M17.5 2v12" strokeDasharray="2 2" strokeWidth={1.6} />
  </svg>
)
export const Telephone = ({className}: P) => (
  <svg {...base(className)} strokeLinejoin="round">
    <path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z" />
  </svg>
)
export const Enveloppe = ({className}: P) => (
  <svg {...base(className)}>
    <rect x="3" y="5" width="18" height="14" />
    <path d="m3 6 9 7 9-7" />
  </svg>
)
export const Repere = ({className}: P) => (
  <svg {...base(className)}>
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
)
export const Horloge = ({className}: P) => (
  <svg {...base(className)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
)
export const Loupe = ({className}: P) => (
  <svg {...base(className)}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 5 5" />
  </svg>
)
export const Croix = ({className}: P) => (
  <svg {...base(className)} strokeLinecap="square">
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)
export const VueListe = ({className}: P) => (
  <svg {...base(className)}>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </svg>
)
export const VueAffiches = ({className}: P) => (
  <svg {...base(className)}>
    <rect x="4" y="3" width="6.5" height="8" />
    <rect x="13.5" y="3" width="6.5" height="8" />
    <rect x="4" y="14" width="6.5" height="8" />
    <rect x="13.5" y="14" width="6.5" height="8" />
  </svg>
)
export const Train = ({className}: P) => (
  <svg {...base(className)}>
    <rect x="5" y="3" width="14" height="14" rx="2" />
    <path d="M5 11h14M8 21l2-4M16 21l-2-4" />
  </svg>
)
export const Bus = ({className}: P) => (
  <svg {...base(className)}>
    <rect x="4" y="3" width="16" height="15" rx="2" />
    <path d="M4 11h16M7 21v-3M17 21v-3" />
  </svg>
)
export const Parking = ({className}: P) => (
  <svg {...base(className)} strokeWidth={2.4}>
    <path d="M8 18V6h5a4 4 0 0 1 0 8H8" />
  </svg>
)
export const Couverts = ({className}: P) => (
  <svg {...base(className)}>
    <path d="M6 3v8a3 3 0 0 0 6 0V3M9 3v18M17 3c-2 2-2 6 0 8v10" />
  </svg>
)
export const Alerte = ({className}: P) => (
  <svg {...base(className)} strokeLinejoin="round">
    <path d="M12 3 2 20h20L12 3z" />
    <path d="M12 10v4M12 17v.5" />
  </svg>
)
export const Coche = ({className}: P) => (
  <svg {...base(className)} strokeWidth={2.4} strokeLinecap="square">
    <path d="m4 12 5 5L20 6" />
  </svg>
)
