import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api'
import { isEpisodeWatched } from '../services/userService'
import './Anime.css'

export default function Anime() {
  const { id } = useParams()
  const [anime, setAnime] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('episodes')

  useEffect(() => {
    const fetchAnime = async () => {
      setLoading(true)
      try {
        const data = await api.getAnimeInfo(id)
        setAnime(data)
      } catch (error) {
        console.error('Failed to fetch anime:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAnime()
    window.scrollTo(0, 0)
  }, [id])

  if (loading) {
    return (
      <div className="anime-page">
        <div className="anime-hero-skeleton" />
        <div className="container">
          <div className="anime-content-skeleton">
            <div className="skeleton poster-skeleton" />
            <div className="info-skeleton">
              <div className="skeleton" style={{ width: '70%', height: 32 }} />
              <div className="skeleton" style={{ width: '40%', height: 20, marginTop: 16 }} />
              <div className="skeleton" style={{ width: '100%', height: 80, marginTop: 20 }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!anime) {
    return (
      <div className="anime-page">
        <div className="container">
          <div className="anime-not-found">
            <h2>Anime not found</h2>
            <p>The anime you're looking for doesn't exist or has been removed.</p>
            <Link to="/" className="btn-primary">Back to Home</Link>
          </div>
        </div>
      </div>
    )
  }

  const episodes = anime.episodes || []
  const firstEpisode = episodes[0]

  return (
    <div className="anime-page">
      {/* Hero Banner */}
      <div className="anime-hero" style={{ backgroundImage: `url(${anime.image})` }}>
        <div className="anime-hero-overlay" />
      </div>

      <div className="container">
        <div className="anime-main">
          {/* Poster */}
          <div className="anime-poster">
            <img src={anime.image} alt={anime.title} />
            {firstEpisode && (
              <Link to={`/watch/${id}/${firstEpisode.id}`} className="poster-play">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </Link>
            )}
          </div>

          {/* Info */}
          <div className="anime-info">
            <div className="anime-badges">
              {anime.rating && (
                <span className="badge-rating">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                  {anime.rating}
                </span>
              )}
              {anime.quality && <span className="badge-quality">HD</span>}
              {anime.subEpisodes && <span className="badge-sub">{anime.subEpisodes} SUB</span>}
              {anime.dubEpisodes && <span className="badge-dub">{anime.dubEpisodes} DUB</span>}
            </div>

            <h1 className="anime-title">{anime.title}</h1>
            
            {anime.japaneseTitle && (
              <p className="anime-alt-title">{anime.japaneseTitle}</p>
            )}

            <div className="anime-meta">
              {anime.type && <span>{anime.type}</span>}
              {anime.duration && <span>{anime.duration}</span>}
              {anime.releaseDate && <span>{anime.releaseDate}</span>}
              {anime.status && (
                <span className={`status ${anime.status.toLowerCase().includes('ongoing') ? 'ongoing' : ''}`}>
                  {anime.status}
                </span>
              )}
            </div>

            <div className="anime-actions">
              {firstEpisode && (
                <Link to={`/watch/${id}/${firstEpisode.id}`} className="btn-watch">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Watch Now
                </Link>
              )}
              <button className="btn-list">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Add to List
              </button>
              <button className="btn-share">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
                </svg>
              </button>
            </div>

            {anime.description && (
              <div className="anime-synopsis">
                <h3>Synopsis</h3>
                <p>{anime.description}</p>
              </div>
            )}

            {anime.genres?.length > 0 && (
              <div className="anime-genres">
                {anime.genres.map((genre) => (
                  <Link key={genre} to={`/genre/${genre.toLowerCase()}`} className="genre-tag">
                    {genre}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Details */}
          <aside className="anime-sidebar">
            <div className="sidebar-card">
              <h3>Information</h3>
              <dl className="info-list">
                {anime.type && (
                  <>
                    <dt>Type</dt>
                    <dd>{anime.type}</dd>
                  </>
                )}
                {anime.releaseDate && (
                  <>
                    <dt>Premiered</dt>
                    <dd>{anime.releaseDate}</dd>
                  </>
                )}
                {anime.status && (
                  <>
                    <dt>Status</dt>
                    <dd>{anime.status}</dd>
                  </>
                )}
                {anime.duration && (
                  <>
                    <dt>Duration</dt>
                    <dd>{anime.duration}</dd>
                  </>
                )}
                {anime.studios?.length > 0 && (
                  <>
                    <dt>Studios</dt>
                    <dd>{anime.studios.join(', ')}</dd>
                  </>
                )}
                {episodes.length > 0 && (
                  <>
                    <dt>Episodes</dt>
                    <dd>{episodes.length}</dd>
                  </>
                )}
              </dl>
            </div>
          </aside>
        </div>

        {/* Episodes Section */}
        {episodes.length > 0 && (
          <section className="episodes-section">
            <div className="episodes-header">
              <h2>Episodes</h2>
              <span className="episode-count">{episodes.length} Episodes</span>
            </div>
            <div className="episodes-grid">
              {episodes.map((ep) => {
                const watched = isEpisodeWatched(ep.id)
                return (
                  <Link 
                    key={ep.id} 
                    to={`/watch/${id}/${ep.id}`}
                    className={`episode-card ${watched ? 'watched' : ''}`}
                    title={ep.title || `Episode ${ep.number || ep.episode}`}
                  >
                    <span className="ep-number">{ep.number || ep.episode}</span>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
