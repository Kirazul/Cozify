import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import bgImg from '/background.jpeg'
import './Landing.css'

export default function Landing() {
  const navigate = useNavigate()
  const [imageLoaded, setImageLoaded] = useState(false)
  const [entering, setEntering] = useState(false)

  useEffect(() => {
    const img = new Image()
    img.src = bgImg
    img.onload = () => setImageLoaded(true)
    if (img.complete) setImageLoaded(true)
  }, [])

  const handleEnter = () => {
    setEntering(true)
    setTimeout(() => navigate('/home'), 800)
  }

  return (
    <div className={`landing ${imageLoaded ? 'loaded' : ''} ${entering ? 'entering' : ''}`}>
      <div 
        className="landing-bg" 
        style={{ backgroundImage: `url(${bgImg})` }}
      />
      
      <div className="landing-content">
        <button className="enter-btn" onClick={handleEnter}>
          <span className="enter-text">始める</span>
          <span className="enter-subtext">Start Watching</span>
          <div className="enter-line"></div>
        </button>
      </div>
    </div>
  )
}
