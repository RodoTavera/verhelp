import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP } from '../lib/gsap'

const PHRASES = [
  'Cuidar con calma.',
  'Observar antes de decidir.',
  'Una sola historia por mascota.',
]

const PawMark = ({ className = '' }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <circle cx="11" cy="11" r="3.4" fill="currentColor" />
    <circle cx="21" cy="11" r="3.4" fill="currentColor" />
    <circle cx="6" cy="18" r="2.6" fill="currentColor" />
    <circle cx="26" cy="18" r="2.6" fill="currentColor" />
    <path
      d="M16 18.5c-3.2 0-6.2 2.4-6.2 5.4 0 2.1 1.5 3.6 3.4 3.6 1 0 1.7-.4 2.4-.9.4-.3.8-.4 1.2 0 .7.5 1.4.9 2.4.9 1.9 0 3.4-1.5 3.4-3.6 0-3-3-5.4-6.2-5.4Z"
      fill="currentColor"
    />
  </svg>
)

export default function SplashScreen({ onDone, duration = 1700 }) {
  const rootRef = useRef(null)
  const markRef = useRef(null)
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState('')

  // Animacion de la pieza: logo crece, anillo gira, fondo se desvanece al salir.
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo(
        rootRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.32 }
      )
        .fromTo(
          markRef.current,
          { scale: 0.6, rotate: -8, autoAlpha: 0 },
          { scale: 1, rotate: 0, autoAlpha: 1, duration: 0.7 },
          0.05
        )
        .to({}, { duration: duration / 1000 })
        .to(rootRef.current, { autoAlpha: 0, y: -16, duration: 0.4 })
    },
    { scope: rootRef }
  )

  // Typewriter de las frases.
  useEffect(() => {
    if (index >= PHRASES.length) {
      onDone?.()
      return undefined
    }
    const phrase = PHRASES[index]
    let timer
    let i = 0
    setTyped('')
    const type = () => {
      i += 1
      setTyped(phrase.slice(0, i))
      if (i < phrase.length) {
        timer = window.setTimeout(type, 42)
      } else {
        timer = window.setTimeout(() => setIndex((value) => value + 1), 320)
      }
    }
    timer = window.setTimeout(type, 220)
    return () => window.clearTimeout(timer)
  }, [index, onDone])

  return (
    <div
      ref={rootRef}
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-light via-cream to-white"
    >
      <div ref={markRef} className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-brand text-cream shadow-[0_24px_60px_rgba(31,42,29,0.18)]">
        <PawMark className="h-12 w-12" />
        <span className="absolute -inset-3 rounded-[1.5rem] border border-brand/20 animate-pulse-soft" aria-hidden="true" />
      </div>
      <p className="mt-6 font-display text-2xl text-dark">VetHelp</p>
      <p className="mt-2 h-6 text-sm text-dark/65">
        {typed}
        <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-brand animate-caret" aria-hidden="true" />
      </p>
    </div>
  )
}
