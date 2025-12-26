import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api'
import AnimeCard, { AnimeCardSkeleton } from '../components/AnimeCard'
import './Search.css'

export default function Search() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setResults([])
        return
      }
      setLoading(true)
      try {
        const data = await api.search(query, 1)
        setResults(data.results || [])
        setHasMore(data.hasNextPage || false)
        setPage(1)
      } catch (error) {
        console.error('Search failed:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }
    fetchResults()
  }, [query])

  const loadMore = async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const data = await api.search(query, page + 1)
      setResults((prev) => [...prev, ...(data.results || [])])
      setHasMore(data.hasNextPage || false)
      setPage((p) => p + 1)
    } catch (error) {
      console.error('Load more failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="search-page container">
      <div className="search-header">
        <h1>
          {query ? (
            <>Search results for "<span className="highlight">{query}</span>"</>
          ) : (
            'Search Anime'
          )}
        </h1>
        {results.length > 0 && (
          <p className="results-count">{results.length} results found</p>
        )}
      </div>

      {!query && (
        <div className="search-empty">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <p>Enter a search term to find anime</p>
        </div>
      )}

      {query && results.length === 0 && !loading && (
        <div className="search-empty">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
            <line x1="9" y1="9" x2="9.01" y2="9"/>
            <line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
          <p>No results found for "{query}"</p>
          <span>Try different keywords or check your spelling</span>
        </div>
      )}

      <div className="search-grid">
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
  )
}
