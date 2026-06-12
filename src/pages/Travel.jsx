import { useRef, useState } from 'react'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { gsap, useGSAP } from '../lib/gsap'
import { attachHoverLift, attachMagnetic, riseIn, scrollReveal } from '../lib/motion'

const STATUS_TONE = {
  APTO: 'pill-tab-active',
  CONDICIONAL: 'pill-tab',
  'NO APTO': 'pill-tab',
}

const STATUS_COPY = {
  APTO: 'Mascota apta para viajar',
  CONDICIONAL: 'Requiere actualizacion de documentos',
  'NO APTO': 'Mascota no apta para viajar',
}

export default function Travel() {
  const { user } = useAuth()
  const [petId, setPetId] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const rootRef = useRef(null)
  const resultRef = useRef(null)
  const formRef = useRef(null)

  useGSAP(
    () => {
      riseIn(formRef.current?.querySelectorAll('[data-rise]') || [], { y: 18, stagger: 0.08, duration: 0.7 })
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

  // Cuando llega un resultado, lo presentamos con un barrido lateral.
  useGSAP(
    () => {
      if (!result || !resultRef.current) return undefined
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo(
        resultRef.current,
        { autoAlpha: 0, x: 32 },
        { autoAlpha: 1, x: 0, duration: 0.6 }
      ).fromTo(
        resultRef.current.querySelectorAll('[data-stagger]'),
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08 },
        '-=0.2'
      )
      return () => tl.kill()
    },
    { scope: resultRef, dependencies: [result, loading] }
  )

  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.get(`/api/airline/verify/${petId}`)
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Mascota no encontrada')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  if (user?.role !== 'airline') {
    return (
      <div className="animalist-card text-center" data-rise>
        <p className="eyebrow-label">Acceso restringido</p>
        <h1 className="mt-3 text-3xl text-dark">Esta vista es solo para aerolineas autorizadas.</h1>
        <p className="mt-3 text-sm text-dark/68">Solicita acceso a tu equipo de operaciones para continuar.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8" ref={rootRef}>
      <section className="animalist-card text-center" data-rise>
        <p className="eyebrow-label">Viajes</p>
        <h1 className="mt-3 text-4xl text-dark">Verificacion de embarque</h1>
        <p className="mt-3 text-sm text-dark/68">Consulta aptitud sanitaria antes de cada vuelo.</p>
      </section>

      <form ref={formRef} onSubmit={handleVerify} className="animalist-card space-y-4" data-rise>
        <label className="block">
          <span className="eyebrow-label">ID de mascota</span>
          <input
            type="text"
            placeholder="PET-2024-1234"
            value={petId}
            onChange={(e) => setPetId(e.target.value)}
            className="input-field mt-2"
            required
          />
        </label>
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center" data-magnetic>
          {loading ? 'Buscando...' : 'Buscar mascota'}
        </button>
      </form>

      {error && (
        <div className="rounded-2xl border border-red-200/70 bg-red-50 px-4 py-3 text-sm text-red-700" data-rise>
          {error}
        </div>
      )}

      {result && (
        <article ref={resultRef} className="animalist-card space-y-5" data-hover>
          <div className="field-soft text-center" data-stagger>
            <p className="eyebrow-label">Ficha evaluada</p>
            <h2 className="mt-2 text-3xl text-dark">{result.petName}</h2>
            <p className="text-xs text-dark/55 capitalize">{result.species}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="field-soft text-center" data-stagger>
              <p className="eyebrow-label">Estado</p>
              <p className="mt-2 text-xl text-brand">{result.travelStatus}</p>
            </div>
            <div className="field-soft text-center" data-stagger>
              <p className="eyebrow-label">Ultima consulta</p>
              <p className="mt-2 text-sm text-dark">{result.lastControlDate || 'N/A'}</p>
            </div>
          </div>
          {result.vaccines?.length ? (
            <div data-stagger>
              <p className="eyebrow-label">Vacunas</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.vaccines.map((item) => <span key={item} className="tag" data-hover>{item}</span>)}
              </div>
            </div>
          ) : null}
          {result.allergies?.length ? (
            <div data-stagger>
              <p className="eyebrow-label">Alergias</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.allergies.map((item) => <span key={item} className="tag" data-hover>{item}</span>)}
              </div>
            </div>
          ) : null}
          <div className={`rounded-2xl px-4 py-3 text-center text-sm font-medium ${STATUS_TONE[result.travelStatus] || 'pill-tab'}`} data-stagger>
            {STATUS_COPY[result.travelStatus] || 'Resultado pendiente de revision'}
          </div>
        </article>
      )}
    </div>
  )
}
