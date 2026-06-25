import { useEffect, useRef, useState } from 'react'
import { api } from '../utils/api'
import { formatDateTime } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'
import { useGSAP } from '../lib/gsap'
import { attachHoverLift, attachMagnetic, scrollReveal } from '../lib/motion'

const INITIAL_FORM = { type: 'consulta', description: '', vaccines: '', allergies: '' }

const TYPES = [
  { value: 'consulta', label: 'Consulta' },
  { value: 'vacuna', label: 'Vacuna' },
  { value: 'alergia', label: 'Alergia' },
  { value: 'tratamiento', label: 'Tratamiento' },
  { value: 'nota', label: 'Nota' },
]

export default function Records() {
  const { user } = useAuth()
  const [pets, setPets] = useState([])
  const [selectedPetId, setSelectedPetId] = useState('')
  const [records, setRecords] = useState([])
  const [audit, setAudit] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState(INITIAL_FORM)
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
    void fetchPets()
  }, [])

  useEffect(() => {
    if (selectedPetId) void fetchRecords(selectedPetId)
  }, [selectedPetId])

  const canCreateRecord = user?.role === 'owner' || user?.role === 'vet'

  const fetchPets = async () => {
    try {
      const res = await api.get('/api/pets')
      setPets(res.data)
      if (res.data.length > 0) setSelectedPetId(res.data[0].id)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'No se pudieron cargar las mascotas')
    } finally {
      setLoading(false)
    }
  }

  const fetchRecords = async (petId) => {
    try {
      const res = await api.get(`/api/pets/${petId}/records`)
      setRecords(res.data.records || [])
      setAudit(res.data.audit || [])
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'No se pudo cargar el historial')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await api.post(`/api/pets/${selectedPetId}/records`, {
        type: formData.type,
        description: formData.description,
        vaccines: formData.vaccines ? formData.vaccines.split(',').map((i) => i.trim()).filter(Boolean) : [],
        allergies: formData.allergies ? formData.allergies.split(',').map((i) => i.trim()).filter(Boolean) : [],
      })
      setFormData(INITIAL_FORM)
      setShowForm(false)
      await fetchRecords(selectedPetId)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'No se pudo guardar el registro')
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

  const selectedPet = pets.find((pet) => pet.id === selectedPetId)
  const timeline = [
    ...records.map((record) => ({
      id: record.id,
      kind: 'record',
      title: record.type,
      description: record.description,
      createdAt: record.createdAt,
      actorName: record.actorName,
      vaccines: record.vaccines,
      allergies: record.allergies,
    })),
    ...audit.map((entry) => ({
      id: entry.id,
      kind: 'audit',
      title: entry.action,
      description: entry.details,
      createdAt: entry.createdAt,
      actorName: entry.actorName,
    })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return (
    <div className="space-y-10" ref={rootRef}>
      <section className="animalist-card" data-rise>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow-label">Historial clinico</p>
            <h1 className="mt-3 text-4xl text-dark">La historia de cada cuidado</h1>
            <p className="mt-3 max-w-xl text-sm text-dark/68">
              Revisa registros y movimientos. La informacion se lee rapido y se entiende mejor.
            </p>
          </div>
          {canCreateRecord && (
            <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm" data-magnetic>
              {showForm ? 'Cancelar' : 'Nuevo registro'}
            </button>
          )}
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200/70 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <label className="block">
        <span className="eyebrow-label">Mascota</span>
        <select value={selectedPetId} onChange={(e) => setSelectedPetId(e.target.value)} className="input-field mt-2">
          {pets.map((pet) => (
            <option key={pet.id} value={pet.id}>{pet.name} ({pet.species})</option>
          ))}
        </select>
      </label>

      {showForm && selectedPet && canCreateRecord && (
        <form onSubmit={handleSubmit} className="animalist-card space-y-5" data-rise>
          <h2 className="text-2xl text-dark">Nuevo registro para {selectedPet.name}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="input-field">
              {TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <input type="text" placeholder="Vacunas" value={formData.vaccines} onChange={(e) => setFormData({ ...formData, vaccines: e.target.value })} className="input-field" />
            <input type="text" placeholder="Alergias" value={formData.allergies} onChange={(e) => setFormData({ ...formData, allergies: e.target.value })} className="input-field" />
            <textarea
              placeholder="Descripcion"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field min-h-[100px] md:col-span-2"
              required
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
            {submitting ? 'Guardando...' : 'Guardar registro'}
          </button>
        </form>
      )}

      <section>
        <div className="section-divider mb-5">
          <span>Linea de tiempo</span>
        </div>
        {timeline.length === 0 ? (
          <div className="animalist-card text-center">
            <p className="editorial-quote text-2xl text-dark">Aun no hay registros. Empieza acompanando esta historia.</p>
          </div>
        ) : (
          <ol className="space-y-4">
            {timeline.map((entry) => (
              <li key={entry.id} className="animalist-card">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`pill-tab ${entry.kind === 'audit' ? 'pill-tab-active' : ''}`}>
                      {entry.title}
                    </span>
                    <span className="text-xs uppercase tracking-[0.2em] text-dark/45">{formatDateTime(entry.createdAt)}</span>
                  </div>
                  <span className="text-xs text-dark/55">{entry.actorName}</span>
                </div>
                {entry.description && <p className="mt-3 text-sm text-dark/74">{entry.description}</p>}
                {entry.vaccines?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {entry.vaccines.map((item) => (
                      <span key={item} className="tag">{item}</span>
                    ))}
                  </div>
                ) : null}
                {entry.allergies?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {entry.allergies.map((item) => (
                      <span key={item} className="tag" style={{ color: '#A05D33', borderColor: 'rgba(201, 122, 75, 0.3)', background: 'rgba(201, 122, 75, 0.08)' }}>
                        {item}
                      </span>
                    ))}
                  </div>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}
