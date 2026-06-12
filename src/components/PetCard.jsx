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
    <article className="animalist-card group flex flex-col gap-5" data-hover>
      <div className="flex items-center gap-4">
        <PetAvatar3D pet={pet} avatarConfig={avatarConfig} petName={pet.name} size="sm" className="shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="eyebrow-label">Ficha</p>
          <h3 className="mt-1 truncate text-2xl text-dark">{pet.name}</h3>
          <p className="mt-1 truncate text-xs text-dark/45">{pet.petId || pet.id}</p>
        </div>
        <span className="pet-species-pill capitalize">{pet.species || 'Mascota'}</span>
      </div>

      <ul className="subtle-list text-sm">
        <li><span>Sexo: {pet.sex || 'No registrado'}</span></li>
        <li><span>Avatar: {avatarAccessory} · {avatarPattern}</span></li>
        {pet.vaccines?.length ? (
          <li><span>Vacunas: {pet.vaccines.slice(0, 2).join(', ')}{pet.vaccines.length > 2 ? ` · +${pet.vaccines.length - 2}` : ''}</span></li>
        ) : (
          <li><span>Sin vacunas registradas</span></li>
        )}
      </ul>

      <div className="flex items-center justify-between gap-3">
        <span className="text-xs uppercase tracking-[0.2em] text-dark/45">Historial clinico</span>
        <Link to="/records" className="text-sm font-medium text-brand transition hover:text-brand-strong">
          Ver mas →
        </Link>
      </div>
    </article>
  )
}
