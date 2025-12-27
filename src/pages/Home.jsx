import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useLoading } from '../contexts/LoadingContext'
import { getHighQualityImage } from '../utils/imageUtils'
import './Home.css'

// Get 4K quality image URL
function get4KImage(url) {
  if (!url) return '';
  // Try to get highest quality from various CDNs
  return url
    .replace(/\/small\//, '/large/')
    .replace(/\/medium\//, '/large/')
    .replace(/\?.*$/, '') // Remove query params that might limit quality
    .replace(/w=\d+/, 'w=1920')
    .replace(/h=\d+/, 'h=1080');
}

export default function Home() {
  const { setPageLoaded } = useLoading()
  const [spotlight, setSpotlight] = useState([])
  const [topAiring, setTopAiring] = useState([])
  const [recent, setRecent] = useState([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [slideDirection, setSlideDirection] = useState('next')
  const [isAnimating, setIsAnimating] = useState(false)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [spotlightData, topAiringData, recentData] = await Promise.all([
          api.getSpotlight(),
          api.getTopAiring(),
          api.getRecentEpisodes()
        ])
        setSpotlight(spotlightData.results || spotlightData || [])
        setTopAiring(topAiringData.results || [])
        setRecent(recentData.results || [])
      } catch (error) {
        console.error('Failed to fetch:', error)
      } finally {
        setLoading(false)
        setPageLoaded(true)
      }
    }
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const maxSlides = Math.min(spotlight.length, 10)

  useEffect(() => {
    if (!spotlight.length) return
    const timer = setInterval(() => {
      goToNext()
    }, 6000)
    return () => clearInterval(timer)
  }, [spotlight, current])

  const goToNext = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setSlideDirection('next')
    setCurrent(c => (c + 1) % maxSlides)
    setTimeout(() => setIsAnimating(false), 600)
  }

  const goToPrev = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setSlideDirection('prev')
    setCurrent(c => c === 0 ? maxSlides - 1 : c - 1)
    setTimeout(() => setIsAnimating(false), 600)
  }

  const goToSlide = (index) => {
    if (isAnimating || index === current) return
    setIsAnimating(true)
    setSlideDirection(index > current ? 'next' : 'prev')
    setCurrent(index)
    setTimeout(() => setIsAnimating(false), 600)
  }

  // Touch handlers for swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToNext()
      else goToPrev()
    }
  }

  const hero = spotlight[current]

  return (
    <div className="home">
      {/* Hero Section with integrated header space */}
      <section 
        className="hero"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="hero-slides">
          {spotlight.slice(0, 10).map((item, i) => (
            <div 
              key={item.id}
              className={`hero-slide ${i === current ? 'active' : ''} ${slideDirection}`}
              style={{ backgroundImage: `url(${get4KImage(item.image)})` }}
            />
          ))}
        </div>
        <div className="hero-overlay" />
        
        {hero && (
          <div className={`hero-content ${isAnimating ? 'animating' : ''}`}>
            <h1 className="hero-title">{hero.title}</h1>
            <div className="hero-meta">
              {hero.type && <span>{hero.type}</span>}
              {hero.duration && <span>{hero.duration}</span>}
              {hero.releaseDate && <span>{hero.releaseDate}</span>}
              <div className="hero-tags">
                {hero.subEpisodes && <span className="tag tag-sub">{hero.subEpisodes}</span>}
                {hero.dubEpisodes && <span className="tag tag-dub">{hero.dubEpisodes}</span>}
              </div>
            </div>
            {hero.description && <p className="hero-desc">{hero.description}</p>}
            <div className="hero-actions">
              <Link to={`/anime/${hero.id}`} className="btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Watch Now
              </Link>
              <Link to={`/anime/${hero.id}`} className="btn-secondary">Detail</Link>
            </div>
          </div>
        )}

        <div className="hero-dots">
          {spotlight.slice(0, 10).map((_, i) => (
            <button 
              key={i} 
              className={`dot ${i === current ? 'active' : ''}`}
              onClick={() => goToSlide(i)}
            />
          ))}
        </div>

        <button className="hero-arrow left" onClick={goToPrev}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <button className="hero-arrow right" onClick={goToNext}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </button>
      </section>

      {/* Trending Section */}
      <section className="section">
        <div className="container">
          <div className="section-title-center">
            <h2 className="section-title">Trending Now</h2>
          </div>
          <div className="trending-row">
            {topAiring.slice(0, 10).map((anime, i) => (
              <Link key={anime.id} to={`/anime/${anime.id}`} className="trending-item">
                <span className="trending-rank">{String(i + 1).padStart(2, '0')}</span>
                <div className="trending-poster">
                  <img src={getHighQualityImage(anime.image)} alt={anime.title} loading="lazy" />
                  <div className="trending-hover">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
                <h3>{anime.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Episodes */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Latest Episodes</h2>
            <Link to="/browse" className="see-all">See all</Link>
          </div>
          <div className="anime-grid">
            {loading ? (
              Array(12).fill(0).map((_, i) => <div key={i} className="card-skeleton" />)
            ) : (
              recent.slice(0, 22).map(anime => (
                <Link key={anime.id} to={`/anime/${anime.id}`} className="anime-card">
                  <div className="card-poster">
                    <img src={getHighQualityImage(anime.image)} alt={anime.title} loading="lazy" />
                    <div className="card-overlay">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <div className="card-badges">
                      {anime.subEpisodes && <span className="tag tag-sub">{anime.subEpisodes}</span>}
                      {anime.dubEpisodes && <span className="tag tag-dub">{anime.dubEpisodes}</span>}
                    </div>
                    {anime.rating && (
                      <div className="card-rating">
                        <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                        {anime.rating}
                      </div>
                    )}
                  </div>
                  <h3>{anime.title}</h3>
                  <span className="card-type">{anime.type}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Top Airing with Sidebar Layout */}
      <section className="section section-dark">
        <div className="container">
          <div className="split-layout">
            <div className="split-main">
              <div className="section-header">
                <h2 className="section-title">Top Airing</h2>
                <Link to="/browse" className="see-all">See all</Link>
              </div>
              <div className="anime-grid">
                {topAiring.slice(0, 16).map(anime => (
                  <Link key={anime.id} to={`/anime/${anime.id}`} className="anime-card">
                    <div className="card-poster">
                      <img src={getHighQualityImage(anime.image)} alt={anime.title} loading="lazy" />
                      <div className="card-overlay">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                      <div className="card-badges">
                        {anime.subEpisodes && <span className="tag tag-sub">{anime.subEpisodes}</span>}
                        {anime.dubEpisodes && <span className="tag tag-dub">{anime.dubEpisodes}</span>}
                      </div>
                      {anime.rating && (
                        <div className="card-rating">
                          <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                          {anime.rating}
                        </div>
                      )}
                    </div>
                    <h3>{anime.title}</h3>
                    <span className="card-type">{anime.type}</span>
                  </Link>
                ))}
              </div>
            </div>

            <aside className="split-sidebar">
              <div className="top-list">
                <h3 className="top-list-title">Top 5 This Week</h3>
                {topAiring.slice(0, 5).map((anime, i) => (
                  <Link key={anime.id} to={`/anime/${anime.id}`} className="top-item">
                    <span className={`top-rank ${i < 3 ? 'gold' : ''}`}>{i + 1}</span>
                    <img src={getHighQualityImage(anime.image)} alt={anime.title} />
                    <div className="top-info">
                      <h4>{anime.title}</h4>
                      <div className="top-meta">
                        {anime.subEpisodes && <span className="tag tag-sub">{anime.subEpisodes}</span>}
                        <span>{anime.type}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Schedule Preview */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Airing Schedule</h2>
            <Link to="/schedule" className="see-all">Full Schedule</Link>
          </div>
          <div className="schedule-preview">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
              <Link key={day} to="/schedule" className={`schedule-day ${i === new Date().getDay() - 1 ? 'today' : ''}`}>
                <span className="day-name">{day}</span>
                <span className="day-count">{Math.floor(Math.random() * 15) + 5}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
