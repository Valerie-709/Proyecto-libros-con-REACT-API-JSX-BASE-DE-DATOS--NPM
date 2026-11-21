import { useState } from 'react'
import InterestSelector from '../components/InterestSelector.jsx'
import BookSection from '../components/BookSection.jsx'
import { MAX_INTERESTS } from '../data/interests.js'
import { fetchRecommendations } from '../services/bookApi.js'

function DiscoverPage({ user, onSavePreferences, onToggleFavorite }) {
  const [selectedInterests, setSelectedInterests] = useState(
    user?.interests ?? [],
  )
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  function toggleInterest(interestId) {
    setSelectedInterests((current) => {
      if (current.includes(interestId)) {
        return current.filter((interest) => interest !== interestId)
      }
      if (current.length >= MAX_INTERESTS) {
        return current
      }
      return [...current, interestId]
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (selectedInterests.length === 0 || loading) {
      return
    }

    setLoading(true)
    setError('')
    setSearched(true)
    try {
      if (user) {
        await onSavePreferences(selectedInterests)
      }
      setBooks(await fetchRecommendations(selectedInterests))
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No fue posible buscar estos libros.',
      )
      setBooks([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="inner-page">
      <section className="page-banner discover-banner">
        <div className="page-banner-copy">
          <p className="eyebrow">Un catálogo sin mapa</p>
          <h1>Deja que la curiosidad <em>te guíe.</em></h1>
          <p>Combina hasta tres géneros y encuentra historias fuera de tu camino habitual.</p>
        </div>
        <div className="banner-sigil" aria-hidden="true">⌘</div>
      </section>

      <div className="page-container discover-content">
        <section className="discovery-form-panel">
          <div className="section-heading compact-heading">
            <div>
              <p className="eyebrow">Tu búsqueda comienza aquí</p>
              <h2>Elige tus señales</h2>
            </div>
            <span className="selection-counter">
              {selectedInterests.length} / {MAX_INTERESTS}
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            <InterestSelector
              disabled={loading}
              onToggle={toggleInterest}
              selectedInterests={selectedInterests}
            />
            <button
              className="primary-button discovery-submit"
              disabled={selectedInterests.length === 0 || loading}
              type="submit"
            >
              {loading ? 'Consultando el catálogo…' : 'Encontrar mis lecturas'}
              {!loading && <span aria-hidden="true">✦</span>}
            </button>
            {user ? (
              <p className="form-footnote">
                Tus selecciones también actualizarán las recomendaciones de tu inicio.
              </p>
            ) : (
              <p className="form-footnote">
                <a href="#/registro">Crea una cuenta</a> para guardar tus gustos y recibir una selección automática.
              </p>
            )}
          </form>
        </section>

        {error && <p className="notice notice-error" role="alert">{error}</p>}
        {loading && (
          <div className="loading-panel" role="status">
            <span className="loading-orbit" aria-hidden="true">✦</span>
            <p>Husmeando entre miles de historias…</p>
          </div>
        )}
        {!loading && searched && !error && books.length > 0 && (
          <BookSection
            books={books}
            onToggleFavorite={onToggleFavorite}
            title="Hallazgos para esta búsqueda"
            user={user}
          />
        )}
        {!loading && searched && !error && books.length === 0 && (
          <p className="notice">No encontramos coincidencias. Prueba otra combinación de géneros.</p>
        )}
      </div>
    </main>
  )
}

export default DiscoverPage
