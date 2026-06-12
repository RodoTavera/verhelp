import { useRef, useState } from 'react'
import { useGSAP } from '../lib/gsap'
import { attachHoverLift, attachMagnetic, scrollReveal } from '../lib/motion'

const FEED_FACTORS = [
  { value: 1.2, label: 'Reposo o control de peso' },
  { value: 1.6, label: 'Adulto con actividad moderada' },
  { value: 2, label: 'Activo o entrenamiento frecuente' },
  { value: 3, label: 'Crecimiento o alta demanda energetica' },
]

const GUIDES = [
  { id: 1, category: 'Nutricion', title: 'Nutricion balanceada', description: 'Ajusta por edad, peso, condicion corporal y gasto energetico.' },
  { id: 2, category: 'Rutina', title: 'Ejercicio diario', description: 'El movimiento correcto reduce ansiedad, sobrepeso y conductas reactivas.' },
  { id: 3, category: 'Prevencion', title: 'Salud dental', description: 'La higiene oral afecta el aliento, las encias y la salud sistemica.' },
  { id: 4, category: 'Prevencion', title: 'Vacunacion al dia', description: 'Respeta el esquema base, los refuerzos y el contexto epidemiologico.' },
  { id: 5, category: 'Bienestar', title: 'Manejo del estres', description: 'Identifica senales tempranas antes de que escalen a conductas de riesgo.' },
  { id: 6, category: 'Cuidado diario', title: 'Higiene y aseo', description: 'Bano, unas, piel y pelaje requieren frecuencia adecuada, no exceso.' },
  { id: 7, category: 'Urgencias', title: 'Primeros auxilios', description: 'Actua rapido, estabiliza y evita intervenciones caseras peligrosas.' },
  { id: 8, category: 'Bienestar', title: 'Salud mental', description: 'El enriquecimiento ambiental mejora conducta, descanso y calidad de vida.' },
]

function formatNumber(value) {
  return new Intl.NumberFormat('es-PE').format(value)
}

export default function Guides() {
  const [calculator, setCalculator] = useState({ weight: '', factor: String(FEED_FACTORS[1].value) })
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setCalculator((current) => ({ ...current, [name]: value }))
    setError('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const weight = Number(calculator.weight)
    const factor = Number(calculator.factor)

    if (!Number.isFinite(weight) || weight <= 0) {
      setError('Ingresa un peso valido para estimar el requerimiento energetico.')
      setResult(null)
      return
    }

    const rer = Math.round(70 * Math.pow(weight, 0.75))
    const daily = Math.round(rer * factor)
    setResult({ rer, daily })
  }

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
        <p className="eyebrow-label">Guias de cuidado</p>
        <h1 className="mt-3 text-4xl text-dark md:text-5xl">Cuidar con criterio</h1>
        <p className="mt-3 max-w-xl text-sm text-dark/68">
          Una biblioteca breve y honesta para acompanarte en lo cotidiano. Senales claras, decisiones faciles.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {GUIDES.map((guide) => (
          <article key={guide.id} className="animalist-card" data-rise>
            <span className="pet-species-pill">{guide.category}</span>
            <h2 className="mt-3 text-xl text-dark">{guide.title}</h2>
            <p className="mt-3 text-sm text-dark/68">{guide.description}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleSubmit} className="animalist-card space-y-5" data-rise>
          <p className="eyebrow-label">Calculadora energetica</p>
          <h2 className="text-2xl text-dark">Estima la racion diaria</h2>
          <p className="text-sm text-dark/68">Una referencia practica. No sustituye la indicacion de tu veterinaria.</p>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="number"
              min="0.1"
              step="0.1"
              name="weight"
              value={calculator.weight}
              onChange={handleChange} data-magnetic
              className="input-field"
              placeholder="Peso en kg"
              required
            />
            <select name="factor" value={calculator.factor} onChange={handleChange} className="input-field">
              {FEED_FACTORS.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </div>
          {error && (
            <div className="rounded-2xl border border-red-200/70 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          <button type="submit" className="btn-primary w-full justify-center">Calcular racion</button>

          {result && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="field-soft text-center">
                <p className="eyebrow-label">RER</p>
                <p className="mt-2 text-3xl text-dark">{formatNumber(result.rer)}</p>
                <p className="mt-1 text-xs text-dark/55">kcal base</p>
              </div>
              <div className="field-soft text-center">
                <p className="eyebrow-label">Racion sugerida</p>
                <p className="mt-2 text-3xl text-dark">{formatNumber(result.daily)}</p>
                <p className="mt-1 text-xs text-dark/55">kcal al dia</p>
              </div>
            </div>
          )}
        </form>

        <article className="showcase-stage" data-rise>
          <p className="eyebrow-label text-white/60">Manifiesto</p>
          <h2 className="mt-3 font-display text-3xl text-white">Menos datos, mas cuidado.</h2>
          <p className="mt-4 text-sm text-white/78">
            Las guias estan para acompanarte. Si dudas, observa a tu mascota: ella siempre te dice como se siente.
          </p>
          <ul className="subtle-list mt-5" style={{ color: 'rgba(255, 252, 246, 0.86)' }}>
            <li><span>Observa su energia cada dia.</span></li>
            <li><span>Registra solo lo importante.</span></li>
            <li><span>Confia en tu veterinaria de cabecera.</span></li>
          </ul>
        </article>
      </section>
    </div>
  )
}
