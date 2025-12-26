import { useRef, useState, useCallback, useEffect } from 'react'
import Hls from 'hls.js'
import './VideoPlayer.css'

const API_BASE = 'https://cozify-api.deno.dev'

export default function VideoPlayer({ episodeId, audioType = 'sub', onNext, onPrev, hasNext, hasPrev }) {
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const hlsRef = useRef(null)
  const idleTimerRef = useRef(null)
  const trackRef = useRef(null)
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showControls, setShowControls] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [seeking, setSeeking] = useState(false)
  
  // Settings state
  const [subtitles, setSubtitles] = useState([])
  const [currentSubtitle, setCurrentSubtitle] = useState('off')
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [qualities, setQualities] = useState([])
  const [currentQuality, setCurrentQuality] = useState(-1)

  // Reset on episode change
  useEffect(() => {
    setLoading(true)
    setError(null)
    setPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setSubtitles([])
    setCurrentSubtitle('off')
    setQualities([])
    setCurrentQuality(-1)
  }, [episodeId, audioType])

  // Cleanup
  useEffect(() => {
    return () => {
      if (hlsRef.current) hlsRef.current.destroy()
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [])

  // Load video source
  useEffect(() => {
    if (!episodeId) return

    const loadSource = async () => {
      setLoading(true)
      setError(null)

      try {
        const url = `${API_BASE}/watch?episodeId=${encodeURIComponent(episodeId)}&type=${audioType}`
        const res = await fetch(url)
        
        if (!res.ok) throw new Error('Failed to fetch sources')
        
        const data = await res.json()
        
        if (!data.sources || data.sources.length === 0) {
          throw new Error('No sources available')
        }

        // Store subtitles
        if (data.subtitles && data.subtitles.length > 0) {
          setSubtitles(data.subtitles)
          // Auto-select English if available
          const english = data.subtitles.find(s => s.lang.toLowerCase().includes('english'))
          if (english) {
            setCurrentSubtitle(english.url)
          }
        }

        const source = data.sources[0]
        const video = videoRef.current
        if (!video) return

        if (hlsRef.current) hlsRef.current.destroy()

        if (Hls.isSupported()) {
          const hls = new Hls({ enableWorker: true })
          hlsRef.current = hls
          hls.loadSource(source.url)
          hls.attachMedia(video)
          
          hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
            setLoading(false)
            if (data.levels && data.levels.length > 0) {
              setQualities(data.levels.map((level, idx) => ({
                index: idx,
                height: level.height,
                label: `${level.height}p`
              })))
            }
            const playPromise = video.play()
            if (playPromise !== undefined) {
              playPromise.catch(() => {})
            }
          })
          
          hls.on(Hls.Events.ERROR, (_, data) => {
            if (data.fatal) {
              setLoading(false)
              setError({ message: 'Stream error', details: data.details })
            }
          })
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source.url
          video.addEventListener('loadedmetadata', () => {
            setLoading(false)
            const playPromise = video.play()
            if (playPromise !== undefined) {
              playPromise.catch(() => {})
            }
          }, { once: true })
        }
      } catch (err) {
        setLoading(false)
        setError({ message: err.message || 'Failed to load', details: 'Try a different server or audio type' })
      }
    }

    loadSource()
  }, [episodeId, audioType])

  // Handle subtitle change
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    
    // Remove existing track
    if (trackRef.current && trackRef.current.parentNode) {
      trackRef.current.parentNode.removeChild(trackRef.current)
      trackRef.current = null
    }
    
    // Disable all existing text tracks
    for (let i = 0; i < video.textTracks.length; i++) {
      video.textTracks[i].mode = 'disabled'
    }
    
    if (currentSubtitle !== 'off') {
      const track = document.createElement('track')
      track.kind = 'subtitles'
      track.label = 'Subtitles'
      track.srclang = 'en'
      track.src = currentSubtitle
      track.default = true
      video.appendChild(track)
      trackRef.current = track
      
      // Wait for track to load then enable it
      track.addEventListener('load', () => {
        if (video.textTracks.length > 0) {
          video.textTracks[video.textTracks.length - 1].mode = 'showing'
        }
      })
      
      // Also try to enable immediately
      setTimeout(() => {
        if (video.textTracks.length > 0) {
          video.textTracks[video.textTracks.length - 1].mode = 'showing'
        }
      }, 100)
    }
  }, [currentSubtitle])

  // Handle quality change
  useEffect(() => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = currentQuality
    }
  }, [currentQuality])

  // Handle playback speed change
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed
    }
  }, [playbackSpeed])

  // Mouse idle
  const handleMouseMove = useCallback(() => {
    setShowControls(true)
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = setTimeout(() => {
      if (playing && !showSettings) setShowControls(false)
    }, 3000)
  }, [playing, showSettings])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.addEventListener('mousemove', handleMouseMove)
    return () => container.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  const togglePlay = () => {
    if (videoRef.current) {
      playing ? videoRef.current.pause() : videoRef.current.play()
    }
  }

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    if (videoRef.current && duration) {
      const newTime = percent * duration
      setCurrentTime(newTime) // Update UI immediately
      setSeeking(true)
      videoRef.current.currentTime = newTime
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted
      setMuted(!muted)
    }
  }

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.volume = val
      setVolume(val)
      setMuted(val === 0)
    }
  }

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setFullscreen(true)
    } else {
      document.exitFullscreen()
      setFullscreen(false)
    }
  }, [])

  const handleRetry = () => {
    setLoading(true)
    setError(null)
    // Re-trigger load
    const video = videoRef.current
    if (video && hlsRef.current) {
      hlsRef.current.destroy()
    }
  }

  const formatTime = (s) => {
    if (!s || isNaN(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return
      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k': e.preventDefault(); togglePlay(); break
        case 'f': toggleFullscreen(); break
        case 'n': if (hasNext) onNext?.(); break
        case 'p': if (hasPrev) onPrev?.(); break
        case 'm': toggleMute(); break
        case 'arrowleft': if (videoRef.current) videoRef.current.currentTime -= 10; break
        case 'arrowright': if (videoRef.current) videoRef.current.currentTime += 10; break
        case 'escape': setShowSettings(false); break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hasNext, hasPrev, onNext, onPrev, toggleFullscreen, playing])

  if (!episodeId) {
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
            <circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6m0-6l6 6"/>
          </svg>
          <h3>Playback Error</h3>
          <p>{error.message}</p>
          <span className="error-details">{error.details}</span>
          <div className="error-actions">
            <button className="retry-btn primary" onClick={handleRetry}>
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`player ${fullscreen ? 'fullscreen' : ''}`} onClick={togglePlay}>
      {loading && (
        <div className="player-loader">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      )}
      
      {seeking && !loading && (
        <div className="player-seeking">
          <div className="seeking-spinner"></div>
        </div>
      )}

      <video
        ref={videoRef}
        className="player-video"
        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onSeeked={() => setSeeking(false)}
        onSeeking={() => setSeeking(true)}
        onEnded={() => hasNext && onNext?.()}
        playsInline
        crossOrigin="anonymous"
      />

      {/* Settings Panel */}
      {showSettings && (
        <div className="settings-panel" onClick={e => e.stopPropagation()}>
          <div className="settings-header">
            <span>Settings</span>
            <button className="settings-close" onClick={() => setShowSettings(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
          
          {/* Subtitles */}
          <div className="settings-section">
            <label>Subtitles</label>
            <select value={currentSubtitle} onChange={e => setCurrentSubtitle(e.target.value)}>
              <option value="off">Off</option>
              {subtitles.map((sub, i) => (
                <option key={i} value={sub.url}>{sub.lang}</option>
              ))}
            </select>
          </div>
          
          {/* Quality */}
          {qualities.length > 0 && (
            <div className="settings-section">
              <label>Quality</label>
              <select value={currentQuality} onChange={e => setCurrentQuality(parseInt(e.target.value))}>
                <option value={-1}>Auto</option>
                {qualities.map(q => (
                  <option key={q.index} value={q.index}>{q.label}</option>
                ))}
              </select>
            </div>
          )}
          
          {/* Playback Speed */}
          <div className="settings-section">
            <label>Speed</label>
            <select value={playbackSpeed} onChange={e => setPlaybackSpeed(parseFloat(e.target.value))}>
              <option value={0.25}>0.25x</option>
              <option value={0.5}>0.5x</option>
              <option value={0.75}>0.75x</option>
              <option value={1}>Normal</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
              <option value={1.75}>1.75x</option>
              <option value={2}>2x</option>
            </select>
          </div>
        </div>
      )}

      <div className={`player-controls ${showControls ? 'visible' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="progress-bar" onClick={handleSeek}>
          <div className="progress-fill" style={{ width: `${(currentTime / duration) * 100 || 0}%` }} />
        </div>
        
        <div className="controls-row">
          <div className="controls-left">
            <button className="ctrl-btn" onClick={togglePlay}>
              {playing ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>
            
            {hasPrev && (
              <button className="ctrl-btn" onClick={onPrev}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
              </button>
            )}
            
            {hasNext && (
              <button className="ctrl-btn" onClick={onNext}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 18h2V6h-2zM6 18l8.5-6L6 6z"/></svg>
              </button>
            )}

            <div className="volume-control">
              <button className="ctrl-btn" onClick={toggleMute}>
                {muted || volume === 0 ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9zM12 4L9.91 6.09 12 8.18z"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                )}
              </button>
              <input type="range" min="0" max="1" step="0.1" value={muted ? 0 : volume} onChange={handleVolumeChange} className="volume-slider" />
            </div>

            <span className="time-display">{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>

          <div className="controls-right">
            {/* Subtitle indicator */}
            {currentSubtitle !== 'off' && (
              <span className="subtitle-indicator">CC</span>
            )}
            
            {/* Settings button */}
            <button className="ctrl-btn" onClick={() => setShowSettings(!showSettings)} title="Settings">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
            </button>
            
            <button className="ctrl-btn" onClick={toggleFullscreen}>
              {fullscreen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16h3v3h2v-5H5zm3-8H5v2h5V5H8zm6 11h2v-3h3v-2h-5zm2-11V5h-2v5h5V8z"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7zm-2-4h2V7h3V5H5zm12 7h-3v2h5v-5h-2zM14 5v2h3v3h2V5z"/></svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
