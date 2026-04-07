import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { heroCycleWords, heroSlides, municipalLogoUrl } from '../constants'
import { useHeroTypewriter } from '../hooks/useHeroTypewriter'
import { Reveal, RevealGroup } from './Reveal'

export function HeroSection() {
  const heroRef = useRef<HTMLElement | null>(null)
  const typedHeroWord = useHeroTypewriter(heroCycleWords)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  const heroBgY = useTransform(scrollYProgress, [0, 1], [0, 160])
  const heroOverlayY = useTransform(scrollYProgress, [0, 1], [0, 90])

  return (
    <section id="hero" ref={heroRef} className="poster-hero">
      <motion.div className="poster-hero__bg-track" style={{ y: heroBgY }}>
        {heroSlides.map((image, index) => (
          <motion.div
            key={image}
            className="poster-hero__bg"
            style={{ backgroundImage: `url(${image})` }}
            initial={{ opacity: index === 0 ? 1 : 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 6,
            }}
          />
        ))}
      </motion.div>

      <motion.div className="poster-hero__overlay" style={{ y: heroOverlayY }} />
      <div className="poster-hero__vignette" />

      <RevealGroup className="poster-hero__content">
        <Reveal className="poster-hero__logo-lockup">
          <img
            src={municipalLogoUrl}
            alt="Logotipo de la Municipalidad de San Juan Sacatepequez"
            className="poster-hero__logo"
          />
          <div className="poster-hero__municipality">
            <span>Municipalidad de</span>
          </div>
        </Reveal>

        <Reveal>
          <div className="poster-hero__title">
            San Juan Sacatepequez
            <span className="poster-hero__cycle">
              <span className="poster-hero__cycle-item">
                <span className="poster-hero__cycle-word">
                  {typedHeroWord}
                  <span className="poster-hero__cycle-caret" aria-hidden="true" />
                </span>
              </span>
            </span>
          </div>
        </Reveal>

        <Reveal>
          <div className="poster-hero__ribbon poster-hero__ribbon--top">
            Avanza con obras, identidad y comunidad
          </div>
        </Reveal>

        <Reveal>
          <p className="poster-hero__subtitle">
            Servicios municipales digitales al alcance de todos los vecinos de San Juan Sacatepequez.
          </p>
        </Reveal>

        <Reveal className="poster-hero__cta-row">
          <a href="#news" className="poster-button poster-button--primary">
            Ver noticias
          </a>
          <a href="#mayor" className="poster-button poster-button--secondary">
            Conocer al alcalde
          </a>
        </Reveal>

        <Reveal className="poster-hero__lower-badge">
          <span className="poster-hero__lower-badge-label">Enfoque actual</span>
          <strong>PROYECTOS MUNICIPALES</strong>
        </Reveal>
      </RevealGroup>
    </section>
  )
}
