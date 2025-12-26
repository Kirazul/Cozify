import { Link } from 'react-router-dom'
import logoImg from '/LOGO.png'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-bg"></div>
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <img src={logoImg} alt="Cozify" className="footer-logo-img" />
              <span className="footer-logo-text">Cozify</span>
            </Link>
            <p className="footer-tagline">
              Your cozy place to watch anime online. Stream thousands of anime series and movies in HD quality.
            </p>
            <div className="footer-stats">
              <div className="stat">
                <span className="stat-value">10K+</span>
                <span className="stat-label">Titles</span>
              </div>
              <div className="stat">
                <span className="stat-value">HD</span>
                <span className="stat-label">Quality</span>
              </div>
              <div className="stat">
                <span className="stat-value">24/7</span>
                <span className="stat-label">Streaming</span>
              </div>
            </div>
          </div>
          
          <div className="footer-nav">
            <div className="footer-col">
              <h4 className="footer-heading">Browse</h4>
              <ul className="footer-list">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/browse">Browse</Link></li>
                <li><Link to="/schedule">Schedule</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4 className="footer-heading">Genres</h4>
              <ul className="footer-list">
                <li><Link to="/browse?genre=action">Action</Link></li>
                <li><Link to="/browse?genre=romance">Romance</Link></li>
                <li><Link to="/browse?genre=comedy">Comedy</Link></li>
                <li><Link to="/browse?genre=fantasy">Fantasy</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4 className="footer-heading">Support</h4>
              <ul className="footer-list">
                <li><a href="#">FAQ</a></li>
                <li><a href="#">Contact</a></li>
                <li><a href="#">Privacy</a></li>
                <li><a href="#">Terms</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="copyright">{new Date().getFullYear()} Cozify. All rights reserved.</p>
          <p className="disclaimer">Cozify does not store any files on its server. All contents are provided by non-affiliated third parties.</p>
        </div>
      </div>
    </footer>
  )
}
