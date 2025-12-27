import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useLoading } from '../contexts/LoadingContext'
import VideoPlayer from '../components/VideoPlayer'
import { addToHistory, markEpisodeCompleted, isEpisodeWatched, addWatchTime } from '../services/userService'
import './Watch.css'

export default function Watch() {
  const { animeId, episodeId } = useParams()
  const navigate = useNavigate()
  const { setPageLoaded } = useLoading()
  const [anime, setAnime] = useState(null)
  const [loading, setLoading] = useState(true)
  const [audioType, setAudioType] = useState('sub')
  const [relatedSeasons, setRelatedSeasons] = useState([])
  
  // Watch time tracking
  const watchTimeRef = useRef(0) // Total seconds watched for this episode
  const watchIntervalRef = useRef(null)
  const hasCountedRef = useRef(false)
  const lastSaveRef = useRef(0)

  const episodes = anime?.episodes || []
  const currentEp = episodes.find(ep => ep.id === episodeId)
  const currentIdx = episodes.findIndex(ep => ep.id === episodeId)
  const prevEp = currentIdx > 0 ? episodes[currentIdx - 1] : null
  const nextEp = currentIdx < episodes.length - 1 ? episodes[currentIdx + 1] : null

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        const data = await api.getAnimeInfo(animeId)
        setAnime(data)
        
        // Search for related seasons using the anime title
        if (data?.title) {
          try {
            // Try multiple search strategies
            const baseTitle = data.title.toLowerCase()
            
            // Strategy 1: Search with first part before colon/dash
            let searchTitle = data.title.split(/[:\-–]/)[0].trim()
            
            // Strategy 2: If title is short, use full title
            if (searchTitle.length < 5) {
              searchTitle = data.title.split(' ').slice(0, 4).join(' ')
            }
            
            // Strategy 3: Remove common suffixes like "Season X", "Part X", "2nd Season", etc.
            searchTitle = searchTitle
              .replace(/\s*(season|part|cour)\s*\d*/gi, '')
              .replace(/\s*(1st|2nd|3rd|\d+th)\s*/gi, '')
              .replace(/\s*(I{1,3}|IV|V|VI{0,3})$/gi, '') // Roman numerals
              .trim()
            
            if (searchTitle.length < 3) {
              searchTitle = data.title.split(' ').slice(0, 3).join(' ')
            }
            
            const searchResults = await api.search(searchTitle)
            if (searchResults?.results) {
              // Filter to find related seasons/movies
              const related = searchResults.results.filter(item => {
                if (item.id === animeId) return false
                
                const itemTitle = item.title.toLowerCase()
                
                // Get significant words (length > 2)
                const baseWords = baseTitle.split(/[\s:\-–]+/).filter(w => w.length > 2)
                const itemWords = itemTitle.split(/[\s:\-–]+/).filter(w => w.length > 2)
                
                // Count matching words
                const matchCount = baseWords.filter(w => 
                  itemWords.some(iw => iw.includes(w) || w.includes(iw))
                ).length
                
                // More lenient matching - at least 1 significant word match
                // or if titles share the first word (often the main title)
                const firstWordMatch = baseWords[0] && itemWords[0] && 
                  (baseWords[0] === itemWords[0] || 
                   baseWords[0].includes(itemWords[0]) || 
                   itemWords[0].includes(baseWords[0]))
                
                return (matchCount >= 1 || firstWordMatch) && 
                       (item.type === 'TV' || item.type === 'Movie' || item.type === 'OVA' || item.type === 'Special')
              })
              
              setRelatedSeasons(related.slice(0, 12))
            }
          } catch (e) {
            console.log('Could not fetch related seasons:', e)
          }
        }
      } catch (err) {
        console.error('Failed to fetch anime:', err)
      } finally {
        setLoading(false)
        setPageLoaded(true)
      }
    }
    fetchAnime()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animeId])

  // Track watch history (immediately add to history for continue watching)
  useEffect(() => {
    if (anime && currentEp) {
      addToHistory(
        animeId,
        anime.title,
        anime.image,
        episodeId,
        currentEp.number || currentEp.episode
      )
    }
  }, [anime, currentEp, animeId, episodeId])

  // Track watch time
  useEffect(() => {
    // Reset for new episode
    watchTimeRef.current = 0
    lastSaveRef.current = 0
    hasCountedRef.current = isEpisodeWatched(episodeId)
    
    // Start tracking time (counts every second the page is open with video)
    watchIntervalRef.current = setInterval(() => {
      watchTimeRef.current += 1
      
      // Check if we hit 1 minute (60 seconds) and haven't counted yet
      if (watchTimeRef.current >= 60 && !hasCountedRef.current && anime) {
        const watchedMinutes = Math.floor(watchTimeRef.current / 60)
        markEpisodeCompleted(animeId, episodeId, watchedMinutes)
        hasCountedRef.current = true
      }
      
      // Save watch time every minute to stats (for already-watched episodes)
      if (hasCountedRef.current && watchTimeRef.current - lastSaveRef.current >= 60) {
        addWatchTime(1) // Add 1 minute
        lastSaveRef.current = watchTimeRef.current
      }
    }, 1000)

    return () => {
      // On unmount, save any remaining watch time
      if (watchIntervalRef.current) {
        clearInterval(watchIntervalRef.current)
      }
      
      // If episode wasn't counted but watched some time, still save the time
      if (!hasCountedRef.current && watchTimeRef.current >= 60) {
        const remainingMinutes = Math.floor((watchTimeRef.current - lastSaveRef.current) / 60)
        if (remainingMinutes > 0) {
          addWatchTime(remainingMinutes)
        }
      }
    }
  }, [episodeId, animeId, anime])

  const goToEpisode = (epId) => {
    navigate(`/watch/${animeId}/${epId}`)
  }

  return (
    <div className="watch-page">
      <main className="watch-main">
        <nav className="watch-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          {anime && <Link to={`/anime/${animeId}`}>{anime.type || 'Anime'}</Link>}
          <span>/</span>
          <span>{anime?.title}</span>
        </nav>

        <div className="watch-content">
          <div className="watch-left">
            <div className="player-wrapper">
              <VideoPlayer 
                episodeId={episodeId}
                audioType={audioType}
                hasNext={!!nextEp}
                hasPrev={!!prevEp}
                onNext={() => nextEp && goToEpisode(nextEp.id)}
                onPrev={() => prevEp && goToEpisode(prevEp.id)}
                onAudioTypeChange={setAudioType}
              />
            </div>

            <div className="watch-controls">
              <div className="control-left">
                <div className="control-info">
                  <span className="control-label">Now Playing</span>
                  <span className="control-episode">Episode {currentEp?.number || currentEp?.episode}</span>
                </div>
                <div className="ep-nav">
                  <button className="ep-nav-btn" disabled={!prevEp} onClick={() => prevEp && goToEpisode(prevEp.id)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                    </svg>
                    Prev
                  </button>
                  <button className="ep-nav-btn" disabled={!nextEp} onClick={() => nextEp && goToEpisode(nextEp.id)}>
                    Next
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="server-select">
                <button 
                  className={audioType === 'sub' ? 'active' : ''} 
                  onClick={() => setAudioType('sub')}
                >SUB</button>
                <button 
                  className={audioType === 'dub' ? 'active' : ''} 
                  onClick={() => setAudioType('dub')}
                >DUB</button>
              </div>
            </div>

            <div className="episodes-section">
              <div className="episodes-header">
                <span>Episodes</span>
                <span className="ep-count">{episodes.length} episodes</span>
              </div>
              <div className="episodes-grid">
                {loading ? (
                  Array(24).fill(0).map((_, i) => (
                    <div key={i} className="ep-btn skeleton"></div>
                  ))
                ) : (
                  episodes.map((ep) => {
                    const isWatched = isEpisodeWatched(ep.id)
                    const isCurrent = ep.id === episodeId
                    return (
                      <button
                        key={ep.id}
                        className={`ep-btn ${isCurrent ? 'active' : ''} ${isWatched && !isCurrent ? 'watched' : ''}`}
                        onClick={() => goToEpisode(ep.id)}
                      >
                        {ep.number || ep.episode}
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            {/* Seasons Section */}
            {relatedSeasons.length > 0 && (
              <div className="seasons-section">
                <div className="seasons-header">
                  <span>Seasons & Related</span>
                </div>
                <div className="seasons-list">
                  {/* Current Season */}
                  <div className="season-card active">
                    <img src={anime?.image} alt={anime?.title} />
                    <span className="season-label">Current</span>
                  </div>
                  {/* Other Seasons */}
                  {relatedSeasons.map((season) => (
                    <Link 
                      key={season.id} 
                      to={`/anime/${season.id}`}
                      className="season-card"
                    >
                      <img src={season.image} alt={season.title} />
                      <span className="season-label">
                        {season.title.length > 20 
                          ? season.title.slice(0, 18) + '...' 
                          : season.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="watch-right">
            {anime && (
              <div className="watch-info">
                <img src={anime.image} alt={anime.title} className="info-poster" />
                <div className="info-content">
                  <h1>{anime.title}</h1>
                  <div className="info-meta">
                    {anime.rating && (
                      <span className="info-rating">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                        </svg>
                        {anime.rating}
                      </span>
                    )}
                    {episodes.length > 0 && <span className="info-badge">{episodes.length} eps</span>}
                    {anime.type && <span className="info-type">{anime.type}</span>}
                  </div>
                  {anime.description && <p className="info-desc">{anime.description}</p>}
                  <Link to={`/anime/${animeId}`} className="info-link">View details →</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
