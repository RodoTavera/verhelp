import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PetAvatar3D from '../components/PetAvatar3D'

export default function Auth() {
  const navigate = useNavigate()
  const { login, register } = useAuth()
  const [tab, setTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [role, setRole] = useState('owner')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    dni: '',
    ownerDni: '',
    ruc: '',
    clinic: '',
  })

  useEffect(() => {
    if (tab === 'register' && ['airline', 'admin'].includes(role)) setRole('owner')
  }, [tab, role])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      let credentials = {}
      if (role === 'owner' || role === 'family') {
        credentials = { dni: formData.dni, password: formData.password, role }
      } else if (role === 'vet') {
        credentials = { ruc: formData.ruc, password: formData.password, role }
      } else if (role === 'airline') {
        credentials = { code: formData.ruc, password: formData.password, role }
      } else if (role === 'admin') {
        credentials = { email: formData.email, identifier: formData.email, password: formData.password, role }
      }
      
      const session = await login(credentials)
      const nextRoute = session.user?.role === 'admin' ? '/admin' : session.user?.role === 'airline' ? '/travel' : '/dashboard'
      navigate(nextRoute)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error en el login')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      let endpoint, data
      if (role === 'owner') {
        endpoint = '/api/register/owner'
        data = { fullName: formData.name, dni: formData.dni, email: formData.email, password: formData.password }
      } else if (role === 'family') {
        endpoint = '/api/register/family'
        data = { fullName: formData.name, dni: formData.dni, ownerDni: formData.ownerDni, email: formData.email, password: formData.password }
      } else if (role === 'vet') {
        endpoint = '/api/register/vet'
        data = { clinicName: formData.clinic, ruc: formData.ruc, email: formData.email, password: formData.password }
      }
      
      await register(endpoint, data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error en el registro')
    } finally {
      setLoading(false)
    }
  }

  const availableRoles = tab === 'register' ? ['owner', 'family', 'vet'] : ['owner', 'family', 'vet', 'airline', 'admin']

  return (
    <div className="animate-fade">
      <div className="grid gap-8 xl:grid-cols-[1.02fr_0.98fr]">
        <section className="space-y-6 animate-in">
          <div className="hero-panel space-y-6" data-hero>
            <span className="section-kicker" data-hero-line>Acceso multirol</span>
            <div className="space-y-4">
              <h1 className="text-6xl leading-[0.96] text-dark md:text-7xl" data-hero-line>
                Entrar a VetHelp ahora se siente tan cuidado como el resto del producto.
              </h1>
              <p className="max-w-2xl text-lg text-dark/70" data-hero-line>
                Dueños, familia, clinicas, aerolineas y admin comparten el mismo sistema, pero cada uno entra desde una superficie clara, elegante y con foco en la tarea.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { value: '5', label: 'roles activos' },
                { value: '1', label: 'nucleo clinico' },
                { value: '0', label: 'ruido visual innecesario' },
              ].map((item) => (
                <div key={item.label} className="metric-pill">
                  <p className="text-2xl font-black text-dark">{item.value}</p>
                  <p className="mt-1 text-sm text-dark/58">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
            <article className="card-soft" data-reveal>
              <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
                <PetAvatar3D
                  petName="Luna"
                  species="perro"
                  avatarConfig={{
                    furColor: '#C89A72',
                    innerColor: '#F2D7BF',
                    accessoryColor: '#0F766E',
                    eyeColor: '#17333B',
                    pattern: 'mask',
                    accessory: 'collar',
                  }}
                  size="sm"
                />
                <div>
                  <p className="eyebrow-label">Una ficha, multiples accesos</p>
                  <h2 className="mt-1 text-3xl text-dark">El mismo producto para toda la operacion.</h2>
                  <p className="mt-2 text-sm text-dark/65">La identidad de la mascota se mantiene consistente desde el login hasta el dashboard.</p>
                </div>
              </div>
            </article>

            <article className="card" data-reveal>
              <p className="eyebrow-label">Roles disponibles</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  { title: 'Duenos', desc: 'Registran y comparten la ficha.' },
                  { title: 'Familia', desc: 'Consulta segura y concreta.' },
                  { title: 'Clinicas', desc: 'Registran continuidad clinica.' },
                  { title: 'Admin', desc: 'Supervisa operacion completa.' },
                ].map((item) => (
                  <div key={item.title} className="rounded-[0.95rem] border border-dark/8 bg-white/70 px-4 py-4">
                    <p className="font-semibold text-dark">{item.title}</p>
                    <p className="mt-1 text-sm text-dark/62">{item.desc}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <div className="showcase-stage" data-reveal>
            <p className="text-sm uppercase tracking-[0.24em] text-white/58">Credenciales demo</p>
            <div className="mt-4 grid gap-3 text-sm text-white/78 sm:grid-cols-2">
              <p><strong>Dueno:</strong> 44556677 / demo123</p>
              <p><strong>Vet:</strong> 20123456789 / demo123</p>
              <p><strong>Aerolinea:</strong> AERO001 / air12345</p>
              <p><strong>Admin:</strong> admin@vethelp.cloud / admin123</p>
            </div>
          </div>
        </section>

        <section className="hero-panel animate-in" style={{ animationDelay: '0.1s' }} data-hero>
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow-label">Acceso seguro</p>
              <h2 className="mt-2 text-5xl leading-[0.98] text-dark">Entrar o crear cuenta.</h2>
            </div>
            <div className="rounded-[0.95rem] border border-dark/8 bg-white/64 px-4 py-3 text-right shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.22em] text-dark/45">Estado</p>
              <p className="mt-1 text-sm font-semibold text-dark">{tab === 'login' ? 'Acceso activo' : 'Registro activo'}</p>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3 rounded-[1rem] border border-dark/8 bg-white/56 p-2">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 rounded-lg px-5 py-3 font-semibold transition-all ${
                tab === 'login' ? 'bg-dark text-white shadow-lg shadow-dark/10' : 'bg-white/65 text-dark/60'
              }`}
            >
              Acceso
            </button>
            <button
              onClick={() => setTab('register')}
              className={`flex-1 rounded-lg px-5 py-3 font-semibold transition-all ${
                tab === 'register' ? 'bg-dark text-white shadow-lg shadow-dark/10' : 'bg-white/65 text-dark/60'
              }`}
            >
              Registro
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-[0.85rem] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 animate-in">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3 text-dark/70">Tipo de Cuenta</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {availableRoles.map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`rounded-lg px-3 py-3 text-sm font-semibold transition-all ${
                    role === r ? 'bg-gradient-pet text-white shadow-lg shadow-dark/10 -translate-y-0.5' : 'bg-white/70 text-dark/70 hover:bg-white'
                  }`}
                >
                  {r === 'owner' && 'Dueno'}
                  {r === 'family' && 'Familia'}
                  {r === 'vet' && 'Veterinaria'}
                  {r === 'airline' && 'Aerolinea'}
                  {r === 'admin' && 'Admin'}
                </button>
              ))}
            </div>
          </div>

          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              {(role === 'owner' || role === 'family') && (
                <input type="text" name="dni" placeholder="DNI (8 dígitos)" value={formData.dni} onChange={handleChange} className="input-field" required />
              )}
              {(role === 'vet' || role === 'airline') && (
                <input type="text" name="ruc" placeholder={role === 'vet' ? 'RUC (11 dígitos)' : 'Código Aerolínea'} value={formData.ruc} onChange={handleChange} className="input-field" required />
              )}
              {role === 'admin' && (
                <input type="email" name="email" placeholder="Correo administrador" value={formData.email} onChange={handleChange} className="input-field" required />
              )}
              <input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} className="input-field" required />
              <button type="submit" disabled={loading} className="w-full justify-center btn-primary py-3 disabled:opacity-50">
                {loading ? 'Accediendo...' : 'Entrar a VetHelp'}
              </button>
            </form>
          )}

          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <input type="text" name="name" placeholder="Nombre completo" value={formData.name} onChange={handleChange} className="input-field" required />
              <input type="email" name="email" placeholder="Correo electrónico" value={formData.email} onChange={handleChange} className="input-field" required />
              {(role === 'owner' || role === 'family') && (
                <input type="text" name="dni" placeholder="DNI (8 dígitos)" value={formData.dni} onChange={handleChange} className="input-field" required />
              )}
              {role === 'family' && (
                <input type="text" name="ownerDni" placeholder="DNI del dueño principal" value={formData.ownerDni} onChange={handleChange} className="input-field" required />
              )}
              {role === 'vet' && (
                <>
                  <input type="text" name="clinic" placeholder="Nombre de Clínica" value={formData.clinic} onChange={handleChange} className="input-field" required />
                  <input type="text" name="ruc" placeholder="RUC (11 dígitos)" value={formData.ruc} onChange={handleChange} className="input-field" required />
                </>
              )}
              <input type="password" name="password" placeholder="Contraseña (mín. 6 caracteres)" value={formData.password} onChange={handleChange} className="input-field" minLength="6" required />
              <button type="submit" disabled={loading} className="w-full justify-center btn-primary py-3 disabled:opacity-50">
                {loading ? 'Registrando...' : 'Crear cuenta'}
              </button>
            </form>
          )}

          <div className="mt-6 rounded-[1rem] border border-dark/8 bg-gradient-soft p-5">
            <p className="eyebrow-label">Por que esta pantalla cambio</p>
            <p className="mt-2 text-sm text-dark/68">
              El objetivo no era solo decorar el login: necesitaba verse mejor, sentirse mas serio y seguir siendo rapido de usar para cada rol del sistema.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
