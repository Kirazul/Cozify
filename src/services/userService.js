// User Data Service - All localStorage operations

const STORAGE_KEYS = {
  USER: 'cozify_user',
  WATCH_HISTORY: 'cozify_history',
  STATS: 'cozify_stats',
  ACHIEVEMENTS: 'cozify_achievements',
  FIRST_VISIT: 'cozify_first_visit',
  WATCHED_EPISODES: 'cozify_watched_eps',
  WATCH_PROGRESS: 'cozify_watch_progress'
}

// Trophies (achievements renamed)
const TROPHIES_LIST = [
  { id: 'first_watch', name: 'First Step', desc: 'Watch your first episode', requirement: 1, type: 'episodes', tier: 'bronze' },
  { id: 'binge_10', name: 'Getting Started', desc: 'Watch 10 episodes', requirement: 10, type: 'episodes', tier: 'bronze' },
  { id: 'binge_50', name: 'Dedicated Viewer', desc: 'Watch 50 episodes', requirement: 50, type: 'episodes', tier: 'silver' },
  { id: 'binge_100', name: 'True Otaku', desc: 'Watch 100 episodes', requirement: 100, type: 'episodes', tier: 'gold' },
  { id: 'binge_500', name: 'Legendary Watcher', desc: 'Watch 500 episodes', requirement: 500, type: 'episodes', tier: 'platinum' },
  { id: 'anime_1', name: 'Explorer', desc: 'Start watching an anime', requirement: 1, type: 'anime', tier: 'bronze' },
  { id: 'anime_5', name: 'Curious Mind', desc: 'Watch 5 different anime', requirement: 5, type: 'anime', tier: 'bronze' },
  { id: 'anime_10', name: 'Variety Seeker', desc: 'Watch 10 different anime', requirement: 10, type: 'anime', tier: 'silver' },
  { id: 'anime_25', name: 'Connoisseur', desc: 'Watch 25 different anime', requirement: 25, type: 'anime', tier: 'gold' },
  { id: 'anime_50', name: 'Anime Scholar', desc: 'Watch 50 different anime', requirement: 50, type: 'anime', tier: 'platinum' },
  { id: 'hours_1', name: 'Time Flies', desc: 'Spend 1 hour watching', requirement: 1, type: 'hours', tier: 'bronze' },
  { id: 'hours_10', name: 'Marathon Runner', desc: 'Spend 10 hours watching', requirement: 10, type: 'hours', tier: 'silver' },
  { id: 'hours_50', name: 'Devoted Fan', desc: 'Spend 50 hours watching', requirement: 50, type: 'hours', tier: 'gold' },
  { id: 'hours_100', name: 'Living the Dream', desc: 'Spend 100 hours watching', requirement: 100, type: 'hours', tier: 'platinum' },
  { id: 'streak_3', name: 'Consistent', desc: 'Watch 3 days in a row', requirement: 3, type: 'streak', tier: 'bronze' },
  { id: 'streak_7', name: 'Weekly Warrior', desc: 'Watch 7 days in a row', requirement: 7, type: 'streak', tier: 'silver' },
  { id: 'streak_30', name: 'Monthly Master', desc: 'Watch 30 days in a row', requirement: 30, type: 'streak', tier: 'gold' },
]

// Initialize user data
export function initUser() {
  if (!localStorage.getItem(STORAGE_KEYS.USER)) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({
      name: null,
      createdAt: Date.now()
    }))
  }
  if (!localStorage.getItem(STORAGE_KEYS.WATCH_HISTORY)) {
    localStorage.setItem(STORAGE_KEYS.WATCH_HISTORY, JSON.stringify([]))
  }
  if (!localStorage.getItem(STORAGE_KEYS.STATS)) {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify({
      totalEpisodes: 0,
      totalMinutes: 0,
      uniqueAnime: [],
      lastWatched: null,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      dailyActivity: {}
    }))
  }
  if (!localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS)) {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify([]))
  }
  if (!localStorage.getItem(STORAGE_KEYS.WATCHED_EPISODES)) {
    localStorage.setItem(STORAGE_KEYS.WATCHED_EPISODES, JSON.stringify([]))
  }
  if (!localStorage.getItem(STORAGE_KEYS.WATCH_PROGRESS)) {
    localStorage.setItem(STORAGE_KEYS.WATCH_PROGRESS, JSON.stringify({}))
  }
}

// Check if first visit
export function isFirstVisit() {
  return !localStorage.getItem(STORAGE_KEYS.FIRST_VISIT)
}

export function markVisited() {
  localStorage.setItem(STORAGE_KEYS.FIRST_VISIT, 'true')
}

// User operations
export function getUser() {
  const data = localStorage.getItem(STORAGE_KEYS.USER)
  return data ? JSON.parse(data) : null
}

export function setUserName(name) {
  const user = getUser() || { createdAt: Date.now() }
  user.name = name
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
}

// Get watched episodes set (to prevent duplicates)
function getWatchedEpisodes() {
  const data = localStorage.getItem(STORAGE_KEYS.WATCHED_EPISODES)
  return data ? JSON.parse(data) : []
}

// Export for use in components
export function getWatchedEpisodeIds() {
  return new Set(getWatchedEpisodes())
}

function markEpisodeWatched(episodeId) {
  const watched = getWatchedEpisodes()
  if (!watched.includes(episodeId)) {
    watched.push(episodeId)
    localStorage.setItem(STORAGE_KEYS.WATCHED_EPISODES, JSON.stringify(watched))
    return true // New episode
  }
  return false // Already watched
}

export function isEpisodeWatched(episodeId) {
  const watched = getWatchedEpisodes()
  return watched.includes(episodeId)
}

