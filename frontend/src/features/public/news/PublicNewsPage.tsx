import { Spin } from 'antd'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchPublicNews } from '@/shared/api/news'
import type { NewsPost } from '@/shared/api/types'
import { PosterNav } from '@/features/public/landing/components/PosterNav'
import { LandingFooter } from '@/features/public/landing/components/LandingFooter'

export function PublicNewsPage() {
  const [items, setItems] = useState<NewsPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setItems(await fetchPublicNews())
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  return (
    <div className="poster-app">
      <PosterNav />
      <main id="news-main" className="poster-shell pt-28 pb-12">
        <h1 className="poster-section__heading mb-8">
          <span className="poster-kicker">Portal municipal</span>
          <span className="block text-3xl font-black tracking-tight text-white">Noticias publicas</span>
        </h1>
        {loading ? (
          <div className="flex justify-center py-16"><Spin size="large" /></div>
        ) : (
          <div className="poster-news-grid">
            {items.map((item) => (
              <Link
                key={item.slug}
                to={`/news/${item.slug}`}
                className="poster-news-card"
                aria-label={item.title}
              >
                <div className="poster-news-card__media">
                  <img src={item.coverImageUrl} alt={item.title} />
                  <div className="poster-news-card__overlay" />
                </div>
                <div className="poster-news-card__body">
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <strong>Leer detalle</strong>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <LandingFooter />
    </div>
  )
}
