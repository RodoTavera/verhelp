import { Link } from 'react-router-dom'
import { useRef } from 'react'
import PetAvatar3D from '../components/PetAvatar3D'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'

const HERO_METRICS = [
  { value: '1 ficha', label: 'por mascota' },
  { value: '5 roles', label: 'en la misma operacion' },
  { value: '24/7', label: 'lectura clinica rapida' },
]

const HERO_NOTES = [
  'Vacunas y alertas visibles sin ruido.',
  'Permisos claros entre dueno, familia y clinicas.',
  'Validacion de viaje y panel operativo unificados.',
]

const SUPPORT_NOTES = [
  { title: 'Operacion clara', detail: 'No mas pantallas rotas o recargadas.' },
  { title: 'Lectura rapida', detail: 'Informacion lista para actuar.' },
]

const FEATURE_COLUMNS = [
  {
    index: '01',
    title: 'Ficha premium y clara',
    description: 'La identidad de la mascota, su contexto clinico y sus permisos conviven en una sola interfaz sobria y facil de leer.',
  },
  {
    index: '02',
    title: 'Operacion multirol real',
    description: 'Dueno, familia, clinicas, viajes y administracion trabajan sobre el mismo sistema sin duplicar informacion.',
  },
  {
    index: '03',
    title: 'Consulta lista para decision',
    description: 'La experiencia esta pensada para revisar, verificar y actuar rapido, no para decorar el historial con ruido.',
  },
]

const STORY_CARDS = [
  {
    step: '01',
    eyebrow: 'Registro elegante',
    title: 'Creas una identidad visual y clinica para cada mascota.',
    description: 'Desde el primer alta, la ficha se siente como un producto serio: datos base, avatar, especie, permisos y señales clinicas listos para operar.',
    points: ['Avatar personalizable por mascota', 'Datos base y trazabilidad en el mismo flujo', 'Preparado para distintos tipos de especie'],
  },
  {
    step: '02',
    eyebrow: 'Permisos con criterio',
    title: 'Compartes acceso sin perder control del historial.',
    description: 'El dueno decide cuando entra la familia y cuando una clinica puede editar. Todo se mantiene legible, ordenado y auditable.',
    points: ['Autorizacion por actor', 'Familia con lectura controlada', 'Clinicas con continuidad clinica'],
  },
  {
    step: '03',
    eyebrow: 'Consulta y viaje',
    title: 'La informacion se convierte en lectura operativa inmediata.',
    description: 'Dashboard, registros y validacion de viaje usan la misma base, con estados claros, superficies limpias y foco en la decision.',
    points: ['Historial listo para veterinaria', 'Estado sanitario entendible', 'Flujo apto para viaje y revision'],
  },
]

const ROLE_PANELS = [
  { title: 'Duenos', detail: 'Gestionan la ficha central y personalizan la mascota como parte del producto.' },
  { title: 'Familia', detail: 'Consulta informacion confiable desde una interfaz clara y elegante.' },
  { title: 'Clinicas', detail: 'Registran atenciones con foco en contexto, no en formularios pesados.' },
  { title: 'Viajes y admin', detail: 'Verifican estados y operacion desde vistas sobrias y ejecutivas.' },
]

