import { getInterestLabel } from '../data/interests.js'
import BookGrid from './BookGrid.jsx'

function BookSection({
  books,
  user,
  onToggleFavorite,
  title = 'Una estantería por descubrir',
}) {
  return (
    <section className="results-section" aria-live="polite">
      <div className="results-heading">
        <div>
          <p className="eyebrow">Una selección hecha para ti</p>
          <h2>{title}</h2>
        </div>
        <span className="results-count">
          <i aria-hidden="true">✦</i>
          {books.length} {books.length === 1 ? 'hallazgo' : 'hallazgos'}
        </span>
      </div>
      <p className="recommendation-context">
        {user?.interests?.length
          ? user.interests.map(getInterestLabel).join(' · ')
          : 'Nuevos mundos te esperan'}
      </p>
      <BookGrid
        books={books}
        user={user}
        onToggleFavorite={onToggleFavorite}
      />
    </section>
  )
}

export default BookSection
