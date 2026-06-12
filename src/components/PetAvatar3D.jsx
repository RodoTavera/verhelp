import { useId } from 'react'
import { normalizePetSpecies, sanitizeAvatarConfig } from '../shared/petAvatar'

const SIZE_CLASSES = {
  sm: 'h-32 w-32',
  md: 'h-40 w-40',
  lg: 'h-52 w-52',
}

const SIZE_PADDING = {
  sm: 'p-2',
  md: 'p-3',
  lg: 'p-4',
}

export default function PetAvatar3D({ pet, species, avatarConfig, petName, size = 'md', className = '', interactive = false, scene = 'auto' }) {
  const rawId = useId().replace(/:/g, '')
  const activeSpecies = normalizePetSpecies(species || pet?.species)
  const config = sanitizeAvatarConfig(avatarConfig ?? pet?.avatarConfig, activeSpecies)
  const name = petName || pet?.name || 'mascota'
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md
  const padding = SIZE_PADDING[size] || SIZE_PADDING.md
  const isSpline = scene === 'spline' || (scene === 'auto' && activeSpecies === 'perro')

  if (isSpline) {
    return (
      <SplineStage
        config={config}
        name={name}
        sizeClass={sizeClass}
        padding={padding}
        className={className}
        interactive={interactive}
        idSuffix={rawId}
      />
    )
  }

  return (
    <SvgCreature
      config={config}
      activeSpecies={activeSpecies}
      name={name}
      sizeClass={sizeClass}
      padding={padding}
      className={className}
      idSuffix={rawId}
    />
  )
}

function SplineStage({ config, name, sizeClass, padding, className, interactive, idSuffix }) {
  return (
    <div className={`relative shrink-0 ${sizeClass} ${className}`} role="img" aria-label={`Avatar 3D de ${name}`}>
      <div
        className={`relative h-full w-full overflow-hidden rounded-[1.5rem] border ${padding}`}
        style={{
          background: buildStageBackground(config),
          boxShadow: '0 18px 40px rgba(31, 42, 29, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
        }}
      >
        <div className="absolute inset-0 animate-avatar-breath rounded-[1.5rem]" style={{ background: buildPatternOverlay(config) }} />
        <div className="absolute inset-0 rounded-[1.5rem]" style={{ background: `radial-gradient(circle at 50% 30%, ${hexToRgba(config.innerColor, 0.42)} 0%, transparent 70%)` }} />

        <SplineScene config={config} interactive={interactive} idSuffix={idSuffix} />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 rounded-b-[1.5rem]" style={{ background: 'linear-gradient(180deg, transparent, rgba(31, 42, 29, 0.18))' }} />

        <div className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          {activeLabel(config)}
        </div>

        <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
          <div>
            <p className="font-display text-base leading-tight text-white drop-shadow-sm">{name}</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/80">Avatar editorial</p>
          </div>
          <span className="rounded-full border border-white/30 bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
            Spline
          </span>
        </div>
      </div>
    </div>
  )
}

function SplineScene({ config, interactive, idSuffix }) {
  const splineUrl = 'https://my.spline.design/untitled-3mpBkPaTLm9BhB5v43me70Bq/'
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-[1.25rem]"
      style={{ background: 'transparent' }}
    >
      <iframe
        title={`Modelo Spline de ${name}`}
        src={splineUrl}
        loading="lazy"
        className="absolute inset-0 h-full w-full border-0"
        style={{
          filter: buildSplineFilter(config),
          pointerEvents: interactive ? 'auto' : 'none',
          background: 'transparent',
        }}
        sandbox="allow-scripts allow-same-origin allow-pointer-lock"
      />
    </div>
  )
}

