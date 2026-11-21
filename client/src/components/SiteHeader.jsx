const guestLinks = [
  { href: '#/inicio', label: 'Inicio' },
  { href: '#/descubrir', label: 'Descubrir' },
]

const memberLinks = [
  { href: '#/para-ti', label: 'Para ti' },
  { href: '#/descubrir', label: 'Explorar' },
  { href: '#/estante', label: 'Mi estante' },
  { href: '#/gustos', label: 'Mis gustos' },
]

function SiteHeader({ user, loading, onLogout, route }) {
  const links = user ? memberLinks : guestLinks

  return (
    <header className="site-header">
      <a className="brand" href="#/inicio" aria-label="Entre Líneas, inicio">
        <span className="brand-mark" aria-hidden="true">E</span>
        <span className="brand-words">
          entre líneas
          <small>la biblioteca de medianoche</small>
        </span>
      </a>

      <nav className="main-nav" aria-label="Navegación principal">
        {links.map((link) => (
          <a
            aria-current={
              route === link.href.slice(1) ||
              (user && link.href === '#/para-ti' && route === '/inicio')
                ? 'page'
                : undefined
            }
            className="nav-link"
            href={link.href}
            key={link.href}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="header-account">
        {loading ? (
          <span className="account-loading" aria-label="Cargando perfil" />
        ) : user ? (
          <>
            <a className="account-chip" href="#/gustos">
              <span className="account-avatar" aria-hidden="true">
                {user.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="account-name">{user.name.split(' ')[0]}</span>
            </a>
            <button className="logout-button" type="button" onClick={onLogout}>
              Salir
            </button>
          </>
        ) : (
          <>
            <a className="login-link" href="#/acceso">Entrar</a>
            <a className="join-button" href="#/registro">Crear cuenta</a>
          </>
        )}
      </div>
    </header>
  )
}

export default SiteHeader
