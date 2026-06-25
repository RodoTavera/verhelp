import { useId } from 'react'
import { normalizePetSpecies, sanitizeAvatarConfig } from '../shared/petAvatar'

const SIZE_CLASSES = {
  sm: 'h-28 w-28',
  md: 'h-40 w-40',
  lg: 'h-56 w-56',
}

export default function PetAvatar3D({ pet, species, avatarConfig, petName, size = 'md', className = '' }) {
  const rawId = useId().replace(/:/g, '')
  const activeSpecies = normalizePetSpecies(species || pet?.species)
  const config = sanitizeAvatarConfig(avatarConfig ?? pet?.avatarConfig, activeSpecies)
  const name = petName || pet?.name || 'mascota'
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md

  return (
    <div className={`relative shrink-0 ${sizeClass} ${className}`} role="img" aria-label={`Avatar de ${name}`}>
      <div
        className="relative h-full w-full overflow-hidden rounded-2xl border border-dark/10"
        style={{
          background: buildStageBackground(config),
          boxShadow: '0 12px 32px rgba(31, 42, 29, 0.10)',
        }}
      >
        <div className="absolute inset-0 rounded-2xl" style={{ background: `radial-gradient(circle at 50% 35%, ${hexToRgba(config.innerColor, 0.45)} 0%, transparent 65%)` }} />
        <div className="absolute inset-0 rounded-2xl" style={{ background: buildPatternOverlay(config) }} />

        <SvgFace config={config} species={activeSpecies} idSuffix={rawId} />

        <div className="pointer-events-none absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-brand shadow-sm">
          <span className="h-1 w-1 rounded-full bg-brand" />
          {name}
        </div>

        <div className="pointer-events-none absolute right-2.5 bottom-2.5 rounded-full bg-brand/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-white shadow-sm">
          {activeSpecies}
        </div>
      </div>
    </div>
  )
}

