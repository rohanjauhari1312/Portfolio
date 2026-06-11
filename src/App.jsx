import { useState, useRef, useEffect } from 'react'
import CustomCursor from './components/CustomCursor'
import useIsMobile from './hooks/useIsMobile'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Skills from './components/Skills'
import Education from './components/Education'
import Roadmap from './components/Roadmap'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Contact from './components/Contact'
import ScrollTop from './components/ScrollTop'
import ChatBot from './components/ChatBot'
import DotGrid from './components/DotGrid'
import NourishDetail from './components/NourishDetail'
import SwiftHireDetail from './components/SwiftHireDetail'
import FramerDemo from './components/FramerDemo'
import RohBotScreen from './components/RohBotScreen'

const DETAIL_PATHS = ['nourish', 'swifthire', 'framer-demo', 'rohbot']
const SECTION_PATHS = ['about', 'skills', 'education', 'experience', 'projects', 'contact']

export default function App() {
  const isMobile = useIsMobile()
  const [view, setView] = useState(() => {
    const p = window.location.pathname.replace('/', '')
    return DETAIL_PATHS.includes(p) ? p : 'home'
  })
  const didNavigateInApp = useRef(false)

  // Preserve scroll position across a full reload. The browser's default
  // restore fires before async content (images/fonts/reveals) settles, so it
  // lands short and the page then grows past it. We re-apply it after layout.
  useEffect(() => {
    if (!('scrollRestoration' in history)) return
    const KEY = 'home_scroll_y'
    history.scrollRestoration = 'manual'

    let timer
    if (view === 'home') {
      const saved = parseInt(sessionStorage.getItem(KEY) || '0', 10)
      if (saved > 0) {
        const restore = () => window.scrollTo(0, saved)
        requestAnimationFrame(() => requestAnimationFrame(restore))
        window.addEventListener('load', restore, { once: true })
        timer = setTimeout(restore, 400)
      }
    }

    const save = () => { if (window.location.pathname === '/') sessionStorage.setItem(KEY, String(window.scrollY)) }
    window.addEventListener('pagehide', save)
    return () => { window.removeEventListener('pagehide', save); clearTimeout(timer) }
  }, [])

  useEffect(() => {
    const p = window.location.pathname.replace('/', '')
    if (SECTION_PATHS.includes(p)) {
      const tryScroll = (attempts = 0) => {
        const el = document.getElementById(p)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
        } else if (attempts < 10) {
          setTimeout(() => tryScroll(attempts + 1), 150)
        }
      }
      setTimeout(() => tryScroll(), 300)
    }
  }, [])

  useEffect(() => {
    const onPop = (e) => {
      const p = window.location.pathname.replace('/', '')
      const isDetail = DETAIL_PATHS.includes(p)
      setView(isDetail ? p : 'home')
      if (!isDetail) {
        const savedY = e.state?.scrollY ?? 0
        requestAnimationFrame(() => requestAnimationFrame(() => {
          window.scrollTo(0, savedY)
        }))
      } else {
        window.scrollTo(0, 0)
      }
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigateTo = (page) => {
    // Save current scroll into the existing history entry before pushing new one
    history.replaceState({ scrollY: window.scrollY }, '', '/')
    history.pushState(null, '', `/${page}`)
    didNavigateInApp.current = true
    setView(page)
    window.scrollTo(0, 0)
  }

  const navigateBack = () => {
    // If we got here via an in-app navigation, go back to restore scroll.
    // On a direct/shared load there's no in-app history, so go home cleanly.
    if (didNavigateInApp.current) {
      history.back()
    } else {
      history.replaceState(null, '', '/')
      setView('home')
      window.scrollTo(0, 0)
    }
  }

  return (
    <>
      <style>{`
        @property --ba {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes spin-border {
          to { --ba: 360deg; }
        }
        .page-border {
          position: fixed;
          inset: 0;
          z-index: 998;
          pointer-events: none;
          border: 1.5px solid transparent;
          border-image: conic-gradient(
            from var(--ba),
            #facc15, #fb923c, #ef4444, #a855f7, #60a5fa, #4ade80, #facc15
          ) 1;
          animation: spin-border 6s linear infinite;
          opacity: 0.55;
        }
      `}</style>
      <div className="page-border" />

      <DotGrid dotColor={view === 'nourish' ? 'rgba(74,222,128,0.2)' : view === 'swifthire' ? 'rgba(250,204,21,0.18)' : 'rgba(251,169,40,0.5)'} />
      {!isMobile && <CustomCursor />}

      {/* Portfolio — always mounted so Skills state survives navigation */}
      <div style={{
        display: (view === 'nourish' || view === 'swifthire' || view === 'framer-demo' || view === 'rohbot') ? 'none' : 'block',
        minHeight: '100vh',
        background: `
          radial-gradient(ellipse 70% 40% at 15% 10%, rgba(250,204,21,0.05) 0%, transparent 70%),
          radial-gradient(ellipse 60% 35% at 85% 90%, rgba(96,165,250,0.04) 0%, transparent 70%),
          radial-gradient(ellipse 50% 30% at 75% 20%, rgba(168,85,247,0.03) 0%, transparent 60%),
          #0a0a0a
        `,
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
      }}>
        <Navbar />
        <Hero onNavigate={navigateTo} />
        <Skills />
        <Education />
        <Roadmap />
        <Experience />
        <Projects onNavigate={navigateTo} />
        <Contact />
        <ScrollTop />
        <ChatBot onNavigate={navigateTo} />
      </div>

      {view === 'nourish' && <NourishDetail onBack={navigateBack} />}
      {view === 'swifthire' && <SwiftHireDetail onBack={navigateBack} />}
      {view === 'framer-demo' && <FramerDemo onBack={navigateBack} />}
      {view === 'rohbot' && <RohBotScreen onBack={navigateBack} onNavigate={navigateTo} />}
    </>
  )
}
