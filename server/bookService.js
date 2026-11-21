import { INTEREST_SUBJECTS } from './interests.js'

const SEARCH_URL = 'https://openlibrary.org/search.json'
const SEARCH_FIELDS =
  'key,title,author_name,first_publish_year,cover_i,edition_count'

async function searchBooksByInterest(interest) {
  const parameters = new URLSearchParams({
    subject: INTEREST_SUBJECTS[interest],
    limit: '12',
    fields: SEARCH_FIELDS,
  })
  const response = await fetch(`${SEARCH_URL}?${parameters}`, {
    headers: {
      'User-Agent': 'BookRecommendationsAcademicProject/1.0',
    },
    signal: AbortSignal.timeout(12000),
  })

  if (!response.ok) {
    throw new Error(`Open Library respondió con el estado ${response.status}.`)
  }

  const result = await response.json()
  if (!Array.isArray(result.docs)) {
    throw new Error('Open Library devolvió una respuesta con formato inválido.')
  }

  return result.docs
    .filter((book) => book.key && book.title)
    .map((book) => ({
      id: book.key,
      title: book.title,
      authors:
        Array.isArray(book.author_name) && book.author_name.length > 0
          ? book.author_name.slice(0, 3)
          : ['Autor no disponible'],
      firstPublished: Number.isInteger(book.first_publish_year)
        ? book.first_publish_year
        : null,
      coverUrl:
        Number.isInteger(book.cover_i) && book.cover_i > 0
          ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
          : null,
      editionCount: Number.isInteger(book.edition_count)
        ? book.edition_count
        : null,
      interests: [interest],
    }))
}

export async function getBookRecommendations(interests) {
  const resultsByInterest = await Promise.all(
    interests.map((interest) => searchBooksByInterest(interest)),
  )
  const booksById = new Map()

  for (const book of resultsByInterest.flat()) {
    const existingBook = booksById.get(book.id)
    if (existingBook) {
      existingBook.interests.push(book.interests[0])
    } else {
      booksById.set(book.id, book)
    }
  }

  return [...booksById.values()].slice(0, 18)
}