function SvgFace({ config, species, idSuffix }) {
  const furLight = shiftHexColor(config.furColor, 28)
  const furDark = shiftHexColor(config.furColor, -24)
  const innerLight = shiftHexColor(config.innerColor, 14)
  const gradientId = `${idSuffix}-fur`
  const muzzleId = `${idSuffix}-muzzle`
  const shadowId = `${idSuffix}-shadow`

  const isCat = species === 'gato'
  const isDog = species === 'perro'
  const isRabbit = species === 'conejo'
  const isBird = species === 'pajaro'
  const isReptile = species === 'reptil'
  const isHamster = species === 'hamster'

  return (
    <svg viewBox="0 0 160 160" className="relative h-full w-full" style={{ filter: 'drop-shadow(0 8px 14px rgba(31, 42, 29, 0.14))' }}>
      <defs>
        <radialGradient id={gradientId} cx="38%" cy="30%" r="72%">
          <stop offset="0%" stopColor={furLight} />
          <stop offset="60%" stopColor={config.furColor} />
          <stop offset="100%" stopColor={furDark} />
        </radialGradient>
        <linearGradient id={muzzleId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={innerLight} />
          <stop offset="100%" stopColor={config.innerColor} />
        </linearGradient>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor={hexToRgba(furDark, 0.22)} />
        </filter>
      </defs>

      {/* Orejas */}
      {isCat && (
        <>
          <path d="M48 58 L64 26 L70 62 Z" fill={furDark} />
          <path d="M112 58 L96 26 L90 62 Z" fill={furDark} />
          <path d="M54 56 L63 36 L66 58 Z" fill={innerLight} />
          <path d="M106 56 L97 36 L94 58 Z" fill={innerLight} />
        </>
      )}
      {isDog && (
        <>
          <path d="M44 62 C38 42 48 32 56 48 L58 68 Z" fill={furDark} />
          <path d="M116 62 C122 42 112 32 104 48 L102 68 Z" fill={furDark} />
          <path d="M50 60 C48 48 52 42 56 50 L56 64 Z" fill={innerLight} />
          <path d="M110 60 C112 48 108 42 104 50 L104 64 Z" fill={innerLight} />
        </>
      )}
      {isRabbit && (
        <>
          <path d="M56 76 C52 44 60 22 68 40 L66 78 Z" fill={furDark} />
          <path d="M104 76 C108 44 100 22 92 40 L94 78 Z" fill={furDark} />
          <path d="M60 74 C58 50 62 32 66 44 L64 76 Z" fill={innerLight} />
          <path d="M100 74 C102 50 98 32 94 44 L96 76 Z" fill={innerLight} />
        </>
      )}
      {isHamster && (
        <>
          <circle cx="56" cy="52" r="11" fill={furDark} />
          <circle cx="104" cy="52" r="11" fill={furDark} />
          <circle cx="56" cy="52" r="6" fill={innerLight} />
          <circle cx="104" cy="52" r="6" fill={innerLight} />
        </>
      )}
      {isBird && (
        <>
          <path d="M48 60 C40 48 44 36 58 42 C60 52 56 58 52 64 Z" fill={furDark} />
          <path d="M112 60 C120 48 116 36 102 42 C100 52 104 58 108 64 Z" fill={furDark} />
        </>
      )}
      {isReptile && (
        <path d="M56 56 L64 34 L72 56 L80 30 L88 56 L96 34 L104 56" stroke={furDark} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      )}

      {/* Cabeza */}
      <ellipse cx="80" cy="90" rx="46" ry="48" fill={`url(#${gradientId})`} filter={`url(#${shadowId})`} />

      {/* Patron */}
      {config.pattern === 'spots' && (
        <>
          <circle cx="64" cy="68" r="7" fill={hexToRgba(furDark, 0.26)} />
          <circle cx="94" cy="60" r="8" fill={hexToRgba(furDark, 0.26)} />
          <circle cx="102" cy="78" r="5" fill={hexToRgba(furDark, 0.26)} />
        </>
      )}
      {config.pattern === 'mask' && (
        <path d="M50 84 C60 70 100 70 110 84 C98 90 62 90 50 84 Z" fill={hexToRgba(furDark, 0.24)} />
      )}
      {config.pattern === 'stripe' && (
        <path d="M76 52 C80 46 82 46 84 52 L82 90 C80 94 80 94 78 90 Z" fill={hexToRgba(furDark, 0.24)} />
      )}

      {/* Ojos */}
      {isReptile ? (
        <>
          <ellipse cx="64" cy="86" rx="9" ry="7" fill="#F8FAFC" opacity="0.96" />
          <ellipse cx="96" cy="86" rx="9" ry="7" fill="#F8FAFC" opacity="0.96" />
          <rect x="62.5" y="82" width="3" height="8" rx="1.5" fill={config.eyeColor} />
          <rect x="94.5" y="82" width="3" height="8" rx="1.5" fill={config.eyeColor} />
        </>
      ) : isBird ? (
        <>
          <circle cx="64" cy="86" r="7.5" fill="#F8FAFC" opacity="0.98" />
          <circle cx="96" cy="86" r="7.5" fill="#F8FAFC" opacity="0.98" />
          <circle cx="64" cy="86" r="4" fill={config.eyeColor} />
          <circle cx="96" cy="86" r="4" fill={config.eyeColor} />
          <circle cx="62.5" cy="84.5" r="1.4" fill="#FFFFFF" opacity="0.9" />
          <circle cx="94.5" cy="84.5" r="1.4" fill="#FFFFFF" opacity="0.9" />
        </>
      ) : (
        <>
          <circle cx="64" cy="87" r="7" fill="#F8FAFC" opacity="0.98" />
          <circle cx="96" cy="87" r="7" fill="#F8FAFC" opacity="0.98" />
          <circle cx="64.5" cy="88" r="3.8" fill={config.eyeColor} />
          <circle cx="96.5" cy="88" r="3.8" fill={config.eyeColor} />
          <circle cx="63" cy="86.5" r="1.2" fill="#FFFFFF" opacity="0.92" />
          <circle cx="95" cy="86.5" r="1.2" fill="#FFFFFF" opacity="0.92" />
        </>
      )}

      {/* Hocico */}
      {isReptile ? (
        <>
          <ellipse cx="80" cy="106" rx="22" ry="14" fill={hexToRgba(innerLight, 0.42)} />
          <circle cx="76" cy="102" r="1.4" fill={furDark} />
          <circle cx="84" cy="102" r="1.4" fill={furDark} />
          <path d="M72 110 Q80 114 88 110" stroke={furDark} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </>
      ) : isBird ? (
        <>
          <ellipse cx="80" cy="104" rx="18" ry="14" fill={hexToRgba(config.innerColor, 0.4)} />
          <path d="M76 100 H84 L80 112 Z" fill="#D97706" />
        </>
      ) : (
        <>
          <ellipse cx="80" cy="108" rx={isHamster ? 30 : 26} ry={isHamster ? 20 : 18} fill={`url(#${muzzleId})`} />
          {isHamster && (
            <>
              <circle cx="58" cy="110" r="7" fill={hexToRgba(innerLight, 0.65)} />
              <circle cx="102" cy="110" r="7" fill={hexToRgba(innerLight, 0.65)} />
            </>
          )}
          <ellipse cx="80" cy="100" rx={isRabbit ? 7 : 8} ry={isRabbit ? 5 : 6} fill={furDark} />
          <path d="M80 105 V110" stroke={furDark} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M80 110 Q74 114 70 118" stroke={furDark} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M80 110 Q86 114 90 118" stroke={furDark} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {isCat && (
            <>
              <path d="M58 108 H44" stroke={hexToRgba(furDark, 0.6)} strokeWidth="1.8" strokeLinecap="round" />
              <path d="M59 113 H42" stroke={hexToRgba(furDark, 0.6)} strokeWidth="1.8" strokeLinecap="round" />
              <path d="M102 108 H116" stroke={hexToRgba(furDark, 0.6)} strokeWidth="1.8" strokeLinecap="round" />
              <path d="M101 113 H118" stroke={hexToRgba(furDark, 0.6)} strokeWidth="1.8" strokeLinecap="round" />
            </>
          )}
          {isRabbit && (
            <>
              <rect x="76" y="112" width="4" height="7" rx="1.5" fill="#FFFFFF" opacity="0.92" />
              <rect x="80" y="112" width="4" height="7" rx="1.5" fill="#FFFFFF" opacity="0.92" />
            </>
          )}
        </>
      )}

      {/* Accesorio */}
      {renderAccessory(config.accessory, config.accessoryColor, shiftHexColor(config.accessoryColor, -20))}
    </svg>
  )
}

function renderAccessory(accessory, color, darkColor) {
  if (accessory === 'bandana') {
    return (
      <path d="M46 132 Q80 156 114 132 L108 126 Q80 146 52 126 Z" fill={color} />
    )
  }
  if (accessory === 'bow') {
    return (
      <>
        <ellipse cx="68" cy="130" rx="12" ry="7" fill={color} />
        <ellipse cx="92" cy="130" rx="12" ry="7" fill={color} />
        <circle cx="80" cy="130" r="5" fill={darkColor} />
      </>
    )
  }
  if (accessory === 'medal') {
    return (
      <>
        <rect x="52" y="128" width="56" height="5" rx="2.5" fill={color} />
        <circle cx="80" cy="144" r="9" fill={color} />
        <circle cx="80" cy="144" r="5" fill={darkColor} />
        <text x="80" y="147" textAnchor="middle" fontSize="7" fontWeight="700" fill="#FFFFFF">V+</text>
      </>
    )
  }
  if (accessory === 'collar') {
    return <rect x="50" y="128" width="60" height="5" rx="2.5" fill={color} />
  }
  return null
}

function buildStageBackground(config) {
  const soft = hexToRgba(config.innerColor, 0.55)
  const fur = hexToRgba(config.furColor, 0.14)
  return `radial-gradient(circle at 50% 25%, ${soft} 0%, rgba(255,255,255,0.12) 32%, transparent 58%), linear-gradient(160deg, rgba(31,42,29,0.88) 0%, ${fur} 100%)`
}

function buildPatternOverlay(config) {
  const tone = hexToRgba(config.furColor, 0.14)
  if (config.pattern === 'spots') {
    return `radial-gradient(circle at 22% 26%, ${tone} 0 9%, transparent 10%), radial-gradient(circle at 70% 20%, ${tone} 0 8%, transparent 9%), radial-gradient(circle at 78% 64%, ${tone} 0 7%, transparent 8%)`
  }
  if (config.pattern === 'mask') {
    return `radial-gradient(circle at 50% 16%, ${tone} 0%, transparent 50%), linear-gradient(180deg, ${tone} 0%, transparent 30%)`
  }
  if (config.pattern === 'stripe') {
    return `linear-gradient(90deg, transparent 40%, ${tone} 48%, transparent 56%)`
  }
  return 'none'
}

function shiftHexColor(hex, amount) {
  const { r, g, b } = hexToRgb(hex)
  const clamp = (value) => Math.max(0, Math.min(255, value))
  return `#${[clamp(r + amount), clamp(g + amount), clamp(b + amount)].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

function hexToRgba(hex, alpha = 1) {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function hexToRgb(hex) {
  let normalized = hex.replace('#', '')
  if (normalized.length === 3) {
    normalized = normalized.split('').map((char) => char + char).join('')
  }
  const value = parseInt(normalized, 16)
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 }
}
