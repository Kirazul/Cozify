import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Anime from './pages/Anime'
import Watch from './pages/Watch'
import Browse from './pages/Browse'
import Schedule from './pages/Schedule'
import Profile from './pages/Profile'
import WelcomeModal from './components/WelcomeModal'
import { initUser, isFirstVisit } from './services/userService'

export default function App() {
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    initUser()
    if (isFirstVisit()) {
      setShowWelcome(true)
    }
  }, [])

  return (
    <HashRouter>
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="anime/:id" element={<Anime />} />
          <Route path="watch/:animeId/:episodeId" element={<Watch />} />
          <Route path="browse" element={<Browse />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
