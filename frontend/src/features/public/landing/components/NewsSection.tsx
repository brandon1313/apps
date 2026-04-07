import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ExportOutlined } from '@ant-design/icons'
import { fetchPublicNews } from '@/shared/api/news'
import type { NewsPost } from '@/shared/api/types'
import { formatDate } from '@/shared/lib/format'
import { municipalLogoUrl, newsItems } from '../constants'
import { Reveal, RevealGroup, revealContainer, revealItem } from './Reveal'

export function NewsSection() {
  const [apiNews, setApiNews] = useState<NewsPost[]>([])

  useEffect(() => {
    void fetchPublicNews()
      .then((posts) => {
        setApiNews(posts.filter((p) => p.status === 'PUBLISHED').slice(0, 4))
      })
      .catch(() => {})
  }, [])

  const showApiNews = apiNews.length > 0

  return (
    <section id="news" className="poster-section poster-section--news">
      <RevealGroup className="poster-shell">
        <div className="poster-news-top">
          <Reveal className="poster-section__heading">
            <span className="poster-kicker">Noticias municipales</span>
            <h2>Proyectos y actualidad municipal</h2>
            <p>
              Mantente informado sobre los proyectos, obras e iniciativas más recientes de la Municipalidad de San Juan Sacatepequez.
            </p>
          </Reveal>

          <Reveal className="poster-logo-panel">
            <img
              src={municipalLogoUrl}
              alt="Logotipo oficial de la Municipalidad de San Juan Sacatepequez"
              className="poster-logo-panel__logo"
            />
            <div>
              <span className="poster-kicker">Logotipo oficial</span>
              <p className="poster-logo-panel__title">Municipalidad de San Juan Sacatepequez</p>
              <Link to="/news">Ver todas las noticias</Link>
            </div>
          </Reveal>
        </div>

        <motion.div variants={revealContainer} className="poster-news-grid">
          {showApiNews
            ? apiNews.map((item) => (
                <motion.div key={item.id} variants={revealItem}>
                  <Link
                    to={`/news/${item.slug}`}
                    className="poster-news-card"
                    aria-label={item.title}
                  >
                    <div className="poster-news-card__media">
                      {item.coverImageUrl ? (
                        <img src={item.coverImageUrl} alt={item.title} />
                      ) : null}
                      <div className="poster-news-card__overlay" />
                      <span className="poster-news-card__category">Institucional</span>
                    </div>
                    <div className="poster-news-card__body">
                      <span className="poster-news-card__date">
                        {item.publishedAt ? formatDate(item.publishedAt) : ''}
                      </span>
                      <h3>{item.title}</h3>
                      <p>{item.summary}</p>
                      <strong>Leer más</strong>
                    </div>
                  </Link>
                </motion.div>
              ))
            : newsItems.map((item) => (
                <motion.a
                  key={item.title}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  variants={revealItem}
                  className="poster-news-card"
                  aria-label={`${item.title} (abre en nueva pestaña)`}
                >
                  <div className="poster-news-card__media">
                    <img src={item.image} alt={item.title} />
                    <div className="poster-news-card__overlay" />
                    <span className="poster-news-card__category">{item.category}</span>
                  </div>
                  <div className="poster-news-card__body">
                    <span className="poster-news-card__date">{item.date}</span>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                    <strong>Leer más <ExportOutlined aria-hidden="true" /></strong>
                  </div>
                </motion.a>
              ))
          }
        </motion.div>
      </RevealGroup>
    </section>
  )
}
