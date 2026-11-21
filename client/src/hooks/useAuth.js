import { useEffect, useState } from 'react'
import {
  fetchCurrentUser,
  loginAccount,
  logoutAccount,
  registerAccount,
  saveInterests,
  toggleFavoriteBook,
} from '../services/authApi.js'

function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    fetchCurrentUser()
      .then((currentUser) => {
        if (active) {
          setUser(currentUser)
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'No fue posible cargar tu perfil.',
          )
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  async function applyUserRequest(request) {
    setError('')
    try {
      const result = await request()
      if (Object.hasOwn(result, 'user')) {
        setUser(result.user)
      }
      return result
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No fue posible completar la solicitud.',
      )
      throw requestError
    }
  }

  return {
    user,
    loading,
    error,
    clearError: () => setError(''),
    register: (details) => applyUserRequest(() => registerAccount(details)),
    login: (details) => applyUserRequest(() => loginAccount(details)),
    logout: () => applyUserRequest(logoutAccount),
    updateInterests: (interests) =>
      applyUserRequest(() => saveInterests(interests)),
    toggleFavorite: (book) =>
      applyUserRequest(() => toggleFavoriteBook(book)),
  }
}

export default useAuth
