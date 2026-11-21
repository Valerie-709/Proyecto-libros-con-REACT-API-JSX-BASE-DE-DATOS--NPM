import { useState } from 'react'
import { getInterestLabel } from '../data/interests.js'

function BookCard({ book, isSaved, canSave, onToggleSaved }) {
  const [coverUnavailable, setCoverUnavailable] = useState(false)

  return (
    <article className="book-card">
      <div className="book-cover-frame">
        {book.coverUrl && !coverUnavailable ? (
          <img
            className="book-cover"
            src={book.coverUrl}
            alt={`Portada de ${book.title}`}
            loading="lazy"
            onError={() => setCoverUnavailable(true)}
          />
        ) : (
          <div className="cover-placeholder">
            <span aria-hidden="true">✳</span>
            <strong>{book.title}</strong>
            <small>Portada no disponible</small>
          </div>
        )}
      </div>

      <div className="book-information">
        <p className="book-kicker">Recomendación</p>
        <h3>{book.title}</h3>
        <p className="book-authors">{book.authors.join(', ')}</p>
        <div className="book-meta">
          {book.firstPublished && <span>Publicado en {book.firstPublished}</span>}
          {book.editionCount && <span>{book.editionCount} ediciones</span>}
        </div>
        <div className="book-tags" aria-label="Intereses relacionados">
          {book.interests.map((interest) => (
            <span className="book-tag" key={interest}>
              {getInterestLabel(interest)}
            </span>
          ))}
        </div>
        <button
          className={`save-book-button${isSaved ? ' is-saved' : ''}`}
          type="button"
          aria-pressed={isSaved}
          onClick={() => onToggleSaved(book)}
        >
          <span aria-hidden="true">{isSaved ? '♥' : '♡'}</span>
          {isSaved
            ? 'En mi estante'
            : canSave
              ? 'Guardar lectura'
              : 'Entrar para guardar'}
        </button>
      </div>
    </article>
  )
}

export default BookCard
