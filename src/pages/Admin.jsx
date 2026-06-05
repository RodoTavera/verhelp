import { useEffect, useState } from 'react'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { formatDateTime } from '../utils/helpers'

const INITIAL_CLINIC = {
  name: '',
  district: '',
  speciality: '',
  rating: '4.8',
  reviews: '120',
}

export default function Admin() {
  const { user } = useAuth()
  const [overview, setOverview] = useState(null)
  const [users, setUsers] = useState([])
  const [clinics, setClinics] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState(INITIAL_CLINIC)

  useEffect(() => {
    void fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      setError('')
      const [overviewRes, usersRes, clinicsRes] = await Promise.all([
        api.get('/api/admin/overview'),
        api.get('/api/admin/users'),
        api.get('/api/admin/clinics'),
      ])

      setOverview(overviewRes.data)
      setUsers(usersRes.data)
      setClinics(clinicsRes.data)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'No se pudo cargar el panel admin')
    } finally {
      setLoading(false)
    }
  }

  const handleClinicChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleCreateClinic = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await api.post('/api/admin/clinics', {
        ...formData,
        rating: Number(formData.rating),
        reviews: Number(formData.reviews),
      })

      setFormData(INITIAL_CLINIC)
      await fetchAdminData()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'No se pudo registrar la clínica')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteClinic = async (clinicId) => {
    try {
      setError('')
      await api.delete(`/api/admin/clinics/${clinicId}`)
      await fetchAdminData()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'No se pudo eliminar la clínica')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-brand border-t-transparent mb-4"></div>
          <p className="text-dark/70">Cargando centro de control...</p>
        </div>
      </div>
    )
  }

  const stats = overview?.counts || {}
  const roleBreakdown = overview?.roleBreakdown || {}
  const recentUsers = overview?.recentUsers || []
  const recentPets = overview?.recentPets || []
  const recentRecords = overview?.recentRecords || []
  const topClinics = overview?.topClinics || []

  return (
    <div className="space-y-10 animate-fade">
      <section className="hero-panel animate-in">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <span className="section-kicker">
              Centro de control VetHelp
            </span>
            <div className="space-y-3">
              <h1 className="text-5xl font-black tracking-tight text-dark">
                Administra usuarios, clínicas y actividad en tiempo real.
              </h1>
              <p className="max-w-2xl text-lg text-dark/70">
                Panel operativo para supervisar el ecosistema completo de VetHelp. Todo desde una sola vista: adopción,
                clínica, operaciones y trazabilidad.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {Object.entries(roleBreakdown).map(([role, total]) => (
                <span key={role} className="tag text-sm">
                  {role}: {total}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 self-start">
            {[
              { label: 'Usuarios', value: stats.users },
              { label: 'Mascotas', value: stats.pets },
              { label: 'Registros', value: stats.records },
              { label: 'Clinicas', value: stats.clinics },
            ].map((item, index) => (
              <div
                key={item.label}
                className="card animate-in"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-dark/45">{item.label}</p>
                <p className="text-4xl font-black text-dark">{item.value ?? 0}</p>
                <p className="mt-2 text-sm font-medium text-dark/60">Indicador principal</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="card space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">Usuarios recientes</p>
              <h2 className="text-2xl font-black text-dark">Altas y accesos visibles</h2>
            </div>
            <span className="tag">{users.length} usuarios</span>
          </div>

          <div className="space-y-3">
            {recentUsers.map((entry, index) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-lg border border-dark/8 bg-white/75 px-4 py-4 animate-in"
                style={{ animationDelay: `${index * 0.06}s` }}
              >
                <div>
                  <p className="font-bold text-dark">{entry.name || entry.email}</p>
                  <p className="text-sm text-dark/60">{entry.role} · {entry.email || entry.dni || entry.ruc || entry.airlineCode}</p>
                </div>
                <span className="text-xs font-medium text-dark/50">{formatDateTime(entry.createdAt)}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="card space-y-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand">Actividad clínica</p>
            <h2 className="text-2xl font-black text-dark">Últimos registros</h2>
          </div>

          <div className="space-y-3">
            {recentRecords.map((record, index) => (
              <div
                key={record.id}
                className="rounded-lg border border-dark/8 bg-white px-4 py-4 shadow-sm animate-in"
                style={{ animationDelay: `${index * 0.06}s` }}
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="font-bold capitalize text-brand">{record.type}</p>
                  <span className="text-xs font-medium text-dark/50">{formatDateTime(record.createdAt)}</span>
                </div>
                <p className="text-sm text-dark/70">{record.description}</p>
                <p className="mt-2 text-xs font-semibold text-dark/45">Actor: {record.actorName}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="card space-y-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">Registro veterinario</p>
            <h2 className="text-2xl font-black text-dark">Nueva clínica autorizada</h2>
          </div>

          <form onSubmit={handleCreateClinic} className="grid gap-4 md:grid-cols-2">
            <input name="name" placeholder="Nombre comercial" value={formData.name} onChange={handleClinicChange} className="input-field md:col-span-2" required />
            <input name="district" placeholder="Distrito" value={formData.district} onChange={handleClinicChange} className="input-field" required />
            <input name="speciality" placeholder="Especialidad" value={formData.speciality} onChange={handleClinicChange} className="input-field" required />
            <input name="rating" type="number" min="0" max="5" step="0.1" value={formData.rating} onChange={handleClinicChange} className="input-field" />
            <input name="reviews" type="number" min="0" step="1" value={formData.reviews} onChange={handleClinicChange} className="input-field" />
            <button type="submit" disabled={submitting} className="btn-primary md:col-span-2 justify-center py-3 disabled:opacity-60">
              {submitting ? 'Guardando...' : 'Registrar clínica'}
            </button>
          </form>

          <div className="rounded-lg border border-dark/8 bg-gradient-soft p-5">
            <p className="text-sm font-semibold text-dark">Admin activo</p>
            <p className="mt-1 text-sm text-dark/70">{user?.name || user?.email}</p>
            <p className="mt-3 text-sm text-dark/65">Credencial demo: admin@vethelp.cloud / admin123</p>
          </div>
        </article>

        <article className="card space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand">Clínicas</p>
              <h2 className="text-2xl font-black text-dark">Red administrada</h2>
            </div>
            <span className="tag">Top {topClinics.length}</span>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {clinics.map((clinic, index) => (
              <div
                key={clinic.id}
                className="rounded-lg border border-dark/8 bg-white/78 p-4 animate-in"
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-dark">{clinic.name}</p>
                    <p className="text-sm text-dark/60">{clinic.zone}</p>
                  </div>
                  <button type="button" onClick={() => handleDeleteClinic(clinic.id)} className="rounded-md border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">
                    Eliminar
                  </button>
                </div>
                <p className="text-sm text-dark/70">{clinic.specialty}</p>
                <div className="mt-3 flex items-center justify-between text-xs font-semibold text-dark/55">
                  <span>⭐ {clinic.rating}</span>
                  <span>{clinic.reviews} reseñas</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="card space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">Mascotas activas</p>
            <h2 className="text-2xl font-black text-dark">Últimas fichas actualizadas</h2>
          </div>

          <div className="space-y-3">
            {recentPets.map((pet, index) => (
              <div key={pet.petId} className="flex items-center justify-between rounded-lg border border-dark/8 bg-white px-4 py-4 animate-in" style={{ animationDelay: `${index * 0.05}s` }}>
                <div>
                  <p className="font-bold text-dark">{pet.name}</p>
                  <p className="text-sm text-dark/60">{pet.petId} · {pet.species}</p>
                </div>
                <span className="text-xs font-semibold text-dark/50">{formatDateTime(pet.updatedAt || pet.createdAt)}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="card space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand">Directorio</p>
            <h2 className="text-2xl font-black text-dark">Clínicas mejor valoradas</h2>
          </div>

          <div className="space-y-3">
            {topClinics.map((clinic, index) => (
              <div key={clinic.id} className="rounded-lg border border-dark/8 bg-gradient-soft px-4 py-4 animate-in" style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-dark">{clinic.name}</p>
                    <p className="text-sm text-dark/60">{clinic.zone} · {clinic.specialty}</p>
                  </div>
                  <span className="tag">{clinic.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}