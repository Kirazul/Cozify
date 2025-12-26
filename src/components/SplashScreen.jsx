import { useState, useEffect } from 'react'
import './SplashScreen.css'

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState('loading') // loading -> reveal -> exit

  useEffect(() => {
    // Loading phase
    const revealTimer = setTimeout(() => {
      setPhase('reveal')
    }, 1800)

    // Exit phase
    const exitTimer = setTimeout(() => {
      setPhase('exit')
    }, 2400)

    // Complete
    const completeTimer = setTimeout(() => {
      onComplete()
    }, 3000)

    return () => {
      clearTimeout(revealTimer)
      clearTimeout(exitTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <div className={`splash-screen ${phase}`}>
      <div className="splash-bg">
        <div className="splash-glow glow-1"></div>
        <div className="splash-glow glow-2"></div>
        <div className="splash-glow glow-3"></div>
      </div>
      
      <div className="splash-content">
        <div className="logo-container">
          <div className="logo-text">
            {'Cozify'.split('').map((letter, i) => (
              <span 
                key={i} 
                className="logo-letter"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {letter}
              </span>
            ))}
          </div>
          <div className="logo-tagline">Your Anime Universe</div>
        </div>
        
        <div className="loader-container">
          <div className="loader-bar">
            <div className="loader-progress"></div>
          </div>
          <div className="loader-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <div className="splash-particles">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  )
}
