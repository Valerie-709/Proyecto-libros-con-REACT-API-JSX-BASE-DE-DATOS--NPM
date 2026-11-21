import express from 'express'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getBookRecommendations } from './bookService.js'
import { INTEREST_SUBJECTS, MAX_INTERESTS } from './interests.js'
import {
  authenticateUser,
  createUser,
  findUserById,
  toggleUserFavorite,
  updateUserInterests,
} from './userStore.js'
import {
  clearSessionCookie,
  getSessionUserId,
  setSessionCookie,
} from './session.js'

const app = express()
const port = Number(process.env.PORT) || 3001
const clientDist = fileURLToPath(new URL('../client/dist/', import.meta.url))
const clientIndex = path.join(clientDist, 'index.html')

app.disable('x-powered-by')
app.use(express.json({ limit: '10kb' }))

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', service: 'book-recommendations-api' })
})

function validateInterests(requestedInterests, allowEmpty = false) {
  if (
    !Array.isArray(requestedInterests) ||
    (!allowEmpty && requestedInterests.length === 0)
  ) {
    return null
  }

  const interests = [...new Set(requestedInterests)]
  if (
    interests.length > MAX_INTERESTS ||
    interests.some(
      (interest) =>
        typeof interest !== 'string' ||
        !Object.hasOwn(INTEREST_SUBJECTS, interest),
    )
  ) {
    return null
  }

  return interests
}

function requireAuthenticatedUser(request, response, next) {
  const userId = getSessionUserId(request)
  const user = userId ? findUserById(userId) : null
  if (!user) {
    return response.status(401).json({
      error: 'Inicia sesión para acceder a tu perfil.',
    })
  }

  request.user = user
  return next()
}

function isValidBook(book) {
  return (
    book &&
    typeof book === 'object' &&
    typeof book.id === 'string' &&
    book.id.length > 0 &&
    book.id.length <= 200 &&
    typeof book.title === 'string' &&
    book.title.length > 0 &&
    book.title.length <= 300 &&
    Array.isArray(book.authors) &&
    book.authors.length <= 3 &&
    book.authors.every(
      (author) => typeof author === 'string' && author.length <= 150,
    ) &&
    (book.coverUrl === null ||
      (typeof book.coverUrl === 'string' &&
        book.coverUrl.startsWith('https://covers.openlibrary.org/b/id/'))) &&
    (book.firstPublished === null ||
      Number.isInteger(book.firstPublished)) &&
    (book.editionCount === null || Number.isInteger(book.editionCount)) &&
    Array.isArray(book.interests) &&
    book.interests.length <= MAX_INTERESTS &&
    book.interests.every((interest) =>
      Object.hasOwn(INTEREST_SUBJECTS, interest),
    )
  )
}

app.post('/api/auth/register', (request, response) => {
  const name = typeof request.body?.name === 'string'
    ? request.body.name.trim()
    : ''
  const email = typeof request.body?.email === 'string'
    ? request.body.email.trim().toLowerCase()
    : ''
  const password = request.body?.password

  if (name.length < 2 || name.length > 50) {
    return response.status(400).json({
      error: 'Escribe un nombre entre 2 y 50 caracteres.',
    })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return response.status(400).json({
      error: 'Escribe un correo electrónico válido.',
    })
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
    return response.status(400).json({
      error: 'La contraseña debe tener entre 8 y 72 caracteres.',
    })
  }

  const result = createUser({ name, email, password })
  if (result.error === 'email_exists') {
    return response.status(409).json({
      error: 'Ya existe una cuenta con ese correo electrónico.',
    })
  }

  setSessionCookie(response, result.user.id)
  return response.status(201).json({ user: result.user })
})

app.post('/api/auth/login', (request, response) => {
  const email = typeof request.body?.email === 'string'
    ? request.body.email.trim().toLowerCase()
    : ''
  const password = request.body?.password
  if (typeof password !== 'string' || password.length > 72) {
    return response.status(401).json({ error: 'Correo o contraseña incorrectos.' })
  }

  const user = authenticateUser(email, password)
  if (!user) {
    return response.status(401).json({
      error: 'Correo o contraseña incorrectos.',
    })
  }

  setSessionCookie(response, user.id)
  return response.json({ user })
})

app.get('/api/auth/me', (request, response) => {
  const userId = getSessionUserId(request)
  const user = userId ? findUserById(userId) : null
  if (!user) {
    clearSessionCookie(response)
  }
  return response.json({ user })
})

app.post('/api/auth/logout', (_request, response) => {
  clearSessionCookie(response)
  return response.json({ user: null })
})

app.put('/api/auth/preferences', requireAuthenticatedUser, (request, response) => {
  const interests = validateInterests(request.body?.interests, true)
  if (!interests) {
    return response.status(400).json({
      error: `Selecciona hasta ${MAX_INTERESTS} intereses válidos.`,
    })
  }

  const user = updateUserInterests(request.user.id, interests)
  return response.json({ user })
})

app.post('/api/auth/favorites', requireAuthenticatedUser, (request, response) => {
  const { book } = request.body ?? {}
  if (!isValidBook(book)) {
    return response.status(400).json({
      error: 'No fue posible guardar este libro. Inténtalo de nuevo.',
    })
  }

  const result = toggleUserFavorite(request.user.id, book)
  if (result.limitReached) {
    return response.status(409).json({
      error: 'Tu estantería ya tiene el máximo de 60 libros guardados.',
    })
  }
  return response.json({ user: result.user, saved: result.saved })
})

app.post('/api/recommendations', async (request, response) => {
  const interests = validateInterests(request.body?.interests)
  if (!interests) {
    return response.status(400).json({
      error: `Selecciona entre 1 y ${MAX_INTERESTS} intereses válidos.`,
    })
  }

  try {
    const books = await getBookRecommendations(interests)
    return response.json({ interests, books })
  } catch (error) {
    console.error('Error consultando Open Library:', error)
    const timedOut = error.name === 'TimeoutError'
    return response.status(timedOut ? 504 : 502).json({
      error: timedOut
        ? 'Open Library tardó demasiado en responder. Inténtalo de nuevo.'
        : 'No fue posible consultar Open Library. Inténtalo de nuevo más tarde.',
    })
  }
})

app.use(express.static(clientDist))

app.use((request, response, next) => {
  if (request.method !== 'GET' || request.path.startsWith('/api/')) {
    return next()
  }

  if (!existsSync(clientIndex)) {
    return response
      .status(503)
      .send('Frontend aún no compilado. Ejecuta npm run build antes de iniciar.')
  }

  return response.sendFile(clientIndex, (error) => {
    if (error) {
      next(error)
    }
  })
})

app.use('/api', (_request, response) => {
  response.status(404).json({ error: 'Ruta de API no encontrada.' })
})

app.use((error, _request, response, next) => {
  if (response.headersSent) {
    return next(error)
  }

  if (error.type === 'entity.parse.failed') {
    return response
      .status(400)
      .json({ error: 'El cuerpo de la solicitud debe ser JSON válido.' })
  }

  if (error.type === 'entity.too.large') {
    return response
      .status(413)
      .json({ error: 'El cuerpo de la solicitud es demasiado grande.' })
  }

  console.error('Error interno del servidor:', error)
  return response.status(500).json({ error: 'Ocurrió un error interno.' })
})

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor Express disponible en el puerto ${port}.`)
})
