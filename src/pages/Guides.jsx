import { useState } from 'react'
import { Link } from 'react-router-dom'

const FEED_FACTORS = [
  { value: 1.2, label: 'Reposo o control de peso' },
  { value: 1.6, label: 'Adulto con actividad moderada' },
  { value: 2, label: 'Activo o entrenamiento frecuente' },
  { value: 3, label: 'Crecimiento o alta demanda energética' },
]

const GUIDES_DATA = [
  {
    id: 1,
    category: 'Nutrición',
    title: 'Nutrición Balanceada',
    emoji: '🍖',
    description: 'Ajusta por edad, peso, condición corporal y gasto energético real.',
    signals: ['Raciones medidas', 'Proteína de calidad', 'Ajustes por etapa de vida'],
    tip: 'Cambia la dieta en transición gradual de 5 a 7 días para evitar molestias digestivas.',
  },
  {
    id: 2,
    category: 'Rutina',
    title: 'Ejercicio Diario',
    emoji: '🏃',
    description: 'El movimiento correcto reduce ansiedad, sobrepeso y conductas reactivas.',
    signals: ['Sesiones cortas y consistentes', 'Juegos olfativos', 'Descanso post actividad'],
    tip: 'No midas solo minutos: intensidad, clima y edad cambian la carga ideal.',
  },
  {
    id: 3,
    category: 'Prevención',
    title: 'Salud Dental',
    emoji: '🦷',
    description: 'La higiene oral afecta aliento, encías y también salud sistémica.',
    signals: ['Cepillado gradual', 'Snacks dentales', 'Control veterinario regular'],
    tip: 'Sangrado persistente o mal olor fuerte es motivo de revisión clínica.',
  },
  {
    id: 4,
    category: 'Prevención',
    title: 'Vacunación',
    emoji: '💉',
    description: 'Respeta esquema base, refuerzos y contexto epidemiológico de tu zona.',
    signals: ['Calendario visible', 'Refuerzos anuales', 'Registro clínico actualizado'],
    tip: 'Un carnet desactualizado complica viajes, ingresos y admisiones clínicas.',
  },
  {
    id: 5,
    category: 'Conducta',
    title: 'Manejo del Estrés',
    emoji: '😰',
    description: 'Identifica señales tempranas antes de que escalen a conductas de riesgo.',
    signals: ['Rutinas previsibles', 'Espacios seguros', 'Lectura de lenguaje corporal'],
    tip: 'Temblor, jadeo o evitación pueden ser estrés, no simple mal comportamiento.',
  },
  {
    id: 6,
    category: 'Cuidado diario',
    title: 'Higiene y Aseo',
    emoji: '🛁',
    description: 'Baño, uñas, piel y pelaje requieren frecuencia adecuada, no exceso.',
    signals: ['Rutina de cepillado', 'Secado completo', 'Corte seguro de uñas'],
    tip: 'La frecuencia del baño depende más de piel y estilo de vida que de la raza sola.',
  },
  {
    id: 7,
    category: 'Urgencias',
    title: 'Primeros Auxilios',
    emoji: '🚑',
    description: 'Actúa rápido, estabiliza y evita intervenciones caseras peligrosas.',
    signals: ['Botiquín base', 'Teléfono de clínica', 'Control de sangrado'],
    tip: 'Primeros auxilios no reemplazan consulta: compran tiempo mientras llegas a la clínica.',
  },
  {
    id: 8,
    category: 'Bienestar',
    title: 'Salud Mental',
    emoji: '🧠',
    description: 'El enriquecimiento ambiental mejora conducta, descanso y calidad de vida.',
    signals: ['Rotación de juguetes', 'Retos cognitivos', 'Exploración guiada'],
    tip: 'Una mascota aburrida suele expresar el problema en comportamiento, no en palabras.',
  },
  {
    id: 9,
    category: 'Prevención',
    title: 'Desparasitación',
    emoji: '🪱',
    description: 'La prevención debe seguir edad, exposición, clima y entorno.',
    signals: ['Control interno y externo', 'Frecuencia definida', 'Registro por fechas'],
    tip: 'No uses productos al azar: peso y especie importan para evitar toxicidad.',
  },
  {
    id: 10,
    category: 'Cuidado diario',
    title: 'Cuidado de Patas',
    emoji: '🐾',
    description: 'Las almohadillas reflejan desgaste, temperatura y nivel de actividad.',
    signals: ['Inspección post paseo', 'Hidratación adecuada', 'Corte de uñas oportuno'],
    tip: 'Asfalto caliente o superficies abrasivas causan lesiones más rápido de lo que parece.',
  },
  {
    id: 11,
    category: 'Senior',
    title: 'Envejecimiento',
    emoji: '🧓',
    description: 'Una mascota senior necesita monitoreo más fino y ajustes constantes.',
    signals: ['Chequeos más frecuentes', 'Dolor articular controlado', 'Dieta adaptada'],
    tip: 'Menos energía no siempre es vejez normal: a veces es dolor o enfermedad silenciosa.',
  },
  {
    id: 12,
    category: 'Urgencias',
    title: 'Emergencias',
    emoji: '🆘',
    description: 'Aprende a distinguir lo urgente de lo que puede esperar una cita.',
    signals: ['Dificultad respiratoria', 'Convulsiones', 'Hemorragia persistente'],
    tip: 'Cuando dudes entre esperar o salir, prioriza urgencias si hay respiración alterada o trauma.',
  },
]

