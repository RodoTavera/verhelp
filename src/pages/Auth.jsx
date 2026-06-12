import { useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useGSAP } from '../lib/gsap'
import { attachHoverLift, attachMagnetic, riseIn } from '../lib/motion'

const ROLES = [
  { value: 'owner', label: 'Dueno', helper: 'Registra y cuida a tu mascota.' },
  { value: 'family', label: 'Familia', helper: 'Acompanias el cuidado desde cerca.' },
  { value: 'vet', label: 'Veterinaria', helper: 'Atiendes y registras clinica.' },
  { value: 'airline', label: 'Aerolinea', helper: 'Verificas aptitud de viaje.' },
  { value: 'admin', label: 'Administracion', helper: 'Supervisas todo el ecosistema.' },
]

const REGISTER_FIELDS = {
  owner: [
    { name: 'fullName', label: 'Nombre completo', type: 'text', placeholder: 'Como te identifica VetHelp', required: true },
    { name: 'dni', label: 'DNI', type: 'text', placeholder: '8 digitos', pattern: '\\d{8}', maxLength: 8, required: true },
  ],
  family: [
    { name: 'fullName', label: 'Nombre completo', type: 'text', placeholder: 'Como te identifica VetHelp', required: true },
    { name: 'dni', label: 'DNI', type: 'text', placeholder: '8 digitos', pattern: '\\d{8}', maxLength: 8, required: true },
    { name: 'ownerDni', label: 'DNI del dueno', type: 'text', placeholder: 'DNI de quien te compartio la mascota', pattern: '\\d{8}', maxLength: 8, required: true },
  ],
  vet: [
    { name: 'clinicName', label: 'Nombre de la veterinaria', type: 'text', placeholder: 'Como aparece en tus documentos', required: true },
    { name: 'ruc', label: 'RUC', type: 'text', placeholder: '11 digitos', pattern: '\\d{11}', maxLength: 11, required: true },
  ],
  airline: [
    { name: 'airlineCode', label: 'Codigo IATA', type: 'text', placeholder: 'Ej. LA', maxLength: 4, required: true },
  ],
  admin: [
    { name: 'adminKey', label: 'Codigo de administrador', type: 'password', placeholder: 'Clave interna', required: true },
  ],
}

const buildRegisterPayload = (role, form) => {
  const base = { email: form.email, password: form.password }
  if (role === 'owner') return { ...base, fullName: form.fullName, dni: form.dni }
  if (role === 'family') return { ...base, fullName: form.fullName, dni: form.dni, ownerDni: form.ownerDni }
  if (role === 'vet') return { ...base, clinicName: form.clinicName, ruc: form.ruc }
  if (role === 'airline') return { ...base, airlineCode: form.airlineCode }
  return base
}

const buildLoginPayload = (form) => ({
  role: form.role,
  identifier: form.identifier,
  password: form.password,
})

const PILLARS = [
  { title: 'Una cartilla digital por mascota', text: 'Vacunas, alergias, controles y contactos en una sola ficha.' },
  { title: 'Compartida con tu circulo', text: 'Familia, clinicas y viajes acceden solo donde tu decides.' },
  { title: 'Verificacion para volar', text: 'Consulta aptitud de viaje sin papeles sueltos.' },
]

