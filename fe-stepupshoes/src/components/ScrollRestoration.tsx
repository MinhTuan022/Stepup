import React from 'react'
import { useLocation } from 'react-router-dom'

const SCROLL_KEY = (path: string) => `scroll:${path}`

const ScrollRestoration: React.FC = () => {
  const location = useLocation()

  React.useLayoutEffect(() => {
    try {
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    } catch (e) {
    }

    const key = SCROLL_KEY(location.pathname + location.search)
    const saved = sessionStorage.getItem(key)
    if (saved) {
      requestAnimationFrame(() => {
        window.scrollTo(0, parseInt(saved, 10) || 0)
      })
    }

    const handleBeforeUnload = () => {
      const curKey = SCROLL_KEY(location.pathname + location.search)
      try {
        sessionStorage.setItem(curKey, String(window.scrollY || 0))
      } catch (e) {
      }
    }

    return () => {
      try {
        sessionStorage.setItem(key, String(window.scrollY || 0))
      } catch (e) {
      }
    }
  }, [location.key])

  React.useEffect(() => {
    const handleUnload = () => {
      try {
        sessionStorage.setItem(SCROLL_KEY(location.pathname + location.search), String(window.scrollY || 0))
      } catch (e) {
      }
    }

    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [location.pathname, location.search])

  return null
}

export default ScrollRestoration
