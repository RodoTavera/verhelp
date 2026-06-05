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
  const splineDog = activeSpecies === 'perro'
  const presets = AVATAR_PRESETS_BY_SPECIES[activeSpecies] || []

  const applyPreset = (presetConfig) => {
    Object.entries(presetConfig).forEach(([key, value]) => onChange(key, value))
  }

  return (
    <div className="rounded-lg border border-dark/8 bg-white/70 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand">{title}</p>
          <p className="mt-2 text-sm text-dark/70">{description}</p>
          {splineDog && (
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-dark/45">
              Perro usando escena Spline embebida con tintes y stage customizables.
            </p>
          )}
        </div>
        <PetAvatar3D species={species} avatarConfig={safeConfig} size="sm" className="mx-auto lg:mx-0" interactive={splineDog} />
      </div>

      {presets.length > 0 && (
        <div className="mt-5 rounded-lg border border-dark/8 bg-light/45 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-dark/50">Presets rapidos</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => applyPreset(preset.config)}
                className="rounded-md border border-dark/8 bg-white/80 px-3 py-2 text-xs font-semibold text-dark transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {COLOR_FIELDS.map((field) => (
          <label key={field.key} className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-dark/50">{field.label}</span>
            <div className="flex items-center gap-3 rounded-lg border border-dark/8 bg-light/70 px-3 py-2">
              <input
                type="color"
                value={safeConfig[field.key]}
                onChange={(event) => onChange(field.key, event.target.value)}
                className="h-10 w-14 cursor-pointer rounded-md border-0 bg-transparent p-0"
              />
              <span className="text-sm font-semibold text-dark">{safeConfig[field.key]}</span>
            </div>
          </label>
        ))}

        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-dark/50">Patron visual</span>
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
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-dark/50">Accesorio</span>
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
  )
}