const FEATURED_GUIDES = GUIDES_DATA.slice(0, 3)

function formatNumber(value) {
  return new Intl.NumberFormat('es-PE').format(value)
}

export default function Guides() {
  const [selectedGuide, setSelectedGuide] = useState(null)
  const [calculator, setCalculator] = useState({ weight: '', factor: String(FEED_FACTORS[1].value) })
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleCalculatorChange = (event) => {
    const { name, value } = event.target
    setCalculator((current) => ({ ...current, [name]: value }))
    setError('')
  }

  const handleCalculatorSubmit = (event) => {
    event.preventDefault()

    const weight = Number(calculator.weight)
    const factor = Number(calculator.factor)

    if (!Number.isFinite(weight) || weight <= 0) {
      setError('Ingresa un peso válido para estimar el requerimiento energético.')
      setResult(null)
      return
    }

    const rer = Math.round(70 * Math.pow(weight, 0.75))
    const daily = Math.round(rer * factor)
    const factorLabel = FEED_FACTORS.find((item) => item.value === factor)?.label || 'Factor personalizado'

    setResult({ rer, daily, factorLabel })
  }

  return (
    <div className="space-y-10 animate-fade">
      <section className="hero-panel animate-in">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-5">
            <span className="section-kicker">Biblioteca clínica</span>
            <div className="space-y-3">
              <h1 className="text-5xl font-black text-dark md:text-6xl">Guías de cuidado con criterio práctico, no relleno genérico.</h1>
              <p className="max-w-2xl text-lg text-dark/70">
                Aprende hábitos útiles, identifica señales importantes y usa herramientas rápidas para tomar mejores decisiones antes de la próxima consulta.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { value: GUIDES_DATA.length, label: 'guías activas' },
                { value: '1', label: 'calculadora integrada' },
                { value: '24/7', label: 'consulta y referencia' },
              ].map((item, idx) => (
                <div key={item.label} className="metric-pill animate-in" style={{ animationDelay: `${idx * 0.06}s` }}>
                  <p className="text-3xl font-black text-dark">{item.value}</p>
                  <p className="mt-1 text-sm text-dark/60">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <article className="card-soft animate-in" style={{ animationDelay: '0.08s' }}>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand">Top lecturas</p>
            <div className="mt-4 grid gap-3">
              {FEATURED_GUIDES.map((guide) => (
                <button
                  key={guide.id}
                  type="button"
                  onClick={() => setSelectedGuide(guide)}
                  className="rounded-lg border border-dark/8 bg-white/80 px-4 py-4 text-left shadow-sm transition-transform hover:-translate-y-0.5"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{guide.category}</p>
                    <p className="mt-1 text-lg font-black text-dark">{guide.title}</p>
                    <p className="mt-2 text-sm text-dark/65">{guide.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.98fr_1.02fr]">
        <article className="card space-y-5 animate-in" style={{ animationDelay: '0.12s' }}>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">Herramienta útil</p>
            <h2 className="mt-2 text-3xl font-black text-dark">Calculadora rápida de requerimiento energético</h2>
            <p className="mt-3 text-sm text-dark/70">
              Estima kcal diarias base a partir del peso y nivel de actividad. Es una referencia práctica, no sustituye indicación veterinaria.
            </p>
          </div>

          <form onSubmit={handleCalculatorSubmit} className="grid gap-4 md:grid-cols-2">
            <input
              type="number"
              min="0.1"
              step="0.1"
              name="weight"
              value={calculator.weight}
              onChange={handleCalculatorChange}
              className="input-field"
              placeholder="Peso en kg"
              required
            />

            <select
              name="factor"
              value={calculator.factor}
              onChange={handleCalculatorChange}
              className="input-field"
            >
              {FEED_FACTORS.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>

            <button type="submit" className="btn-primary justify-center md:col-span-2">
              Calcular ración energética
            </button>
          </form>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <div className="rounded-[0.95rem] bg-gradient-soft p-5">
            {result ? (
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-dark/45">RER</p>
                  <p className="mt-2 text-3xl font-black text-brand">{formatNumber(result.rer)}</p>
                  <p className="text-sm text-dark/65">kcal base</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-dark/45">Objetivo diario</p>
                  <p className="mt-2 text-3xl font-black text-dark">{formatNumber(result.daily)}</p>
                  <p className="text-sm text-dark/65">kcal estimadas</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-dark/45">Factor aplicado</p>
                  <p className="mt-2 text-lg font-black text-dark">{result.factorLabel}</p>
                  <p className="text-sm text-dark/65">ajústalo según condición corporal</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-dark/70">Introduce el peso y el nivel de actividad para obtener una base rápida de alimentación.</p>
            )}
          </div>
        </article>

        <article className="card space-y-5 animate-in" style={{ animationDelay: '0.16s' }}>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand">Cómo usar este módulo</p>
            <h2 className="mt-2 text-3xl font-black text-dark">Qué te llevas de cada guía</h2>
          </div>
          <div className="grid gap-3">
            {[
              'Acciones concretas que puedes aplicar en casa sin caer en improvisaciones peligrosas.',
              'Señales clínicas o conductuales que merecen vigilancia y consulta oportuna.',
              'Atajos de decisión para saber cuándo observar, cuándo ajustar y cuándo escalar.',
            ].map((item, idx) => (
              <div key={item} className="rounded-lg border border-dark/8 bg-white/72 px-4 py-4 animate-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                <p className="text-sm font-semibold text-dark">0{idx + 1}</p>
                <p className="mt-2 text-sm text-dark/70">{item}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">Colección completa</p>
            <h2 className="mt-1 text-3xl font-black text-dark">Explora la biblioteca de cuidado</h2>
          </div>
          <span className="tag">{GUIDES_DATA.length} contenidos</span>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {GUIDES_DATA.map((guide, idx) => (
            <button
              key={guide.id}
              type="button"
              onClick={() => setSelectedGuide(guide)}
              className="card cursor-pointer text-left hover:-translate-y-1 hover:shadow-2xl hover:shadow-dark/10 transition-all animate-in"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-dark/45">Guia {String(guide.id).padStart(2, '0')}</p>
                <span className="tag">{guide.category}</span>
              </div>
              <h3 className="mt-5 text-2xl font-black text-dark">{guide.title}</h3>
              <p className="mt-3 text-sm text-dark/65">{guide.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {guide.signals.slice(0, 2).map((signal) => (
                  <span key={signal} className="tag">{signal}</span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </section>

      {selectedGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/60 p-4 backdrop-blur-sm">
          <div className="card max-h-[85vh] max-w-3xl overflow-y-auto p-8 animate-in">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-accent">{selectedGuide.category}</p>
                <h2 className="mt-2 text-4xl font-black text-dark">{selectedGuide.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGuide(null)}
                className="rounded-md bg-white/80 px-4 py-2 text-sm font-semibold text-dark shadow-sm"
              >
                Cerrar
              </button>
            </div>

            <p className="mt-6 text-lg leading-relaxed text-dark/75">{selectedGuide.description}</p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {selectedGuide.signals.map((signal) => (
                <div key={signal} className="rounded-lg border border-dark/8 bg-gradient-soft px-4 py-4 text-sm font-semibold text-dark">
                  {signal}
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[0.95rem] bg-dark px-6 py-6 text-white">
              <p className="text-sm uppercase tracking-[0.24em] text-white/55">Consejo importante</p>
              <p className="mt-3 text-base text-white/85">{selectedGuide.tip}</p>
            </div>
          </div>
        </div>
      )}

      <section className="hero-panel text-center animate-in" style={{ animationDelay: '0.2s' }}>
        <div className="mx-auto max-w-3xl space-y-5">
          <span className="section-kicker">Escala cuando haga falta</span>
          <h2 className="text-4xl font-black text-dark md:text-5xl">Cuando una guía no basta, pasa a una clínica autorizada.</h2>
          <p className="text-lg text-dark/70">
            Usa estas referencias para decidir mejor, pero confirma tratamientos, dietas complejas y urgencias con profesionales.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/clinics" className="btn-primary">Ver veterinarias</Link>
            <Link to="/auth" className="btn-soft">Entrar a VetHelp</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
