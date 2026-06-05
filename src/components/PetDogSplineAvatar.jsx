import { useRef, useState } from 'react'
import { useGSAP, gsap } from '../lib/gsap'
import { sanitizeAvatarConfig } from '../shared/petAvatar'

const SPLINE_DOG_URL = 'https://my.spline.design/untitled-3mpBkPaTLm9BhB5v43me70Bq/'

const SIZE_CLASSES = {
  sm: 'h-28 w-28',
  md: 'h-32 w-32',
  lg: 'h-40 w-40',
}

export default function PetDogSplineAvatar({ avatarConfig, petName, size = 'md', className = '', interactive = false }) {
  const config = sanitizeAvatarConfig(avatarConfig, 'perro')
  const containerRef = useRef(null)
  const [loaded, setLoaded] = useState(false)
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md
  const filter = buildSplineFilter(config)
  const furGlow = hexToRgba(config.furColor, 0.26)
  const accentGlow = hexToRgba(config.accessoryColor, 0.2)
  const innerGlow = hexToRgba(config.innerColor, 0.42)
  const label = petName || 'mascota'

  useGSAP(
    () => {
      if (!containerRef.current) return undefined

      const mm = gsap.matchMedia()
      mm.add(
        {
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { reduceMotion } = context.conditions
          const root = containerRef.current
          const stage = root?.querySelector('[data-spline-stage]')
          const glow = root?.querySelector('[data-spline-glow]')
          const badge = root?.querySelector('[data-spline-badge]')

          if (!stage) return undefined

          if (reduceMotion) {
            gsap.set([stage, glow, badge], { clearProps: 'all', autoAlpha: 1, y: 0, scale: 1 })
            return undefined
          }

          gsap.fromTo(
            stage,
            { autoAlpha: 0, y: 16, scale: 0.96 },
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.72, ease: 'power3.out' }
          )

          if (glow) {
            gsap.fromTo(
              glow,
              { autoAlpha: 0.26, scale: 0.88 },
              { autoAlpha: 0.92, scale: 1, duration: 0.88, ease: 'power2.out' }
            )
          }

          if (badge) {
            gsap.fromTo(
              badge,
              { autoAlpha: 0, y: 10 },
              { autoAlpha: 1, y: 0, duration: 0.58, delay: 0.16, ease: 'power3.out' }
            )
          }

          return undefined
        },
        containerRef
      )

      return () => mm.revert()
    },
    { scope: containerRef, dependencies: [loaded, config.furColor, config.accessoryColor, config.pattern], revertOnUpdate: true }
  )

  return (
    <div
      ref={containerRef}
      className={`relative shrink-0 ${sizeClass} ${className}`}
      aria-label={`Avatar 3D de ${label} con modelo Spline`}
      role="img"
    >
      <div
        data-spline-glow
        className="absolute inset-x-4 bottom-2 h-6 rounded-full blur-xl"
        style={{
          background: `radial-gradient(circle, ${furGlow} 0%, ${accentGlow} 56%, transparent 100%)`,
        }}
      />

      <div
        data-spline-stage
        className="spline-dog-shell absolute inset-0"
        style={{
          background: buildStageBackground(config),
          boxShadow: `0 18px 30px ${hexToRgba(config.furColor, 0.16)}, inset 0 1px 0 rgba(255, 255, 255, 0.34)`,
        }}
      >
        <div className="absolute inset-0 rounded-[1.05rem]" style={{ background: buildPatternOverlay(config), opacity: 0.95 }} />
        <div className="absolute inset-[5%] rounded-[0.95rem]" style={{ background: `radial-gradient(circle at 50% 28%, ${innerGlow} 0%, transparent 70%)` }} />

        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center rounded-[1.05rem] bg-dark/8">
            <div className="h-11 w-11 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          </div>
        )}

        <iframe
          title={`Modelo Spline de ${label}`}
          src={SPLINE_DOG_URL}
          loading="lazy"
          className="absolute inset-[4%] h-[92%] w-[92%] rounded-[0.95rem] border-0"
          style={{
            filter,
            opacity: loaded ? 1 : 0,
            transition: 'opacity 220ms ease-out',
            pointerEvents: interactive ? 'auto' : 'none',
            background: 'transparent',
          }}
          sandbox="allow-scripts allow-same-origin allow-pointer-lock"
          onLoad={() => setLoaded(true)}
        />

        <div className="pointer-events-none absolute inset-0 rounded-[1.05rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.28),transparent_30%,rgba(23,51,59,0.12)_100%)]" />
        {renderAccessoryOverlay(config)}
      </div>

      <div
        data-spline-badge
        className="absolute inset-x-3 -bottom-2 rounded-[0.8rem] border px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.18em]"
        style={{
          borderColor: hexToRgba(config.accessoryColor, 0.32),
          background: `linear-gradient(135deg, ${hexToRgba(config.eyeColor, 0.92)}, ${hexToRgba(config.accessoryColor, 0.92)})`,
          color: '#FFFFFF',
          boxShadow: `0 12px 22px ${hexToRgba(config.eyeColor, 0.16)}`,
        }}
      >
        Spline dog scene
      </div>
    </div>
  )
}

