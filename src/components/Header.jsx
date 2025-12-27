import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { api } from '../api'
import { getUser } from '../services/userService'
import logoImg from '/LOGO.png'
import './Header.css'

export default function Header() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const searchRef = useRef(null)
  
  const isHome = location.pathname === '/home' || location.pathname === '/'
  const user = getUser()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        try {
          const data = await api.search(query)
          const results = data?.results || []
          setSuggestions(results)
          setShowSuggestions(results.length > 0)
        } catch (e) {
          console.error('Search error:', e)
          setSuggestions([])
          setShowSuggestions(false)
        }
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/browse?q=${encodeURIComponent(query.trim())}`)
      setShowSuggestions(false)
      setQuery('')
    }
  }

  const isActive = (path) => location.pathname === path

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''} ${isHome && !scrolled ? 'transparent' : ''}`}>
      <div className="container header-inner">
        <div className="header-left">
          <button className="menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
          </button>

          <Link to="/" className="logo">
            <img src={logoImg} alt="Cozify" className="logo-img" />
          </Link>

          <nav className={`nav ${mobileMenuOpen ? 'open' : ''}`}>
            <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
            <Link to="/browse" className={isActive('/browse') ? 'active' : ''}>Browse</Link>
            <Link to="/schedule" className={isActive('/schedule') ? 'active' : ''}>Schedule</Link>
          </nav>
        </div>

        <div className="header-right">
          <div className="search-box" ref={searchRef}>
            <form onSubmit={handleSearch}>
              <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search anime..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </form>

            {showSuggestions && (
              <div className="search-dropdown">
                {suggestions.length > 0 ? (
                  suggestions.slice(0, 6).map((item) => (
                    <Link 
                      key={item.id} 
                      to={`/anime/${item.id}`} 
                      className="search-item" 
                      onClick={() => { setShowSuggestions(false); setQuery(''); }}
                    >
                      <img src={item.image || '/placeholder.png'} alt="" />
                      <div className="search-item-info">
                        <span className="search-item-title">{item.title}</span>
                        {item.jname && <span className="search-item-jname">{item.jname}</span>}
                        <span className="search-item-meta">
                          {item.releaseDate && <span>{item.releaseDate}</span>}
                          {item.type && <span className="type-badge">{item.type}</span>}
                          {item.duration && <span>{item.duration}</span>}
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="search-no-results">No results found</div>
                )}
              </div>
            )}
          </div>

          <Link to="/profile" className="profile-btn">
            <div className="profile-avatar">
              {(user?.name || 'G')[0].toUpperCase()}
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}
