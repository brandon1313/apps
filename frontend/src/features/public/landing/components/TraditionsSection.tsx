import { motion } from 'framer-motion'
import { traditionItems } from '../constants'
import { Reveal, RevealGroup, revealContainer, revealItem } from './Reveal'

export function TraditionsSection() {
  return (
    <section id="traditions" className="poster-section poster-section--deep">
      <RevealGroup className="poster-shell">
        <Reveal className="poster-section__heading">
          <span className="poster-kicker">Tradiciones</span>
          <h2>Celebración, marimba y memoria local</h2>
          <p>
            La fiesta patronal, los mercados y las prácticas comunitarias mantienen viva la identidad cultural del municipio. La marimba, las tradiciones y la gastronomía son parte del orgullo de San Juan Sacatepequez.
          </p>
        </Reveal>

        <motion.div variants={revealContainer} className="poster-traditions">
          {traditionItems.map((item) => (
            <motion.article key={item.title} variants={revealItem} className="poster-tradition-card">
              <div className="poster-tradition-card__image-wrap">
                <img src={item.image} alt={item.title} className="poster-tradition-card__image" />
                <div className="poster-tradition-card__image-overlay" />
              </div>
              <span className="poster-tradition-card__label">{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </motion.article>
          ))}
        </motion.div>
      </RevealGroup>
    </section>
  )
}
