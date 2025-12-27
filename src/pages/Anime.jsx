import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useLoading } from '../contexts/LoadingContext'
import { getWatchHistory } from '../services/userService'

export default function Anime() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { setPageLoaded } = useLoading()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAndRedirect = async () => {
      try {
        const data = await api.getAnimeInfo(id)
        const episodes = data?.episodes || []
        
        if (episodes.length === 0) {
          // No episodes, go back to browse
          navigate('/browse', { replace: true })
          return
        }
        
        // Check watch history for this anime to find last watched episode
        const history = getWatchHistory()
        const lastWatched = history.find(h => h.animeId === id)
        
        let targetEpisodeId
        
        if (lastWatched) {
          // Find the episode in the list
          const lastEpIndex = episodes.findIndex(ep => ep.id === lastWatched.episodeId)
          if (lastEpIndex !== -1) {
            // Go to the last watched episode
            targetEpisodeId = lastWatched.episodeId
          } else {
            // Episode not found, start from episode 1
            targetEpisodeId = episodes[0].id
          }
        } else {
          // New anime, start from episode 1
          targetEpisodeId = episodes[0].id
        }
        
        // Redirect to watch page
        navigate(`/watch/${id}/${targetEpisodeId}`, { replace: true })
      } catch (error) {
        console.error('Failed to fetch anime:', error)
        navigate('/browse', { replace: true })
      } finally {
        setLoading(false)
        setPageLoaded(true)
      }
    }
    
    fetchAndRedirect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate])

  // Show loading while redirecting
  return (
    <div className="anime-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading...
      </div>
    </div>
  )
}
