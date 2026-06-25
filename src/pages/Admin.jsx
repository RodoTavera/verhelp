import { useEffect, useRef, useState } from 'react'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { formatDateTime } from '../utils/helpers'
import { useGSAP } from '../lib/gsap'
import { attachHoverLift, attachMagnetic, scrollReveal } from '../lib/motion'

const INITIAL_CLINIC = { name: '', district: '', speciality: '', rating: '4.8', reviews: '120' }

export default function Admin() {
  const { user } = useAuth()
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState(INITIAL_CLINIC)
  const rootRef = useRef(null)

  useGSAP(
    () => {
      if (!rootRef.current) return undefined
      scrollReveal(rootRef.current, '[data-rise]')
      const cleanHover = attachHoverLift(rootRef.current, '[data-hover]')
      const cleanMagnetic = attachMagnetic(rootRef.current, '[data-magnetic]')
      return () => {
        cleanHover()
        cleanMagnetic()
      }
    },
    { scope: rootRef, dependencies: [] }
  )

  useEffect(() => {
    void fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      setError('')
      const res = await api.get('/api/admin/overview')
      setOverview(res.data)
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
      setError(err.response?.data?.message || err.message || 'No se pudo registrar la clinica')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    )
  }

  const stats = overview?.counts || {}
  const roleBreakdown = overview?.roleBreakdown || {}
  const recentUsers = overview?.recentUsers || []
  const recentRecords = overview?.recentRecords || []

  return (
    <div className="space-y-10" ref={rootRef}>
      <section className="animalist-card" data-rise>
        <p className="eyebrow-label">Centro de control</p>
        <h1 className="mt-3 text-4xl text-dark">VetHelp en una mirada</h1>
        <p className="mt-3 max-w-2xl text-sm text-dark/68">
          {user?.role === 'admin'
            ? 'Acompanias todo el ecosistema. Cuida los datos como cuidas a cada mascota.'
            : 'Vista general de la operacion. La informacion aqui respira y se lee rapido.'}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {Object.entries(roleBreakdown).map(([role, total]) => (
            <span key={role} className="pet-species-pill capitalize" data-hover>{role}: {total}</span>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Usuarios', value: stats.users },
          { label: 'Mascotas', value: stats.pets },
          { label: 'Registros', value: stats.records },
          { label: 'Clinicas', value: stats.clinics },
        ].map((item) => (
          <article key={item.label} className="animalist-card text-center" data-rise>
            <p className="eyebrow-label">{item.label}</p>
            <p className="mt-3 text-4xl text-dark">{item.value ?? 0}</p>
          </article>
        ))}
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200/70 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <section className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <article className="animalist-card" data-rise>
          <div className="flex items-center justify-between">
            <p className="eyebrow-label">Usuarios recientes</p>
            <span className="pet-species-pill">{recentUsers.length}</span>
          </div>
          <ul className="subtle-list mt-4">
            {recentUsers.length === 0 && <li><span>Sin actividad reciente</span></li>}
            {recentUsers.map((entry) => (
              <li key={entry.id}>
                <span className="flex w-full items-center justify-between gap-3">
                  <span>{entry.name || entry.email} <span className="text-dark/45">· {entry.role}</span></span>
                  <span className="text-xs text-dark/45">{formatDateTime(entry.createdAt)}</span>
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="animalist-card" data-rise>
          <p className="eyebrow-label">Actividad clinica</p>
          <ul className="subtle-list mt-4">
            {recentRecords.length === 0 && <li><span>Sin registros recientes</span></li>}
            {recentRecords.map((record) => (
              <li key={record.id}>
                <span className="flex w-full flex-col gap-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="capitalize text-dark">{record.type}</span>
                    <span className="text-xs text-dark/45">{formatDateTime(record.createdAt)}</span>
                  </span>
                  <span className="text-dark/65">{record.description}</span>
                </span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <form onSubmit={handleCreateClinic} className="animalist-card space-y-5" data-rise>
        <p className="eyebrow-label">Nueva clinica</p>
        <h2 className="text-2xl text-dark">Registrar clinica autorizada</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <input name="name" placeholder="Nombre comercial" value={formData.name} onChange={handleClinicChange} className="input-field md:col-span-2" required />
          <input name="district" placeholder="Distrito" value={formData.district} onChange={handleClinicChange} className="input-field" required />
          <input name="speciality" placeholder="Especialidad" value={formData.speciality} onChange={handleClinicChange} className="input-field" required />
          <input name="rating" type="number" min="0" max="5" step="0.1" value={formData.rating} onChange={handleClinicChange} className="input-field" />
          <input name="reviews" type="number" min="0" step="1" value={formData.reviews} onChange={handleClinicChange} className="input-field" />
        </div>
        <button type="submit" disabled={submitting} className="btn-primary w-full justify-center" data-magnetic>
          {submitting ? 'Guardando...' : 'Registrar clinica'}
        </button>
      </form>
    </div>
  )
}
