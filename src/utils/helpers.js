export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatPetId = (id) => {
  // Formato: PET-YYYY-NNNN
  return `PET-${id.substring(0, 4)}-${id.substring(4)}`
}

export const truncate = (text, length = 50) => {
  return text.length > length ? text.substring(0, length) + '...' : text
}

export const capitalizeFirst = (text) => {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
