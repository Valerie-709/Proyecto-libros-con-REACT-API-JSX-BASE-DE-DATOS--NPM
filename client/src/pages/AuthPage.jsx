import { useState } from 'react'

function AuthPage({ mode, onLogin, onRegister }) {
  const isRegister = mode === 'register'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      if (isRegister) {
        await onRegister({ name, email, password })
        window.location.hash = '#/gustos'
      } else {
        await onLogin({ email, password })
        window.location.hash = '#/para-ti'
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No fue posible acceder. Inténtalo de nuevo.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-image" aria-hidden="true">
        <div className="auth-image-caption">
          <span>«</span>
          <p>Hay lugares a los que solo se llega leyendo.</p>
          <small>Un rincón para cada lector</small>
        </div>
      </div>

      <section className="auth-panel">
        <a className="auth-back" href="#/inicio">
          <span aria-hidden="true">←</span> Volver al inicio
        </a>
        <div className="auth-form-wrap">
          <span className="auth-symbol" aria-hidden="true">✧</span>
          <p className="eyebrow">{isRegister ? 'Tu rincón personal' : 'Qué bueno verte'}</p>
          <h1>{isRegister ? 'Abre tu cuenta.' : 'Vuelve a tu estante.'}</h1>
          <p className="auth-intro">
            {isRegister
              ? 'Guardaremos tus gustos para que cada visita empiece con una historia a tu medida.'
              : 'Tus lecturas favoritas y recomendaciones te están esperando.'}
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegister && (
              <label className="form-field">
                <span>Nombre</span>
                <input
                  autoComplete="name"
                  maxLength={50}
                  minLength={2}
                  name="name"
                  onChange={(event) => setName(event.target.value)}
                  placeholder="¿Cómo te llamamos?"
                  required
                  value={name}
                />
              </label>
            )}
            <label className="form-field">
              <span>Correo electrónico</span>
              <input
                autoComplete="email"
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="tu@correo.com"
                required
                type="email"
                value={email}
              />
            </label>
            <label className="form-field">
              <span>Contraseña</span>
              <input
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                maxLength={72}
                minLength={isRegister ? 8 : undefined}
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder={isRegister ? 'Mínimo 8 caracteres' : 'Tu contraseña'}
                required
                type="password"
                value={password}
              />
            </label>

            {error && <p className="form-error" role="alert">{error}</p>}

            <button className="primary-button auth-submit" disabled={submitting}>
              {submitting
                ? 'Un momento…'
                : isRegister
                  ? 'Crear mi cuenta'
                  : 'Entrar a mi biblioteca'}
              {!submitting && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <p className="auth-switch">
            {isRegister ? '¿Ya tienes una cuenta?' : '¿Aún no tienes cuenta?'}
            {' '}
            <a href={isRegister ? '#/acceso' : '#/registro'}>
              {isRegister ? 'Inicia sesión' : 'Crea una aquí'}
            </a>
          </p>
          <p className="local-account-note">
            Las cuentas y preferencias se guardan en esta instalación local.
          </p>
        </div>
      </section>
    </main>
  )
}

export default AuthPage
