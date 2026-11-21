async function request(path, method = 'GET', body) {
  const response = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
  })

  let result
  try {
    result = await response.json()
  } catch {
    throw new Error('El servidor devolvió una respuesta inesperada.')
  }

  if (!response.ok) {
    throw new Error(result.error || 'No fue posible completar la solicitud.')
  }
  return result
}

export async function fetchCurrentUser() {
  const result = await request('/api/auth/me')
  return result.user
}

export async function registerAccount({ name, email, password }) {
  return request('/api/auth/register', 'POST', { name, email, password })
}

export async function loginAccount({ email, password }) {
  return request('/api/auth/login', 'POST', { email, password })
}

export async function logoutAccount() {
  return request('/api/auth/logout', 'POST', {})
}

export async function saveInterests(interests) {
  return request('/api/auth/preferences', 'PUT', { interests })
}

export async function toggleFavoriteBook(book) {
  return request('/api/auth/favorites', 'POST', { book })
}
