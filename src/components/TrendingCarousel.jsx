import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getHighQualityImage } from '../utils/imageUtils'
import './TrendingCarousel.css'

export default function TrendingCarousel({ items, title = "Trending" }) {
  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  const scroll = (dir) => {
    const el = scrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.8
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  if (!items?.length) return null

  return (
    <section className="trending-section">
      <div className="trending-header">
        <h2>{title}</h2>
        <div className="trending-arrows">
          <button 
            className="arrow-btn" 
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <button 
            className="arrow-btn" 
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>

      <div 
        className="trending-scroll" 
        ref={scrollRef}
        onScroll={checkScroll}
      >
        {items.slice(0, 10).map((anime, index) => (
          <Link 
            key={anime.id} 
            to={`/anime/${anime.id}`} 
            className="trending-card"
          >
            <div className="trending-rank">{String(index + 1).padStart(2, '0')}</div>
            <div className="trending-image">
              <img src={getHighQualityImage(anime.image)} alt={anime.title} loading="lazy" />
              <div className="trending-overlay">
                <div className="trending-play">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              <div className="trending-badges">
                {anime.subEpisodes && (
                  <span className="badge badge-sub">{anime.subEpisodes}</span>
                )}
                {anime.dubEpisodes && (
                  <span className="badge badge-dub">{anime.dubEpisodes}</span>
                )}
              </div>
            </div>
            <div className="trending-info">
              <h3>{anime.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