// Watch history operations
export function getWatchHistory() {
  const data = localStorage.getItem(STORAGE_KEYS.WATCH_HISTORY)
  return data ? JSON.parse(data) : []
}

// Add to history (called when starting to watch)
export function addToHistory(animeId, animeTitle, animeImage, episodeId, episodeNumber) {
  const history = getWatchHistory()
  
  // Remove if already exists (to move to top)
  const filtered = history.filter(h => !(h.animeId === animeId && h.episodeId === episodeId))
  
  // Add to beginning
  filtered.unshift({
    animeId,
    animeTitle,
    animeImage,
    episodeId,
    episodeNumber,
    watchedAt: Date.now()
  })
  
  // Keep only last 200 entries
  const trimmed = filtered.slice(0, 200)
  localStorage.setItem(STORAGE_KEYS.WATCH_HISTORY, JSON.stringify(trimmed))
}

// Mark episode as completed (called after 5 minutes of watching)
export function markEpisodeCompleted(animeId, episodeId, watchedMinutes = 24) {
  const isNew = markEpisodeWatched(episodeId)
  
  if (isNew) {
    // Only update stats for new episodes
    updateStats(animeId, episodeId, watchedMinutes)
    return true
  }
  return false
}

// Add watch time without marking episode complete
export function addWatchTime(minutes) {
  const stats = getStats()
  stats.totalMinutes += minutes
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats))
}

// Get continue watching (last episode per anime)
export function getContinueWatching() {
  const history = getWatchHistory()
  const seen = new Set()
  const result = []
  
  for (const item of history) {
    if (!seen.has(item.animeId)) {
      seen.add(item.animeId)
      result.push(item)
    }
    if (result.length >= 10) break
  }
  
  return result
}

// Stats operations
export function getStats() {
  const data = localStorage.getItem(STORAGE_KEYS.STATS)
  return data ? JSON.parse(data) : null
}

function updateStats(animeId, episodeId, watchedMinutes = 24) {
  const stats = getStats()
  const today = new Date().toDateString()
  
  // Update episode count
  stats.totalEpisodes += 1
  
  // Add actual watched time (passed from player)
  stats.totalMinutes += watchedMinutes
  
  // Track unique anime
  if (!stats.uniqueAnime.includes(animeId)) {
    stats.uniqueAnime.push(animeId)
  }
  
  // Update last watched
  stats.lastWatched = { animeId, episodeId, timestamp: Date.now() }
  
  // Update streak
  if (stats.lastActiveDate !== today) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (stats.lastActiveDate === yesterday.toDateString()) {
      stats.currentStreak += 1
    } else if (stats.lastActiveDate !== today) {
      stats.currentStreak = 1
    }
    
    if (stats.currentStreak > stats.longestStreak) {
      stats.longestStreak = stats.currentStreak
    }
    
    stats.lastActiveDate = today
  }
  
  // Daily activity tracking
  stats.dailyActivity[today] = (stats.dailyActivity[today] || 0) + 1
  
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats))
  
  // Check trophies
  checkTrophies(stats)
}

// Trophies (renamed from achievements)
export function getTrophies() {
  const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS)
  return data ? JSON.parse(data) : []
}

export function getAllTrophies() {
  const unlocked = getTrophies()
  return TROPHIES_LIST.map(t => ({
    ...t,
    unlocked: unlocked.includes(t.id)
  }))
}

function checkTrophies(stats) {
  const unlocked = getTrophies()
  const newUnlocks = []
  
  for (const trophy of TROPHIES_LIST) {
    if (unlocked.includes(trophy.id)) continue
    
    let progress = 0
    switch (trophy.type) {
      case 'episodes':
        progress = stats.totalEpisodes
        break
      case 'anime':
        progress = stats.uniqueAnime.length
        break
      case 'hours':
        progress = Math.floor(stats.totalMinutes / 60)
        break
      case 'streak':
        progress = stats.longestStreak
        break
    }
    
    if (progress >= trophy.requirement) {
      newUnlocks.push(trophy.id)
    }
  }
  
  if (newUnlocks.length > 0) {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify([...unlocked, ...newUnlocks]))
  }
}

export function getTrophyProgress(trophy, stats) {
  switch (trophy.type) {
    case 'episodes':
      return Math.min(stats.totalEpisodes / trophy.requirement, 1)
    case 'anime':
      return Math.min(stats.uniqueAnime.length / trophy.requirement, 1)
    case 'hours':
      return Math.min((stats.totalMinutes / 60) / trophy.requirement, 1)
    case 'streak':
      return Math.min(stats.longestStreak / trophy.requirement, 1)
    default:
      return 0
  }
}

// Clear all data
export function clearAllData() {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key))
}

// Watch progress operations (for resume functionality)
export function saveWatchProgress(animeId, episodeId, timestamp, duration) {
  const progress = getWatchProgress()
  progress[animeId] = {
    episodeId,
    timestamp,
    duration,
    savedAt: Date.now()
  }
  localStorage.setItem(STORAGE_KEYS.WATCH_PROGRESS, JSON.stringify(progress))
}

export function getWatchProgress() {
  const data = localStorage.getItem(STORAGE_KEYS.WATCH_PROGRESS)
  return data ? JSON.parse(data) : {}
}

export function getAnimeProgress(animeId) {
  const progress = getWatchProgress()
  return progress[animeId] || null
}

export function clearAnimeProgress(animeId) {
  const progress = getWatchProgress()
  delete progress[animeId]
  localStorage.setItem(STORAGE_KEYS.WATCH_PROGRESS, JSON.stringify(progress))
}
