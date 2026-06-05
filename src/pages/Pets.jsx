import { useEffect, useState } from 'react'
import { api } from '../utils/api'
import PetCard from '../components/PetCard'
import PetAvatarCustomizer from '../components/PetAvatarCustomizer'
import { useAuth } from '../context/AuthContext'
import { getDefaultAvatarConfig, sanitizeAvatarConfig } from '../shared/petAvatar'

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
        allergies: formData.allergies ? formData.allergies.split(',').map((item) => item.trim()).filter(Boolean) : [],
        vaccines: formData.vaccines ? formData.vaccines.split(',').map((item) => item.trim()).filter(Boolean) : [],
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
      setFormData((prev) => ({
        ...prev,
        species: value,
        avatarConfig: getDefaultAvatarConfig(value),
      }))
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateAvatarChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      avatarConfig: {
        ...prev.avatarConfig,
        [field]: value,
      },
    }))
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
    setManagement((current) => ({
      ...current,
      avatarConfig: {
        ...current.avatarConfig,
        [field]: value,
      },
    }))
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
      setError(err.response?.data?.message || err.message || 'No se pudo autorizar la clínica')
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Cargando mascotas...</p>
        </div>
      </div>
    )
  }

  const managedPet = pets.find((pet) => pet.id === management.petId)
  const ownerMode = user?.role === 'owner'
  const totalFamilyAccess = pets.reduce((sum, pet) => sum + (pet.familyAccess?.length || 0), 0)
  const totalVetAccess = pets.reduce((sum, pet) => sum + (pet.vetAuthorization?.length || 0), 0)

  return (
    <div className="space-y-8 animate-fade">
      <section className="hero-panel animate-in">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="space-y-4">
            <span className="section-kicker">Fichas y permisos</span>
            <h1 className="text-5xl font-black text-dark">Mascotas registradas con control claro y acceso compartido.</h1>
            <p className="max-w-2xl text-lg text-dark/70">Gestiona fichas, autorizaciones y observaciones desde un panel mas limpio y centrado en operaciones reales.</p>
            {ownerMode && (
              <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn-primary">
                {showCreateForm ? 'Cancelar' : 'Nueva mascota'}
              </button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { value: pets.length, label: 'fichas activas' },
              { value: totalFamilyAccess, label: 'accesos familia' },
              { value: totalVetAccess, label: 'accesos clinica' },
            ].map((item) => (
              <div key={item.label} className="metric-pill">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-dark/45">{item.label}</p>
                <p className="mt-3 text-3xl font-black text-dark">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {showCreateForm && ownerMode && (
        <div className="card p-6 space-y-4 animate-in">
          <h2 className="text-2xl font-bold mb-4">Registrar nueva mascota</h2>

          <form onSubmit={handleCreatePet} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input type="text" name="name" placeholder="Nombre de la mascota" value={formData.name} onChange={handleChange} className="input-field" required />
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
              <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="input-field" required />
            </div>

            <textarea name="traits" placeholder="Rasgos, comportamiento y señales físicas" value={formData.traits} onChange={handleChange} className="input-field h-24" />
            <input type="text" name="ownerComment" placeholder="Comentario inicial del dueño" value={formData.ownerComment} onChange={handleChange} className="input-field" />
            <input type="text" name="allergies" placeholder="Alergias separadas por coma" value={formData.allergies} onChange={handleChange} className="input-field" />
            <input type="text" name="vaccines" placeholder="Vacunas separadas por coma" value={formData.vaccines} onChange={handleChange} className="input-field" />

            <PetAvatarCustomizer
              species={formData.species}
              avatarConfig={formData.avatarConfig}
              onChange={handleCreateAvatarChange}
              title="Avatar 3D de la mascota"
              description="Elige colores, patron y accesorio. Este avatar se guarda con la ficha y se muestra en todas sus tarjetas."
            />

            <button type="submit" disabled={submitting} className="w-full btn-primary py-3 disabled:opacity-50">
              {submitting ? 'Registrando...' : 'Registrar mascota'}
            </button>
          </form>
        </div>
      )}

      <div>
        {pets.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">No tienes mascotas registradas</p>
            {ownerMode && (
              <button onClick={() => setShowCreateForm(true)} className="btn-primary">
                Crear mi primera mascota
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet, idx) => (
              <div key={pet.id} className="animate-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                <PetCard pet={pet} />
              </div>
            ))}
          </div>
        )}
      </div>

      {ownerMode && managedPet && (
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="card p-6 space-y-5 animate-in">
            <div>
                <h2 className="text-2xl font-bold text-dark">Gestion avanzada de ficha</h2>
              <p className="text-sm text-gray-600">Edita la base clínica y mantén el acceso controlado por mascota.</p>
            </div>

            <form onSubmit={handleUpdatePet} className="space-y-4">
              <select name="petId" value={management.petId} onChange={handleManagementChange} className="input-field">
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>{pet.name} · {pet.petId}</option>
                ))}
              </select>
              <input name="allergies" value={management.allergies} onChange={handleManagementChange} className="input-field" placeholder="Alergias (coma separada)" />
              <input name="vaccines" value={management.vaccines} onChange={handleManagementChange} className="input-field" placeholder="Vacunas (coma separada)" />
              <textarea name="ownerComment" value={management.ownerComment} onChange={handleManagementChange} className="input-field h-24" placeholder="Observaciones del dueño" />
              <PetAvatarCustomizer
                species={managedPet.species}
                avatarConfig={management.avatarConfig}
                onChange={handleManagementAvatarChange}
                title="Avatar 3D personalizable"
                description="Ajusta el look de esta mascota y el cambio se refleja en sus tarjetas del panel y del dashboard."
              />
              <button type="submit" disabled={submitting} className="w-full btn-primary py-3 disabled:opacity-60">
                Guardar ficha
              </button>
            </form>

            <div className="rounded-lg border border-dark/8 bg-gradient-soft p-5">
              <p className="font-bold text-dark">Estado actual</p>
              <p className="mt-2 text-sm text-dark/70">Familia autorizada: {(managedPet.familyAccess || []).join(', ') || 'Sin accesos'}</p>
              <p className="mt-1 text-sm text-dark/70">Veterinarias autorizadas: {(managedPet.vetAuthorization || []).join(', ') || 'Sin clínicas'}</p>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="card p-6 space-y-4 animate-in">
              <div>
                <h2 className="text-2xl font-bold text-dark">Autorizar veterinaria</h2>
                <p className="text-sm text-gray-600">Habilita edición del historial para una clínica concreta.</p>
              </div>

              <form onSubmit={handleAuthorizeVet} className="space-y-4">
                <input name="vetRuc" value={management.vetRuc} onChange={handleManagementChange} className="input-field" placeholder="RUC de la clínica" required />
                <button type="submit" disabled={submitting} className="w-full btn-secondary py-3 disabled:opacity-60">
                  Autorizar clinica
                </button>
              </form>
            </div>

            <div className="card p-6 space-y-4 animate-in">
              <div>
                <h2 className="text-2xl font-bold text-dark">Compartir con familiar</h2>
                <p className="text-sm text-gray-600">Entrega acceso de visualización usando el DNI familiar registrado.</p>
              </div>

              <form onSubmit={handleGrantFamily} className="space-y-4">
                <input name="familyDni" value={management.familyDni} onChange={handleManagementChange} className="input-field" placeholder="DNI familiar" required />
                <button type="submit" disabled={submitting} className="w-full btn-soft py-3 disabled:opacity-60">
                  Compartir acceso
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
