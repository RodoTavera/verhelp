import { Link } from 'react-router-dom'
import PetAvatar3D from './PetAvatar3D'
import {
  AVATAR_ACCESSORY_OPTIONS,
  AVATAR_PATTERN_OPTIONS,
  getAvatarOptionLabel,
  sanitizeAvatarConfig,
} from '../shared/petAvatar'

export default function PetCard({ pet }) {
  const avatarConfig = sanitizeAvatarConfig(pet.avatarConfig, pet.species)
  const avatarAccessory = getAvatarOptionLabel(avatarConfig.accessory, AVATAR_ACCESSORY_OPTIONS)
  const avatarPattern = getAvatarOptionLabel(avatarConfig.pattern, AVATAR_PATTERN_OPTIONS)

  return (
    <article className="card overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-dark/8">
      <div className="rounded-[0.9rem] border border-dark/8 bg-gradient-soft p-5">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-dark/48">Ficha clinica</p>
            <h3 className="mt-3 text-3xl font-black text-dark">{pet.name}</h3>
            <p className="mt-1 text-sm text-dark/55">ID: {pet.petId || pet.id}</p>
          </div>
          <div className="flex flex-col items-center gap-2 sm:items-end">
            <span className="tag capitalize">{pet.species || 'Mascota'}</span>
            <PetAvatar3D pet={pet} avatarConfig={avatarConfig} petName={pet.name} size="sm" className="mx-auto sm:mx-0" />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm text-center">
          <div className="rounded-lg border border-dark/8 bg-white/55 px-3 py-3">
            <p className="text-dark/50">Especie</p>
            <p className="font-semibold capitalize text-dark">{pet.species}</p>
          </div>
          <div className="rounded-lg border border-dark/8 bg-white/55 px-3 py-3">
            <p className="text-dark/50">Sexo</p>
            <p className="font-semibold capitalize text-dark">{pet.sex || 'N/A'}</p>
          </div>
        </div>

        <div className="rounded-lg border border-dark/8 bg-white/70 px-3 py-3">
          <p className="text-dark/50">Avatar 3D</p>
          <p className="mt-1 font-semibold text-dark">{avatarAccessory} · {avatarPattern}</p>
          <p className="mt-1 text-xs text-dark/55">Se personaliza desde la gestion de esta mascota.</p>
        </div>

        {pet.vaccines && pet.vaccines.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold text-dark/55">Vacunas registradas</p>
            <div className="flex flex-wrap gap-1">
              {pet.vaccines.slice(0, 3).map((vaccine, idx) => (
                <span key={idx} className="tag text-xs">
                  {vaccine}
                </span>
              ))}
              {pet.vaccines.length > 3 && <span className="text-xs text-dark/55">+{pet.vaccines.length - 3} mas</span>}
            </div>
          </div>
        )}

        {pet.allergies && pet.allergies.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold text-dark/55">Alertas alergicas</p>
            <div className="flex flex-wrap gap-1">
              {pet.allergies.slice(0, 2).map((allergy, idx) => (
                <span key={idx} className="inline-block rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                  {allergy}
                </span>
              ))}
              {pet.allergies.length > 2 && <span className="text-xs text-dark/55">+{pet.allergies.length - 2} mas</span>}
            </div>
          </div>
        )}

        <Link to="/records" className="mt-4 w-full justify-center btn-primary py-2 text-sm text-center">
          Ver historial
        </Link>
      </div>
    </article>
  )
}
