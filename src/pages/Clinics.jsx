import { useDeferredValue, useEffect, useRef, useState } from 'react'
import { api } from '../utils/api'
import { useGSAP } from '../lib/gsap'
import { attachHoverLift, scrollReveal } from '../lib/motion'

export default function Clinics() {
  const [clinics, setClinics] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const deferredSearch = useDeferredValue(search)
  const rootRef = useRef(null)

  useEffect(() => { void fetchClinics() }, [])

  useEffect(() => {
    const value = deferredSearch.trim().toLowerCase()
    if (!value) {
      setFiltered(clinics)
      return
    }
    setFiltered(
      clinics.filter((clinic) =>
        clinic.name?.toLowerCase().includes(value) ||
        clinic.district?.toLowerCase().includes(value) ||
        clinic.speciality?.toLowerCase().includes(value)
      )
    )
  }, [deferredSearch, clinics])

  const fetchClinics = async () => {
    try {
      const res = await api.get('/api/clinics')
      setClinics(res.data || [])
      setFiltered(res.data || [])
    } catch (err) {
      console.error('Error cargando clinicas:', err)
      setError(err.response?.data?.message || err.message || 'No se pudieron cargar las clinicas.')
    } finally {
      setLoading(false)
    }
  }

  useGSAP(
    () => {
      if (!rootRef.current) return undefined
      scrollReveal(rootRef.current, '[data-rise]')
      const cleanHover = attachHoverLift(rootRef.current, '[data-hover]')
      return () => cleanHover()
    },
    { scope: rootRef, dependencies: [] }
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-10" ref={rootRef}>
      <section className="animalist-card" data-rise>
        <p className="eyebrow-label">Red veterinaria</p>
        <h1 className="mt-3 text-4xl text-dark md:text-5xl">Clinicas que acompanan</h1>
        <p className="mt-3 max-w-xl text-sm text-dark/68">
          Encuentra clinicas por zona o especialidad. Una red pensada para acompanar, no para abrumar.
        </p>
      </section>

      <div className="animalist-card space-y-3" data-rise>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="eyebrow-label">Busqueda</p>
          <span className="pet-species-pill">{filtered.length} resultados</span>
        </div>
        <input
          type="text"
          placeholder="Busca por nombre, zona o especialidad"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field"
        />
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200/70 bg-red-50 px-4 py-3 text-sm text-red-700" data-rise>
          {error}
        </div>
      )}

      {!error && filtered.length === 0 ? (
        <div className="animalist-card text-center" data-rise>
          <p className="editorial-quote text-2xl text-dark">No encontramos clinicas con ese criterio. Prueba con otra palabra.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((clinic) => (
            <article key={clinic.id} className="animalist-card flex flex-col gap-4" data-hover data-rise>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="eyebrow-label">Clinica autorizada</p>
                  <h2 className="mt-2 text-2xl text-dark">{clinic.name}</h2>
                </div>
                <span className="pet-species-pill">{clinic.rating} ★</span>
              </div>
              <ul className="subtle-list text-sm">
                <li><span>Distrito: {clinic.district}</span></li>
                {clinic.speciality && <li><span>Especialidad: {clinic.speciality}</span></li>}
                {clinic.phone && <li><span>Telefono: {clinic.phone}</span></li>}
                <li><span>Confianza: {clinic.reviews || 0} resenas</span></li>
              </ul>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
