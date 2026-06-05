export const AVATAR_PATTERN_OPTIONS = [
  { value: 'none', label: 'Liso' },
  { value: 'spots', label: 'Manchas' },
  { value: 'mask', label: 'Mascara' },
  { value: 'stripe', label: 'Franja' },
]

export const AVATAR_ACCESSORY_OPTIONS = [
  { value: 'collar', label: 'Collar' },
  { value: 'bandana', label: 'Bandana' },
  { value: 'bow', label: 'Lazo' },
  { value: 'medal', label: 'Medalla' },
]

export const AVATAR_PRESETS_BY_SPECIES = {
  perro: [
    {
      value: 'classic',
      label: 'Clasico',
      config: {
        furColor: '#C98B5B',
        innerColor: '#F3D8BF',
        accessoryColor: '#0F766E',
        eyeColor: '#1F2937',
        pattern: 'mask',
        accessory: 'collar',
      },
    },
    {
      value: 'cream',
      label: 'Crema',
      config: {
        furColor: '#D9BF96',
        innerColor: '#F8E8D7',
        accessoryColor: '#B5823D',
        eyeColor: '#2B3136',
        pattern: 'none',
        accessory: 'medal',
      },
    },
    {
      value: 'graphite',
      label: 'Grafito',
      config: {
        furColor: '#76818B',
        innerColor: '#DEE4EA',
        accessoryColor: '#7C3AED',
        eyeColor: '#17212B',
        pattern: 'stripe',
        accessory: 'bandana',
      },
    },
    {
      value: 'caramel',
      label: 'Caramelo',
      config: {
        furColor: '#AE704B',
        innerColor: '#F0D1B6',
        accessoryColor: '#DC2626',
        eyeColor: '#252525',
        pattern: 'spots',
        accessory: 'bow',
      },
    },
  ],
}

const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/

const SPECIES_DEFAULTS = {
  perro: {
    furColor: '#C98B5B',
    innerColor: '#F3D8BF',
    accessoryColor: '#0F766E',
    eyeColor: '#1F2937',
    pattern: 'mask',
    accessory: 'collar',
  },
  gato: {
    furColor: '#8C95A7',
    innerColor: '#F0E0D2',
    accessoryColor: '#DB7C2B',
    eyeColor: '#243B53',
    pattern: 'spots',
    accessory: 'bow',
  },
  pajaro: {
    furColor: '#4C9FCA',
    innerColor: '#DFF4FF',
    accessoryColor: '#EA580C',
    eyeColor: '#0F172A',
    pattern: 'stripe',
    accessory: 'medal',
  },
  conejo: {
    furColor: '#D6C4B2',
    innerColor: '#F7E7D9',
    accessoryColor: '#A855F7',
    eyeColor: '#374151',
    pattern: 'none',
    accessory: 'bandana',
  },
  hamster: {
    furColor: '#B8895E',
    innerColor: '#F6DDC2',
    accessoryColor: '#DC2626',
    eyeColor: '#1F2937',
    pattern: 'mask',
    accessory: 'medal',
  },
  reptil: {
    furColor: '#59A971',
    innerColor: '#CFEEC0',
    accessoryColor: '#2563EB',
    eyeColor: '#0F172A',
    pattern: 'stripe',
    accessory: 'collar',
  },
}

export function normalizePetSpecies(species = 'perro') {
  const normalized = String(species || '').trim().toLowerCase()
  return Object.prototype.hasOwnProperty.call(SPECIES_DEFAULTS, normalized) ? normalized : 'perro'
}

export function getDefaultAvatarConfig(species = 'perro') {
  const normalizedSpecies = normalizePetSpecies(species)
  return { ...SPECIES_DEFAULTS[normalizedSpecies] }
}

export function sanitizeAvatarConfig(input, species = 'perro') {
  const defaults = getDefaultAvatarConfig(species)
  const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {}

  return {
    furColor: normalizeColor(source.furColor, defaults.furColor),
    innerColor: normalizeColor(source.innerColor, defaults.innerColor),
    accessoryColor: normalizeColor(source.accessoryColor, defaults.accessoryColor),
    eyeColor: normalizeColor(source.eyeColor, defaults.eyeColor),
    pattern: normalizeToken(source.pattern, AVATAR_PATTERN_OPTIONS, defaults.pattern),
    accessory: normalizeToken(source.accessory, AVATAR_ACCESSORY_OPTIONS, defaults.accessory),
  }
}

export function getAvatarOptionLabel(value, options) {
  return options.find((option) => option.value === value)?.label || value
}

function normalizeColor(value, fallback) {
  const normalized = String(value || '').trim().toUpperCase()
  return HEX_COLOR_PATTERN.test(normalized) ? normalized : fallback
}

function normalizeToken(value, options, fallback) {
  const normalized = String(value || '').trim().toLowerCase()
  return options.some((option) => option.value === normalized) ? normalized : fallback
}