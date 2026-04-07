import { Spin, Alert } from 'antd'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchPublicNewsBySlug } from '@/shared/api/news'
import type { NewsPost } from '@/shared/api/types'
import { PosterNav } from '@/features/public/landing/components/PosterNav'
import { LandingFooter } from '@/features/public/landing/components/LandingFooter'
import { RichTextEditor } from '@/shared/components/editor/RichTextEditor'

export function PublicNewsDetailPage() {
  const { slug = '' } = useParams()
  const [item, setItem] = useState<NewsPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        setItem(await fetchPublicNewsBySlug(slug))
      } catch {
        setError('No fue posible cargar la noticia solicitada.')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [slug])

  return (
    <div className="poster-app">
      <PosterNav />
      <main className="poster-shell py-12">
        <Link to="/news" className="news-detail__back">
          ← Volver a noticias
        </Link>

        {loading && (
          <div className="flex justify-center py-24">
            <Spin size="large" />
          </div>
        )}

        {error && <Alert type="error" message={error} style={{ marginTop: 24 }} />}

        {!loading && item && (
          <article className="news-detail">
            {item.coverImageUrl && (
              <div className="news-detail__hero">
                <img src={item.coverImageUrl} alt={item.title} />
              </div>
            )}

            <header className="news-detail__header">
              {item.publishedAt && (
                <span className="poster-kicker">
                  {new Date(item.publishedAt).toLocaleDateString('es-GT', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              )}
              <h1 className="news-detail__title">{item.title}</h1>
              {item.summary && (
                <p className="news-detail__lead">{item.summary}</p>
              )}
            </header>

            <hr className="news-detail__divider" />

            <div className="tiptap-content--public">
              <RichTextEditor value={item.content} readOnly />
            </div>
          </article>
        )}
      </main>
      <LandingFooter />
    </div>
  )
}
