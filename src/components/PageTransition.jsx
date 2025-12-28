import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useLoading } from '../contexts/LoadingContext'
import logoImg from '/LOGO.png'
import './PageTransition.css'

export default function PageTransition({ children }) {
  const location = useLocation()
  const { isPageLoaded, resetLoading } = useLoading()
  const [showLoader, setShowLoader] = useState(true)
  const [loaderExiting, setLoaderExiting] = useState(false)
  const [contentVisible, setContentVisible] = useState(false)
  const lastPathRef = useRef('')
  const timerRef = useRef(null)
  const timeoutRef = useRef(null)
  const fromLandingRef = useRef(false)

  // Use layoutEffect to immediately hide content before paint
  useLayoutEffect(() => {
    const currentPath = location.pathname
    const isInitialLoad = lastPathRef.current === ''
    const isPathChange = lastPathRef.current !== currentPath
    
    // Check if coming from landing page (first navigation to /home)
    const isFromLanding = isInitialLoad && currentPath === '/home'
    fromLandingRef.current = isFromLanding
    
    if (!isInitialLoad && !isPathChange) return
    
    // Skip loader if coming from landing page (it has its own transition)
    if (isFromLanding) {
      setShowLoader(false)
      setContentVisible(true)
      lastPathRef.current = currentPath
      return
    }
    
    // Immediately hide content and show loader before any render
    setContentVisible(false)
    setShowLoader(true)
    setLoaderExiting(false)
    resetLoading()
    
    lastPathRef.current = currentPath
    
    if (isPathChange && !isInitialLoad) {
      window.scrollTo(0, 0)
    }
  }, [location.pathname, resetLoading])
  
  // Fallback timeout - force show content after 5 seconds max
  useEffect(() => {
    if (!showLoader) return
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      console.log('Loading timeout - forcing page display')
      setLoaderExiting(true)
      setTimeout(() => {
        setShowLoader(false)
        setLoaderExiting(false)
        setContentVisible(true)
      }, 400)
    }, 5000)
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [showLoader, location.pathname])

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  // Watch for page loaded state
  useEffect(() => {
    if (!isPageLoaded || !showLoader) return
    
    // Clear timeout since page loaded
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    
    // Clear any existing timer
    if (timerRef.current) clearTimeout(timerRef.current)
    
    // Minimum display time for the loader (so it doesn't flash)
    timerRef.current = setTimeout(() => {
      setLoaderExiting(true)
      
      // Hide loader completely, then show content
      setTimeout(() => {
        setShowLoader(false)
        setLoaderExiting(false)
        setContentVisible(true)
      }, 400)
    }, 400)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPageLoaded, showLoader])

  return (
    <>
      {showLoader && (
        <div className={`page-loader ${loaderExiting ? 'exit' : ''}`}>
          <img src={logoImg} alt="Cozify" className="loader-logo-img" />
          <div className="loader-dots">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>
      )}
      <div className={`page-content ${contentVisible ? 'visible' : ''}`}>
        {children}
      </div>
    </>
  )
}
