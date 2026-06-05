import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'
import { formatDateTime } from '../utils/helpers'
import PetCard from '../components/PetCard'
import PetAvatar3D from '../components/PetAvatar3D'

const EMPTY_STATS = {
  totalPets: 0,
  vaccinesCount: 0,
  allergiesCount: 0,
  familyPermissions: 0,
  vetAuthorizations: 0,
}

const ROLE_CONTENT = {
  owner: {
    kicker: 'Centro del dueno',
    title: 'Controla la ficha clinica desde una vista clara y operativa.',
    description: 'Supervisa vacunas, alergias, permisos familiares y actividad reciente sin saltar entre modulos ni ruido visual.',
  },
  family: {
    kicker: 'Vista compartida',
    title: 'Consulta mascotas autorizadas con contexto real y lectura rapida.',
    description: 'Tienes acceso a la informacion esencial para acompanar tratamientos, chequeos y cambios de estado.',
  },
  vet: {
    kicker: 'Operacion veterinaria',
    title: 'Revisa fichas visibles, actividad reciente y continuidad clinica.',
    description: 'La vista principal se enfoca en acceso rapido a mascotas, historial y decisiones de atencion.',
  },
  airline: {
    kicker: 'Operacion de viaje',
    title: 'Valida el estado sanitario sin perder tiempo en interfaces que no aportan.',
    description: 'Tu flujo no depende de explorar fichas completas: entra a verificacion, consulta por ID y resuelve embarques con criterios claros.',
  },
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [pets, setPets] = useState([])
  const [recentRecords, setRecentRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [user?.role])

  const fetchData = async () => {
    if (user?.role === 'airline') {
      setStats(EMPTY_STATS)
      setPets([])
      setRecentRecords([])
      setLoading(false)
      return
    }

    try {
      const petsRes = await api.get('/api/pets')
      setPets(petsRes.data)

      setStats({
        totalPets: petsRes.data.length,
        vaccinesCount: petsRes.data.reduce((sum, p) => sum + (p.vaccines?.length || 0), 0),
        allergiesCount: petsRes.data.reduce((sum, p) => sum + (p.allergies?.length || 0), 0),
        familyPermissions: petsRes.data.reduce((sum, p) => sum + (p.familyAccess?.length || 0), 0),
        vetAuthorizations: petsRes.data.reduce((sum, p) => sum + (p.vetAuthorization?.length || 0), 0),
      })

      if (petsRes.data.length > 0) {
        const recordsData = []
        for (const pet of petsRes.data.slice(0, 5)) {
          try {
            const recordsRes = await api.get(`/api/pets/${pet.id}/records`)
            recordsData.push(...recordsRes.data.records)
          } catch (e) {
            console.error('Error fetching records for pet:', pet.id)
          }
        }
        setRecentRecords(recordsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5))
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const roleContent = ROLE_CONTENT[user?.role] || ROLE_CONTENT.owner
  const displayName = user?.name || user?.email || 'VetHelp'
  const featuredPet = pets[0] || null
  const totalSignals = (stats?.vaccinesCount || 0) + (stats?.allergiesCount || 0)
  const quickLinks = user?.role === 'vet'
    ? [
        { to: '/records', label: 'Abrir historial', tone: 'btn-primary' },
        { to: '/pets', label: 'Ver fichas', tone: 'btn-soft' },
        { to: '/clinics', label: 'Red veterinaria', tone: 'btn-soft' },
      ]
    : [
        { to: '/pets', label: 'Gestionar mascotas', tone: 'btn-primary' },
        { to: '/records', label: 'Ver historial', tone: 'btn-soft' },
        { to: '/clinics', label: 'Clínicas autorizadas', tone: 'btn-soft' },
      ]

  const operationalNotes = [
    `${stats?.totalPets || 0} fichas visibles en este panel.`,
    `${stats?.familyPermissions || 0} permisos familiares registrados.`,
    `${stats?.vetAuthorizations || 0} accesos veterinarios activos.`,
  ]

  const careSignals = [
    {
      title: 'Vacunas rastreadas',
      value: stats?.vaccinesCount || 0,
      description: 'Ayuda a detectar cobertura y pendientes clinicos.',
    },
    {
      title: 'Alergias visibles',
      value: stats?.allergiesCount || 0,
      description: 'Informacion critica para cualquier atencion o viaje.',
    },
    {
      title: 'Contexto total',
      value: totalSignals,
      description: 'Suma de señales clinicas activas en esta vista.',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Cargando panel...</p>
        </div>
      </div>
    )
  }

  if (user?.role === 'airline') {
    return (
      <div className="space-y-8 animate-fade">
        <section className="hero-panel animate-in">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-5">
              <span className="section-kicker">{roleContent.kicker}</span>
              <div className="space-y-3">
                <h1 className="text-5xl font-black text-dark md:text-6xl">{roleContent.title}</h1>
                <p className="max-w-2xl text-lg text-dark/70">{roleContent.description}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/travel" className="btn-primary">Abrir verificación</Link>
                <Link to="/clinics" className="btn-soft">Consultar clínicas</Link>
              </div>
            </div>

            <div className="grid gap-4 self-start sm:grid-cols-2">
              {[
                { title: 'Consulta por ID', value: '01', desc: 'Tu flujo inicia con el codigo de la mascota.' },
                { title: 'Estado final', value: '03', desc: 'APTO, CONDICIONAL o NO APTO en lenguaje claro.' },
                { title: 'Control reciente', value: '24h', desc: 'Valida si la ultima atencion cumple ventana operativa.' },
                { title: 'Canal activo', value: 'API', desc: 'El backend responde con criterio uniforme y trazable.' },
              ].map((item, idx) => (
                <article
                  key={item.title}
                  className="metric-pill animate-in"
                  style={{ animationDelay: `${idx * 0.07}s` }}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-dark/45">{item.title}</p>
                  <p className="mt-3 text-3xl font-black text-dark">{item.value}</p>
                  <p className="mt-2 text-sm text-dark/65">{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="card space-y-5 animate-in">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">Checklist operativo</p>
              <h2 className="mt-2 text-3xl font-black text-dark">Que valida una aerolinea en VetHelp</h2>
            </div>
            <div className="grid gap-3">
              {[
                'Ingresa el identificador de la mascota en el modulo de viajes.',
                'Lee el estado sanitario normalizado sin interpretar texto libre.',
                'Confirma ultima consulta, vacunas y alertas visibles.',
                'Escala a revision cuando el estado no sea APTO.',
              ].map((item, idx) => (
                <div key={item} className="rounded-lg border border-dark/8 bg-white/70 px-4 py-4 animate-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <p className="text-sm font-semibold text-dark">0{idx + 1}</p>
                  <p className="mt-2 text-sm text-dark/70">{item}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="card space-y-5 animate-in" style={{ animationDelay: '0.08s' }}>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand">Lectura rapida</p>
              <h2 className="mt-2 text-3xl font-black text-dark">Semaforo sanitario</h2>
            </div>
            <div className="grid gap-3">
              {[
                { label: 'APTO', tone: 'bg-emerald-100 text-emerald-700', desc: 'La mascota cumple criterio visible de viaje.' },
                { label: 'CONDICIONAL', tone: 'bg-amber-100 text-amber-700', desc: 'Falta validar una condicion o actualizar evidencia.' },
                { label: 'NO APTO', tone: 'bg-rose-100 text-rose-700', desc: 'Existe una restriccion que impide el embarque.' },
              ].map((status) => (
                <div key={status.label} className="rounded-lg border border-dark/8 bg-white px-4 py-4 shadow-sm">
                  <span className={`inline-flex rounded-md px-3 py-1 text-xs font-semibold ${status.tone}`}>{status.label}</span>
                  <p className="mt-3 text-sm text-dark/70">{status.desc}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade">
      <section className="hero-panel animate-in">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <span className="section-kicker" data-hero-line>{roleContent.kicker}</span>
            <div className="space-y-3">
              <h1 className="text-5xl font-black text-dark md:text-6xl" data-hero-line>{roleContent.title}</h1>
              <p className="max-w-2xl text-lg text-dark/70" data-hero-line>{roleContent.description}</p>
            </div>
            <div className="flex flex-wrap gap-3" data-hero-line>
              {quickLinks.map((link) => (
                <Link key={link.to} to={link.to} className={link.tone}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <article className="showcase-stage animate-in" style={{ animationDelay: '0.08s' }}>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/55">Resumen ejecutivo</p>
            <div className="mt-5 grid gap-5 lg:grid-cols-[auto_1fr] lg:items-center">
              <div className="showcase-card flex justify-center">
                {featuredPet ? (
                  <PetAvatar3D pet={featuredPet} avatarConfig={featuredPet.avatarConfig} size="md" />
                ) : (
                  <div className="brand-mark">VH</div>
                )}
              </div>

              <div>
                <h2 className="text-4xl font-semibold text-white">Hola, {displayName}.</h2>
                <p className="mt-2 text-sm text-white/72">
                  {featuredPet
                    ? `La ficha destacada ahora puede sentirse mas viva y legible: ${featuredPet.name} es la primera mascota visible en este panel.`
                    : 'Este panel conserva una lectura ejecutiva aunque todavia no tengas fichas cargadas.'}
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {(featuredPet
                    ? [
                        { label: 'Mascota foco', value: featuredPet.name },
                        { label: 'Especie', value: featuredPet.species },
                        { label: 'ID', value: featuredPet.petId },
                      ]
                    : operationalNotes.map((note, index) => ({ label: `0${index + 1}`, value: note }))
                  ).map((item) => (
                    <div key={item.label} className="rounded-[0.95rem] border border-white/12 bg-white/10 px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">{item.label}</p>
                      <p className="mt-2 text-sm text-white/78">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      {stats && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            { label: 'Mascotas', value: stats.totalPets },
            { label: 'Vacunas', value: stats.vaccinesCount },
            { label: 'Alergias', value: stats.allergiesCount },
            { label: 'Familia', value: stats.familyPermissions },
            { label: 'Veterinarias', value: stats.vetAuthorizations },
          ].map((stat, idx) => (
            <article
              key={stat.label}
              className={`${idx === 0 ? 'showcase-stage text-white' : 'card'} animate-in`}
              style={{ animationDelay: `${idx * 0.06}s` }}
            >
              <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${idx === 0 ? 'text-white/55' : 'text-dark/45'}`}>{stat.label}</p>
              <p className={`mt-4 text-4xl font-black ${idx === 0 ? 'text-white' : 'text-dark'}`}>{stat.value}</p>
              <p className={`mt-2 text-sm font-medium ${idx === 0 ? 'text-white/72' : 'text-dark/60'}`}>{idx === 0 ? 'Ficha principal del panel' : 'Indicador principal'}</p>
            </article>
          ))}
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <article className="card space-y-5 animate-in" style={{ animationDelay: '0.12s' }}>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">Señales clinicas</p>
            <h2 className="mt-2 text-3xl font-black text-dark">Lectura rapida del estado actual</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {careSignals.map((signal, idx) => (
              <div key={signal.title} className="rounded-lg border border-dark/8 bg-white px-4 py-5 shadow-sm animate-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-dark/45">{signal.title}</p>
                <p className="mt-3 text-4xl font-black text-brand">{signal.value}</p>
                <p className="mt-2 text-sm text-dark/65">{signal.description}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="card space-y-5 animate-in" style={{ animationDelay: '0.18s' }}>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand">Acciones sugeridas</p>
            <h2 className="mt-2 text-3xl font-black text-dark">Siguiente mejor paso</h2>
          </div>
          <div className="grid gap-3">
            {[
              'Revisa las fichas con alergias visibles antes de nuevas atenciones.',
              'Mantén permisos familiares y autorizaciones veterinarias al dia.',
              'Usa historial para centralizar consultas y notas recientes.',
            ].map((item, idx) => (
              <div key={item} className="rounded-lg border border-dark/8 bg-white/72 px-4 py-4 animate-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                <p className="text-sm text-dark/70">{item}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="space-y-4 animate-in" style={{ animationDelay: '0.24s' }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">Mascotas visibles</p>
            <h2 className="mt-1 text-3xl font-black text-dark">{user?.role === 'vet' ? 'Fichas clínicas disponibles' : 'Mis mascotas'}</h2>
          </div>
          <span className="tag">{pets.length} fichas</span>
        </div>
        {pets.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-xl font-black text-dark">Aun no hay fichas en esta vista.</p>
            <p className="mt-3 text-dark/65">Crea o habilita una mascota para empezar a construir el historial clínico centralizado.</p>
            <Link to="/pets" className="btn-primary mt-6 inline-flex">
              Registrar primera mascota
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pets.map((pet, idx) => (
              <div
                key={pet.id}
                className="animate-in"
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                <PetCard pet={pet} />
              </div>
            ))}
          </div>
        )}
      </section>

      {recentRecords.length > 0 && (
        <section className="space-y-4 animate-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand">Actividad reciente</p>
              <h2 className="mt-1 text-3xl font-black text-dark">Ultimos registros clínicos</h2>
            </div>
            <span className="tag">{recentRecords.length} eventos</span>
          </div>
          <div className="space-y-3">
            {recentRecords.map((record, idx) => (
              <div
                key={`${record.id || record.createdAt}-${idx}`}
                className="card flex items-start gap-4 hover:shadow-lg transition-shadow animate-in"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-soft text-xs font-semibold uppercase tracking-[0.18em] text-dark/55">REG</div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-semibold text-dark capitalize">{record.type}</p>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-dark/45">{formatDateTime(record.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-sm text-dark/70">{record.description?.substring(0, 140)}</p>
                  {record.vaccines?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {record.vaccines.slice(0, 3).map((item) => (
                        <span key={item} className="tag">{item}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
