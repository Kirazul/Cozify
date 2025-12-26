import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import './Spotlight.css'

export default function Spotlight({ items }) {
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const goToSlide = useCallback((index) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrent(index)
    setTimeout(() => setIsTransitioning(false), 500)
  }, [isTransitioning])

  const nextSlide = useCallback(() => {
    if (!items?.length) return
    goToSlide((current + 1) % items.length)
  }, [current, items, goToSlide])

  useEffect(() => {
    if (!items?.length) return
    const timer = setInterval(nextSlide, 6000)
    return () => clearInterval(timer)
  }, [items, nextSlide])

  if (!items?.length) return null

  const item = items[current]

  return (
    <div className="spotlight">
      <div className="spotlight-slides">
        {items.slice(0, 6).map((slide, index) => (
          <div 
            key={slide.id} 
            className={`spotlight-slide ${index === current ? 'active' : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          />
        ))}
      </div>
      <div className="spotlight-overlay" />
      
      <div className="spotlight-content container">
        <div className={`spotlight-info ${isTransitioning ? 'transitioning' : ''}`}>
          <span className="spotlight-rank">#{current + 1} Spotlight</span>
          <h1 className="spotlight-title">{item.title}</h1>
          
          <div className="spotlight-meta">
            {item.type && <span className="meta-tag">{item.type}</span>}
            {item.duration && <span className="meta-tag">{item.duration}</span>}
            {item.releaseDate && <span className="meta-tag">{item.releaseDate}</span>}
            {item.quality && <span className="badge badge-hd">{item.quality}</span>}
            {item.subEpisodes && <span className="badge badge-sub">{item.subEpisodes}</span>}
            {item.dubEpisodes && <span className="badge badge-dub">{item.dubEpisodes}</span>}
          </div>

          {item.description && (
            <p className="spotlight-desc">{item.description}</p>
          )}

          <div className="spotlight-actions">
            <Link to={`/anime/${item.id}`} className="btn-watch">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Watch Now
            </Link>
            <Link to={`/anime/${item.id}`} className="btn-detail">
              Detail
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <div className="spotlight-nav">
        {items.slice(0, 6).map((_, i) => (
          <button
            key={i}
            className={`nav-dot ${i === current ? 'active' : ''}`}
            onClick={() => goToSlide(i)}
          />
        ))}
      </div>

      <div className="spotlight-arrows">
        <button 
          className="arrow-btn" 
          onClick={() => goToSlide(current === 0 ? items.length - 1 : current - 1)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <button 
          className="arrow-btn" 
          onClick={() => goToSlide((current + 1) % items.length)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
