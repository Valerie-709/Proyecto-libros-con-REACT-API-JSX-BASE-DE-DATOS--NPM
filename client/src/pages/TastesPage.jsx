import { useState } from 'react'
import InterestSelector from '../components/InterestSelector.jsx'
import { MAX_INTERESTS } from '../data/interests.js'

function TastesPage({ user, onSavePreferences }) {
  const [selectedInterests, setSelectedInterests] = useState(
    user?.interests ?? [],
  )
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
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

  async function handleSave(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await onSavePreferences(selectedInterests)
      setMessage(
        selectedInterests.length
          ? 'Tus gustos quedaron guardados. Tu inicio se actualizará con nuevas lecturas.'
          : 'Tus preferencias se limpiaron. Cuando quieras, podrás elegir otras.',
      )
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No fue posible guardar tus preferencias.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <main className="inner-page">
        <section className="locked-page page-container">
          <span className="locked-sigil" aria-hidden="true">✧</span>
          <p className="eyebrow">Solo para miembros</p>
          <h1>Tu perfil vive aquí.</h1>
          <p>Entra para guardar tus géneros favoritos y recibir recomendaciones hechas para ti.</p>
          <a className="primary-button" href="#/acceso">Iniciar sesión <span>→</span></a>
        </section>
      </main>
    )
  }

  return (
    <main className="inner-page">
      <section className="page-banner taste-banner">
        <div className="page-banner-copy">
          <p className="eyebrow">Tu perfil lector</p>
          <h1>Un poco de ti,<br /><em>en cada página.</em></h1>
          <p>Estos gustos se guardan en tu cuenta y dan forma a tu estantería personalizada.</p>
        </div>
        <div className="profile-monogram" aria-hidden="true">
          {user.name.slice(0, 1).toUpperCase()}
        </div>
      </section>

      <div className="page-container taste-layout">
        <aside className="profile-card">
          <span className="profile-avatar" aria-hidden="true">
            {user.name.slice(0, 1).toUpperCase()}
          </span>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <div className="profile-divider" />
          <div className="profile-stat">
            <span>{user.favorites.length}</span>
            <small>libros en tu estante</small>
          </div>
          <p className="profile-note">Tu espacio es privado en esta instalación local.</p>
        </aside>

        <section className="taste-editor">
          <div className="section-heading compact-heading">
            <div>
              <p className="eyebrow">Sintoniza tu algoritmo</p>
              <h2>¿Qué te gusta leer?</h2>
            </div>
            <span className="selection-counter">
              {selectedInterests.length} / {MAX_INTERESTS}
            </span>
          </div>
          <p className="taste-intro">
            Elige hasta {MAX_INTERESTS} intereses. Cuando vuelvas a «Para ti», encontrarás libros nuevos sin volver a buscar.
          </p>
          <form onSubmit={handleSave}>
            <InterestSelector
              onToggle={toggleInterest}
              selectedInterests={selectedInterests}
            />
            {error && <p className="form-error" role="alert">{error}</p>}
            {message && <p className="notice notice-success" role="status">{message}</p>}
            <button className="primary-button save-preferences" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar mis gustos'}
              {!saving && <span aria-hidden="true">✦</span>}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}

export default TastesPage
