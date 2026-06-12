import { Link } from 'react-router-dom'
import { useRef } from 'react'
import { useGSAP } from '../lib/gsap'
import {
  riseIn,
  scrollReveal,
  attachHoverLift,
  attachMagnetic,
  marquee,
  parallaxY,
} from '../lib/motion'

const SPECIES = [
  { name: 'Perros', accent: false },
  { name: 'Gatos', accent: false },
  { name: 'Aves', accent: false },
  { name: 'Conejos', accent: true },
  { name: 'Exoticos', accent: true },
  { name: 'Hamsters', accent: false },
  { name: 'Reptiles', accent: true },
  { name: 'Pajaros', accent: false },
]

const PILLARS = [
  {
    eyebrow: 'Cartilla digital',
    title: 'Una sola ficha por mascota',
    description: 'Vacunas, alergias, controles, contacto clinico y permisos de viaje. Todo en una cartilla digital sobria y facil de leer.',
  },
  {
    eyebrow: 'Compartida con criterio',
    title: 'Permisos por circulo de cuidado',
    description: 'Dueno, familia, clinica y aerolinea entran solo donde tu decides. Tu cartilla, tus reglas.',
  },
  {
    eyebrow: 'Lista en el momento justo',
    title: 'Cuando se necesita, aparece',
    description: 'La cartilla se entiende rapido y se comparte sin friccion. La decision correcta se toma en segundos.',
  },
]

const VALUES = [
  'Cartilla digital con vacunas, alergias y controles.',
  'Compartida con dueno, familia, clinica y viajes.',
  'Verificacion de embarque desde la ficha.',
  'Diseno animalista: sereno, claro, util.',
]

export default function Landing() {
  const pageRef = useRef(null)
  const heroRef = useRef(null)
  const marqueeRef = useRef(null)

  useGSAP(
    () => {
      // Hero: reveal del titulo y subtexto, con stagger vertical.
      riseIn(heroRef.current?.querySelectorAll('[data-rise]') || [])
      // Reveal por scroll para el resto de la pagina.
      scrollReveal(pageRef.current, '[data-rise]:not([data-static])')
      // Hover lift y magnetic en piezas interactivas.
      const cleanHover = attachHoverLift(pageRef.current, '[data-hover]')
      const cleanMagnetic = attachMagnetic(pageRef.current, '[data-magnetic]')
      // Parallax editorial en la pieza oscura.
      parallaxY(pageRef.current, '[data-parallax]', { amount: 30 })
      // Marquee inferior de especies.
      const killMarquee = marquee(marqueeRef.current, '[data-marquee-track]', { speed: 0.6 })
      return () => {
        cleanHover()
        cleanMagnetic()
        if (killMarquee) killMarquee()
      }
    },
    { scope: pageRef }
  )

  return (
    <div ref={pageRef} className="space-y-14 md:space-y-20">
      <section
        ref={heroRef}
        className="reference-hero text-center"
        data-static
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-white/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand shadow-sm" data-rise>
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          Funcion principal · cartilla digital
        </span>
        <h1 className="reference-headline mt-6" data-rise>
          La cartilla digital
          <br />
          que cuida a cada mascota.
        </h1>
        <p className="reference-subcopy mx-auto mt-6" data-rise>
          VetHelp reune identidad, salud y permisos compartidos en una cartilla digital animalista: sobria,
          viva y lista cuando la necesitas.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2" data-rise>
          {SPECIES.slice(0, 5).map((species) => (
            <span
              key={species.name}
              data-hover
              className={`pet-species-pill ${species.accent ? 'pet-species-pill-accent' : ''}`}
            >
              {species.name}
            </span>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3" data-rise>
          <Link to="/auth" className="btn-primary" data-magnetic>Crear mi cartilla</Link>
          <Link to="/guides" className="btn-soft" data-magnetic>Como se cuida</Link>
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

      <section className="grid gap-6 md:grid-cols-[1.05fr_0.95fr]" data-rise>
        <article className="showcase-stage" data-parallax>
          <p className="eyebrow-label text-white/60">La cartilla digital</p>
          <h2 className="mt-4 font-display text-3xl text-white">Una ficha viva, una historia cuidada.</h2>
          <p className="mt-4 max-w-md text-sm text-white/78">
            Menos bloques, mas respiracion. Menos datos escondidos, mas decisiones faciles. VetHelp se siente
            como un refugio digital: sereno, util, accesible para todos los que quieren a un animal.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {VALUES.slice(0, 2).map((value) => (
              <div key={value} className="showcase-card" data-hover>
                <p className="text-sm text-white/80">{value}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="animalist-card" data-hover>
          <p className="eyebrow-label">Lo que encontraras</p>
          <ul className="subtle-list mt-4">
            {VALUES.map((value) => (
              <li key={value}><span>{value}</span></li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link to="/clinics" className="btn-soft text-sm" data-magnetic>Clinicas</Link>
            <Link to="/guides" className="btn-soft text-sm" data-magnetic>Guias</Link>
            <Link to="/auth" className="btn-soft text-sm" data-magnetic>Iniciar sesion</Link>
          </div>
        </article>
      </section>

      <section className="grid gap-6 md:grid-cols-[1.05fr_0.95fr]" data-rise>
        <article className="showcase-stage" data-parallax>
          <p className="eyebrow-label text-white/60">La cartilla digital</p>
          <h2 className="mt-4 font-display text-3xl text-white">Una ficha viva, una historia cuidada.</h2>
          <p className="mt-4 max-w-md text-sm text-white/78">
            Menos bloques, mas respiracion. Menos datos escondidos, mas decisiones faciles. VetHelp se siente
            como un refugio digital: sereno, util, accesible para todos los que quieren a un animal.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {VALUES.slice(0, 2).map((value) => (
              <div key={value} className="showcase-card" data-hover>
                <p className="text-sm text-white/80">{value}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="animalist-card" data-hover>
          <p className="eyebrow-label">Lo que encontraras</p>
          <ul className="subtle-list mt-4">
            {VALUES.map((value) => (
              <li key={value}><span>{value}</span></li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link to="/clinics" className="btn-soft text-sm" data-magnetic>Clinicas</Link>
            <Link to="/guides" className="btn-soft text-sm" data-magnetic>Guias</Link>
            <Link to="/auth" className="btn-soft text-sm" data-magnetic>Iniciar sesion</Link>
          </div>
        </article>
      </section>

      <section className="animalist-card text-center" data-rise>
        <p className="editorial-quote text-2xl text-dark md:text-3xl">
          "Una mascota no es un dato. Es un companero de vida, y su cuidado merece una experiencia serena."
        </p>
        <p className="mt-4 text-xs uppercase tracking-[0.22em] text-dark/45">VetHelp · Manifiesto animalista</p>
      </section>

      <div ref={marqueeRef} className="relative overflow-hidden rounded-full border border-dark/8 bg-white/55 py-3" aria-hidden="true">
        <div className="flex w-max gap-6 whitespace-nowrap" data-marquee-track>
          {[...SPECIES, ...SPECIES].map((species, index) => (
            <span key={`${species.name}-${index}`} className={`pet-species-pill ${species.accent ? 'pet-species-pill-accent' : ''}`}>
              {species.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
