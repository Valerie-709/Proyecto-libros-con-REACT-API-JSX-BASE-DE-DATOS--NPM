import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Database from 'better-sqlite3'

const dataDirectory = fileURLToPath(new URL('./data/', import.meta.url))
const databaseFile = path.join(dataDirectory, 'users.sqlite')
const legacyUsersFile = path.join(dataDirectory, 'users.json')
const PASSWORD_HASH_LENGTH = 64

mkdirSync(dataDirectory, { recursive: true })

const database = new Database(databaseFile)
database.pragma('journal_mode = WAL')
database.pragma('foreign_keys = ON')
database.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL COLLATE NOCASE UNIQUE,
    password_salt TEXT NOT NULL,
    password_hash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_interests (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interest TEXT NOT NULL,
    position INTEGER NOT NULL,
    PRIMARY KEY (user_id, interest)
  );

  CREATE TABLE IF NOT EXISTS favorites (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id TEXT NOT NULL,
    book_json TEXT NOT NULL,
    position INTEGER NOT NULL,
    PRIMARY KEY (user_id, book_id)
  );

  CREATE TABLE IF NOT EXISTS migrations (
    id TEXT PRIMARY KEY
  );
`)

const selectUserById = database.prepare('SELECT * FROM users WHERE id = ?')
const selectUserByEmail = database.prepare('SELECT * FROM users WHERE email = ?')
const selectInterests = database.prepare(
  'SELECT interest FROM user_interests WHERE user_id = ? ORDER BY position',
)
const selectFavorites = database.prepare(
  'SELECT book_json FROM favorites WHERE user_id = ? ORDER BY position',
)
const insertUser = database.prepare(`
  INSERT INTO users (id, name, email, password_salt, password_hash)
  VALUES (@id, @name, @email, @passwordSalt, @passwordHash)
`)
const createUserTransaction = database.transaction((user) => {
  if (selectUserByEmail.get(user.email)) {
    return false
  }

  insertUser.run(user)
  return true
})
const insertInterest = database.prepare(
  'INSERT INTO user_interests (user_id, interest, position) VALUES (?, ?, ?)',
)
const insertFavorite = database.prepare(`
  INSERT INTO favorites (user_id, book_id, book_json, position)
  VALUES (?, ?, ?, ?)
`)

function importLegacyUsers() {
  const migrationId = 'import-users-json-v1'
  if (database.prepare('SELECT id FROM migrations WHERE id = ?').get(migrationId)) {
    return
  }

  const migrate = database.transaction(() => {
    if (existsSync(legacyUsersFile)) {
      const users = JSON.parse(readFileSync(legacyUsersFile, 'utf8'))
      if (!Array.isArray(users)) {
        throw new Error('El archivo local de usuarios no tiene un formato válido.')
      }

      for (const [userIndex, user] of users.entries()) {
        if (
          !user ||
          typeof user.id !== 'string' ||
          typeof user.name !== 'string' ||
          typeof user.email !== 'string' ||
          typeof user.passwordSalt !== 'string' ||
          typeof user.passwordHash !== 'string' ||
          !Array.isArray(user.interests) ||
          !Array.isArray(user.favorites)
        ) {
          throw new Error(`El usuario ${userIndex + 1} del archivo local no es válido.`)
        }

        insertUser.run(user)
        user.interests.forEach((interest, position) => {
          insertInterest.run(user.id, interest, position)
        })
        user.favorites.forEach((book, position) => {
          if (!book || typeof book.id !== 'string') {
            throw new Error(`Un libro favorito del usuario ${user.email} no es válido.`)
          }
          insertFavorite.run(user.id, book.id, JSON.stringify(book), position)
        })
      }
    }

    database.prepare('INSERT INTO migrations (id) VALUES (?)').run(migrationId)
  })

  migrate()
}

importLegacyUsers()

function toPublicUser(user) {
  if (!user) {
    return null
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    interests: selectInterests.all(user.id).map(({ interest }) => interest),
    favorites: selectFavorites.all(user.id).map(({ book_json: book }) => JSON.parse(book)),
  }
}

export function createUser({ name, email, password }) {
  const salt = randomBytes(16).toString('hex')
  const passwordHash = scryptSync(password, salt, PASSWORD_HASH_LENGTH).toString(
    'hex',
  )
  const user = {
    id: randomUUID(),
    name,
    email,
    passwordSalt: salt,
    passwordHash,
  }

  if (!createUserTransaction(user)) {
    return { error: 'email_exists' }
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      interests: [],
      favorites: [],
    },
  }
}

export function authenticateUser(email, password) {
  const user = selectUserByEmail.get(email)
  if (!user) {
    return null
  }

  const expectedHash = Buffer.from(user.password_hash, 'hex')
  const actualHash = scryptSync(password, user.password_salt, PASSWORD_HASH_LENGTH)
  if (
    expectedHash.length !== actualHash.length ||
    !timingSafeEqual(expectedHash, actualHash)
  ) {
    return null
  }

  return toPublicUser(user)
}

export function findUserById(userId) {
  return toPublicUser(selectUserById.get(userId))
}

const saveInterests = database.transaction((userId, interests) => {
  if (!selectUserById.get(userId)) {
    return null
  }

  database.prepare('DELETE FROM user_interests WHERE user_id = ?').run(userId)
  interests.forEach((interest, position) => {
    insertInterest.run(userId, interest, position)
  })

  return toPublicUser(selectUserById.get(userId))
})

export function updateUserInterests(userId, interests) {
  return saveInterests(userId, interests)
}

const toggleFavorite = database.transaction((userId, book) => {
  const user = selectUserById.get(userId)
  if (!user) {
    return null
  }

  const existing = database
    .prepare('SELECT book_id FROM favorites WHERE user_id = ? AND book_id = ?')
    .get(userId, book.id)

  if (existing) {
    database
      .prepare('DELETE FROM favorites WHERE user_id = ? AND book_id = ?')
      .run(userId, book.id)
  } else {
    const count = database
      .prepare('SELECT COUNT(*) AS count FROM favorites WHERE user_id = ?')
      .get(userId).count
    if (count >= 60) {
      return {
        user: toPublicUser(user),
        saved: false,
        limitReached: true,
      }
    }

    const position = database
      .prepare('SELECT COALESCE(MAX(position), -1) + 1 AS position FROM favorites WHERE user_id = ?')
      .get(userId).position
    insertFavorite.run(userId, book.id, JSON.stringify(book), position)
  }

  return {
    user: toPublicUser(user),
    saved: !existing,
    limitReached: false,
  }
})

export function toggleUserFavorite(userId, book) {
  return toggleFavorite(userId, book)
}
