import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useRef, useState } from 'react'
import { useGSAP } from '../lib/gsap'
import { attachMagnetic, attachHoverLift, riseIn } from '../lib/motion'

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

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const headerRef = useRef(null)

  useGSAP(
    () => {
      riseIn(headerRef.current?.querySelectorAll('[data-rise]') || [], { y: 14, stagger: 0.05, duration: 0.6 })
      const cleanHover = attachHoverLift(headerRef.current, '[data-hover]')
      const cleanMagnetic = attachMagnetic(headerRef.current, '[data-magnetic]')
      return () => {
        cleanHover()
        cleanMagnetic()
      }
    },
    { scope: headerRef, dependencies: [user?.role] }
  )

  const baseLinks = [
    { to: '/', label: 'Inicio' },
    { to: '/clinics', label: 'Clinicas' },
    { to: '/guides', label: 'Guias' },
  ]

  const appLinks = user?.role === 'admin'
    ? [{ to: '/admin', label: 'Admin' }]
    : [
        { to: '/dashboard', label: 'Panel' },
        { to: '/pets', label: 'Mascotas' },
        { to: '/records', label: 'Historial' },
        ...(user?.role === 'airline' ? [{ to: '/travel', label: 'Viajes' }] : []),
      ]

  const handleLogout = () => {
    logout()
    setMenuOpen(false)
    navigate('/')
  }

  const renderNavLink = (link, mobile = false) => (
    <NavLink
      key={link.to}
      to={link.to}
      onClick={() => setMenuOpen(false)}
      data-hover
      className={({ isActive }) =>
        `${mobile ? 'block' : ''} nav-link ${isActive ? 'nav-link-active' : ''}`.trim()
      }
    >
      {link.label}
    </NavLink>
  )

  return (
    <header ref={headerRef} data-shell-header className="sticky top-3 z-50 mx-3 mt-3 md:mx-6">
      <div className="container mx-auto max-w-7xl">
        <div className="shell-frame flex items-center justify-between gap-4" data-rise>
          <Link to="/" className="flex items-center gap-3 transition hover:opacity-90" data-magnetic>
            <div className="brand-mark">
              <PawMark className="h-5 w-5 text-cream" />
            </div>
            <div className="leading-tight">
              <p className="eyebrow-label">Pet care cloud</p>
              <p className="text-base font-semibold text-dark md:text-lg">VetHelp</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-dark/8 bg-white/60 px-2 py-1.5 shadow-sm md:flex">
            {baseLinks.map((link) => renderNavLink(link))}
            {user && appLinks.map((link) => renderNavLink(link))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <div className="field-soft text-right">
                  <p className="text-sm font-semibold text-dark">{user.name || user.email}</p>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-dark/45">{user.role}</p>
                </div>
                <button onClick={handleLogout} className="btn-soft text-sm" data-hover>
                  Cerrar sesion
                </button>
              </>
            ) : (
              <Link to="/auth" className="btn-primary text-sm" data-magnetic>
                Entrar
              </Link>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-dark/10 bg-surface text-base text-dark shadow-sm transition md:hidden"
            aria-label="Abrir navegacion"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {menuOpen && (
          <nav className="glass-surface mt-2 rounded-3xl px-4 py-4 animate-in md:hidden">
            <div className="space-y-1">
              {baseLinks.map((link) => renderNavLink(link, true))}
              {user && appLinks.map((link) => renderNavLink(link, true))}
            </div>
            <div className="mt-4 border-t border-dark/10 pt-4">
              {user ? (
                <div className="space-y-3">
                  <div className="field-soft text-center">
                    <p className="text-sm font-semibold text-dark">{user.name || user.email}</p>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-dark/45">{user.role}</p>
                  </div>
                  <button onClick={handleLogout} className="btn-soft w-full justify-center text-sm" data-hover>
                    Cerrar sesion
                  </button>
                </div>
              ) : (
                <Link to="/auth" onClick={() => setMenuOpen(false)} className="btn-primary w-full justify-center text-sm" data-magnetic>
                  Entrar
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