function renderAccessoryOverlay(config) {
  const accessoryColor = config.accessoryColor
  const darkAccent = shiftHexColor(accessoryColor, -22)

  if (config.accessory === 'bandana') {
    return (
      <>
        <div className="absolute inset-x-[18%] bottom-[16%] h-[11%] rounded-full" style={{ background: accessoryColor, opacity: 0.95 }} />
        <div className="absolute bottom-[8%] left-1/2 h-5 w-6 -translate-x-1/2 rotate-45" style={{ background: darkAccent, clipPath: 'polygon(0 0, 100% 0, 54% 100%)' }} />
      </>
    )
  }

  if (config.accessory === 'bow') {
    return (
      <>
        <div className="absolute bottom-[17%] left-[33%] h-4 w-6 rounded-full" style={{ background: accessoryColor, transform: 'rotate(-14deg)' }} />
        <div className="absolute bottom-[17%] right-[33%] h-4 w-6 rounded-full" style={{ background: accessoryColor, transform: 'rotate(14deg)' }} />
        <div className="absolute bottom-[17%] left-1/2 h-4 w-4 -translate-x-1/2 rounded-full" style={{ background: darkAccent }} />
      </>
    )
  }

  if (config.accessory === 'medal') {
    return (
      <>
        <div className="absolute inset-x-[18%] bottom-[16%] h-[8%] rounded-full" style={{ background: accessoryColor, opacity: 0.88 }} />
        <div className="absolute bottom-[7%] left-1/2 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-white/60" style={{ background: darkAccent }} />
      </>
    )
  }

  return <div className="absolute inset-x-[18%] bottom-[16%] h-[8%] rounded-full" style={{ background: accessoryColor, opacity: 0.9 }} />
}

function buildStageBackground(config) {
  const darkEdge = hexToRgba(shiftHexColor(config.eyeColor, -10), 0.92)
  const softCenter = hexToRgba(config.innerColor, 0.9)
  const accent = hexToRgba(config.accessoryColor, 0.24)
  const fur = hexToRgba(config.furColor, 0.2)

  return `radial-gradient(circle at 50% 24%, ${softCenter} 0%, rgba(255,255,255,0.16) 36%, transparent 58%), linear-gradient(180deg, ${accent} 0%, transparent 30%), linear-gradient(160deg, ${darkEdge} 0%, ${fur} 100%)`
}

function buildPatternOverlay(config) {
  const patternTone = hexToRgba(config.furColor, 0.16)

  if (config.pattern === 'spots') {
    return `radial-gradient(circle at 24% 28%, ${patternTone} 0 10%, transparent 11%), radial-gradient(circle at 72% 22%, ${patternTone} 0 9%, transparent 10%), radial-gradient(circle at 80% 68%, ${patternTone} 0 8%, transparent 9%)`
  }

  if (config.pattern === 'mask') {
    return `radial-gradient(circle at 50% 18%, ${patternTone} 0%, transparent 52%), linear-gradient(180deg, ${patternTone} 0%, transparent 34%)`
  }

  if (config.pattern === 'stripe') {
    return `linear-gradient(90deg, transparent 38%, ${patternTone} 46%, transparent 54%, transparent 100%)`
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
    `brightness(${(0.78 + inner.l / 180).toFixed(2)})`,
    `contrast(${(0.96 + accent.s / 220).toFixed(2)})`,
  ].join(' ')
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

function hexToHsl(hexColor) {
  const normalized = String(hexColor || '').replace('#', '')
  if (normalized.length !== 6) return { h: 0, s: 0, l: 50 }

  const red = Number.parseInt(normalized.slice(0, 2), 16) / 255
  const green = Number.parseInt(normalized.slice(2, 4), 16) / 255
  const blue = Number.parseInt(normalized.slice(4, 6), 16) / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const lightness = (max + min) / 2
  const delta = max - min

  if (delta === 0) {
    return { h: 0, s: 0, l: Math.round(lightness * 100) }
  }

  const saturation = delta / (1 - Math.abs(2 * lightness - 1))
  let hue = 0

  switch (max) {
    case red:
      hue = ((green - blue) / delta) % 6
      break
    case green:
      hue = (blue - red) / delta + 2
      break
    default:
      hue = (red - green) / delta + 4
      break
  }

  return {
    h: Math.round(hue * 60 < 0 ? hue * 60 + 360 : hue * 60),
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100),
  }
}

function clampChannel(value) {
  return Math.max(0, Math.min(255, value))
}