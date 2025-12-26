import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import './Schedule.css'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function Countdown({ targetTime }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const calculateTime = () => {
      if (!targetTime) return ''
      
      const now = new Date()
      const [hours, minutes] = targetTime.split(':').map(Number)
      const target = new Date()
      target.setHours(hours, minutes, 0, 0)
      
      // If time has passed today, show "Aired"
      if (target <= now) return 'Aired'
      
      const diff = target - now
      const h = Math.floor(diff / (1000 * 60 * 60))
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const s = Math.floor((diff % (1000 * 60)) / 1000)
      
      if (h > 0) return `${h}h ${m}m`
      if (m > 0) return `${m}m ${s}s`
      return `${s}s`
    }

    setTimeLeft(calculateTime())
    const interval = setInterval(() => setTimeLeft(calculateTime()), 1000)
    return () => clearInterval(interval)
  }, [targetTime])

  if (!targetTime || !timeLeft) return null

  return (
    <span className={`countdown ${timeLeft === 'Aired' ? 'aired' : ''}`}>
      {timeLeft === 'Aired' ? 'Aired' : timeLeft}
    </span>
  )
}

export default function Schedule() {
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())

  const getWeekDates = () => {
    const dates = []
    const today = new Date()
    for (let i = -3; i <= 3; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const weekDates = getWeekDates()

  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString()
  }

  const isTodaySelected = isToday(selectedDate)

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true)
      try {
        const data = await api.getSchedule(formatDate(selectedDate))
        setSchedule(data.results || data || [])
      } catch (error) {
        console.error('Failed to fetch schedule:', error)
        setSchedule([])
      } finally {
        setLoading(false)
      }
    }
    fetchSchedule()
  }, [selectedDate])

  return (
    <div className="schedule-page">
      <div className="schedule-hero">
        <div className="hero-bg">
          <div className="hero-glow"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
                <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
              </svg>
            </div>
            <h1>Airing Schedule</h1>
            <p>Track upcoming episodes and never miss a release</p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-num">{schedule.length}</span>
                <span className="stat-label">Today</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-num">7</span>
                <span className="stat-label">Days</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-num">24/7</span>
                <span className="stat-label">Updates</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Week Navigation */}
        <div className="week-nav">
          {weekDates.map((date) => (
            <button
              key={date.toISOString()}
              className={`day-btn ${isSelected(date) ? 'active' : ''} ${isToday(date) ? 'today' : ''}`}
              onClick={() => setSelectedDate(date)}
            >
              <span className="day-name">{SHORT_DAYS[date.getDay()]}</span>
              <span className="day-num">{date.getDate()}</span>
              {isToday(date) && <span className="today-dot"></span>}
            </button>
          ))}
        </div>

        {/* Selected Date Header */}
        <div className="date-header">
          <div className="date-title">
            <h2>{DAYS[selectedDate.getDay()]}, {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h2>
            {isTodaySelected && <span className="today-tag">Today</span>}
          </div>
          <span className="anime-count">{schedule.length} anime airing</span>
        </div>

        {/* Schedule Grid */}
        <div className="schedule-content">
          {loading ? (
            <div className="schedule-grid">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="schedule-card skeleton">
                  <div className="skeleton-poster" />
                  <div className="skeleton-info">
                    <div className="skeleton-line" />
                    <div className="skeleton-line short" />
                  </div>
                </div>
              ))}
            </div>
          ) : schedule.length > 0 ? (
            <div className="schedule-grid">
              {schedule.map((anime) => (
                <Link key={anime.id} to={`/anime/${anime.id}`} className="schedule-card">
                  <div className="card-image">
                    <img src={anime.image} alt={anime.title} loading="lazy" />
                    <div className="card-badges">
                      {anime.episode && (
                        <span className="ep-badge">EP {anime.episode}</span>
                      )}
                      {isTodaySelected && anime.time && (
                        <Countdown targetTime={anime.time} />
                      )}
                    </div>
                    <div className="card-hover">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="card-body">
                    <h3>{anime.title}</h3>
                    <div className="card-meta">
                      {anime.time && <span className="time">{anime.time}</span>}
                      {anime.type && <span className="type">{anime.type}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <h3>No anime scheduled</h3>
              <p>There are no anime airing on this date. Try selecting a different day.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
