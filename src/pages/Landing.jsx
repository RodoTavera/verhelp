import { Link } from 'react-router-dom'
import { useRef } from 'react'
import { useGSAP } from '../lib/gsap'
import { riseIn, scrollReveal, attachHoverLift, attachMagnetic } from '../lib/motion'

const PILLARS = [
  {
    eyebrow: 'Cartilla digital',
    title: 'Una sola ficha por mascota',
    description: 'Vacunas, alergias, controles y permisos de viaje. Todo en una cartilla digital sobria y facil de leer.',
  },
  {
    eyebrow: 'Compartida con criterio',
    title: 'Tus reglas, tu circulo',
    description: 'Familia, clinica y aerolinea acceden solo donde tu decides. Tu cartilla, tus permisos.',
  },
  {
    eyebrow: 'Lista cuando la necesitas',
    title: 'Sin friccion, sin papeles',
    description: 'La cartilla se entiende rapido y se comparte sin esfuerzo. La decision correcta en segundos.',
  },
]

export default function Landing() {
  const pageRef = useRef(null)
  const heroRef = useRef(null)

  useGSAP(
    () => {
      riseIn(heroRef.current?.querySelectorAll('[data-rise]') || [])
      scrollReveal(pageRef.current, '[data-rise]')
      const cleanHover = attachHoverLift(pageRef.current, '[data-hover]')
      const cleanMagnetic = attachMagnetic(pageRef.current, '[data-magnetic]')
      return () => {
        cleanHover()
        cleanMagnetic()
      }
    },
    { scope: pageRef }
  )

  return (
    <div ref={pageRef} className="space-y-14 md:space-y-20">
      <section ref={heroRef} className="reference-hero text-center" data-static>
        <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-white/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand shadow-sm" data-rise>
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          Cartilla digital animalista
        </span>
        <h1 className="reference-headline mt-6" data-rise>
          La cartilla digital
          <br />
          que cuida a cada mascota.
        </h1>
        <p className="reference-subcopy mx-auto mt-6" data-rise>
          Una ficha clinica viva y compartida para cada mascota. Vacunas, alergias, controles
          y viajes en un solo lugar, lista cuando la necesitas.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3" data-rise>
          <Link to="/auth" className="btn-primary" data-magnetic>Crear mi cartilla</Link>
          <Link to="/guides" className="btn-soft" data-magnetic>Guias de cuidado</Link>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3" data-rise>
        {PILLARS.map((pillar, index) => (
          <article key={pillar.title} className="animalist-card" data-hover>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand/10 text-xs font-semibold text-brand">0{index + 1}</span>
              <p className="eyebrow-label">{pillar.eyebrow}</p>
            </div>
            <h2 className="mt-3 text-2xl text-dark">{pillar.title}</h2>
            <p className="mt-3 text-sm text-dark/68">{pillar.description}</p>
          </article>
        ))}
      </section>

      <section className="animalist-card text-center" data-rise>
        <p className="editorial-quote text-2xl text-dark md:text-3xl">
          "Una mascota no es un dato. Es un companero de vida, y su cuidado merece una experiencia serena."
        </p>
        <p className="mt-4 text-xs uppercase tracking-[0.22em] text-dark/45">VetHelp · Manifiesto animalista</p>
      </section>
    </div>
  )
}
