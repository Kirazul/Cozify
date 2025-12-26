import { useState } from 'react'
import { markVisited, setUserName } from '../services/userService'
import joinImg from '/join.png'
import logoImg from '/LOGO.png'
import './WelcomeModal.css'

export default function WelcomeModal({ onClose }) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [transitioning, setTransitioning] = useState(false)

  const handleNameSubmit = () => {
    if (name.trim()) {
      setUserName(name.trim())
    }
    markVisited()
    
    // Start transition animation
    setTransitioning(true)
    setTimeout(() => {
      setStep(2)
      setTransitioning(false)
    }, 500)
  }

  const handleClose = () => {
    markVisited()
    onClose()
  }

  const handleWatchNow = () => {
    markVisited()
    onClose()
    window.location.hash = '#/browse'
  }

  // Step 1: Name input
  if (step === 1) {
    return (
      <div className="welcome-overlay">
        <div className={`welcome-name-modal ${transitioning ? 'exit' : ''}`}>
          <button className="welcome-close" onClick={handleClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
          
          <div className="name-modal-content">
            <img src={logoImg} alt="Cozify" className="welcome-logo" />
            <p>What should we call you?</p>
            
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
            />
            
            <button className="name-submit-btn" onClick={handleNameSubmit}>
              {name.trim() ? 'Continue' : 'Skip'}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Step 2: Image popup
  return (
    <div className="welcome-overlay" onClick={handleClose}>
      <div className="welcome-modal-image" onClick={(e) => e.stopPropagation()}>
        <button className="welcome-close" onClick={handleClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        <img src={joinImg} alt="Welcome to Cozify" />
        <button className="welcome-watch-btn" onClick={handleWatchNow}>
          Watch Now
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
