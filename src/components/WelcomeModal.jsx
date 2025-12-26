import { useState } from 'react'
import { setUserName, markVisited } from '../services/userService'
import './WelcomeModal.css'

export default function WelcomeModal({ onClose }) {
  const [name, setName] = useState('')
  const [step, setStep] = useState(1)

  const handleSave = () => {
    if (name.trim()) {
      setUserName(name.trim())
    }
    markVisited()
    setStep(2)
  }

  const handleSkip = () => {
    markVisited()
    setStep(2)
  }

  const handleFinish = () => {
    onClose()
  }

  return (
    <div className="welcome-overlay">
      <div className="welcome-modal">
        <button className="welcome-close" onClick={handleFinish}>
          <span></span>
          <span></span>
        </button>

        {step === 1 && (
          <div className="welcome-content">
            <div className="welcome-visual">
              <div className="visual-circle"></div>
              <div className="visual-ring"></div>
              <div className="visual-ring delay"></div>
            </div>

            <h1>Welcome to Cozify</h1>
            <p className="welcome-subtitle">
              Your personal anime sanctuary. Everything you watch is saved locally on your device.
            </p>

            <div className="welcome-form">
              <label>What should we call you?</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                autoFocus
              />
              <span className="form-hint">Stored only on this device. No accounts, no tracking.</span>
            </div>

            <div className="welcome-actions">
              <button className="btn-primary" onClick={handleSave}>
                {name.trim() ? 'Continue' : 'Continue as Guest'}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="welcome-content">
            <div className="welcome-visual">
              <div className="visual-check">
                <span></span>
              </div>
            </div>

            <h1>{name.trim() ? `Welcome, ${name}` : 'Welcome'}</h1>
            <p className="welcome-subtitle">
              Your journey begins now. Track your progress, unlock achievements, and discover your watching patterns.
            </p>

            <div className="welcome-features">
              <div className="feature-item">
                <span className="feature-dot"></span>
                <span>Watch history saved automatically</span>
              </div>
              <div className="feature-item">
                <span className="feature-dot"></span>
                <span>Continue where you left off</span>
              </div>
              <div className="feature-item">
                <span className="feature-dot"></span>
                <span>Unlock achievements as you watch</span>
              </div>
              <div className="feature-item">
                <span className="feature-dot"></span>
                <span>View your stats anytime</span>
              </div>
            </div>

            <div className="welcome-actions">
              <button className="btn-primary" onClick={handleFinish}>
                Start Watching
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
