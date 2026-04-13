import { ref } from 'vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const currentUser = ref(null)
const accessToken = ref(localStorage.getItem('lumarate_access_token') || null)
const refreshToken = ref(localStorage.getItem('lumarate_refresh_token') || null)

// Инициализация пользователя с проверкой наличия токена
const storedUser = localStorage.getItem('lumarate_user')
if (storedUser && accessToken.value) {
  const parsedUser = JSON.parse(storedUser)
  if (parsedUser.login && !parsedUser.username) {
    parsedUser.username = parsedUser.login
  }
  currentUser.value = parsedUser
} else {
  // Если токена нет, очищаем всё
  currentUser.value = null
  accessToken.value = null
  localStorage.removeItem('lumarate_user')
  localStorage.removeItem('lumarate_access_token')
  localStorage.removeItem('lumarate_refresh_token')
}

export function useAuth() {
  const register = async (login, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          return { success: false, error: 'Пользователь с таким логином уже существует' }
        }
        if (response.status === 400) {
          return { success: false, error: data.message || 'Ошибка валидации (логин или пароль)' }
        }
        return { success: false, error: data.message || 'Ошибка регистрации' }
      }

      return await loginUser(login, password)
    } catch (err) {
      return { success: false, error: 'Ошибка соединения с сервером' }
    }
  }

  const loginUser = async (login, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          return { success: false, error: 'Неверный логин или пароль' }
        }
        return { success: false, error: data.message || 'Ошибка авторизации' }
      }

      // Нормализуем объект пользователя: добавляем username из login
      const user = data.user
      if (user.login && !user.username) {
        user.username = user.login
      }

      // Сохраняем данные
      accessToken.value = data.accessToken
      refreshToken.value = data.refreshToken
      currentUser.value = user

      localStorage.setItem('lumarate_access_token', data.accessToken)
      localStorage.setItem('lumarate_refresh_token', data.refreshToken)
      localStorage.setItem('lumarate_user', JSON.stringify(user))

      return { success: true }
    } catch (err) {
      return { success: false, error: 'Ошибка соединения с сервером' }
    }
  }

  const logoutUser = async () => {
    const currentToken = accessToken.value
    const currentRefreshToken = refreshToken.value

    // Всегда очищаем локальные данные в первую очередь
    currentUser.value = null
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem('lumarate_user')
    localStorage.removeItem('lumarate_access_token')
    localStorage.removeItem('lumarate_refresh_token')

    if (currentToken && currentRefreshToken) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`
          },
          body: JSON.stringify({ refreshToken: currentRefreshToken })
        })
      } catch (err) {
        console.error('Logout request failed:', err)
      }
    }
  }

  return {
    currentUser,
    accessToken,
    register,
    login: loginUser,
    logout: logoutUser
  }
}
