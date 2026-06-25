import { useEffect, useRef, useState } from 'react'
import { api } from '../utils/api'
import PetCard from '../components/PetCard'
import PetAvatarCustomizer from '../components/PetAvatarCustomizer'
import { useAuth } from '../context/AuthContext'
import { getDefaultAvatarConfig, sanitizeAvatarConfig } from '../shared/petAvatar'
import { useGSAP } from '../lib/gsap'
import { attachHoverLift, attachMagnetic, scrollReveal } from '../lib/motion'

const buildInitialPetForm = () => ({
  name: '',
  species: 'perro',
  sex: 'macho',
  birthDate: '',
  traits: '',
  ownerComment: '',
  allergies: '',
  vaccines: '',
  avatarConfig: getDefaultAvatarConfig('perro'),
})

const buildManagementState = (pet, current = {}) => ({
  petId: pet.id,
  allergies: (pet.allergies || []).join(', '),
  vaccines: (pet.vaccines || []).join(', '),
  ownerComment: pet.ownerComment || '',
  vetRuc: current.vetRuc || '',
  familyDni: current.familyDni || '',
  avatarConfig: sanitizeAvatarConfig(pet.avatarConfig, pet.species),
})

export default function Pets() {
  const { user } = useAuth()
  const [pets, setPets] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState(buildInitialPetForm)
  const [management, setManagement] = useState({
    petId: '',
    allergies: '',
    vaccines: '',
    ownerComment: '',
    vetRuc: '',
    familyDni: '',
    avatarConfig: getDefaultAvatarConfig('perro'),
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const rootRef = useRef(null)

  useGSAP(
    () => {
      if (!rootRef.current) return undefined
      scrollReveal(rootRef.current, '[data-rise]')
      const cleanHover = attachHoverLift(rootRef.current, '[data-hover]')
      const cleanMagnetic = attachMagnetic(rootRef.current, '[data-magnetic]')
      return () => {
        cleanHover()
        cleanMagnetic()
      }
    },
    { scope: rootRef, dependencies: [] }
  )

  useEffect(() => {
    void fetchPets()
  }, [])

  const hydrateManagement = (petList, currentPetId = management.petId) => {
    if (!petList.length) return
    const activePet = petList.find((pet) => pet.id === currentPetId) || petList[0]
    setManagement((current) => buildManagementState(activePet, current))
  }

  const fetchPets = async () => {
    try {
      const res = await api.get('/api/pets')
      setPets(res.data)
      if (user?.role === 'owner') hydrateManagement(res.data)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'No se pudieron cargar las mascotas')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePet = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await api.post('/api/pets', {
        ...formData,
        allergies: formData.allergies ? formData.allergies.split(',').map((i) => i.trim()).filter(Boolean) : [],
        vaccines: formData.vaccines ? formData.vaccines.split(',').map((i) => i.trim()).filter(Boolean) : [],
      })
      setFormData(buildInitialPetForm())
      setShowCreateForm(false)
      await fetchPets()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al crear mascota')
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'species') {
      setFormData((prev) => ({ ...prev, species: value, avatarConfig: getDefaultAvatarConfig(value) }))
      return
    }
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateAvatarChange = (field, value) => {
    setFormData((prev) => ({ ...prev, avatarConfig: { ...prev.avatarConfig, [field]: value } }))
  }

  const handleManagementChange = (e) => {
    const { name, value } = e.target
    if (name === 'petId') {
      const selectedPet = pets.find((pet) => pet.id === value)
      if (selectedPet) {
        setManagement((current) => buildManagementState(selectedPet, current))
        return
      }
    }
    setManagement((current) => ({ ...current, [name]: value }))
    setError('')
  }

  const handleManagementAvatarChange = (field, value) => {
    setManagement((current) => ({ ...current, avatarConfig: { ...current.avatarConfig, [field]: value } }))
    setError('')
  }

  const handleUpdatePet = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await api.patch(`/api/pets/${management.petId}`, {
        allergies: management.allergies,
        vaccines: management.vaccines,
        ownerComment: management.ownerComment,
        avatarConfig: management.avatarConfig,
      })
      await fetchPets()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'No se pudo actualizar la ficha')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAuthorizeVet = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await api.post(`/api/pets/${management.petId}/authorize-vet`, { vetRuc: management.vetRuc })
      setManagement((current) => ({ ...current, vetRuc: '' }))
      await fetchPets()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'No se pudo autorizar la clinica')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGrantFamily = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await api.post(`/api/pets/${management.petId}/grant-family`, { familyDni: management.familyDni })
      setManagement((current) => ({ ...current, familyDni: '' }))
      await fetchPets()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'No se pudo compartir la mascota')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    )
  }

  const managedPet = pets.find((pet) => pet.id === management.petId)
  const ownerMode = user?.role === 'owner'
  return (
    <div className="space-y-10" ref={rootRef}>
      <section className="animalist-card" data-rise>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow-label">Fichas y permisos</p>
            <h1 className="mt-3 text-4xl text-dark">Mascotas que acompanamos</h1>
            <p className="mt-3 max-w-xl text-sm text-dark/68">
              Cada mascota tiene su propia identidad. Cuida, comparte y mantene el historial siempre a la mano.
            </p>
          </div>
          {ownerMode && (
            <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn-primary text-sm">
              {showCreateForm ? 'Cancelar' : 'Nueva mascota'}
            </button>
          )}
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200/70 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showCreateForm && ownerMode && (
        <form onSubmit={handleCreatePet} className="animalist-card space-y-5" data-rise>
          <h2 className="text-2xl text-dark">Registrar nueva mascota</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <input type="text" name="name" placeholder="Nombre" value={formData.name} onChange={handleChange} className="input-field" required />
            <select name="species" value={formData.species} onChange={handleChange} className="input-field">
              <option value="perro">Perro</option>
              <option value="gato">Gato</option>
              <option value="pajaro">Pajaro</option>
              <option value="conejo">Conejo</option>
              <option value="hamster">Hamster</option>
              <option value="reptil">Reptil</option>
            </select>
            <select name="sex" value={formData.sex} onChange={handleChange} className="input-field">
              <option value="macho">Macho</option>
              <option value="hembra">Hembra</option>
            </select>
            <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="input-field" />
            <input type="text" name="allergies" placeholder="Alergias (separadas por coma)" value={formData.allergies} onChange={handleChange} className="input-field" />
            <input type="text" name="vaccines" placeholder="Vacunas (separadas por coma)" value={formData.vaccines} onChange={handleChange} className="input-field" />
          </div>
          <textarea
            name="ownerComment"
            placeholder="Notas de cuidado"
            value={formData.ownerComment}
            onChange={handleChange}
            className="input-field min-h-[100px]"
          />
          <PetAvatarCustomizer species={formData.species} avatarConfig={formData.avatarConfig} onChange={handleCreateAvatarChange} />
          <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
            {submitting ? 'Guardando...' : 'Registrar mascota'}
          </button>
        </form>
      )}

      <section>
        <div className="section-divider mb-5">
          <span>Fichas activas</span>
        </div>
        {pets.length === 0 ? (
          <div className="animalist-card text-center">
            <p className="editorial-quote text-2xl text-dark">Aun no hay fichas. Empieza creando la primera.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        )}
      </section>

      {ownerMode && managedPet && (
        <section className="animalist-card space-y-6" data-rise>
          <div className="section-divider">
            <span>Cuidado y permisos</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="eyebrow-label">Mascota</span>
              <select name="petId" value={management.petId} onChange={handleManagementChange} className="input-field mt-2">
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>{pet.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="eyebrow-label">Vacunas</span>
              <input type="text" name="vaccines" value={management.vaccines} onChange={handleManagementChange} className="input-field mt-2" />
            </label>
            <label className="block">
              <span className="eyebrow-label">Alergias</span>
              <input type="text" name="allergies" value={management.allergies} onChange={handleManagementChange} className="input-field mt-2" />
            </label>
            <label className="block">
              <span className="eyebrow-label">Notas</span>
                <textarea name="ownerComment" value={management.ownerComment} onChange={handleManagementChange} className="input-field mt-2 min-h-[80px]" />
            </label>
          </div>

          <PetAvatarCustomizer
            species={managedPet.species}
            avatarConfig={management.avatarConfig}
            onChange={handleManagementAvatarChange}
            title="Avatar de la ficha"
            description="Cambia los detalles visuales del avatar de esta mascota."
          />

          <div className="flex flex-wrap gap-2">
            <button onClick={handleUpdatePet} disabled={submitting} className="btn-primary text-sm">
              {submitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <form onSubmit={handleAuthorizeVet} className="field-soft space-y-3">
              <p className="eyebrow-label">Autorizar clinica</p>
              <input
                type="text"
                name="vetRuc"
                value={management.vetRuc}
                onChange={handleManagementChange}
                placeholder="RUC de la clinica"
                className="input-field"
              />
              <button type="submit" disabled={submitting} className="btn-soft w-full justify-center text-sm">
                Autorizar
              </button>
            </form>

            <form onSubmit={handleGrantFamily} className="field-soft space-y-3">
              <p className="eyebrow-label">Compartir con familia</p>
              <input
                type="text"
                name="familyDni"
                value={management.familyDni}
                onChange={handleManagementChange}
                placeholder="DNI de la persona"
                className="input-field"
              />
              <button type="submit" disabled={submitting} className="btn-soft w-full justify-center text-sm">
                Compartir
              </button>
            </form>
          </div>
        </section>
      )}
    </div>
  )
}
