import { Link } from 'react-router-dom'
import './ContinueWatching.css'

export default function ContinueWatching({ items }) {
  if (!items?.length) return null

  return (
    <section className="continue-section">
      <div className="section-header">
        <div className="section-title-group">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="section-icon">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
          </svg>
          <h2>Continue Watching</h2>
        </div>
        <Link to="/history" className="view-all">
          View all
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </Link>
      </div>
      <div className="continue-grid">
        {items.slice(0, 6).map((item) => (
          <Link key={item.id} to={`/watch/${item.animeId}/${item.episodeId}`} className="continue-card">
            <div className="continue-poster">
              <img src={item.image} alt={item.title} />
              <div className="continue-overlay">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <div className="continue-progress">
                <div className="progress-bar" style={{ width: `${item.progress || 45}%` }} />
              </div>
            </div>
            <div className="continue-info">
              <h4>{item.title}</h4>
              <span>Episode {item.episode}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
