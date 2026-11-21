import { useEffect, useState } from 'react'
import { INTEREST_OPTIONS } from '../data/interests.js'
import { fetchRecommendations } from '../services/bookApi.js'
import BookSection from '../components/BookSection.jsx'

function HomePage({
  user,
  loadingUser,
  onToggleFavorite,
}) {
  const userId = user?.id
  const interests = user?.interests ?? []
  const recommendationKey =
    userId && interests.length > 0
      ? `${userId}:${interests.join('|')}`
      : ''
  const [recommendation, setRecommendation] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const requestKey = recommendationKey
    ? `${recommendationKey}::${retryCount}`
    : ''

  useEffect(() => {
    if (!requestKey) {
      return undefined
    }

    let active = true
    const identity = requestKey.split('::')[0]
    const requestedInterests = identity
      .slice(identity.indexOf(':') + 1)
      .split('|')

    fetchRecommendations(requestedInterests)
      .then((recommendations) => {
        if (active) {
          setRecommendation({
            key: requestKey,
            books: recommendations,
          })
        }
      })
      .catch((requestError) => {
        if (active) {
          setRecommendation({
            key: requestKey,
            error:
              requestError instanceof Error
                ? requestError.message
                : 'No fue posible cargar tus recomendaciones.',
          })
        }
      })

    return () => {
      active = false
    }
  }, [requestKey])

  const currentRecommendation =
    recommendation?.key === requestKey ? recommendation : null
  const loadingBooks = Boolean(requestKey) && !currentRecommendation
  const books = currentRecommendation?.books ?? []
  const error = currentRecommendation?.error ?? ''
  const featuredInterests = INTEREST_OPTIONS.slice(0, 3)

  return (
    <main>
      <section className="home-hero">
        <div className="hero-veil" />
        <div className="hero-content">
          <p className="eyebrow hero-eyebrow">
            <span className="eyebrow-star" aria-hidden="true">✦</span>
            {user ? 'Tu refugio entre páginas' : 'Una biblioteca hecha a tu medida'}
          </p>
          <h1>
            {user ? (
              <>Buenas historias,<br /><em>{user.name.split(' ')[0]}.</em></>
            ) : (
              <>La noche es joven.<br /><em>Abre un libro.</em></>
            )}
          </h1>
          <p className="hero-description">
            {user
              ? 'Tu estantería cambia contigo. Aquí están las historias que conversan con tus gustos.'
              : 'Un rincón oscuro, cálido y solo tuyo para descubrir esa historia que no sabías que necesitabas.'}
          </p>
          <div className="hero-actions">
            <a className="primary-button" href={user ? '#/para-ti' : '#/registro'}>
              {user ? 'Ver mis recomendaciones' : 'Crear mi espacio'}
              <span aria-hidden="true">↗</span>
            </a>
            <a className="text-button" href="#/descubrir">
              Explorar sin prisa <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="hero-annotation">
            <span className="annotation-line" />
            <span>Historias elegidas por tus intereses</span>
          </div>
        </div>
        <div className="hero-image-note">
          <span>LECTURAS DESPUÉS DEL ANOCHECER</span>
          <span>◈</span>
        </div>
        <div className="hero-counter" aria-hidden="true">
          <span>01</span><i /><span>04</span>
        </div>
      </section>

      {user && (
        <section className="personalized-section page-container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">El algoritmo de tu biblioteca</p>
              <h2>Tu próxima obsesión literaria</h2>
            </div>
            <a className="subtle-link" href="#/gustos">
              Afinar mis gustos <span aria-hidden="true">↗</span>
            </a>
          </div>

          {loadingUser && <p className="inline-status">Abriendo tu biblioteca…</p>}
          {!loadingUser && interests.length === 0 && (
            <div className="taste-empty-card">
              <span className="taste-empty-symbol" aria-hidden="true">✧</span>
              <div>
                <h3>Tu estantería aún no conoce tus gustos.</h3>
                <p>Cuéntanos qué te gusta y prepararemos recomendaciones automáticamente cada vez que vuelvas.</p>
              </div>
              <a className="outline-button" href="#/gustos">Elegir mis gustos <span>→</span></a>
            </div>
          )}
          {loadingBooks && (
            <div className="loading-panel" role="status">
              <span className="loading-orbit" aria-hidden="true">✦</span>
              <p>Buscando historias en los estantes de la noche…</p>
            </div>
          )}
          {error && (
            <div className="notice notice-error" role="alert">
              <p>{error}</p>
              <button
                className="retry-button"
                onClick={() => setRetryCount((count) => count + 1)}
                type="button"
              >
                Intentar otra vez <span aria-hidden="true">↻</span>
              </button>
            </div>
          )}
          {!loadingBooks && !error && books.length > 0 && (
            <BookSection
              books={books}
              onToggleFavorite={onToggleFavorite}
              title="Lecturas que ya te estaban buscando"
              user={user}
            />
          )}
        </section>
      )}

      <section className="manifesto-section">
        <div className="manifesto-copy">
          <p className="eyebrow">No es solo una lista</p>
          <h2>Un lugar donde los libros <em>te encuentran.</em></h2>
          <p>
            Elige tus intereses una vez. Nosotros cruzamos tus señales con un
            catálogo abierto y dejamos que la curiosidad haga el resto.
          </p>
          <a className="text-button" href={user ? '#/gustos' : '#/registro'}>
            {user ? 'Editar mis preferencias' : 'Empezar mi biblioteca'}
            <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="manifesto-stamp" aria-label="Lee a tu manera">
          <span>LEE</span>
          <span className="stamp-star" aria-hidden="true">✳</span>
          <span>A TU<br />MANERA</span>
        </div>
      </section>

      <section className="genre-section page-container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Abre una puerta</p>
            <h2>¿Qué noche te apetece?</h2>
          </div>
          <a className="subtle-link" href="#/descubrir">
            Ver todos los géneros <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="genre-cards">
          {featuredInterests.map((interest, index) => (
            <a
              className="genre-card"
              href="#/descubrir"
              key={interest.id}
              style={{
                '--genre-image': `url("${interest.image}")`,
                '--genre-index': index,
              }}
            >
              <span className="genre-symbol">{interest.symbol}</span>
              <span className="genre-title">{interest.label}</span>
              <span className="genre-description">{interest.description}</span>
              <span className="genre-arrow" aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </section>

      <section className="quote-band">
        <span className="quote-mark" aria-hidden="true">“</span>
        <p>Un libro es un sueño que tienes en tus manos.</p>
        <span className="quote-credit">— Neil Gaiman</span>
      </section>
    </main>
  )
}

export default HomePage
