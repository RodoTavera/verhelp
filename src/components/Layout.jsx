import { Outlet, useLocation } from 'react-router-dom'
import { useRef } from 'react'
import Header from './Header'
import Footer from './Footer'
import { useLayoutMotion } from '../hooks/useLayoutMotion'

export default function Layout() {
  const shellRef = useRef(null)
  const location = useLocation()

  useLayoutMotion(shellRef, location.pathname)

  return (
    <div ref={shellRef} className="page-shell flex flex-col min-h-screen">
      <div className="background-layer" aria-hidden="true" />

      <Header />
      <main data-shell-main className="relative z-10 flex-1 container mx-auto px-4 py-8 md:py-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
