import { mayor } from '../constants'
import { Reveal, RevealGroup } from './Reveal'

export function MayorSection() {
  return (
    <section id="mayor" className="poster-section poster-section--mayor">
      <RevealGroup className="poster-shell">
        <div className="poster-mayor">
          <Reveal className="poster-mayor__photo-wrap">
            <img src={mayor.image} alt={`Alcalde ${mayor.name}`} className="poster-mayor__photo" />
          </Reveal>
          <Reveal className="poster-mayor__text">
            <span className="poster-kicker">Gobierno municipal</span>
            <h2>{mayor.name}</h2>
            <p className="poster-mayor__role">{mayor.role}</p>
            <blockquote>{mayor.quote}</blockquote>
            <p className="poster-mayor__summary">{mayor.summary}</p>
          </Reveal>
        </div>
      </RevealGroup>
    </section>
  )
}
