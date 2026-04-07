import { useEffect, useState } from 'react'

const DESKTOP_QUERY = '(min-width: 1024px)'

function getInitialValue(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return window.matchMedia(DESKTOP_QUERY).matches
}

export function useDesktopLayout(): boolean {
  const [isDesktop, setIsDesktop] = useState<boolean>(getInitialValue)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia(DESKTOP_QUERY)
    const update = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches)
    }

    setIsDesktop(mediaQuery.matches)
    mediaQuery.addEventListener('change', update)

    return () => {
      mediaQuery.removeEventListener('change', update)
    }
  }, [])

  return isDesktop
}
