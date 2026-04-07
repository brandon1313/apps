import { CloseOutlined, MenuOutlined } from '@ant-design/icons'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { crestUrl, navItems } from '../constants'

export function PosterNav() {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => {
    setMenuOpen(false)
  }

  return (
    <header className="poster-nav">
      <div className="poster-nav__shell">
        <div className="poster-nav__inner">
          <a href="#hero" className="poster-nav__brand" onClick={closeMenu}>
            <img src={crestUrl} alt="Escudo municipal" className="poster-nav__crest" />
            <div>
              <span className="poster-nav__eyebrow">Municipalidad de</span>
              <span className="poster-nav__name">San Juan Sacatepequez</span>
            </div>
          </a>

          <nav className="poster-nav__links">
            {navItems.map(([label, href]) => (
              <a
                key={label}
                href={href}
                {...(href.startsWith('/') ? {} : {})}
              >
                {label}
              </a>
            ))}
          </nav>

          <button
            type="button"
            className="poster-nav__toggle"
            aria-label={menuOpen ? 'Cerrar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            aria-controls="poster-mobile-menu"
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <CloseOutlined /> : <MenuOutlined />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen ? (
            <motion.nav
              id="poster-mobile-menu"
              className="poster-nav__mobile-menu"
              initial={{ opacity: 0, y: -14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {navItems.map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  onClick={closeMenu}
                  {...(href.startsWith('/') ? {} : {})}
                >
                  {label}
                </a>
              ))}
            </motion.nav>
          ) : null}
        </AnimatePresence>
      </div>
    </header>
  )
}
