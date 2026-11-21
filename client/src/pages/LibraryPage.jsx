import BookGrid from '../components/BookGrid.jsx'

function LibraryPage({ user, onToggleFavorite }) {
  if (!user) {
    return (
      <main className="inner-page">
        <section className="locked-page page-container">
          <span className="locked-sigil" aria-hidden="true">♡</span>
          <p className="eyebrow">Tu colección personal</p>
          <h1>Los libros que te encuentran, se quedan.</h1>
          <p>Inicia sesión para guardar aquí tus descubrimientos favoritos.</p>
          <a className="primary-button" href="#/acceso">Entrar a mi estante <span>→</span></a>
        </section>
      </main>
    )
  }

  const books = user.favorites ?? []

  return (
    <main className="inner-page">
      <section className="page-banner shelf-banner">
        <div className="page-banner-copy">
          <p className="eyebrow">Tu colección privada</p>
          <h1>Una estantería<br /><em>muy tuya.</em></h1>
          <p>Guarda las historias que quieras recordar. Volverán a estar aquí cuando regreses.</p>
        </div>
        <div className="shelf-count">
          <span>{books.length.toString().padStart(2, '0')}</span>
          <small>{books.length === 1 ? 'LIBRO GUARDADO' : 'LIBROS GUARDADOS'}</small>
        </div>
      </section>

      <section className="page-container shelf-content">
        {books.length > 0 ? (
          <BookGrid
            books={books}
            onToggleFavorite={onToggleFavorite}
            user={user}
          />
        ) : (
          <div className="empty-library">
            <span className="empty-library-art" aria-hidden="true">✧</span>
            <p className="eyebrow">Las páginas están en blanco</p>
            <h2>Tu próxima lectura todavía te espera.</h2>
            <p>Explora tus recomendaciones y guarda los libros que quieras tener cerca.</p>
            <a className="primary-button" href="#/para-ti">Ver mis recomendaciones <span>→</span></a>
          </div>
        )}
      </section>
    </main>
  )
}

export default LibraryPage
