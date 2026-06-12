import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import Header from './Header'
import Footer from './Footer'
import SplashScreen from './SplashScreen'
import { useLayoutMotion } from '../hooks/useLayoutMotion'
import { ScrollTrigger } from '../lib/gsap'

export default function Layout() {
  const shellRef = useRef(null)
  const location = useLocation()
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') return false
    return sessionStorage.getItem('vethelp.splashShown') !== '1'
  })

  // Al cambiar de ruta, mata cualquier ScrollTrigger que haya quedado colgado
  // de un componente desmontado. Asi las paginas nuevas pueden registrar
  // triggers limpios sin duplicarse.
  useEffect(() => {
    ScrollTrigger.refresh()
  }, [location.pathname])

  useLayoutMotion(shellRef, location.pathname)

  useEffect(() => {
    if (!showSplash) return undefined
    const timer = window.setTimeout(() => {
      sessionStorage.setItem('vethelp.splashShown', '1')
      setShowSplash(false)
    }, 2200)
    return () => window.clearTimeout(timer)
  }, [showSplash])

  return (
    <>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      <div ref={shellRef} className="page-shell flex flex-col min-h-screen">
        <Header />
        <main key={location.pathname} data-shell-main className="relative z-10 flex-1 container mx-auto max-w-6xl px-4 py-8 md:py-10">
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  )
}
