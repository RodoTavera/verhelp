import { useRef, useState } from 'react'
import { useGSAP } from '../lib/gsap'
import { attachHoverLift, attachMagnetic, scrollReveal } from '../lib/motion'

const GUIDES = [
  {
    id: 'vacunas-perro',
    category: 'Perros',
    title: 'Calendario de vacunas para perros',
    content: `Las vacunas son la base de la salud preventiva de tu perro. Un calendario completo incluye:

    **Cachorros (6–16 semanas):**
    - 6 semanas: Parvovirus
    - 8 semanas: Pentavalente (parvovirus, moquillo, hepatitis, parainfluenza, leptospirosis)
    - 12 semanas: Refuerzo pentavalente
    - 16 semanas: Refuerzo pentavalente + rabia

    **Adultos (anual):**
    - Refuerzo anual de pentavalente
    - Rabia cada 1–3 años según legislación local

    **Importante:** Siempre consulta con tu veterinario antes de vacunar. Un perro con fiebre o inmunodeprimido no debe vacunarse.`,
  },
  {
    id: 'vacunas-gato',
    category: 'Gatos',
    title: 'Vacunas esenciales para gatos',
    content: `Los gatos necesitan proteccion desde temprana edad para evitar enfermedades graves:

    **Cachorros (8–16 semanas):**
    - 8 semanas: Triple felina (panleucopenia, calicivirus, rinotraqueitis)
    - 12 semanas: Refuerzo triple felina
    - 16 semanas: Refuerzo triple + rabia

    **Adultos:**
    - Refuerzo anual de triple felina
    - Rabia según legislacion local

    **Consejo:** Los gatos de interior tambien necesitan vacunarse. Muchas enfermedades se transmiten por el aire o por contacto indirecto.`,
  },
  {
    id: 'alimentacion-perro',
    category: 'Perros',
    title: 'Alimentacion balanceada para perros',
    content: `Una dieta equilibrada es clave para la longevidad de tu perro:

    **Componentes esenciales:**
    - Proteinas de alta calidad (pollo, pavo, pescado, huevo)
    - Grasas saludables (omega 3 y 6 para piel y pelaje)
    - Carbohidratos complejos (arroz integral, avena, batata)
    - Vitaminas y minerales

    **Evitar:**
    - Chocolate, uvas, cebolla, ajo, xilitol (toxicos)
    - Huesos cocidos (pueden astillarse)
    - Alimentos muy procesados o con exceso de sal

    **Frecuencia:**
    - Cachorros: 3–4 veces al dia
    - Adultos: 2 veces al dia
    - Senior: 2 veces al dia con porciones ajustadas`,
  },
  {
    id: 'alimentacion-gato',
    category: 'Gatos',
    title: 'Nutricion felina adecuada',
    content: `Los gatos son carnivoros obligados y necesitan nutrientes especificos:

    **Requerimientos:**
    - Taurina (aminoacido esencial para vision y corazon)
    - Arginina (necesaria para eliminar amoniaco)
    - Vitamina A preformada (no pueden convertir betacaroteno)
    - Acidos grasos esenciales

    **Tipos de alimentacion:**
    - Croquetas de calidad (verificar contenido de proteina > 30%)
    - Alimento humedo (ayuda a la hidratacion)
    - Dieta BARF (bajo supervision veterinaria)

    **Hidratacion:**
    - Los gatos tienen baja sed natural
    - Proporciona fuentes de agua fresca y limpia
    - Considera fuentes de agua corriente`,
  },
  {
    id: 'viaje-mascota',
    category: 'Viajes',
    title: 'Requisitos para viajar con mascotas',
    content: `Viajar con tu mascota requiere planificacion previa:

    **Documentacion:**
    - Cartilla sanitaria vigente con vacunas al dia
    - Certificado de salud emitido por veterinario (maximo 10 dias antes)
    - Certificado de rabia con mas de 30 dias y menos de 1 año
    - Microchip ISO 11784/11785 (obligatorio en muchos paises)

    **Transporte:**
    - Transportadora aprobada por la aerolinea
    - Etiqueta con datos de contacto
    - Absorbente y manta familiar
    - No sedantes (a menos que el veterinario lo indique)

    **Antes del vuelo:**
    - Paseo y comida ligera 4 horas antes
    - Hidratacion constante
    - Familiarizar a la mascota con la transportadora dias antes

    **Verifica:** Cada aerolinea y pais tienen requisitos especificos. Consulta siempre antes de reservar.`,
  },
  {
    id: 'primeros-auxilios',
    category: 'Emergencias',
    title: 'Primeros auxilios basicos',
    content: `Saber actuar en una emergencia puede salvar la vida de tu mascota:

    **Signos de emergencia (acude al veterinario inmediatamente):**
    - Dificultad para respirar o encias azuladas
    - Convulsiones o perdida de conciencia
    - Sangrado que no cede en 5 minutos
    - Vomito o diarrea con sangre
    - Ingesta de sustancia toxica

    **Botiquin basico:**
    - Gasas esteriles y vendajes
    - Solucion salina para limpieza
    - Termometro digital
    - Pinzas para garrapatas
    - Numero de veterinario de emergencia

    **RCP basica:**
    - 30 compresiones toracicas seguidas de 2 respiraciones
    - Verifica pulso en la arteria femoral (pata trasera interna)
    - Manten la calma y actua rapido`,
  },
  {
    id: 'higiene-dental',
    category: 'Higiene',
    title: 'Higiene dental en mascotas',
    content: `La salud bucal afecta el bienestar general de tu mascota:

    **Problemas comunes:**
    - Tartaro y placa bacteriana
    - Gingivitis (inflamacion de encias)
    - Periodontitis (afecta hueso y ligamentos)
    - Mal aliento persistente

    **Prevencion:**
    - Cepillado dental 3 veces por semana con pasta veterinaria
    - Juguetes dentales y huesos apropiados
    - Alimento seco de calidad (reduce acumulo de placa)
    - Revision veterinaria anual

    **Senales de alerta:**
    - Mal aliento persistente
    - Encias rojas o sangrantes
    - Dificultad para comer
    - Exceso de babeo

    **Importante:** Nunca uses pasta de dientes humana. Contiene fluor y xilitol que son toxicos.`,
  },
  {
    id: 'parasitos',
    category: 'Prevencion',
    title: 'Control de parasitos internos y externos',
    content: `Los parasitos afectan la calidad de vida de tu mascota y pueden transmitirse a humanos:

    **Parasitos externos:**
    - Garrapatas: transmiten erliquiosis, anaplasmosis, babesiosis
    - Pulgas: causan alergia, anemia, transmision de tenias
    - Control: pipetas mensuales o collares antiparasitarios

    **Parasitos internos:**
    - Tenias, ascaris, giardias, ancilostomas
    - Desparasitacion interna cada 3–6 meses
    - Examen coprologico anual

    **Prevencion:**
    - Manten el ambiente limpio y seco
    - Desinfecta areas de descanso regularmente
    - Evita que tu mascota ingiera heces de otros animales
    - Consulta el calendario especifico con tu veterinario`,
  },
]

export default function Guides() {
  const [openId, setOpenId] = useState(null)
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
        <p className="eyebrow-label">Centro de conocimiento</p>
        <h1 className="mt-3 text-4xl text-dark md:text-5xl">Guias de cuidado animalista</h1>
        <p className="mt-3 max-w-xl text-sm text-dark/68">
          Informacion verificada por profesionales veterinarios para que tomes decisiones informadas sobre el cuidado de tu mascota.
        </p>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        {GUIDES.map((guide) => (
          <article
            key={guide.id}
            className="animalist-card cursor-pointer transition"
            data-rise
            data-hover
            onClick={() => setOpenId(openId === guide.id ? null : guide.id)}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="pet-species-pill text-xs">{guide.category}</span>
                <h2 className="mt-2 text-xl text-dark">{guide.title}</h2>
              </div>
              <span className="text-2xl text-dark/40">{openId === guide.id ? '−' : '+'}</span>
            </div>
            {openId === guide.id && (
              <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-dark/75">
                {guide.content}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}
