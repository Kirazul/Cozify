import logoImg from '/LOGO.png'
import './ResumeModal.css'

export default function ResumeModal({ savedTime, onResume, onStartOver }) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60)
      const remainMins = mins % 60
      return `${hrs}h ${remainMins}m ${secs}s`
    }
    return `${mins}m ${secs}s`
  }

  return (
    <div className="resume-modal-overlay">
      <div className="resume-modal">
        <div className="resume-icon">
          <img src={logoImg} alt="Cozify" className="resume-logo" />
        </div>
        
        <h3>Continue Watching?</h3>
        <p className="resume-time">
          You left off at <span>{formatTime(savedTime)}</span>
        </p>
        
        <div className="resume-actions">
          <button className="resume-btn primary" onClick={onResume}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            Resume
          </button>
          <button className="resume-btn secondary" onClick={onStartOver}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
            </svg>
            Start Over
          </button>
        </div>
      </div>
    </div>
  )
}
