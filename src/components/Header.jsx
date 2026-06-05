import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

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
      className={({ isActive }) => `${mobile ? 'block' : ''} nav-link ${isActive ? 'nav-link-active' : ''}`.trim()}
    >
      {link.label}
    </NavLink>
  )

  return (
    <header data-shell-header className="sticky top-0 z-50 border-b border-dark/10 bg-light/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        <div className="shell-frame flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 transition hover:opacity-85">
            <div className="brand-mark">VH</div>
            <div>
              <p className="eyebrow-label">Pet identity system</p>
              <h1 className="text-xl font-semibold text-dark md:text-2xl">VetHelp</h1>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 rounded-[1rem] border border-dark/8 bg-white/60 px-2 py-2 shadow-sm md:flex">
            {baseLinks.map((link) => renderNavLink(link))}
            {user && appLinks.map((link) => renderNavLink(link))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <div className="rounded-[0.95rem] border border-dark/8 bg-white/60 px-4 py-2 text-right shadow-sm">
                  <p className="text-sm font-semibold text-dark">{user.name || user.email}</p>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-dark/45">{user.role}</p>
                </div>
                <button onClick={handleLogout} className="btn-soft text-sm">
                  Cerrar sesion
                </button>
              </>
            ) : (
              <Link to="/auth" className="btn-primary text-sm">
                Acceso
              </Link>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-dark/10 bg-surface text-lg text-dark shadow-sm md:hidden"
            aria-label="Abrir navegacion"
          >
            ☰
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="container mx-auto px-4 pb-4 md:hidden">
          <nav className="glass-surface rounded-[1rem] px-4 py-4 animate-in">
            <div className="space-y-1">
              {baseLinks.map((link) => renderNavLink(link, true))}
              {user && appLinks.map((link) => renderNavLink(link, true))}
            </div>
            <div className="mt-4 border-t border-dark/10 pt-4">
              {user ? (
                <button onClick={handleLogout} className="btn-soft w-full justify-center text-sm">
                  Cerrar sesion
                </button>
              ) : (
                <Link to="/auth" onClick={() => setMenuOpen(false)} className="btn-primary w-full justify-center text-sm">
                  Acceso
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
