import AnimeCard, { AnimeCardSkeleton } from './AnimeCard'
import { Link } from 'react-router-dom'
import './AnimeGrid.css'

export default function AnimeGrid({ title, items, loading, viewAll }) {
  return (
    <section className="anime-section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        {viewAll && (
          <Link to={viewAll} className="view-all">
            View more
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </Link>
        )}
      </div>
      <div className="anime-grid">
        {loading
          ? Array(12).fill(0).map((_, i) => <AnimeCardSkeleton key={i} />)
          : items?.map((anime) => <AnimeCard key={anime.id} anime={anime} />)
        }
      </div>
    </section>
  )
}
