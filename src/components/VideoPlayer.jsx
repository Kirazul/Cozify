import { useRef, useState, useCallback, useEffect } from 'react'
import './VideoPlayer.css'

const SERVERS = ['s-2', 's-1', 's-3']
const MAX_RETRIES = 6
const LOAD_TIMEOUT = 12000 // 12 seconds
const VERIFY_DELAY = 3000 // 3 seconds after load to verify

export default function VideoPlayer({ episodeId, audioType = 'sub', onNext, onPrev, hasNext, hasPrev, onAudioTypeChange }) {
  const containerRef = useRef(null)
  const iframeRef = useRef(null)
  const timeoutRef = useRef(null)
  const verifyTimeoutRef = useRef(null)
  const idleTimerRef = useRef(null)
  
  const [fullscreen, setFullscreen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [currentServer, setCurrentServer] = useState(0)
  const [currentAudio, setCurrentAudio] = useState(audioType)
  const [triedCombinations, setTriedCombinations] = useState(new Set())
  const [showOverlay, setShowOverlay] = useState(true)
  const [iframeKey, setIframeKey] = useState(0)

  // Extract numeric episode ID: "anime-name-123$episode$456789" -> "456789"
  const epNumber = episodeId?.split('$episode$')[1] || null
  
  // Build embed URL with current server and audio type
  const embedUrl = epNumber 
    ? `https://megaplay.buzz/stream/${SERVERS[currentServer]}/${epNumber}/${currentAudio}`
    : null

  // Reset state when episode or audio type changes externally
  useEffect(() => {
    setLoading(true)
    setError(null)
    setRetryCount(0)
    setCurrentServer(0)
    setCurrentAudio(audioType)
    setTriedCombinations(new Set())
    setIframeKey(prev => prev + 1)
  }, [episodeId, audioType])

  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (verifyTimeoutRef.current) clearTimeout(verifyTimeoutRef.current)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [])

  // Mouse idle detection for overlay
  const handleMouseMove = useCallback(() => {
    setShowOverlay(true)
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = setTimeout(() => {
      setShowOverlay(false)
    }, 2000)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseenter', handleMouseMove)
    
    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseenter', handleMouseMove)
    }
  }, [handleMouseMove])

  const getCombinationKey = (server, audio) => `${server}-${audio}`

  const tryNextCombination = useCallback(() => {
    const currentKey = getCombinationKey(currentServer, currentAudio)
    const newTried = new Set(triedCombinations)
    newTried.add(currentKey)
    setTriedCombinations(newTried)

    const alternateAudio = currentAudio === 'sub' ? 'dub' : 'sub'
    
    // Try next server with same audio
    for (let s = 0; s < SERVERS.length; s++) {
      const key = getCombinationKey(s, currentAudio)
      if (!newTried.has(key)) {
        setCurrentServer(s)
        setLoading(true)
        setError(null)
        setIframeKey(prev => prev + 1)
        return true
      }
    }
    
    // Try servers with alternate audio
    for (let s = 0; s < SERVERS.length; s++) {
      const key = getCombinationKey(s, alternateAudio)
      if (!newTried.has(key)) {
        setCurrentServer(s)
        setCurrentAudio(alternateAudio)
        onAudioTypeChange?.(alternateAudio)
        setLoading(true)
        setError(null)
        setIframeKey(prev => prev + 1)
        return true
      }
    }
    
    return false
  }, [currentServer, currentAudio, triedCombinations, onAudioTypeChange])

  const handleLoadError = useCallback((reason = 'Failed to load') => {
    if (retryCount < MAX_RETRIES && tryNextCombination()) {
      setRetryCount(prev => prev + 1)
    } else {
      setLoading(false)
      setError({
        message: reason,
        details: `Tried ${triedCombinations.size + 1} server/audio combinations`,
        canRetry: true
      })
    }
  }, [retryCount, tryNextCombination, triedCombinations.size])

  // Set load timeout - auto retry if takes too long
  useEffect(() => {
    if (!loading || !epNumber) return
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    
    timeoutRef.current = setTimeout(() => {
      if (loading) {
        console.log('Load timeout, trying next server...')
        handleLoadError('Player took too long to load')
      }
    }, LOAD_TIMEOUT)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [loading, epNumber, currentServer, currentAudio, iframeKey, handleLoadError])

  const handleIframeLoad = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    
    // Set a verification timeout - if still seems broken after delay, retry
    verifyTimeoutRef.current = setTimeout(() => {
      // The iframe loaded but we can't verify content, assume it's working
      setLoading(false)
      setError(null)
    }, VERIFY_DELAY)
    
    // Immediately hide loading for better UX
    setLoading(false)
    setError(null)
  }, [])

  const handleIframeError = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (verifyTimeoutRef.current) clearTimeout(verifyTimeoutRef.current)
    handleLoadError('Stream unavailable')
  }, [handleLoadError])

  const handleRetry = useCallback(() => {
    setRetryCount(0)
    setCurrentServer(0)
    setCurrentAudio(audioType)
    setTriedCombinations(new Set())
    setLoading(true)
    setError(null)
    setIframeKey(prev => prev + 1)
  }, [audioType])

  const handleForceServer = useCallback((serverIdx) => {
    setCurrentServer(serverIdx)
    setLoading(true)
    setError(null)
    setIframeKey(prev => prev + 1)
  }, [])

  const handleForceAudio = useCallback((audio) => {
    setCurrentAudio(audio)
    onAudioTypeChange?.(audio)
    setLoading(true)
    setError(null)
    setIframeKey(prev => prev + 1)
  }, [onAudioTypeChange])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setFullscreen(true)
    } else {
      document.exitFullscreen()
      setFullscreen(false)
    }
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT') return
      switch (e.key.toLowerCase()) {
        case 'f': toggleFullscreen(); break
        case 'n': if (hasNext && onNext) onNext(); break
        case 'p': if (hasPrev && onPrev) onPrev(); break
        case 'r': handleRetry(); break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hasNext, hasPrev, onNext, onPrev, toggleFullscreen, handleRetry])

  if (!epNumber) {
    return (
      <div className="player" ref={containerRef}>
        <div className="player-message">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
          </svg>
          <p>Select an episode to watch</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="player" ref={containerRef}>
        <div className="player-error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M15 9l-6 6m0-6l6 6"/>
          </svg>
          <h3>Playback Error</h3>
          <p>{error.message}</p>
          <span className="error-details">{error.details}</span>
          
          <div className="error-actions">
            <button className="retry-btn primary" onClick={handleRetry}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 4v6h6M23 20v-6h-6"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
              </svg>
              Retry All
            </button>
          </div>

          <div className="manual-options">
            <div className="option-group">
              <span>Try Server:</span>
              <div className="option-btns">
                {SERVERS.map((srv, idx) => (
                  <button 
                    key={srv}
                    className={`option-btn ${currentServer === idx ? 'active' : ''}`}
                    onClick={() => handleForceServer(idx)}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
            <div className="option-group">
              <span>Audio:</span>
              <div className="option-btns">
                <button 
                  className={`option-btn ${currentAudio === 'sub' ? 'active' : ''}`}
                  onClick={() => handleForceAudio('sub')}
                >
                  SUB
                </button>
                <button 
                  className={`option-btn ${currentAudio === 'dub' ? 'active' : ''}`}
                  onClick={() => handleForceAudio('dub')}
                >
                  DUB
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`player ${fullscreen ? 'fullscreen' : ''}`}>
      {loading && (
        <div className="player-loader">
          <div className="spinner"></div>
          <p>Loading player...</p>
          {retryCount > 0 && (
            <span className="retry-info">
              Trying {currentAudio.toUpperCase()} on server {currentServer + 1}...
            </span>
          )}
        </div>
      )}

      <iframe
        ref={iframeRef}
        key={`${epNumber}-${currentAudio}-${currentServer}-${iframeKey}`}
        src={embedUrl}
        className="player-iframe"
        allowFullScreen
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
      />

      <div className={`overlay-info ${showOverlay ? 'visible' : ''}`}>
        {currentAudio.toUpperCase()} • Server {currentServer + 1}
      </div>
    </div>
  )
}
