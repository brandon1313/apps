import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { identityCards, identityHoverImages } from '../constants'
import { Reveal, RevealGroup, revealContainer, revealItem } from './Reveal'

type IdentityHoverKey = keyof typeof identityHoverImages

export function IdentitySection() {
  const identityHoverTimeoutRef = useRef<number | null>(null)
  const [identityHover, setIdentityHover] = useState<IdentityHoverKey | null>(null)

  useEffect(() => {
    return () => {
      if (identityHoverTimeoutRef.current) {
        window.clearTimeout(identityHoverTimeoutRef.current)
      }
    }
  }, [])

  const showIdentityHover = (key: IdentityHoverKey) => {
    if (identityHoverTimeoutRef.current) {
      window.clearTimeout(identityHoverTimeoutRef.current)
      identityHoverTimeoutRef.current = null
    }

    setIdentityHover(key)
  }

  const clearIdentityHover = () => {
    if (identityHoverTimeoutRef.current) {
      window.clearTimeout(identityHoverTimeoutRef.current)
    }

    identityHoverTimeoutRef.current = window.setTimeout(() => {
      setIdentityHover(null)
      identityHoverTimeoutRef.current = null
    }, 140)
  }

  return (
    <section id="identity" className="poster-section poster-section--navy">
      <div className="poster-section__bg-stack" aria-hidden="true">
        <AnimatePresence initial={false} mode="sync">
          {identityHover ? (
            <motion.div
              key={identityHoverImages[identityHover]}
              className="poster-section__bg-layer poster-section__bg-layer--visible"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(5, 8, 58, 0.16), rgba(5, 8, 58, 0.58)), url(${identityHoverImages[identityHover]})`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
            />
          ) : null}
        </AnimatePresence>
      </div>

      <RevealGroup className="poster-shell poster-shell--identity">
        <Reveal className="poster-section__heading">
          <span className="poster-kicker">Identidad</span>
          <h2>Identidad, territorio y cultura viva</h2>
          <p>
            San Juan Sacatepequez es un municipio con identidad propia: cultura Kaqchikel, flores reconocidas en todo el país, y una gestión municipal enfocada en el bienestar de sus comunidades.
          </p>
        </Reveal>

        <motion.div
          variants={revealContainer}
          className="poster-info-grid"
          onMouseLeave={clearIdentityHover}
        >
          {identityCards.map((item) => (
            <motion.article
              key={item.title}
              variants={revealItem}
              className="poster-info-card"
              onMouseEnter={() => showIdentityHover(item.key)}
            >
              <span className="poster-info-card__bar" />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </motion.article>
          ))}
        </motion.div>
      </RevealGroup>
    </section>
  )
}
