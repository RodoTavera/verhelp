import axios from 'axios'
import { sanitizeAvatarConfig } from '../shared/petAvatar'

const baseURL = import.meta.env.VITE_API_URL || ''

const isPlainObject = (value) => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

const normalizeUser = (user) => {
  if (!isPlainObject(user)) return user
  const name = user.name || user.fullName || user.clinicName || user.airlineCode || user.email || ''
  return { ...user, name }
}

const normalizePet = (pet) => {
  if (!isPlainObject(pet)) return pet
  const petId = pet.petId || pet.id
  return {
    ...pet,
    petId,
    id: petId,
    avatarConfig: sanitizeAvatarConfig(pet.avatarConfig, pet.species),
    familyAccess: pet.familyAccess ?? pet.familyDnis ?? [],
    vetAuthorization: pet.vetAuthorization ?? pet.authorizedVetRucs ?? [],
  }
}

const normalizeRecord = (record) => {
  if (!isPlainObject(record)) return record
  return {
    ...record,
    vaccines: record.vaccines ?? record.vaccinesAdded ?? [],
    allergies: record.allergies ?? record.allergiesAdded ?? [],
  }
}

const normalizeClinic = (clinic) => {
  if (!isPlainObject(clinic)) return clinic
  return {
    ...clinic,
    zone: clinic.zone ?? clinic.district ?? '',
    specialty: clinic.specialty ?? clinic.speciality ?? '',
  }
}

const normalizeAdminOverview = (payload) => {
  if (!isPlainObject(payload)) return payload
  return {
    ...payload,
    recentUsers: Array.isArray(payload.recentUsers) ? payload.recentUsers.map(normalizeUser) : [],
    recentPets: Array.isArray(payload.recentPets) ? payload.recentPets.map(normalizePet) : [],
    recentRecords: Array.isArray(payload.recentRecords) ? payload.recentRecords.map(normalizeRecord) : [],
    topClinics: Array.isArray(payload.topClinics) ? payload.topClinics.map(normalizeClinic) : [],
  }
}

const normalizeTravelVerification = (payload) => {
  if (!isPlainObject(payload)) return payload
  const rawStatus = String(payload.travelStatus || '')
  const upper = rawStatus.toUpperCase()
  let travelStatus = rawStatus
  if (upper.includes('NO APTO')) travelStatus = 'NO APTO'
  else if (upper.includes('CONDICIONAL')) travelStatus = 'CONDICIONAL'
  else if (upper.includes('APTO')) travelStatus = 'APTO'

  const lastControl = payload.lastControl || payload.lastControlDate || null
  const lastControlDate = lastControl ? new Date(lastControl).toLocaleDateString('es-PE') : null

  return {
    ...payload,
    travelStatus,
    travelStatusDetails: rawStatus,
    lastControl,
    lastControlDate,
  }
}

const normalizeByEndpoint = (url, data) => {
  const path = String(url || '').split('?')[0]

  if (path === '/api/session' && isPlainObject(data) && data.user) {
    return normalizeUser(data.user)
  }

  if (path === '/api/login' && isPlainObject(data)) {
    return { ...data, user: normalizeUser(data.user) }
  }

  if (path.startsWith('/api/register') && isPlainObject(data)) {
    return { ...data, user: normalizeUser(data.user) }
  }

  if (path === '/api/pets' && Array.isArray(data)) {
    return data.map(normalizePet)
  }

  if (/^\/api\/pets\/[^/]+$/.test(path) && isPlainObject(data)) {
    return normalizePet(data)
  }

  if (/^\/api\/pets\/[^/]+\/records/.test(path)) {
    if (Array.isArray(data)) return { records: data.map(normalizeRecord), audit: [] }
    if (isPlainObject(data) && Array.isArray(data.records)) {
      return {
        ...data,
        records: data.records.map(normalizeRecord),
        audit: Array.isArray(data.audit) ? data.audit : [],
      }
    }
    if (isPlainObject(data) && isPlainObject(data.record)) {
      return { ...data, record: normalizeRecord(data.record) }
    }
    return { records: [], audit: [] }
  }

  if (path.startsWith('/api/clinics') && Array.isArray(data)) {
    return data.map(normalizeClinic)
  }

  if (path === '/api/admin/overview' && isPlainObject(data)) {
    return normalizeAdminOverview(data)
  }

  if (path === '/api/admin/users' && Array.isArray(data)) {
    return data.map(normalizeUser)
  }

  if (path === '/api/admin/clinics' && Array.isArray(data)) {
    return data.map(normalizeClinic)
  }

  if (path === '/api/admin/clinics' && isPlainObject(data) && isPlainObject(data.clinic)) {
    return { ...data, clinic: normalizeClinic(data.clinic) }
  }

  if (/^\/api\/admin\/clinics\/[^/]+$/.test(path) && isPlainObject(data) && isPlainObject(data.clinic)) {
    return { ...data, clinic: normalizeClinic(data.clinic) }
  }

  if (path.startsWith('/api/airline/verify/') && isPlainObject(data)) {
    return normalizeTravelVerification(data)
  }

  return data
}

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token a cada request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token && token !== 'undefined' && token !== 'null') {
    config.headers.Authorization = `Bearer ${token}`
  } else if (token) {
    localStorage.removeItem('authToken')
  }
  return config
})

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  (response) => {
    const payload = response?.data

    if (isPlainObject(payload) && Object.prototype.hasOwnProperty.call(payload, 'ok')) {
      if (payload.ok) {
        response.data = normalizeByEndpoint(response.config?.url, payload.data)
        return response
      }

      const message = payload.message || payload.error || 'Error'
      const normalized = new Error(message)
      normalized.response = response
      return Promise.reject(normalized)
    }

    response.data = normalizeByEndpoint(response.config?.url, payload)
    return response
  },
  (error) => {
    const status = error.response?.status
    const path = String(error.config?.url || '').split('?')[0]

    const serverPayload = error.response?.data
    if (isPlainObject(serverPayload)) {
      const message = serverPayload.message || serverPayload.error
      if (message && !error.message) {
        error.message = message
      }
    }

    const isAuthEndpoint = path === '/api/login' || path.startsWith('/api/register')

    if (status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('authToken')
      window.location.href = '/auth'
    }
    return Promise.reject(error)
  }
)

export const api = {
  get: (url, config) => apiClient.get(url, config),
  post: (url, data, config) => apiClient.post(url, data, config),
  patch: (url, data, config) => apiClient.patch(url, data, config),
  delete: (url, config) => apiClient.delete(url, config),
}

export default apiClient
