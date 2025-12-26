import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  getUser, 
  getStats, 
  getWatchHistory, 
  getContinueWatching,
  getAllTrophies,
  getTrophyProgress,
  setUserName 
} from '../services/userService'
import './Profile.css'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [history, setHistory] = useState([])
  const [continueWatching, setContinueWatching] = useState([])
  const [trophies, setTrophies] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState('')

  useEffect(() => {
    setUser(getUser())
    setStats(getStats())
    setHistory(getWatchHistory())
    setContinueWatching(getContinueWatching())
    setTrophies(getAllTrophies())
  }, [])

  const handleSaveName = () => {
    if (newName.trim()) {
      setUserName(newName.trim())
      setUser({ ...user, name: newName.trim() })
    }
    setEditingName(false)
  }

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours < 24) return `${hours}h ${mins}m`
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return `${days}d ${remainingHours}h`
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getMemberDuration = () => {
    if (!user?.createdAt) return 'New member'
    const days = Math.floor((Date.now() - user.createdAt) / 86400000)
    if (days === 0) return 'Joined today'
    if (days === 1) return 'Joined yesterday'
    if (days < 30) return `${days} days`
    if (days < 365) return `${Math.floor(days / 30)} months`
    return `${Math.floor(days / 365)} years`
  }

  const unlockedCount = trophies.filter(t => t.unlocked).length

  if (!stats) return null

  return (
    <div className="profile-page">
      <div className="profile-bg">
        <div className="bg-gradient"></div>
        <div className="bg-pattern"></div>
      </div>

      <div className="profile-container">
        {/* Hero Section */}
        <header className="profile-hero">
          <div className="hero-identity">
            <div className="identity-avatar">
              <span>{(user?.name || 'G')[0].toUpperCase()}</span>
            </div>
            <div className="identity-info">
              {editingName ? (
                <div className="name-edit">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter name"
                    maxLength={20}
                    autoFocus
                  />
                  <button onClick={handleSaveName}>Save</button>
                  <button onClick={() => setEditingName(false)} className="cancel">Cancel</button>
                </div>
              ) : (
                <h1 onClick={() => { setEditingName(true); setNewName(user?.name || '') }}>
                  {user?.name || 'Guest'}
                  <span className="edit-hint">click to edit</span>
                </h1>
              )}
              <p className="member-since">{getMemberDuration()}</p>
            </div>
          </div>

          <div className="hero-stats">
            <div className="stat-block">
              <span className="stat-value">{stats.totalEpisodes}</span>
              <span className="stat-label">Episodes</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-block">
              <span className="stat-value">{formatTime(stats.totalMinutes)}</span>
              <span className="stat-label">Watch Time</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-block">
              <span className="stat-value">{stats.uniqueAnime.length}</span>
              <span className="stat-label">Anime</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-block">
              <span className="stat-value">{stats.currentStreak}</span>
              <span className="stat-label">Day Streak</span>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="profile-nav">
          <button 
            className={activeTab === 'overview' ? 'active' : ''} 
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={activeTab === 'history' ? 'active' : ''} 
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
          <button 
            className={activeTab === 'trophies' ? 'active' : ''} 
            onClick={() => setActiveTab('trophies')}
          >
            Trophies
            {unlockedCount > 0 && <span className="nav-badge">{unlockedCount}</span>}
          </button>
        </nav>

        {/* Content */}
        <main className="profile-content">
          {activeTab === 'overview' && (
            <div className="tab-overview">
              {/* Continue Watching */}
              {continueWatching.length > 0 && (
                <section className="overview-section">
                  <h2>Continue Watching</h2>
                  <div className="continue-list">
                    {continueWatching.slice(0, 6).map((item, idx) => (
                      <Link 
                        key={idx} 
                        to={`/watch/${item.animeId}/${item.episodeId}`}
                        className="continue-item"
                      >
                        <div className="continue-poster">
                          <img src={item.animeImage} alt={item.animeTitle} />
                          <div className="continue-overlay">
                            <span>Episode {item.episodeNumber}</span>
                          </div>
                        </div>
                        <div className="continue-info">
                          <h3>{item.animeTitle}</h3>
                          <p>{formatDate(item.watchedAt)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Trophies Preview */}
              <section className="overview-section">
                <h2>Trophies</h2>
                <div className="trophies-preview">
                  {trophies.slice(0, 6).map((trophy) => (
                    <div 
                      key={trophy.id} 
                      className={`trophy-item ${trophy.unlocked ? 'unlocked' : 'locked'} tier-${trophy.tier}`}
                    >
                      <div className="trophy-icon">
                        <div className="trophy-shape"></div>
                      </div>
                      <div className="trophy-content">
                        <h4>{trophy.name}</h4>
                        <p>{trophy.desc}</p>
                        {!trophy.unlocked && (
                          <div className="trophy-progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${getTrophyProgress(trophy, stats) * 100}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="view-all-btn" onClick={() => setActiveTab('trophies')}>
                  View All Trophies
                </button>
              </section>

              {/* Stats Summary */}
              <section className="overview-section">
                <h2>Your Journey</h2>
                <div className="journey-stats">
                  <div className="journey-item">
                    <span className="journey-label">Longest Streak</span>
                    <span className="journey-value">{stats.longestStreak} days</span>
                  </div>
                  <div className="journey-item">
                    <span className="journey-label">Average per Day</span>
                    <span className="journey-value">
                      {stats.totalEpisodes > 0 
                        ? Math.round(stats.totalEpisodes / Math.max(Object.keys(stats.dailyActivity).length, 1) * 10) / 10
                        : 0} eps
                    </span>
                  </div>
                  <div className="journey-item">
                    <span className="journey-label">Days Active</span>
                    <span className="journey-value">{Object.keys(stats.dailyActivity).length}</span>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="tab-history">
              {history.length === 0 ? (
                <div className="empty-state">
                  <p>No watch history yet</p>
                  <Link to="/browse" className="empty-action">Start Watching</Link>
                </div>
              ) : (
                <div className="history-timeline">
                  {history.map((item, idx) => (
                    <Link 
                      key={idx} 
                      to={`/watch/${item.animeId}/${item.episodeId}`}
                      className="history-entry"
                    >
                      <div className="entry-time">{formatDate(item.watchedAt)}</div>
                      <div className="entry-line"></div>
                      <div className="entry-content">
                        <img src={item.animeImage} alt={item.animeTitle} />
                        <div className="entry-info">
                          <h3>{item.animeTitle}</h3>
                          <p>Episode {item.episodeNumber}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'trophies' && (
            <div className="tab-trophies">
              <div className="trophies-header">
                <span>{unlockedCount} of {trophies.length} unlocked</span>
              </div>
              <div className="trophies-grid">
                {trophies.map((trophy) => (
                  <div 
                    key={trophy.id} 
                    className={`trophy-card ${trophy.unlocked ? 'unlocked' : 'locked'} tier-${trophy.tier}`}
                  >
                    <div className="trophy-icon-large">
                      <div className="trophy-shape"></div>
                    </div>
                    <div className="trophy-details">
                      <span className="trophy-tier">{trophy.tier}</span>
                      <h3>{trophy.name}</h3>
                      <p>{trophy.desc}</p>
                      {!trophy.unlocked && (
                        <div className="trophy-progress">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${getTrophyProgress(trophy, stats) * 100}%` }}
                            ></div>
                          </div>
                          <span className="progress-text">
                            {Math.round(getTrophyProgress(trophy, stats) * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
