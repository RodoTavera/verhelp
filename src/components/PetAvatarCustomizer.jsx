import PetAvatar3D from './PetAvatar3D'
import {
  AVATAR_ACCESSORY_OPTIONS,
  AVATAR_PATTERN_OPTIONS,
  AVATAR_PRESETS_BY_SPECIES,
  normalizePetSpecies,
  sanitizeAvatarConfig,
} from '../shared/petAvatar'

const COLOR_FIELDS = [
  { key: 'furColor', label: 'Pelaje base' },
  { key: 'innerColor', label: 'Detalles internos' },
  { key: 'accessoryColor', label: 'Accesorio' },
  { key: 'eyeColor', label: 'Ojos' },
]

export default function PetAvatarCustomizer({
  species,
  avatarConfig,
  onChange,
  title = 'Avatar 3D',
  description = 'Personaliza el avatar que se ve en la tarjeta de la mascota.',
}) {
  const safeConfig = sanitizeAvatarConfig(avatarConfig, species)
  const activeSpecies = normalizePetSpecies(species)
  const presets = AVATAR_PRESETS_BY_SPECIES[activeSpecies] || []

  const applyPreset = (presetConfig) => {
    Object.entries(presetConfig).forEach(([key, value]) => onChange(key, value))
  }

  return (
    <div className="animalist-card grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
      <div>
        <p className="eyebrow-label">{title}</p>
        <p className="mt-2 max-w-md text-sm text-dark/68">{description}</p>
        {presets.length > 0 && (
          <div className="mt-5">
            <p className="eyebrow-label">Presets rapidos</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => applyPreset(preset.config)}
                  className="rounded-full border border-dark/10 bg-white/70 px-3 py-1.5 text-xs font-medium text-dark/80 transition hover:-translate-y-0.5 hover:bg-white"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {COLOR_FIELDS.map((field) => (
            <label key={field.key} className="space-y-2">
              <span className="eyebrow-label">{field.label}</span>
              <div className="flex items-center gap-3 rounded-2xl border border-dark/10 bg-white/80 px-3 py-2">
                <input
                  type="color"
                  value={safeConfig[field.key]}
                  onChange={(event) => onChange(field.key, event.target.value)}
                  className="h-10 w-14 cursor-pointer rounded-md border-0 bg-transparent p-0"
                />
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-dark/65">{safeConfig[field.key]}</span>
              </div>
            </label>
          ))}

          <label className="space-y-2">
            <span className="eyebrow-label">Patron visual</span>
            <select
              value={safeConfig.pattern}
              onChange={(event) => onChange('pattern', event.target.value)}
              className="input-field"
            >
              {AVATAR_PATTERN_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="eyebrow-label">Accesorio</span>
            <select
              value={safeConfig.accessory}
              onChange={(event) => onChange('accessory', event.target.value)}
              className="input-field"
            >
              {AVATAR_ACCESSORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <PetAvatar3D species={species} avatarConfig={safeConfig} size="md" interactive />
      </div>
    </div>
  )
}
