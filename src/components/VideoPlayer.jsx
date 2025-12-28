import { useRef, useState, useCallback, useEffect } from 'react'
import Hls from 'hls.js'
import ResumeModal from './ResumeModal'
import './VideoPlayer.css'

const API_BASE = 'https://cozify-api.deno.dev'
const PLAYER_SETTINGS_KEY = 'cozify_player_settings'

// Load saved settings from localStorage
const loadPlayerSettings = () => {
  try {
    const saved = localStorage.getItem(PLAYER_SETTINGS_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error('Failed to load player settings:', e)
  }
  return {
    volume: 1,
    muted: false,
    playbackSpeed: 1,
    subtitleSize: 'medium',
    subtitleBg: 'semi'
  }
}

// Save settings to localStorage
const savePlayerSettings = (settings) => {
  try {
    localStorage.setItem(PLAYER_SETTINGS_KEY, JSON.stringify(settings))
  } catch (e) {
    console.error('Failed to save player settings:', e)
  }
}

export default function VideoPlayer({ episodeId, audioType = 'sub', onNext, onPrev, hasNext, hasPrev, animeId, savedTimestamp = 0, onProgressUpdate }) {
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const hlsRef = useRef(null)
  const idleTimerRef = useRef(null)
  const trackRef = useRef(null)
  const progressSaveRef = useRef(null)
  
  // Load saved settings on mount
  const savedSettings = loadPlayerSettings()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showControls, setShowControls] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  
  // Resume modal state
  const [showResumeModal, setShowResumeModal] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(savedSettings.volume)
  const [muted, setMuted] = useState(savedSettings.muted)
  const [fullscreen, setFullscreen] = useState(false)
  const [seeking, setSeeking] = useState(false)
  
  // Intro/Outro timestamps
  const [intro, setIntro] = useState(null)
  const [outro, setOutro] = useState(null)
  const [showSkipIntro, setShowSkipIntro] = useState(false)
  const [showSkipOutro, setShowSkipOutro] = useState(false)
  
  // Settings state
  const [subtitles, setSubtitles] = useState([])
  const [currentSubtitle, setCurrentSubtitle] = useState('off')
  const [playbackSpeed, setPlaybackSpeed] = useState(savedSettings.playbackSpeed)
  const [qualities, setQualities] = useState([])
  const [currentQuality, setCurrentQuality] = useState(-1)
  
  // Subtitle styling
  const [subtitleSize, setSubtitleSize] = useState(savedSettings.subtitleSize)
  const [subtitleBg, setSubtitleBg] = useState(savedSettings.subtitleBg)

  // Save settings when they change
  useEffect(() => {
    savePlayerSettings({
      volume,
      muted,
      playbackSpeed,
      subtitleSize,
      subtitleBg
    })
  }, [volume, muted, playbackSpeed, subtitleSize, subtitleBg])

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
    setIntro(null)
    setOutro(null)
    setShowSkipIntro(false)
    setShowSkipOutro(false)
    setShowResumeModal(false)
    setVideoReady(false)
  }, [episodeId, audioType])

  // Cleanup
  useEffect(() => {
    return () => {
      if (hlsRef.current) hlsRef.current.destroy()
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      if (progressSaveRef.current) clearInterval(progressSaveRef.current)
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

        // Store intro/outro timestamps
        if (data.intro && data.intro.end > 0) {
          setIntro(data.intro)
        }
        if (data.outro && data.outro.end > 0) {
          setOutro(data.outro)
        }

        // Store subtitles
        if (data.subtitles && data.subtitles.length > 0) {
          setSubtitles(data.subtitles)
          const english = data.subtitles.find(s => s.lang.toLowerCase().includes('english'))
          if (english) {
            setCurrentSubtitle(english.url)
          }
        }

        const source = data.sources[0]
        const video = videoRef.current
        if (!video) return

        if (hlsRef.current) hlsRef.current.destroy()
        
        // Apply saved volume settings
        video.volume = volume
        video.muted = muted

        if (Hls.isSupported()) {
          const hls = new Hls({ enableWorker: true })
          hlsRef.current = hls
          hls.loadSource(source.url)
          hls.attachMedia(video)
          
          hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
            setLoading(false)
            setVideoReady(true)
            if (data.levels && data.levels.length > 0) {
              setQualities(data.levels.map((level, idx) => ({
                index: idx,
                height: level.height,
                label: `${level.height}p`
              })))
            }
            // Show resume modal if there's saved progress, otherwise auto-play
            console.log('Video ready, savedTimestamp:', savedTimestamp)
            if (savedTimestamp > 10) {
              console.log('Showing resume modal')
              setShowResumeModal(true)
            } else {
              console.log('Auto-playing from start')
              const playPromise = video.play()
              if (playPromise !== undefined) {
                playPromise.catch(() => {})
              }
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
          video.addEventListener('canplay', () => {
            setLoading(false)
            setVideoReady(true)
            // Show resume modal if there's saved progress, otherwise auto-play
            if (savedTimestamp > 10) {
              setShowResumeModal(true)
            } else {
              const playPromise = video.play()
              if (playPromise !== undefined) {
                playPromise.catch(() => {})
              }
            }
          }, { once: true })
        }
      } catch (err) {
        setLoading(false)
        setError({ message: err.message || 'Failed to load', details: 'Try a different server or audio type' })
      }
    }

    loadSource()
  }, [episodeId, audioType, savedTimestamp])

  // Save progress periodically and on unmount
  useEffect(() => {
    // Save progress every 5 seconds
    progressSaveRef.current = setInterval(() => {
      if (videoRef.current && onProgressUpdate && duration > 0) {
        const currentPos = videoRef.current.currentTime
        // Only save if we've watched at least 5 seconds and not near the end
        if (currentPos > 5 && currentPos < duration - 30) {
          onProgressUpdate(currentPos, duration)
        }
      }
    }, 5000)

    return () => {
      // Save progress on unmount
      if (progressSaveRef.current) {
        clearInterval(progressSaveRef.current)
      }
      if (videoRef.current && onProgressUpdate && duration > 0) {
        const currentPos = videoRef.current.currentTime
        if (currentPos > 5 && currentPos < duration - 30) {
          onProgressUpdate(currentPos, duration)
        }
      }
    }
  }, [episodeId, duration, onProgressUpdate])

  // Check if we should show skip buttons
  useEffect(() => {
    if (intro && currentTime >= intro.start && currentTime < intro.end) {
      setShowSkipIntro(true)
    } else {
      setShowSkipIntro(false)
    }
    
    if (outro && currentTime >= outro.start && currentTime < outro.end) {
      setShowSkipOutro(true)
    } else {
      setShowSkipOutro(false)
    }
  }, [currentTime, intro, outro])

  const skipIntro = () => {
    if (videoRef.current && intro) {
      videoRef.current.currentTime = intro.end
      setShowSkipIntro(false)
    }
  }

  const skipOutro = () => {
    if (hasNext && onNext) {
      onNext()
    } else if (videoRef.current && outro) {
      videoRef.current.currentTime = outro.end
      setShowSkipOutro(false)
    }
  }

  // Resume modal handlers
  const handleResume = () => {
    setShowResumeModal(false)
    if (videoRef.current) {
      if (savedTimestamp > 0) {
        videoRef.current.currentTime = savedTimestamp
      }
      const playPromise = videoRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {})
      }
    }
  }

  const handleStartOver = () => {
    setShowResumeModal(false)
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      const playPromise = videoRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {})
      }
    }
  }

  // Handle subtitle change
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    
    if (trackRef.current && trackRef.current.parentNode) {
      trackRef.current.parentNode.removeChild(trackRef.current)
      trackRef.current = null
    }
    
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
      
      track.addEventListener('load', () => {
        if (video.textTracks.length > 0) {
          video.textTracks[video.textTracks.length - 1].mode = 'showing'
        }
      })
      
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
      setCurrentTime(newTime)
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
    if (videoRef.current && hlsRef.current) {
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
        case 's': if (showSkipIntro) skipIntro(); else if (showSkipOutro) skipOutro(); break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hasNext, hasPrev, onNext, onPrev, toggleFullscreen, playing, showSkipIntro, showSkipOutro])

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

      {/* Resume Modal */}
      {showResumeModal && videoReady && (
        <ResumeModal 
          savedTime={savedTimestamp}
          onResume={handleResume}
          onStartOver={handleStartOver}
        />
      )}

      <video
        ref={videoRef}
        className={`player-video sub-size-${subtitleSize} sub-bg-${subtitleBg}`}
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

      {/* Skip Intro Button */}
      {showSkipIntro && (
        <button className="skip-btn skip-intro" onClick={(e) => { e.stopPropagation(); skipIntro(); }}>
          Skip Intro
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
        </button>
      )}

      {/* Skip Outro / Next Episode Button */}
      {showSkipOutro && (
        <button className="skip-btn skip-outro" onClick={(e) => { e.stopPropagation(); skipOutro(); }}>
          {hasNext ? 'Next Episode' : 'Skip Outro'}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
        </button>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="settings-panel" onClick={e => e.stopPropagation()}>
          <div className="settings-header">
            <span>Settings</span>
            <button className="settings-close" onClick={() => setShowSettings(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
          
          <div className="settings-section">
            <label>Subtitles</label>
            <select value={currentSubtitle} onChange={e => setCurrentSubtitle(e.target.value)}>
              <option value="off">Off</option>
              {subtitles.map((sub, i) => (
                <option key={i} value={sub.url}>{sub.lang}</option>
              ))}
            </select>
          </div>
          
          {currentSubtitle !== 'off' && (
            <>
              <div className="settings-section">
                <label>Subtitle Size</label>
                <select value={subtitleSize} onChange={e => setSubtitleSize(e.target.value)}>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="xlarge">Extra Large</option>
                </select>
              </div>
              
              <div className="settings-section">
                <label>Subtitle Background</label>
                <select value={subtitleBg} onChange={e => setSubtitleBg(e.target.value)}>
                  <option value="none">None</option>
                  <option value="semi">Semi-transparent</option>
                  <option value="solid">Solid Black</option>
                </select>
              </div>
            </>
          )}
          
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
          {/* Intro/Outro markers on progress bar */}
          {intro && duration > 0 && (
            <div 
              className="progress-marker intro-marker" 
              style={{ 
                left: `${(intro.start / duration) * 100}%`,
                width: `${((intro.end - intro.start) / duration) * 100}%`
              }} 
            />
          )}
          {outro && duration > 0 && (
            <div 
              className="progress-marker outro-marker" 
              style={{ 
                left: `${(outro.start / duration) * 100}%`,
                width: `${((outro.end - outro.start) / duration) * 100}%`
              }} 
            />
          )}
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
            {currentSubtitle !== 'off' && (
              <span className="subtitle-indicator">CC</span>
            )}
            
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
