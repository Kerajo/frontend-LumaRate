const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export const getFullImageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http') || path.startsWith('data:')) return path
  const origin = API_BASE_URL.replace(/\/api\/?$/, '')
  // path usually starts with / (e.g. /uploads/...)
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${origin}${cleanPath}`
}
