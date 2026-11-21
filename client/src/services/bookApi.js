export async function fetchRecommendations(interests) {
  const response = await fetch('/api/recommendations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ interests }),
  })
  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'El servidor no pudo completar la búsqueda.')
  }

  if (!Array.isArray(result.books)) {
    throw new Error('El servidor devolvió una respuesta inesperada.')
  }

  return result.books
}
