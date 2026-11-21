import { useEffect, useState } from 'react'
import SiteFooter from './components/SiteFooter.jsx'
import SiteHeader from './components/SiteHeader.jsx'
import useAuth from './hooks/useAuth.js'
import AuthPage from './pages/AuthPage.jsx'
import DiscoverPage from './pages/DiscoverPage.jsx'
import HomePage from './pages/HomePage.jsx'
import LibraryPage from './pages/LibraryPage.jsx'
import TastesPage from './pages/TastesPage.jsx'
import './App.css'

function getRoute() {
  return window.location.hash.slice(1) || '/inicio'
}

function App() {
  const auth = useAuth()
  const [route, setRoute] = useState(getRoute)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    function syncRoute() {
      setRoute(getRoute())
      setNotice('')
    }

    window.addEventListener('hashchange', syncRoute)
    if (!window.location.hash) {
      window.location.hash = '#/inicio'
    }
    return () => window.removeEventListener('hashchange', syncRoute)
  }, [])

  async function handleLogout() {
    try {
      await auth.logout()
      window.location.hash = '#/inicio'
    } catch (requestError) {
      setNotice(
        requestError instanceof Error
          ? requestError.message
          : 'No fue posible cerrar sesión.',
      )
    }
  }

  if (
    auth.loading &&
    ['/descubrir', '/gustos', '/estante'].includes(route)
  ) {
    return (
      <div className="app-shell">
        <SiteHeader
          loading
          onLogout={handleLogout}
          route={route}
          user={null}
        />
        <main className="locked-page page-container">
          <span className="loading-orbit" aria-hidden="true">✦</span>
          <p>Preparando tu biblioteca…</p>
        </main>
      </div>
    )
  }

  async function handleToggleFavorite(book) {
    if (!auth.user) {
      setNotice('Inicia sesión para guardar libros en tu estantería.')
      window.location.hash = '#/acceso'
      return
    }

    try {
      const result = await auth.toggleFavorite(book)
      setNotice(
        result.saved
          ? 'Guardado en tu estantería.'
          : 'El libro se retiró de tu estantería.',
      )
    } catch (requestError) {
      setNotice(
        requestError instanceof Error
          ? requestError.message
          : 'No fue posible actualizar tu estantería.',
      )
    }
  }

  if (route === '/acceso' || route === '/registro') {
    return (
      <AuthPage
        mode={route === '/registro' ? 'register' : 'login'}
        onLogin={auth.login}
        onRegister={auth.register}
      />
    )
  }

  let page
  if (route === '/descubrir') {
    page = (
      <DiscoverPage
        onSavePreferences={auth.updateInterests}
        onToggleFavorite={handleToggleFavorite}
        user={auth.user}
      />
    )
  } else if (route === '/gustos') {
    page = (
      <TastesPage
        onSavePreferences={auth.updateInterests}
        user={auth.user}
      />
    )
  } else if (route === '/estante') {
    page = (
      <LibraryPage
        onToggleFavorite={handleToggleFavorite}
        user={auth.user}
      />
    )
  } else if (route === '/inicio' || route === '/para-ti') {
    page = (
      <HomePage
        loadingUser={auth.loading}
        onToggleFavorite={handleToggleFavorite}
        user={auth.user}
      />
    )
  } else {
    page = (
      <main className="locked-page page-container">
        <p className="eyebrow">Esta página no existe</p>
        <h1>Nos hemos perdido entre estantes.</h1>
        <a className="primary-button" href="#/inicio">Volver a la biblioteca <span>→</span></a>
      </main>
    )
  }

  return (
    <div className="app-shell">
      <SiteHeader
        loading={auth.loading}
        onLogout={handleLogout}
        route={route}
        user={auth.user}
      />
      {notice && (
        <div className="site-notice" role="status">
          <span>{notice}</span>
          <button
            aria-label="Cerrar aviso"
            onClick={() => setNotice('')}
            type="button"
          >
            ×
          </button>
        </div>
      )}
      {page}
      <SiteFooter />
    </div>
  )
}

export default App
