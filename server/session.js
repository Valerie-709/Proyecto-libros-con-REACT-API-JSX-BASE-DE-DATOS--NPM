import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dataDirectory = fileURLToPath(new URL('./data/', import.meta.url))
const secretFile = path.join(dataDirectory, 'session-secret')
const cookieName = 'entrelineas_session'
const sessionDurationSeconds = 7 * 24 * 60 * 60

function loadSecret() {
  mkdirSync(dataDirectory, { recursive: true })
  if (process.env.SESSION_SECRET) {
    if (Buffer.byteLength(process.env.SESSION_SECRET) < 32) {
      throw new Error('SESSION_SECRET debe tener al menos 32 caracteres.')
    }
    return process.env.SESSION_SECRET
  }

  if (!existsSync(secretFile)) {
    writeFileSync(secretFile, randomBytes(32).toString('hex'), { mode: 0o600 })
  }
  return readFileSync(secretFile, 'utf8').trim()
}

const secret = loadSecret()

function sign(payload) {
  return createHmac('sha256', secret).update(payload).digest('hex')
}

export function createSessionToken(userId) {
  const payload = Buffer.from(
    JSON.stringify({
      userId,
      expiresAt: Date.now() + sessionDurationSeconds * 1000,
    }),
  ).toString('base64url')
  return `${payload}.${sign(payload)}`
}

export function getSessionUserId(request) {
  const cookieHeader = request.headers.cookie
  if (typeof cookieHeader !== 'string') {
    return null
  }

  const cookie = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`))
  if (!cookie) {
    return null
  }

  const token = cookie.slice(cookieName.length + 1)
  const [payload, signature, extra] = token.split('.')
  if (!payload || !signature || extra) {
    return null
  }

  const expectedSignature = Buffer.from(sign(payload), 'hex')
  const providedSignature = Buffer.from(signature, 'hex')
  if (
    expectedSignature.length !== providedSignature.length ||
    !timingSafeEqual(expectedSignature, providedSignature)
  ) {
    return null
  }

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    return typeof session.userId === 'string' &&
      Number.isFinite(session.expiresAt) &&
      session.expiresAt > Date.now()
      ? session.userId
      : null
  } catch {
    return null
  }
}

export function setSessionCookie(response, userId) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  response.setHeader(
    'Set-Cookie',
    `${cookieName}=${createSessionToken(userId)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${sessionDurationSeconds}${secure}`,
  )
}

export function clearSessionCookie(response) {
  response.setHeader(
    'Set-Cookie',
    `${cookieName}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`,
  )
}
