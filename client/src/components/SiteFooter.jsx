function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-ornament" aria-hidden="true">✦</div>
      <a className="brand footer-brand" href="#/inicio">
        <span className="brand-mark" aria-hidden="true">E</span>
        <span className="brand-words">entre líneas</span>
      </a>
      <p>Hecho para quienes encuentran refugio entre páginas.</p>
      <span className="footer-credit">React · Express · Open Library</span>
    </footer>
  )
}

export default SiteFooter
