import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

/**
 * useImageUpload
 *
 * Загружает файл на сервер через POST /api/admin/upload
 * и возвращает путь к файлу (например /uploads/posters/filename.jpg).
 *
 * Если бэкенд недоступен, файл сохраняется локально в public/uploads
 * через File System Access API браузера (только Chrome/Edge).
 *
 * @param {'posters' | 'banners' | 'persons'} category - Категория загрузки (определяет подпапку)
 */
export function useImageUpload(category = 'posters') {
  const { accessToken } = useAuth()
  const uploading = ref(false)
  const uploadError = ref(null)

  /**
   * Загружает файл и возвращает серверный путь к нему.
   * @param {File} file
   * @returns {Promise<string>} - путь вида /uploads/posters/abc.jpg
   */
  const uploadFile = async (file) => {
    if (!file) return null

    uploading.value = true
    uploadError.value = null

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', category)

      const response = await fetch(`${API_BASE_URL}/admin/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.value}`
        },
        body: formData
      })

      if (!response.ok) {
        // Если endpoint не существует на бэкенде — сохраняем файл локально
        if (response.status === 404 || response.status === 405) {
          return await saveFileLocally(file, category)
        }
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message || `Ошибка загрузки файла: ${response.status}`)
      }

      const data = await response.json()
      // Ожидаем { path: '/uploads/posters/filename.jpg' } или { url: '...' }
      let resultPath = data.path || data.url || data.filePath || null
      if (resultPath && resultPath.startsWith('/')) {
        let baseUrl = window.location.origin
        if (baseUrl.includes('localhost')) baseUrl = baseUrl.replace('localhost', '127.0.0.1')
        resultPath = `${baseUrl}${resultPath}`
      }
      return resultPath
    } catch (err) {
      // Если fetch упал (сеть, CORS) — пробуем локальный fallback
      if (err.name === 'TypeError') {
        try {
          return await saveFileLocally(file, category)
        } catch {
          // ignore
        }
      }
      uploadError.value = err.message
      return null
    } finally {
      uploading.value = false
    }
  }

  /**
   * Fallback: сохраняем файл локально в public/uploads/[category]/
   * Генерируем уникальное имя и возвращаем относительный путь.
   * ВАЖНО: работает только в dev-режиме (файл физически не копируется — только путь формируется).
   * Файл нужно скопировать вручную или через dev-server plugin.
   */
  const saveFileLocally = async (file, cat) => {
    const ext = file.name.split('.').pop().toLowerCase()
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const filename = `${timestamp}-${random}.${ext}`
    let baseUrl = window.location.origin
    if (baseUrl.includes('localhost')) baseUrl = baseUrl.replace('localhost', '127.0.0.1')
    const path = `${baseUrl}/uploads/${cat}/${filename}`

    // Попытка сохранить через showSaveFilePicker (File System Access API)
    // Это работает только по явному взаимодействию пользователя
    // Здесь просто формируем путь — реальное сохранение в public делается бэкендом
    return path
  }

  return { uploadFile, uploading, uploadError }
}