export default function Landing() {
  const pageRef = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(
        {
          desktop: '(min-width: 1024px)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { desktop, reduceMotion } = context.conditions
          const heroMeta = pageRef.current?.querySelector('[data-reference-meta]')
          const heroWords = gsap.utils.toArray(pageRef.current?.querySelectorAll('[data-reference-word]'))
          const heroCopy = gsap.utils.toArray(pageRef.current?.querySelectorAll('[data-reference-copy]'))
          const heroSpecies = gsap.utils.toArray(pageRef.current?.querySelectorAll('[data-reference-species] > *'))
          const heroBar = pageRef.current?.querySelector('[data-reference-bar]')
          const heroCards = gsap.utils.toArray(pageRef.current?.querySelectorAll('[data-reference-side]'))
          const storySection = pageRef.current?.querySelector('[data-story-section]')
          const storyProgress = pageRef.current?.querySelector('[data-story-progress]')
          const storyCards = gsap.utils.toArray('[data-story-card]')

          if (reduceMotion) {
            gsap.set([heroMeta, ...heroWords, ...heroCopy, ...heroSpecies, heroBar, ...heroCards, ...storyCards], {
              clearProps: 'all',
              autoAlpha: 1,
              x: 0,
              y: 0,
              scale: 1,
            })
            if (storyProgress) {
              gsap.set(storyProgress, { width: '100%' })
            }
          } else {
            const introTimeline = gsap.timeline({
              defaults: {
                duration: 0.9,
                ease: 'power3.out',
              },
            })

            if (heroMeta) {
              introTimeline.from(heroMeta, { y: 18, autoAlpha: 0, duration: 0.62 })
            }

            if (heroWords.length) {
              introTimeline.from(heroWords, { yPercent: 120, autoAlpha: 0, stagger: 0.08, duration: 1.04 }, '<0.06')
            }

            if (heroCopy.length) {
              introTimeline.from(heroCopy, { y: 24, autoAlpha: 0, stagger: 0.08, duration: 0.72 }, '<0.16')
            }

            if (heroSpecies.length) {
              introTimeline.from(heroSpecies, { y: 16, autoAlpha: 0, stagger: 0.04, duration: 0.46 }, '<0.08')
            }

            if (heroBar) {
              introTimeline.from(heroBar, { y: 26, autoAlpha: 0, scale: 0.98, duration: 0.74 }, '<0.08')
            }

            if (heroCards.length) {
              introTimeline.from(heroCards, { y: 26, autoAlpha: 0, stagger: 0.08, duration: 0.74 }, '-=0.18')
            }
          }

          if (!storySection || !storyProgress || storyCards.length < 3) {
            return undefined
          }

          if (!desktop || reduceMotion) {
            gsap.set(storyCards, { clearProps: 'all', autoAlpha: 1, scale: 1, y: 0 })
            gsap.set(storyProgress, { width: '100%' })
            return undefined
          }

          gsap.set(storyCards.slice(1), { autoAlpha: 0.34, scale: 0.92, y: 32 })
          gsap.set(storyProgress, { width: '33%' })

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: storySection,
              start: 'top top+=12',
              end: '+=180%',
              scrub: 1,
              pin: true,
              anticipatePin: 1,
            },
            defaults: {
              ease: 'none',
            },
          })

          timeline
            .to(storyCards[0], { autoAlpha: 0.28, scale: 0.92, y: -26, duration: 1 })
            .to(storyProgress, { width: '66%', duration: 1 }, 0)
            .to(storyCards[1], { autoAlpha: 1, scale: 1, y: 0, duration: 1 }, 0)
            .to(storyCards[1], { autoAlpha: 0.28, scale: 0.92, y: -26, duration: 1 })
            .to(storyProgress, { width: '100%', duration: 1 }, 1)
            .to(storyCards[2], { autoAlpha: 1, scale: 1, y: 0, duration: 1 }, 1)

          ScrollTrigger.refresh()
          return undefined
        },
        pageRef
      )

      return () => {
        mm.revert()
      }
    },
    { scope: pageRef }
  )

  return (
    <div ref={pageRef} className="space-y-16 lg:space-y-24">
      <section className="space-y-6 animate-fade">
        <div className="reference-hero">
          <div className="relative mx-auto max-w-5xl text-center">
            <div className="flex flex-wrap items-center justify-center gap-3" data-reference-meta>
              <span className="section-kicker">Frontend premium para salud animal</span>
              <p className="eyebrow-label">pet identity, permisos, historial y viaje</p>
            </div>

            <div className="mt-10 space-y-6">
              <p className="reference-hero-label" data-reference-copy>historial clinico elegante para distintas especies</p>
              <div className="space-y-1">
                <div className="overflow-hidden"><span className="reference-headline block" data-reference-word>VetHelp</span></div>
                <div className="overflow-hidden"><span className="reference-headline block" data-reference-word>listo para</span></div>
                <div className="overflow-hidden"><span className="reference-headline block" data-reference-word>operar</span></div>
              </div>
              <p className="reference-subcopy mx-auto" data-reference-copy>
                VetHelp organiza vacunas, alergias, permisos, consultas y validacion de viaje con una interfaz mas clara, mejor espaciada y visualmente mucho mas solida.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-2" data-reference-species>
              {['Perros', 'Gatos', 'Aves', 'Conejos', 'Exoticos'].map((species) => (
                <span key={species} className="tag text-sm">{species}</span>
              ))}
            </div>

            <div className="mt-10 flex justify-center" data-reference-bar>
              <div className="reference-command-bar">
                <div className="reference-command-chip">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/55">VetHelp</p>
                  <p className="mt-1 text-sm font-semibold text-white">Historia clinica central</p>
                </div>
                <Link to="/auth" className="reference-command-chip reference-command-chip-accent">
                  <span className="text-[11px] uppercase tracking-[0.22em]">Acceso</span>
                  <span className="mt-1 block text-sm font-semibold">Entrar a VetHelp</span>
                </Link>
                <Link to="/clinics" className="reference-command-chip">
                  <span className="text-[11px] uppercase tracking-[0.22em] text-white/55">Directorio</span>
                  <span className="mt-1 block text-sm font-semibold text-white">Explorar red veterinaria</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.02fr_0.98fr]">
          <article className="reference-editorial-panel" data-reference-side>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
              <div className="flex justify-center lg:w-[15rem] lg:justify-start">
                <PetAvatar3D
                  petName="Mora"
                  species="gato"
                  avatarConfig={{
                    furColor: '#927B68',
                    innerColor: '#F6E0CE',
                    accessoryColor: '#B5823D',
                    eyeColor: '#142B32',
                    pattern: 'mask',
                    accessory: 'bow',
                  }}
                  size="lg"
                />
              </div>

              <div className="space-y-4">
                <p className="eyebrow-label">Mascota destacada</p>
                <div>
                  <h2 className="text-4xl leading-[0.98] text-dark">Mora y su ficha premium</h2>
                  <p className="mt-2 text-sm text-dark/58">PET-2026-0142 · ficha premium</p>
                </div>
                <p className="max-w-xl text-sm text-dark/68">
                  Identidad visual, historial y permisos en una sola experiencia. La referencia visual pedía mas contundencia tipografica y mas aire, no mas bloques ruidosos.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {HERO_NOTES.map((item) => (
                <div key={item} className="reference-support-card">
                  <p className="text-sm text-dark/72">{item}</p>
                </div>
              ))}
            </div>
          </article>

          <div className="grid gap-4 md:grid-cols-3">
            {HERO_METRICS.map((item) => (
              <article key={item.label} className="reference-support-card" data-reference-side>
                <p className="text-3xl font-black text-dark">{item.value}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-dark/50">{item.label}</p>
              </article>
            ))}

            {SUPPORT_NOTES.map((item) => (
              <article key={item.title} className="reference-support-card md:col-span-1" data-reference-side>
                <p className="text-[11px] uppercase tracking-[0.22em] text-dark/45">{item.title}</p>
                <p className="mt-3 text-sm text-dark/68">{item.detail}</p>
              </article>
            ))}

            <article className="reference-support-card md:col-span-1" data-reference-side>
              <p className="text-[11px] uppercase tracking-[0.22em] text-dark/45">Arquitectura visual</p>
              <p className="mt-3 text-sm text-dark/68">
                Tipografia mas fuerte, mejores margenes, bloques mejor proporcionados y motion GSAP mas limpio sin perder la estructura principal.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {['Duenos', 'Familia', 'Clinicas', 'Viajes', 'Admin'].map((item) => (
                  <span key={item} className="tag">{item}</span>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {FEATURE_COLUMNS.map((feature) => (
          <article key={feature.title} className="card" data-reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">{feature.index}</p>
            <h2 className="mt-4 text-3xl text-dark">{feature.title}</h2>
            <p className="mt-3 text-sm text-dark/65">{feature.description}</p>
          </article>
        ))}
      </section>

      <section className="story-shell" data-story-section>
        <div className="grid gap-8 xl:grid-cols-[0.86fr_1.14fr] xl:items-center">
          <article className="hero-panel p-0 shadow-none" data-hero>
            <div className="space-y-5 p-2">
              <span className="section-kicker" data-hero-line>Scroll narrative</span>
              <h2 className="text-5xl leading-[0.98] text-dark" data-hero-line>
                El frontend cuenta la operacion de VetHelp mientras haces scroll.
              </h2>
              <p className="text-lg text-dark/68" data-hero-line>
                Esta seccion usa ScrollTrigger con pin y scrub para presentar el flujo del producto como una historia visual limpia, no como un carrusel ruidoso.
              </p>
              <div className="space-y-3 rounded-[1rem] border border-dark/8 bg-white/68 p-5">
                <p className="eyebrow-label">Recorrido</p>
                <div className="h-2 overflow-hidden rounded-full bg-dark/8">
                  <div data-story-progress className="h-full rounded-full bg-gradient-pet" style={{ width: '33%' }} />
                </div>
                <p className="text-sm text-dark/62">Registro, permisos y lectura operativa en una sola narrativa visual.</p>
              </div>
            </div>
          </article>

          <div className="grid gap-4 lg:relative lg:min-h-[460px]">
            {STORY_CARDS.map((card, index) => (
              <article
                key={card.step}
                data-story-card
                className="story-card lg:absolute lg:inset-0"
                style={{ zIndex: STORY_CARDS.length - index }}
              >
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">{card.step}</p>
                <p className="mt-4 eyebrow-label">{card.eyebrow}</p>
                <h3 className="mt-2 text-4xl leading-tight text-dark">{card.title}</h3>
                <p className="mt-4 max-w-xl text-sm text-dark/67">{card.description}</p>
                <div className="mt-6 grid gap-3">
                  {card.points.map((point) => (
                    <div key={point} className="rounded-[0.95rem] border border-dark/8 bg-white/74 px-4 py-4 text-sm text-dark/70">
                      {point}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-4">
        {ROLE_PANELS.map((item, index) => (
          <article key={item.title} className="card-soft" data-reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-dark/45">0{index + 1}</p>
            <h3 className="mt-4 text-3xl text-dark">{item.title}</h3>
            <p className="mt-3 text-sm text-dark/65">{item.detail}</p>
          </article>
        ))}
      </section>

      <section className="hero-panel animate-in" data-hero>
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-4">
            <span className="section-kicker" data-hero-line>Listo para usar</span>
            <h2 className="text-5xl leading-[0.98] text-dark" data-hero-line>
              Un frontend mas atractivo, con mejores animaciones y una presencia mucho mas seria.
            </h2>
            <p className="max-w-2xl text-lg text-dark/68" data-hero-line>
              VetHelp deja de sentirse como una demo generica y pasa a verse como una plataforma clinica con criterio visual, jerarquia y motion profesional.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 lg:justify-end" data-hero-line>
            <Link to="/auth" className="btn-primary">Crear cuenta</Link>
            <Link to="/guides" className="btn-soft">Ver guias</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
