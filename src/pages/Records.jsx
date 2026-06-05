import { useEffect, useState } from 'react'
import { api } from '../utils/api'
import { formatDateTime } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'

const INITIAL_FORM = {
  type: 'consulta',
  description: '',
  vaccines: '',
  allergies: '',
}

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

  useEffect(() => {
    void fetchPets()
  }, [])

  useEffect(() => {
    if (selectedPetId) {
      void fetchRecords(selectedPetId)
    }
  }, [selectedPetId])

  const canCreateRecord = user?.role === 'owner' || user?.role === 'vet'

  const fetchPets = async () => {
    try {
      const res = await api.get('/api/pets')
      setPets(res.data)
      if (res.data.length > 0) {
        setSelectedPetId(res.data[0].id)
      }
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
        vaccines: formData.vaccines ? formData.vaccines.split(',').map((item) => item.trim()).filter(Boolean) : [],
        allergies: formData.allergies ? formData.allergies.split(',').map((item) => item.trim()).filter(Boolean) : [],
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Cargando historial...</p>
        </div>
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
      vaccines: [],
      allergies: [],
    })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return (
    <div className="space-y-8 animate-fade">
      <section className="hero-panel animate-in">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="space-y-4">
            <span className="section-kicker">Historial y auditoria</span>
            <h1 className="text-5xl font-black text-dark">Registros clinicos con trazabilidad por mascota.</h1>
            <p className="max-w-2xl text-lg text-dark/70">Consulta actividad clinica y auditoria en un formato mas limpio, mas legible y mas util para seguimiento.</p>
            {canCreateRecord && (
              <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                {showForm ? 'Cancelar' : 'Nuevo registro'}
              </button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { value: records.length, label: 'registros' },
              { value: audit.length, label: 'auditoria' },
              { value: selectedPet ? selectedPet.name : '-', label: 'mascota activa' },
            ].map((item) => (
              <div key={item.label} className="metric-pill">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-dark/45">{item.label}</p>
                <p className="mt-3 text-3xl font-black text-dark break-words">{item.value}</p>
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

      <div className="card p-6">
        <label className="block text-sm font-semibold mb-3">Selecciona una mascota</label>
        <select value={selectedPetId} onChange={(e) => setSelectedPetId(e.target.value)} className="input-field">
          {pets.map((pet) => (
            <option key={pet.id} value={pet.id}>
              {pet.name} ({pet.species})
            </option>
          ))}
        </select>
      </div>

      {showForm && selectedPet && canCreateRecord && (
        <div className="card p-6 space-y-4 animate-in">
          <h2 className="text-2xl font-bold mb-4">Nuevo registro para {selectedPet.name}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="input-field">
              <option value="consulta">Consulta</option>
              <option value="vacuna">Vacuna</option>
              <option value="alergia">Alergia</option>
              <option value="tratamiento">Tratamiento</option>
              <option value="nota">Nota</option>
            </select>

            <textarea
              placeholder="Descripción del registro"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field h-24"
              required
            />

            <input
              type="text"
              placeholder="Vacunas (coma separada)"
              value={formData.vaccines}
              onChange={(e) => setFormData({ ...formData, vaccines: e.target.value })}
              className="input-field"
            />

            <input
              type="text"
              placeholder="Alergias (coma separada)"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              className="input-field"
            />

            <button type="submit" disabled={submitting} className="w-full btn-primary py-3 disabled:opacity-50">
              {submitting ? 'Guardando...' : 'Guardar registro'}
            </button>
          </form>
        </div>
      )}

      <div>
        {timeline.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-gray-600">Sin registros aún. Crea uno para comenzar.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {timeline.map((entry, idx) => (
              <div
                key={entry.id || idx}
                className={`card p-6 border-l-4 animate-in ${entry.kind === 'audit' ? 'border-accent' : 'border-brand'}`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex justify-between items-start mb-3 gap-4">
                  <div>
                    <p className={`font-bold text-lg capitalize ${entry.kind === 'audit' ? 'text-accent' : 'text-brand'}`}>
                      {entry.kind === 'audit' ? `Auditoria · ${entry.title}` : entry.title}
                    </p>
                    <p className="text-sm text-gray-600">{formatDateTime(entry.createdAt)}</p>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">{entry.actorName}</span>
                </div>
                <p className="text-gray-700 mb-3">{entry.description}</p>

                {entry.vaccines?.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Vacunas:</p>
                    <div className="flex flex-wrap gap-2">
                      {entry.vaccines.map((item, index) => (
                        <span key={index} className="tag">{item}</span>
                      ))}
                    </div>
                  </div>
                )}

                {entry.allergies?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">Alergias:</p>
                    <div className="flex flex-wrap gap-2">
                      {entry.allergies.map((item, index) => (
                        <span key={index} className="inline-block rounded-md bg-red-100 px-2 py-1 text-xs text-red-700">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
