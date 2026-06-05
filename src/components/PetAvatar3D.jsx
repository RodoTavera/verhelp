import { useId } from 'react'
import { normalizePetSpecies, sanitizeAvatarConfig } from '../shared/petAvatar'
import PetDogSplineAvatar from './PetDogSplineAvatar'

const SIZE_CLASSES = {
  sm: 'h-28 w-28',
  md: 'h-32 w-32',
  lg: 'h-40 w-40',
}

export default function PetAvatar3D({ pet, species, avatarConfig, petName, size = 'md', className = '', interactive = false }) {
  const rawId = useId().replace(/:/g, '')
  const activeSpecies = normalizePetSpecies(species || pet?.species)
  const config = sanitizeAvatarConfig(avatarConfig ?? pet?.avatarConfig, activeSpecies)
  const furLight = shiftHexColor(config.furColor, 32)
  const furDark = shiftHexColor(config.furColor, -30)
  const innerLight = shiftHexColor(config.innerColor, 18)
  const accessoryDark = shiftHexColor(config.accessoryColor, -22)
  const shadowColor = hexToRgba(config.furColor, 0.18)
  const patternColor = hexToRgba(furDark, 0.24)
  const name = petName || pet?.name || 'mascota'
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md
  const gradientId = `${rawId}-fur`
  const muzzleId = `${rawId}-muzzle`
  const haloId = `${rawId}-halo`
  const shadowId = `${rawId}-shadow`

  if (activeSpecies === 'perro') {
    return (
      <PetDogSplineAvatar
        avatarConfig={config}
        petName={petName || pet?.name}
        size={size}
        className={className}
        interactive={interactive}
      />
    )
  }

  return (
    <div className={`relative shrink-0 ${sizeClass} ${className}`} aria-label={`Avatar 3D de ${name}`} role="img">
      <div className="absolute inset-x-5 bottom-2 h-5 rounded-full blur-md" style={{ backgroundColor: shadowColor }} />
      <svg
        viewBox="0 0 180 180"
        className="relative h-full w-full"
        style={{ filter: 'drop-shadow(0 18px 28px rgba(22, 78, 99, 0.18))' }}
      >
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
      </svg>
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
        <path d="M50 128 Q90 143 130 128 L130 136 Q90 151 50 136 Z" fill={accessoryColor} />
        <path d="M74 132 L90 154 L106 132 Z" fill={accessoryDark} />
      </>
    )
  }

  if (accessory === 'bow') {
    return (
      <>
        <ellipse cx="77" cy="129" rx="13" ry="9" fill={accessoryColor} />
        <ellipse cx="103" cy="129" rx="13" ry="9" fill={accessoryColor} />
        <circle cx="90" cy="129" r="6" fill={accessoryDark} />
      </>
    )
  }

  if (accessory === 'medal') {
    return (
      <>
        <path d="M52 127 Q90 141 128 127 L128 135 Q90 150 52 135 Z" fill={accessoryColor} />
        <circle cx="90" cy="141" r="10" fill={accessoryDark} />
        <circle cx="90" cy="141" r="4" fill="#FFFFFF" opacity="0.62" />
      </>
    )
  }

  return <path d="M52 127 Q90 141 128 127 L128 135 Q90 150 52 135 Z" fill={accessoryColor} />
}

function shiftHexColor(hexColor, delta) {
  const normalized = String(hexColor || '').replace('#', '')
  if (normalized.length !== 6) return '#000000'

  const next = [0, 2, 4]
    .map((index) => {
      const channel = Number.parseInt(normalized.slice(index, index + 2), 16)
      const value = clampChannel(channel + delta)
      return value.toString(16).padStart(2, '0')
    })
    .join('')

  return `#${next}`.toUpperCase()
}

function hexToRgba(hexColor, alpha) {
  const normalized = String(hexColor || '').replace('#', '')
  if (normalized.length !== 6) return `rgba(0, 0, 0, ${alpha})`

  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

function clampChannel(value) {
  return Math.max(0, Math.min(255, value))
}