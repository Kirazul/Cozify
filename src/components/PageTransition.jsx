import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import logoImg from '/LOGO.png'
import './PageTransition.css'

export default function PageTransition({ children }) {
  const location = useLocation()
  const [showLoader, setShowLoader] = useState(true)
  const [loaderExiting, setLoaderExiting] = useState(false)
  const lastPathRef = useRef('')
  const timer1Ref = useRef(null)
  const timer2Ref = useRef(null)

  useEffect(() => {
    const currentPath = location.pathname
    const isInitialLoad = lastPathRef.current === ''
    const isPathChange = lastPathRef.current !== currentPath
    
    if (!isInitialLoad && !isPathChange) return
    
    lastPathRef.current = currentPath
    
    // Clear any existing timers
    if (timer1Ref.current) clearTimeout(timer1Ref.current)
    if (timer2Ref.current) clearTimeout(timer2Ref.current)
    
    // Show loader
    setShowLoader(true)
    setLoaderExiting(false)
    
    // Start exit after delay
    timer1Ref.current = setTimeout(() => {
      if (isPathChange && !isInitialLoad) {
        window.scrollTo(0, 0)
      }
      setLoaderExiting(true)
      
      // Hide completely
      timer2Ref.current = setTimeout(() => {
        setShowLoader(false)
        setLoaderExiting(false)
      }, 400)
    }, 600)

    return () => {
      if (timer1Ref.current) clearTimeout(timer1Ref.current)
      if (timer2Ref.current) clearTimeout(timer2Ref.current)
    }
  }, [location.pathname])

  return (
    <>
      {showLoader && (
        <div className={`page-loader ${loaderExiting ? 'exit' : ''}`}>
          <img src={logoImg} alt="Cozify" className="loader-logo-img" />
        </div>
      )}
      <div className="page-content">
        {children}
      </div>
    </>
  )
}
