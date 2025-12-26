import { Link } from 'react-router-dom'
import './GenreBar.css'

const POPULAR_GENRES = [
  { name: 'Action', color: '#ff6b6b' },
  { name: 'Romance', color: '#ff8fab' },
  { name: 'Comedy', color: '#ffd93d' },
  { name: 'Fantasy', color: '#6bcb77' },
  { name: 'Drama', color: '#4d96ff' },
  { name: 'Sci-Fi', color: '#9b59b6' },
  { name: 'Horror', color: '#e74c3c' },
  { name: 'Slice of Life', color: '#1abc9c' },
  { name: 'Sports', color: '#f39c12' },
  { name: 'Mystery', color: '#8e44ad' },
]

export default function GenreBar() {
  return (
    <div className="genre-bar">
      <div className="genre-bar-inner">
        {POPULAR_GENRES.map((genre) => (
          <Link 
            key={genre.name} 
            to={`/genre/${genre.name.toLowerCase().replace(' ', '-')}`}
            className="genre-chip"
            style={{ '--genre-color': genre.color }}
          >
            {genre.name}
          </Link>
        ))}
        <Link to="/genre/action" className="genre-chip more">
          More
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </Link>
      </div>
    </div>
  )
}
