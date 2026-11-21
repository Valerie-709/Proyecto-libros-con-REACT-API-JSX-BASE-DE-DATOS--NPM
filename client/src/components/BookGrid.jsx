import BookCard from './BookCard.jsx'

function BookGrid({ books, user, onToggleFavorite }) {
  const savedIds = new Set((user?.favorites ?? []).map((book) => book.id))

  return (
    <div className="book-grid">
      {books.map((book, index) => (
        <div
          className="book-grid-item"
          key={book.id}
          style={{ '--card-index': index }}
        >
          <BookCard
            book={book}
            canSave={Boolean(user)}
            isSaved={savedIds.has(book.id)}
            onToggleSaved={onToggleFavorite}
          />
        </div>
      ))}
    </div>
  )
}

export default BookGrid
