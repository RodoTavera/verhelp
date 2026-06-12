import { Link } from 'react-router-dom'
import { useRef } from 'react'
import { useGSAP } from '../lib/gsap'
import { attachHoverLift, riseIn, scrollReveal, staggerChildren } from '../lib/motion'

const Leaf = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M21 3C12 3 5 8 4 17c0 2 1 3 2 4 7-1 14-8 15-18Z"
      fill="currentColor"
      opacity="0.6"
    />
    <path d="M6 19c4-7 9-11 14-14" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.8" />
  </svg>
)

export default function Footer() {
  const footerRef = useRef(null)

  useGSAP(
    () => {
      riseIn(footerRef.current?.querySelectorAll('[data-rise]') || [], { y: 18, stagger: 0.06, duration: 0.7 })
      staggerChildren(footerRef.current, 'ul', { stagger: 0.04 })
      scrollReveal(footerRef.current, '[data-reveal]')
      const cleanHover = attachHoverLift(footerRef.current, '[data-hover]')
      return () => cleanHover()
    },
    { scope: footerRef }
  )

  return (
    <footer data-shell-footer className="relative z-10 mx-3 mb-6 mt-12 md:mx-6 md:mb-10 md:mt-16" ref={footerRef}>
      <div className="container mx-auto max-w-7xl">
        <div className="footer-panel relative grid gap-10 md:grid-cols-[1.35fr_0.75fr_0.9fr]">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="brand-mark">
                <Leaf className="h-5 w-5 text-cream" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/55">Pet care cloud</p>
                <h3 className="font-display text-2xl text-white">VetHelp</h3>
              </div>
            </div>

            <p className="max-w-md text-sm text-white/78" data-rise>
              Una identidad clara para el cuidado de cada mascota. Vacunas, permisos, consultas y viajes en una sola experiencia animalista, sobria y facil de leer.
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { value: '5', label: 'roles conectados' },
                { value: '6+', label: 'especies visibles' },
                { value: '24/7', label: 'lectura operativa' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/12 bg-white/8 px-4 py-4 backdrop-blur-sm">
                  <p className="text-xl font-semibold text-white">{item.value}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/58">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {['Perros', 'Gatos', 'Aves', 'Conejos', 'Exoticos'].map((item) => (
                <span key={item} data-hover className="rounded-full border border-white/14 bg-white/8 px-3 py-1 text-xs font-medium text-white/78">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">Explorar</h4>
            <ul className="subtle-list mt-4" style={{ color: 'rgba(255, 252, 246, 0.86)' }}>
              <li><Link to="/clinics" className="transition hover:text-white" data-hover>Clinicas</Link></li>
              <li><Link to="/guides" className="transition hover:text-white" data-hover>Guias de cuidado</Link></li>
              <li><Link to="/auth" className="transition hover:text-white" data-hover>Acceso</Link></li>
              <li><Link to="/dashboard" className="transition hover:text-white" data-hover>Panel</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">Compania</h4>
            <div className="mt-4 space-y-3 text-sm text-white/78">
              <p>info@vethelp.cloud</p>
              <p>Operacion multirol con trazabilidad clinica real.</p>
              <p className="editorial-quote text-white/70">
                "Cuidar a un animal es aprender a mirar el mundo con mas calma."
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs uppercase tracking-[0.2em] text-dark/45">
          <p>© 2026 VetHelp Cloud · Cuidado animalista</p>
        </div>
      </div>
    </footer>
  )
}
