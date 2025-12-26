import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import './AnimeCard.css'

export default function AnimeCard({ anime, index = 0 }) {
  const { id, title, image, type, episodes, subEpisodes, dubEpisodes, duration, description, genres, status, rating, japaneseTitle, aired } = anime
  const [showPopup, setShowPopup] = useState(false)
  const [popupSide, setPopupSide] = useState('right')
  const cardRef = useRef(null)
  const timerRef = useRef(null)

  const handleEnter = () => {
    timerRef.current = setTimeout(() => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect()
        setPopupSide(window.innerWidth - rect.right < 320 ? 'left' : 'right')
      }
      setShowPopup(true)
    }, 400)
  }

  const handleLeave = () => {
    clearTimeout(timerRef.current)
    setShowPopup(false)
  }

  const epCount = subEpisodes || episodes

  return (
    <div 
      ref={cardRef}
      className="card-wrapper"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <Link to={`/anime/${id}`} className="card">
        <div className="card-image">
          <img src={image} alt={title} loading="lazy" />
          
          <div className="card-overlay">
            <div className="card-play">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>

          <div className="card-badges">
            {epCount && (
              <span className="badge badge-sub">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/>
                </svg>
                {epCount}
              </span>
            )}
            {dubEpisodes && (
              <span className="badge badge-dub">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                </svg>
                {dubEpisodes}
              </span>
            )}
          </div>

          {rating && (
            <div className="card-rating">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
              {rating}
            </div>
          )}
        </div>

        <div className="card-info">
          <h3 className="card-title">{title}</h3>
          <div className="card-meta">
            {type && <span>{type}</span>}
            {duration && <span>{duration}</span>}
          </div>
        </div>
      </Link>

      {showPopup && (
        <div className={`card-popup ${popupSide}`}>
          <h3 className="popup-title">{title}</h3>
          
          <div className="popup-meta">
            {rating && (
              <span className="popup-rating">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
                {rating}
              </span>
            )}
            <span className="badge badge-hd">HD</span>
            {epCount && <span className="badge badge-sub">{epCount}</span>}
            {type && <span className="badge badge-eps">{type}</span>}
          </div>

          {description && <p className="popup-desc">{description}</p>}

          <div className="popup-details">
            {japaneseTitle && (
              <div className="popup-row">
                <span className="row-label">Japanese:</span>
                <span>{japaneseTitle}</span>
              </div>
            )}
            {aired && (
              <div className="popup-row">
                <span className="row-label">Aired:</span>
                <span>{aired}</span>
              </div>
            )}
            {status && (
              <div className="popup-row">
                <span className="row-label">Status:</span>
                <span className="status-text">{status}</span>
              </div>
            )}
            {genres?.length > 0 && (
              <div className="popup-row">
                <span className="row-label">Genres:</span>
                <span>{genres.slice(0, 3).join(', ')}</span>
              </div>
            )}
          </div>

          <div className="popup-actions">
            <Link to={`/anime/${id}`} className="popup-watch">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Watch now
            </Link>
            <button className="popup-add">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function AnimeCardSkeleton() {
  return (
    <div className="card">
      <div className="card-image skeleton"></div>
      <div className="card-info">
        <div className="skeleton" style={{ height: 14, width: '85%', marginBottom: 6 }}></div>
        <div className="skeleton" style={{ height: 12, width: '55%' }}></div>
      </div>
    </div>
  )
}
