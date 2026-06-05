import { useDeferredValue, useEffect, useState } from 'react'
import { api } from '../utils/api'

export default function Clinics() {
  const [clinics, setClinics] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const deferredSearch = useDeferredValue(search)

  useEffect(() => {
    fetchClinics()
  }, [])

  useEffect(() => {
    const value = deferredSearch.trim().toLowerCase()

    if (!value) {
      setFiltered(clinics)
      return
    }

    setFiltered(
      clinics.filter((clinic) =>
        clinic.name?.toLowerCase().includes(value) ||
        clinic.zone?.toLowerCase().includes(value) ||
        clinic.specialty?.toLowerCase().includes(value)
      )
    )
  }, [deferredSearch, clinics])

  const fetchClinics = async () => {
    try {
      const res = await api.get('/api/clinics')
      setClinics(res.data)
      setFiltered(res.data)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearch(e.target.value)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Cargando veterinarias...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade">
      <section className="hero-panel animate-in">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="space-y-4">
            <span className="section-kicker">Red veterinaria</span>
            <h1 className="text-5xl font-black text-dark">Clinicas autorizadas con lectura rapida y filtros utiles.</h1>
            <p className="max-w-2xl text-lg text-dark/70">Encuentra clinicas por zona o especialidad en una vista mas clara, mas profesional y mas facil de consultar.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { value: clinics.length, label: 'clinicas activas' },
              { value: filtered.length, label: 'resultados visibles' },
              { value: '24/7', label: 'consulta rapida' },
            ].map((item) => (
              <div key={item.label} className="metric-pill">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-dark/45">{item.label}</p>
                <p className="mt-3 text-3xl font-black text-dark">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="card p-6 animate-in space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">Busqueda inteligente</p>
            <p className="text-dark/65">Filtra por nombre, distrito o especialidad.</p>
          </div>
          <span className="tag">{filtered.length} clínicas</span>
        </div>
        <input
          type="text"
          placeholder="Busca por nombre, zona o especialidad..."
          value={search}
          onChange={handleSearch}
          className="input-field"
        />
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="card animate-in">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand">Cobertura</p>
          <h2 className="mt-2 text-3xl font-black text-dark">Mapa de ubicacion en siguiente iteracion.</h2>
          <p className="mt-3 max-w-2xl text-dark/68">Por ahora el directorio prioriza claridad operativa: nombre, zona, especialidad, telefono y reputacion visibles sin depender del mapa.</p>
        </article>
        <article className="card-soft animate-in" style={{ animationDelay: '0.06s' }}>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">Que puedes hacer aqui</p>
          <div className="mt-4 grid gap-3">
            {['Buscar por distrito', 'Revisar especialidades', 'Detectar clinicas mejor valoradas'].map((item, index) => (
              <div key={item} className="rounded-lg border border-dark/8 bg-white/75 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-dark/45">0{index + 1}</p>
                <p className="mt-2 text-sm text-dark/70">{item}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <div>
        {filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-gray-600">No se encontraron veterinarias</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((clinic, idx) => (
              <article key={clinic.id} className="card p-6 hover:shadow-2xl hover:shadow-dark/10 transition-shadow animate-in" style={{ animationDelay: `${idx * 0.06}s` }}>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-dark/45">Clinica autorizada</p>
                    <h3 className="text-2xl font-black text-dark">{clinic.name}</h3>
                  </div>
                  <span className="tag">{clinic.rating}</span>
                </div>

                <div className="space-y-3 text-sm mb-4">
                  <p>
                    <span className="font-semibold text-gray-600">Zona:</span>
                    <br />
                    {clinic.zone}
                  </p>
                  {clinic.specialty && (
                    <p>
                      <span className="font-semibold text-gray-600">Especialidad:</span>
                      <br />
                      {clinic.specialty}
                    </p>
                  )}
                  {clinic.phone && (
                    <p>
                      <span className="font-semibold text-gray-600">Teléfono:</span>
                      <br />
                      {clinic.phone}
                    </p>
                  )}
                </div>

                <div className="rounded-lg bg-gradient-soft px-4 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-dark/45">Confianza</p>
                    <p className="text-lg font-bold text-brand">{clinic.reviews || 0} reseñas</p>
                  </div>
                  <span className="tag">{clinic.specialty || 'General'}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
