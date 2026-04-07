import { crestUrl } from '../constants'

export function LandingFooter() {
  return (
    <footer className="poster-footer">
      <div className="poster-footer__inner">
        <img src={crestUrl} alt="Escudo municipal" />
        <p>San Juan Sacatepequez, Guatemala</p>
      </div>
    </footer>
  )
}