function SvgCreature({ config, activeSpecies, name, sizeClass, padding, className, idSuffix }) {
  const furLight = shiftHexColor(config.furColor, 32)
  const furDark = shiftHexColor(config.furColor, -30)
  const innerLight = shiftHexColor(config.innerColor, 18)
  const accessoryDark = shiftHexColor(config.accessoryColor, -22)
  const shadowColor = hexToRgba(config.furColor, 0.18)
  const patternColor = hexToRgba(furDark, 0.24)
  const gradientId = `${idSuffix}-fur`
  const muzzleId = `${idSuffix}-muzzle`
  const haloId = `${idSuffix}-halo`
  const shadowId = `${idSuffix}-shadow`
  const vignetteId = `${idSuffix}-vignette`

  return (
    <div className={`relative shrink-0 ${sizeClass} ${className}`} role="img" aria-label={`Avatar 3D de ${name}`}>
      <div
        className={`relative h-full w-full overflow-hidden rounded-[1.5rem] border ${padding}`}
        style={{
          background: buildStageBackground(config),
          boxShadow: '0 18px 40px rgba(31, 42, 29, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
        }}
      >
        <div className="absolute inset-0 animate-avatar-breath rounded-[1.5rem]" style={{ background: buildPatternOverlay(config) }} />
        <div className="absolute inset-0 rounded-[1.5rem]" style={{ background: `radial-gradient(circle at 50% 30%, ${hexToRgba(config.innerColor, 0.4)} 0%, transparent 70%)` }} />

        <div className="absolute inset-x-3 bottom-3 h-2 rounded-full opacity-60 blur-md" style={{ backgroundColor: shadowColor }} />

        <svg viewBox="0 0 180 180" className="relative h-full w-full" style={{ filter: 'drop-shadow(0 12px 18px rgba(31, 42, 29, 0.18))' }}>
          <defs>
            <radialGradient id={haloId} cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor={hexToRgba(config.innerColor, 0.94)} />
              <stop offset="75%" stopColor={hexToRgba(config.furColor, 0.18)} />
              <stop offset="100%" stopColor={hexToRgba(config.furColor, 0.02)} />
            </radialGradient>
            <radialGradient id={gradientId} cx="36%" cy="28%" r="70%">
              <stop offset="0%" stopColor={furLight} />
              <stop offset="62%" stopColor={config.furColor} />
              <stop offset="100%" stopColor={furDark} />
            </radialGradient>
            <linearGradient id={muzzleId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={innerLight} />
              <stop offset="100%" stopColor={config.innerColor} />
            </linearGradient>
            <filter id={shadowId} x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor={hexToRgba(furDark, 0.25)} />
            </filter>
            <radialGradient id={vignetteId} cx="50%" cy="55%" r="70%">
              <stop offset="55%" stopColor="rgba(0,0,0,0)" />
              <stop offset="100%" stopColor="rgba(31,42,29,0.22)" />
            </radialGradient>
          </defs>

          <circle cx="90" cy="90" r="76" fill={`url(#${haloId})`} />
          {renderEars(activeSpecies, furDark, config.innerColor, innerLight)}
          {activeSpecies === 'reptil' && (
            <path d="M68 48 L76 30 L84 48 L92 26 L100 48 L108 30 L116 48" stroke={furDark} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          )}
          {activeSpecies === 'pajaro' && (
            <path d="M76 42 L90 24 L104 42" fill={furDark} opacity="0.92" />
          )}

          <ellipse cx="90" cy="98" rx="54" ry="58" fill={`url(#${gradientId})`} filter={`url(#${shadowId})`} />
          <ellipse cx="72" cy="74" rx="15" ry="10" fill={hexToRgba(furLight, 0.34)} transform="rotate(-22 72 74)" />
          {renderPattern(config.pattern, patternColor)}

          {activeSpecies === 'reptil' ? (
            <>
              <ellipse cx="70" cy="92" rx="11" ry="8" fill="#F8FAFC" opacity="0.96" />
              <ellipse cx="110" cy="92" rx="11" ry="8" fill="#F8FAFC" opacity="0.96" />
              <rect x="68.5" y="87" width="3" height="10" rx="1.5" fill={config.eyeColor} />
              <rect x="108.5" y="87" width="3" height="10" rx="1.5" fill={config.eyeColor} />
              <ellipse cx="90" cy="114" rx="27" ry="18" fill={hexToRgba(innerLight, 0.42)} />
              <circle cx="84" cy="108" r="1.7" fill={furDark} />
              <circle cx="96" cy="108" r="1.7" fill={furDark} />
              <path d="M77 120 Q90 126 103 120" stroke={furDark} strokeWidth="3" strokeLinecap="round" fill="none" />
            </>
          ) : activeSpecies === 'pajaro' ? (
            <>
              <circle cx="70" cy="92" r="9.5" fill="#F8FAFC" opacity="0.98" />
              <circle cx="110" cy="92" r="9.5" fill="#F8FAFC" opacity="0.98" />
              <circle cx="71" cy="92" r="5" fill={config.eyeColor} />
              <circle cx="111" cy="92" r="5" fill={config.eyeColor} />
              <circle cx="69" cy="90" r="1.6" fill="#FFFFFF" opacity="0.88" />
              <circle cx="109" cy="90" r="1.6" fill="#FFFFFF" opacity="0.88" />
              <ellipse cx="90" cy="112" rx="22" ry="18" fill={hexToRgba(config.innerColor, 0.4)} />
              <path d="M82 109 H98 L90 124 Z" fill="#F59E0B" />
            </>
          ) : (
            <>
              <circle cx="70" cy="93" r="8.5" fill="#F8FAFC" opacity="0.98" />
              <circle cx="110" cy="93" r="8.5" fill="#F8FAFC" opacity="0.98" />
              <circle cx="71" cy="94" r="4.8" fill={config.eyeColor} />
              <circle cx="111" cy="94" r="4.8" fill={config.eyeColor} />
              <circle cx="69" cy="92.3" r="1.4" fill="#FFFFFF" opacity="0.9" />
              <circle cx="109" cy="92.3" r="1.4" fill="#FFFFFF" opacity="0.9" />
              <ellipse cx="90" cy="116" rx={activeSpecies === 'hamster' ? 34 : 30} ry={activeSpecies === 'hamster' ? 26 : 22} fill={`url(#${muzzleId})`} />
              {activeSpecies === 'hamster' && (
                <>
                  <circle cx="66" cy="118" r="8" fill={hexToRgba(innerLight, 0.7)} />
                  <circle cx="114" cy="118" r="8" fill={hexToRgba(innerLight, 0.7)} />
                </>
              )}
              <ellipse cx="90" cy="108" rx={activeSpecies === 'conejo' ? 8 : 10} ry={activeSpecies === 'conejo' ? 6 : 7} fill={furDark} />
              <path d="M90 114 V121" stroke={furDark} strokeWidth="3" strokeLinecap="round" />
              <path d="M90 121 Q82 126 78 132" stroke={furDark} strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M90 121 Q98 126 102 132" stroke={furDark} strokeWidth="3" strokeLinecap="round" fill="none" />
              {activeSpecies === 'gato' && (
                <>
                  <path d="M64 116 H44" stroke={hexToRgba(furDark, 0.7)} strokeWidth="2" strokeLinecap="round" />
                  <path d="M65 122 H42" stroke={hexToRgba(furDark, 0.7)} strokeWidth="2" strokeLinecap="round" />
                  <path d="M116 116 H136" stroke={hexToRgba(furDark, 0.7)} strokeWidth="2" strokeLinecap="round" />
                  <path d="M115 122 H138" stroke={hexToRgba(furDark, 0.7)} strokeWidth="2" strokeLinecap="round" />
                </>
              )}
              {activeSpecies === 'conejo' && (
                <>
                  <rect x="84" y="123" width="5" height="8" rx="2" fill="#FFFFFF" opacity="0.9" />
                  <rect x="91" y="123" width="5" height="8" rx="2" fill="#FFFFFF" opacity="0.9" />
                </>
              )}
            </>
          )}

          {renderAccessory(config.accessory, config.accessoryColor, accessoryDark)}
          <circle cx="90" cy="90" r="78" fill={`url(#${vignetteId})`} pointerEvents="none" />
        </svg>

        <div className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          {activeLabel(config)}
        </div>

        <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
          <div>
            <p className="font-display text-base leading-tight text-white drop-shadow-sm">{name}</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/80">Avatar editorial</p>
          </div>
          <span className="rounded-full border border-white/30 bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
            {activeSpecies}
          </span>
        </div>
      </div>
    </div>
  )
}

function renderEars(species, furDark, innerColor, innerLight) {
  if (species === 'gato') {
    return (
      <>
        <path d="M54 63 L74 24 L82 68 Z" fill={furDark} />
        <path d="M126 63 L106 24 L98 68 Z" fill={furDark} />
        <path d="M62 60 L73 37 L78 63 Z" fill={innerLight} />
        <path d="M118 60 L107 37 L102 63 Z" fill={innerLight} />
      </>
    )
  }

  if (species === 'conejo') {
    return (
      <>
        <path d="M60 80 C56 42 68 14 79 38 L76 92 C74 102 59 100 60 80 Z" fill={furDark} />
        <path d="M120 80 C124 42 112 14 101 38 L104 92 C106 102 121 100 120 80 Z" fill={furDark} />
        <path d="M66 76 C64 48 71 26 78 42 L75 84 C74 90 67 90 66 76 Z" fill={innerColor} />
        <path d="M114 76 C116 48 109 26 102 42 L105 84 C106 90 113 90 114 76 Z" fill={innerColor} />
      </>
    )
  }

  if (species === 'hamster') {
    return (
      <>
        <circle cx="62" cy="58" r="13" fill={furDark} />
        <circle cx="118" cy="58" r="13" fill={furDark} />
        <circle cx="62" cy="58" r="7" fill={innerLight} />
        <circle cx="118" cy="58" r="7" fill={innerLight} />
      </>
    )
  }

  if (species === 'pajaro') {
    return (
      <>
        <path d="M52 84 C40 68 43 48 63 52 C65 66 63 76 58 88 Z" fill={furDark} opacity="0.95" />
        <path d="M128 84 C140 68 137 48 117 52 C115 66 117 76 122 88 Z" fill={furDark} opacity="0.95" />
      </>
    )
  }

  if (species === 'reptil') {
    return null
  }

  return (
    <>
      <path d="M50 82 C34 58 37 118 58 126 C64 104 63 92 60 76 Z" fill={furDark} />
      <path d="M130 82 C146 58 143 118 122 126 C116 104 117 92 120 76 Z" fill={furDark} />
      <path d="M58 84 C49 68 50 106 63 114 C65 100 64 92 63 82 Z" fill={innerLight} />
      <path d="M122 84 C131 68 130 106 117 114 C115 100 116 92 117 82 Z" fill={innerLight} />
    </>
  )
}

function renderPattern(pattern, patternColor) {
  if (pattern === 'spots') {
    return (
      <>
        <circle cx="72" cy="70" r="8" fill={patternColor} />
        <circle cx="103" cy="60" r="10" fill={patternColor} />
        <circle cx="112" cy="82" r="6" fill={patternColor} />
      </>
    )
  }

  if (pattern === 'mask') {
    return <path d="M56 86 C68 68 112 68 124 86 C111 94 69 94 56 86 Z" fill={patternColor} />
  }

  if (pattern === 'stripe') {
    return <path d="M83 52 C88 44 92 44 97 52 L94 96 C91 100 89 100 86 96 Z" fill={patternColor} />
  }

  return null
}

function renderAccessory(accessory, accessoryColor, accessoryDark) {
  if (accessory === 'bandana') {
    return (
      <>
        <path d="M50 140 Q90 170 130 140 L120 132 Q90 156 60 132 Z" fill={accessoryColor} />
        <path d="M86 144 L90 158 L94 144 Z" fill={accessoryDark} />
      </>
    )
  }

  if (accessory === 'bow') {
    return (
      <>
        <ellipse cx="74" cy="138" rx="14" ry="8" fill={accessoryColor} />
        <ellipse cx="106" cy="138" rx="14" ry="8" fill={accessoryColor} />
        <circle cx="90" cy="138" r="6" fill={accessoryDark} />
      </>
    )
  }

  if (accessory === 'medal') {
    return (
      <>
        <rect x="60" y="136" width="60" height="6" rx="3" fill={accessoryColor} />
        <circle cx="90" cy="156" r="10" fill={accessoryColor} />
        <circle cx="90" cy="156" r="6" fill={accessoryDark} />
        <text x="90" y="159" textAnchor="middle" fontSize="8" fontWeight="700" fill="#FFFFFF">V+</text>
      </>
    )
  }

  return (
    <>
      <rect x="56" y="136" width="68" height="6" rx="3" fill={accessoryColor} />
    </>
  )
}

function buildStageBackground(config) {
  const soft = hexToRgba(config.innerColor, 0.6)
  const accent = hexToRgba(config.accessoryColor, 0.18)
  const fur = hexToRgba(config.furColor, 0.18)
  return `radial-gradient(circle at 50% 22%, ${soft} 0%, rgba(255,255,255,0.18) 30%, transparent 56%), linear-gradient(180deg, ${accent} 0%, transparent 28%), linear-gradient(160deg, rgba(31,42,29,0.92) 0%, ${fur} 100%)`
}

function buildPatternOverlay(config) {
  const tone = hexToRgba(config.furColor, 0.16)
  if (config.pattern === 'spots') {
    return `radial-gradient(circle at 24% 28%, ${tone} 0 10%, transparent 11%), radial-gradient(circle at 72% 22%, ${tone} 0 9%, transparent 10%), radial-gradient(circle at 80% 68%, ${tone} 0 8%, transparent 9%)`
  }
  if (config.pattern === 'mask') {
    return `radial-gradient(circle at 50% 18%, ${tone} 0%, transparent 52%), linear-gradient(180deg, ${tone} 0%, transparent 34%)`
  }
  if (config.pattern === 'stripe') {
    return `linear-gradient(90deg, transparent 38%, ${tone} 46%, transparent 54%, transparent 100%)`
  }
  return 'none'
}

function buildSplineFilter(config) {
  const fur = hexToHsl(config.furColor)
  const accent = hexToHsl(config.accessoryColor)
  const inner = hexToHsl(config.innerColor)
  return [
    `hue-rotate(${Math.round(fur.h - 28)}deg)`,
    `saturate(${(0.88 + fur.s / 110).toFixed(2)})`,
    `brightness(${(0.82 + inner.l / 200).toFixed(2)})`,
    `contrast(${(0.96 + accent.s / 220).toFixed(2)})`,
  ].join(' ')
}

function activeLabel(config) {
  const labels = {
    bandana: 'Bandana',
    bow: 'Moño',
    medal: 'Medalla',
    collar: 'Collar',
  }
  const patterns = {
    none: 'Sin patron',
    spots: 'Manchas',
    mask: 'Mascara',
    stripe: 'Franja',
  }
  return `${labels[config.accessory] || 'Avatar'} · ${patterns[config.pattern] || 'Liso'}`
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

function hexToHsl(hex) {
  const { r, g, b } = hexToRgb(hex)
  const rNorm = r / 255
  const gNorm = g / 255
  const bNorm = b / 255
  const max = Math.max(rNorm, gNorm, bNorm)
  const min = Math.min(rNorm, gNorm, bNorm)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break
      case gNorm: h = (bNorm - rNorm) / d + 2; break
      case bNorm: h = (rNorm - gNorm) / d + 4; break
      default: h = 0
    }
    h *= 60
  }
  return { h, s: s * 100, l: l * 100 }
}
