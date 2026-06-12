import { Link } from 'react-router-dom'
import { useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useGSAP } from '../lib/gsap'
import { attachHoverLift, attachMagnetic, scrollReveal } from '../lib/motion'

const QUICK_ACTIONS = {
  owner: [
    { to: '/pets', label: 'Mis mascotas' },
    { to: '/records', label: 'Historial' },
    { to: '/clinics', label: 'Clinicas cercanas' },
  ],
  family: [
    { to: '/pets', label: 'Mascotas compartidas' },
    { to: '/records', label: 'Historial' },
  ],
  vet: [
    { to: '/records', label: 'Nuevo registro' },
    { to: '/pets', label: 'Fichas autorizadas' },
  ],
  airline: [
    { to: '/travel', label: 'Verificar mascota' },
  ],
  admin: [
    { to: '/admin', label: 'Centro de control' },
  ],
}

const REMINDERS = [
  { title: 'Vacuna al dia', detail: 'Lleva el calendario de tu mascota visible desde la ficha.' },
  { title: 'Permisos claros', detail: 'Decide quien puede ver y editar el historial.' },
  { title: 'Viaje tranquilo', detail: 'Verifica aptitud antes de cada desplazamiento.' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const actions = QUICK_ACTIONS[user?.role] || []
  const firstName = (user?.name || user?.email || 'amigo').split(' ')[0]
  const rootRef = useRef(null)

  useGSAP(
    () => {
      scrollReveal(rootRef.current, '[data-rise]')
      const cleanHover = attachHoverLift(rootRef.current, '[data-hover]')
      const cleanMagnetic = attachMagnetic(rootRef.current, '[data-magnetic]')
      return () => {
        cleanHover()
        cleanMagnetic()
      }
    },
    { scope: rootRef }
  )

  return (
    <div className="space-y-10" ref={rootRef}>
      <section className="animalist-card" data-rise>
        <p className="eyebrow-label">Hola, {firstName}</p>
        <h1 className="mt-3 text-4xl text-dark md:text-5xl">
          Hoy es un buen dia para cuidar a quien te cuida.
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-dark/68">
          VetHelp te acompana con calma. Tu panel de {user?.role || 'invitado'} esta listo para que tomes
          decisiones sin prisas.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {actions.map((action) => (
            <Link key={action.to} to={action.to} className="btn-soft text-sm">
              {action.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {REMINDERS.map((reminder) => (
          <article key={reminder.title} className="animalist-card" data-rise>
            <p className="eyebrow-label">Recordatorio</p>
            <h2 className="mt-3 text-xl text-dark">{reminder.title}</h2>
            <p className="mt-3 text-sm text-dark/68">{reminder.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 md:grid-cols-[1.05fr_0.95fr]">
        <article className="showcase-stage" data-rise>
          <p className="eyebrow-label text-white/60">Cuidado cotidiano</p>
          <h2 className="mt-3 font-display text-3xl text-white">R data-magneticutinas que abrazan</h2>
          <p className="mt-4 max-w-md text-sm text-white/78">
            Paseos tranquilos, descanso suficiente, agua fresca y una mirada atenta. El bienestar se construye
            con detalles pequenos y constantes.
          </p>
        </article>

        <article className="animalist-card" data-rise>
          <p className="eyebrow-label">Tu siguiente paso</p>
          <ul className="subtle-list mt-4">
            <li><span>Revisa el calendario de vacunas.</span></li>
            <li><span>Confirma quien acompana el cuidado de tu mascota.</span></li>
            <li><span>Guarda la clinica de confianza mas cercana.</span></li>
          </ul>
          <Link to="/guides" className="btn-primary mt-6 text-sm">Ver guias de cuidado</Link>
        </article>
      </section>
    </div>
  )
}
