import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { useLoading } from '../contexts/LoadingContext'
import { getHighQualityImage } from '../utils/imageUtils'
import './Browse.css'

const TYPES = ['All', 'TV', 'Movie', 'OVA', 'ONA', 'Special']

export default function Browse() {
  const { setPageLoaded } = useLoading()
  const [searchParams, setSearchParams] = useSearchParams()
  const [genres, setGenres] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  const urlQuery = searchParams.get('q') || ''
  const selectedGenre = searchParams.get('genre') || 'action'
  const selectedType = searchParams.get('type') || 'All'
  
  const isSearchMode = urlQuery.length > 0

  useEffect(() => {
    api.getGenreList().then(data => {
      setGenres(data || [])
    }).catch(() => setGenres([]))
  }, [])

  useEffect(() => {
    setSearchQuery(urlQuery)
  }, [urlQuery])

  // Debounced search as you type
  useEffect(() => {
    if (!searchQuery.trim()) return
    
    const timer = setTimeout(() => {
      const params = new URLSearchParams()
      params.set('q', searchQuery.trim())
      if (selectedType !== 'All') params.set('type', selectedType)
      setSearchParams(params)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    setLoading(true)
    setPage(1)
    
    const fetchData = async () => {
      try {
        let data
        if (isSearchMode) {
          data = await api.search(urlQuery, 1)
        } else {
          data = await api.getByGenre(selectedGenre, 1)
        }
        
        let items = data.results || []
        if (selectedType !== 'All') {
          items = items.filter(item => 
            item.type?.toLowerCase() === selectedType.toLowerCase()
          )
        }
        setResults(items)
        setHasMore(data.hasNextPage || items.length >= 20)
      } catch (e) {
        setResults([])
      } finally {
        setLoading(false)
        setPageLoaded(true)
      }
    }
    
    fetchData()
  }, [urlQuery, selectedGenre, selectedType, isSearchMode])

  const loadMore = async () => {
    const nextPage = page + 1
    try {
      let data
      if (isSearchMode) {
        data = await api.search(urlQuery, nextPage)
      } else {
        data = await api.getByGenre(selectedGenre, nextPage)
      }
      
      let items = data.results || []
      if (selectedType !== 'All') {
        items = items.filter(item => 
          item.type?.toLowerCase() === selectedType.toLowerCase()
        )
      }
      setResults(prev => [...prev, ...items])
      setPage(nextPage)
      setHasMore(data.hasNextPage || items.length >= 20)
    } catch (e) {
      setHasMore(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const params = new URLSearchParams()
      params.set('q', searchQuery.trim())
      if (selectedType !== 'All') params.set('type', selectedType)
      setSearchParams(params)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    const params = new URLSearchParams(searchParams)
    params.delete('q')
    setSearchParams(params)
  }

  const setGenreFilter = (genre) => {
    const params = new URLSearchParams()
    params.set('genre', genre)
    if (selectedType !== 'All') params.set('type', selectedType)
    setSearchParams(params)
  }

  const setTypeFilter = (type) => {
    const params = new URLSearchParams(searchParams)
    if (type === 'All') {
      params.delete('type')
    } else {
      params.set('type', type)
    }
    setSearchParams(params)
  }

  return (
    <div className="browse-page">
      <div className="browse-header-section">
        <div className="container">
          <h1>Discover <span>Anime</span></h1>
          
          {/* Search Bar */}
          <form className="browse-search" onSubmit={handleSearch}>
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button type="button" className="clear-btn" onClick={clearSearch}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            )}
          </form>
          
          {/* Type Tabs */}
          <div className="type-tabs">
            {TYPES.map(type => (
              <button
                key={type}
                className={`type-tab ${selectedType === type ? 'active' : ''}`}
                onClick={() => setTypeFilter(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        <div className="browse-content">
          {/* Genre Sidebar */}
          <aside className="genre-sidebar">
            <div className="sidebar-header">
              <span>Genres</span>
              <span className="genre-count">{genres.length}</span>
            </div>
            <div className="genre-list">
              {genres.map(genre => (
                <button
                  key={genre}
                  className={`genre-btn ${selectedGenre === genre && !isSearchMode ? 'active' : ''}`}
                  onClick={() => setGenreFilter(genre)}
                >
                  {genre.replace(/-/g, ' ')}
                </button>
              ))}
            </div>
          </aside>

          {/* Results */}
          <main className="browse-results">
            <div className="results-header">
              <h2>
                {isSearchMode 
                  ? `Results for "${urlQuery}"`
                  : selectedGenre.replace(/-/g, ' ')
                }
              </h2>
              <span className="results-count">{results.length} titles</span>
            </div>

            {loading ? (
              <div className="results-grid">
                {Array(18).fill(0).map((_, i) => (
                  <div key={i} className="card-skeleton">
                    <div className="skeleton-img"></div>
                    <div className="skeleton-text"></div>
                  </div>
                ))}
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="results-grid">
                  {results.map(anime => (
                    <Link key={anime.id} to={`/anime/${anime.id}`} className="browse-card">
                      <div className="card-img">
                        <img src={anime.image} alt={anime.title} loading="lazy" />
                        {anime.type && <span className="card-type">{anime.type}</span>}
                        <div className="card-play">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                      <div className="card-title">{anime.title}</div>
                    </Link>
                  ))}
                </div>
                
                {hasMore && (
                  <button className="load-more-btn" onClick={loadMore}>
                    Load More
                  </button>
                )}
              </>
            ) : (
              <div className="no-results">
                <p>No anime found {isSearchMode ? `for "${urlQuery}"` : 'for this selection'}</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