export default function Auth() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({
    fullName: '',
    dni: '',
    ownerDni: '',
    clinicName: '',
    ruc: '',
    airlineCode: '',
    adminKey: '',
    email: '',
    identifier: '',
    password: '',
    role: 'owner',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const rootRef = useRef(null)
  const heroRef = useRef(null)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      if (mode === 'login') {
        await login(buildLoginPayload(form))
      } else {
        const endpoint = `/api/register/${form.role}`
        const payload = buildRegisterPayload(form.role, form)
        await register(endpoint, payload)
      }
      navigate('/dashboard')
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'No pudimos completar la operacion.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const registerFields = REGISTER_FIELDS[form.role] || []

  useGSAP(
    () => {
      riseIn(heroRef.current?.querySelectorAll('[data-rise]') || [], { y: 18, stagger: 0.08, duration: 0.7 })
      const cleanHover = attachHoverLift(rootRef.current, '[data-hover]')
      const cleanMagnetic = attachMagnetic(rootRef.current, '[data-magnetic]')
      return () => {
        cleanHover()
        cleanMagnetic()
      }
    },
    { scope: rootRef, dependencies: [mode] }
  )

  return (
    <div className="grid items-stretch gap-6 md:grid-cols-[1.05fr_0.95fr]" ref={rootRef}>
      <section className="auth-hero relative" ref={heroRef} data-rise>
        <p className="eyebrow-label text-cream/70" data-rise>VetHelp · cartilla digital animalista</p>
        <h1 className="mt-4 font-display text-4xl leading-tight text-cream md:text-5xl" data-rise>
          La cartilla digital
          <br />
          que cuida a quien amas.
        </h1>
        <p className="mt-4 max-w-md text-sm text-cream/80" data-rise>
          Una ficha clinica sobria, viva y compartida para cada mascota. Vacunas, alergias, controles
          y viajes en un solo lugar, lista cuando la necesitas.
        </p>
        <ul className="mt-6 space-y-3" data-rise>
          {PILLARS.map((pillar) => (
            <li key={pillar.title} className="flex items-start gap-3 rounded-2xl border border-cream/15 bg-cream/5 px-4 py-3 backdrop-blur-sm" data-hover>
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cream" aria-hidden="true" />
              <div>
                <p className="font-display text-base text-cream">{pillar.title}</p>
                <p className="mt-1 text-xs text-cream/70">{pillar.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-cream/20 bg-cream/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-cream" data-rise>
          <span className="h-1.5 w-1.5 rounded-full bg-cream" />
          Funcion principal · cartilla digital
        </div>
      </section>

      <form onSubmit={handleSubmit} className="auth-card space-y-5" data-rise>
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow-label text-brand">Acceso VetHelp</p>
            <h2 className="mt-1 font-display text-2xl text-dark">{mode === 'login' ? 'Iniciar sesion' : 'Crear cuenta'}</h2>
          </div>
          <button
            type="button"
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
            className="text-xs uppercase tracking-[0.2em] text-brand transition hover:text-brand-strong"
          >
            {mode === 'login' ? 'Crear cuenta' : 'Ya tengo cuenta'}
          </button>
        </div>

        {mode === 'register' ? (
          <>
            <label className="block">
              <span className="eyebrow-label">Rol</span>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {ROLES.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, role: role.value }))}
                    data-hover
                    className={`pill-tab w-full text-left ${form.role === role.value ? 'pill-tab-active' : ''}`}
                  >
                    <p className="text-sm font-medium">{role.label}</p>
                    <p className="mt-1 text-[11px] opacity-80">{role.helper}</p>
                  </button>
                ))}
              </div>
            </label>

            {registerFields.map((field) => (
              <label key={field.name} className="block">
                <span className="eyebrow-label">{field.label}</span>
                <input
                  type={field.type || 'text'}
                  name={field.name}
                  value={form[field.name] || ''}
                  onChange={handleChange}
                  className="input-field mt-2"
                  placeholder={field.placeholder}
                  pattern={field.pattern}
                  maxLength={field.maxLength}
                  required={field.required}
                />
              </label>
            ))}

            <label className="block">
              <span className="eyebrow-label">Correo</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="input-field mt-2"
                placeholder="tu@correo.com"
                required
              />
            </label>

            <label className="block">
              <span className="eyebrow-label">Contrasena</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="input-field mt-2"
                placeholder="Minimo 6 caracteres"
                minLength={6}
                required
              />
            </label>
          </>
        ) : (
          <>
            <label className="block">
              <span className="eyebrow-label">Rol</span>
              <select name="role" value={form.role} onChange={handleChange} className="input-field mt-2">
                {ROLES.map((role) => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="eyebrow-label">{form.role === 'admin' ? 'Correo administrador' : form.role === 'vet' ? 'Correo o RUC' : form.role === 'airline' ? 'Correo o codigo IATA' : 'Correo o DNI'}</span>
              <input
                type="text"
                name="identifier"
                value={form.identifier}
                onChange={handleChange}
                className="input-field mt-2"
                placeholder="Identificador de acceso"
                required
              />
            </label>

            <label className="block">
              <span className="eyebrow-label">Contrasena</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="input-field mt-2"
                placeholder="Minimo 6 caracteres"
                minLength={6}
                required
              />
            </label>
          </>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200/70 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button type="submit" disabled={submitting} className="btn-primary w-full justify-center" data-magnetic>
          {submitting ? 'Procesando...' : mode === 'login' ? 'Entrar a VetHelp' : 'Crear mi cartilla'}
        </button>

        <p className="text-center text-xs text-dark/55">
          {mode === 'login'
            ? 'Tu cartilla digital te espera: solo ingresa con tu correo o DNI.'
            : 'Al crear tu cuenta podras registrar mascotas y armar su cartilla digital.'}
        </p>
      </form>
    </div>
  )
}
