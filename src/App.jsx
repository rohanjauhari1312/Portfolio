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

export default function App() {
  const isMobile = useIsMobile()
  const [view, setView] = useState(() =>
    window.location.pathname === '/nourish' ? 'nourish' : 'home'
  )

  useEffect(() => {
    const onPop = (e) => {
      const isNourish = window.location.pathname === '/nourish'
      setView(isNourish ? 'nourish' : 'home')
      if (!isNourish) {
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
    setView(page)
    window.scrollTo(0, 0)
  }

  const navigateBack = () => {
    history.back()
  }

  return (
    <>
      <DotGrid dotColor={view === 'nourish' ? 'rgba(74,222,128,0.2)' : 'rgba(251,169,40,0.5)'} />
      {!isMobile && <CustomCursor />}

      {/* Portfolio — always mounted so Skills state survives navigation */}
      <div style={{ display: view === 'nourish' ? 'none' : 'block', background: '#0a0a0a', minHeight: '100vh' }}>
        <Navbar />
        <Hero onNavigate={navigateTo} />
        <Skills />
        <Education />
        <Roadmap />
        <Experience />
        <Projects onNavigate={navigateTo} />
        <Contact />
        <ScrollTop />
        <ChatBot />
      </div>

      {view === 'nourish' && <NourishDetail onBack={navigateBack} />}
    </>
  )
}
