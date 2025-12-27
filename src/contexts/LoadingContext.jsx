import { createContext, useContext, useState, useCallback, useRef } from 'react'

const LoadingContext = createContext()

export function LoadingProvider({ children }) {
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const isLoadedRef = useRef(false)

  const setPageLoaded = useCallback((loaded) => {
    // Prevent multiple calls
    if (loaded && isLoadedRef.current) return
    isLoadedRef.current = loaded
    setIsPageLoaded(loaded)
  }, [])

  const resetLoading = useCallback(() => {
    isLoadedRef.current = false
    setIsPageLoaded(false)
  }, [])

  return (
    <LoadingContext.Provider value={{ isPageLoaded, setPageLoaded, resetLoading }}>
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider')
  }
  return context
}
