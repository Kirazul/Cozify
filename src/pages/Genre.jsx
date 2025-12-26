import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api'
import AnimeCard, { AnimeCardSkeleton } from '../components/AnimeCard'
import './Genre.css'

export default function Genre() {
  const { genre } = useParams()
  const [results, setResults] = useState([])
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await api.getGenreList()
        setGenres(data || [])
      } catch (err) {
        console.error('Failed to fetch genres:', err)
      }
    }
    fetchGenres()
  }, [])

  useEffect(() => {
    const fetchByGenre = async () => {
      setLoading(true)
      try {
        const data = await api.getByGenre(genre, 1)
        setResults(data.results || [])
        setHasMore(data.hasNextPage || false)
        setPage(1)
      } catch (err) {
        console.error('Failed to fetch genre results:', err)
        setResults([])
      } finally {
        setLoading(false)
      }
    }
    if (genre) fetchByGenre()
  }, [genre])

  const loadMore = async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const data = await api.getByGenre(genre, page + 1)
      setResults((prev) => [...prev, ...(data.results || [])])
      setHasMore(data.hasNextPage || false)
      setPage((p) => p + 1)
    } catch (err) {
      console.error('Load more failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatGenre = (g) => g.charAt(0).toUpperCase() + g.slice(1).replace(/-/g, ' ')

  return (
    <div className="genre-page container">
      <div className="genre-sidebar">
        <h3>Genres</h3>
        <div className="genre-list">
          {genres.map((g) => (
            <Link 
              key={g} 
              to={`/genre/${g.toLowerCase()}`}
              className={`genre-link ${g.toLowerCase() === genre ? 'active' : ''}`}
            >
              {g}
            </Link>
          ))}
        </div>
      </div>

      <div className="genre-content">
        <div className="genre-header">
          <h1>{formatGenre(genre)} Anime</h1>
          <p>{results.length} titles found</p>
        </div>

        <div className="genre-grid">
          {results.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
          {loading && Array(8).fill(0).map((_, i) => <AnimeCardSkeleton key={`skeleton-${i}`} />)}
        </div>

        {hasMore && results.length > 0 && (
          <div className="load-more">
            <button onClick={loadMore} disabled={loading} className="load-more-btn">
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
