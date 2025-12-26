import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getHighQualityImage } from '../utils/imageUtils'
import './TopTen.css'

export default function TopTen({ items, title = "Top 10" }) {
  const [period, setPeriod] = useState('today')

  if (!items?.length) return null

  return (
    <div className="top-ten">
      <div className="top-ten-header">
        <h3>{title}</h3>
        <div className="top-ten-tabs">
          <button 
            className={period === 'today' ? 'active' : ''} 
            onClick={() => setPeriod('today')}
          >
            Today
          </button>
          <button 
            className={period === 'week' ? 'active' : ''} 
            onClick={() => setPeriod('week')}
          >
            Week
          </button>
          <button 
            className={period === 'month' ? 'active' : ''} 
            onClick={() => setPeriod('month')}
          >
            Month
          </button>
        </div>
      </div>
      <div className="top-ten-list">
        {items.slice(0, 10).map((anime, index) => (
          <Link key={anime.id} to={`/anime/${anime.id}`} className="top-ten-item">
            <div className={`rank-wrapper rank-${index + 1}`}>
              <span className="rank">{String(index + 1).padStart(2, '0')}</span>
            </div>
            <img src={getHighQualityImage(anime.image)} alt={anime.title} className="top-ten-img" />
            <div className="top-ten-info">
              <h4>{anime.title}</h4>
              <div className="top-ten-badges">
                {anime.episodes && (
                  <span className="badge badge-sub">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/>
                    </svg>
                    {anime.episodes}
                  </span>
                )}
                {anime.dubEpisodes && (
                  <span className="badge badge-dub">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    </svg>
                    {anime.dubEpisodes}
                  </span>
                )}
                {anime.type && <span className="top-ten-type">{anime.type}</span>}
              </div>
            </div>
            <button className="top-ten-add" onClick={(e) => e.preventDefault()}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
          </Link>
        ))}
      </div>
    </div>
  )
}
