import { useEffect, useState } from 'react'
import useIsMobile from '../hooks/useIsMobile'

const MILESTONES = [
  { id: 'lnmiit',      company: 'LNMIIT',      logo: '/lnmiit.png',       color: '#60a5fa' },
  { id: 'nu-ms',       company: 'Northeastern', logo: '/northeastern.png', color: '#ef4444' },
  { id: 'avo',         company: 'Avo',          logo: '/avo.jpeg',         color: '#a855f7' },
  { id: 'mckinsey',    company: 'McKinsey',     logo: '/mckinsey.png',     color: '#1a73e8' },
  { id: 'nu-research', company: 'NU Research',  logo: '/northeastern.png', color: '#f97316' },
  { id: 'next',        company: 'Next',         logo: null,                color: '#facc15', future: true },
]

const N = MILESTONES.length

function hexToRgb(hex) {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)]
}
function lerpColor(a, b, t) {
  const [r1,g1,b1] = hexToRgb(a), [r2,g2,b2] = hexToRgb(b)
  return `rgb(${Math.round(r1+(r2-r1)*t)},${Math.round(g1+(g2-g1)*t)},${Math.round(b1+(b2-b1)*t)})`
}
function getDynamicColor(progress) {
  const scaled = progress * (N - 1)
  const i = Math.min(N - 2, Math.floor(scaled))
  return lerpColor(MILESTONES[i].color, MILESTONES[i + 1].color, scaled - i)
}

export default function Roadmap() {
  const [show, setShow] = useState(false)
  const [progress, setProgress] = useState(0)
  const isMobile = useIsMobile()

  useEffect(() => {
    const onScroll = () => {
      const skillsEl    = document.getElementById('skills')
      const educationEl = document.getElementById('education')
      const projectsEl  = document.getElementById('projects')
      const contactEl   = document.getElementById('contact')
      if (!skillsEl || !educationEl || !projectsEl || !contactEl) return

      const viewH   = window.innerHeight
      const scrollY = window.scrollY
      const skillsBottom = skillsEl.offsetTop + skillsEl.offsetHeight
      const contactTop   = contactEl.offsetTop

      setShow(
        scrollY + viewH > skillsBottom - viewH * 0.2 &&
        scrollY + viewH < contactTop + viewH * 0.3
      )

      const start      = educationEl.offsetTop
      const end        = projectsEl.offsetTop
      const viewCenter = scrollY + viewH * 0.5
      const range      = end - start
      if (range <= 0) return
      setProgress(Math.min(1, Math.max(0, (viewCenter - start) / range)))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const activeIndex = MILESTONES.reduce((acc, _, i) => progress >= i / (N-1) ? i : acc, 0)
  const dynamicColor = getDynamicColor(progress)
  const activeMilestone = MILESTONES[activeIndex]

  const logoSize = isMobile ? 22 : 28

  return (
    <>
      <div id="roadmap" style={{ height: 0, pointerEvents: 'none' }} />

      <style>{`
        @keyframes futurePulse { 0%,100%{opacity:0.6} 50%{opacity:1} }
      `}</style>

      <div style={{
        position: 'fixed',
        bottom: isMobile ? 14 : 24,
        left: '50%',
        transform: `translateX(-50%) translateY(${show ? 0 : 60}px)`,
        opacity: show ? 1 : 0,
        transition: 'opacity 0.45s ease, transform 0.45s cubic-bezier(.22,1,.36,1)',
        zIndex: 200,
        pointerEvents: show ? 'auto' : 'none',
      }}>
        <div style={{
          position: 'relative',
          width: isMobile ? 'calc(100vw - 40px)' : 560,
          borderRadius: 18,
          padding: isMobile ? '12px 16px 14px' : '14px 22px 16px',
          background: isMobile ? 'rgba(10,10,10,0.82)' : 'rgba(10,10,10,0.55)',
          backdropFilter: isMobile ? 'none' : 'blur(20px)',
          WebkitBackdropFilter: isMobile ? 'none' : 'blur(20px)',
          border: `1px solid ${dynamicColor}35`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${dynamicColor}18`,
          transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
        }}>

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: isMobile ? 10 : 12,
            position: 'relative',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: dynamicColor, boxShadow: `0 0 7px ${dynamicColor}`,
                display: 'inline-block', transition: 'background 0.4s ease',
              }} />
              <span style={{
                fontSize: 9.5, fontWeight: 700, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)',
              }}>
                Rohan as a Product
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {activeMilestone.logo ? (
                <div style={{
                  width: 16, height: 16, borderRadius: 4,
                  background: '#fff', overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 0 6px ${dynamicColor}60`,
                  transition: 'box-shadow 0.4s ease',
                }}>
                  <img src={activeMilestone.logo} alt={activeMilestone.company}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke={dynamicColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ animation: 'futurePulse 2s ease-in-out infinite' }}>
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              )}
              <span style={{ fontSize: 10, fontWeight: 600, color: dynamicColor, transition: 'color 0.4s ease' }}>
                {activeMilestone.company}
              </span>
            </div>
          </div>

          {/* Progress track */}
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <div style={{
              height: 3, borderRadius: 999,
              background: 'rgba(255,255,255,0.1)',
              position: 'relative',
            }}>
              <div style={{
                height: '100%', borderRadius: 999,
                background: 'linear-gradient(to right, #60a5fa, #ef4444, #a855f7, #1a73e8, #f97316, #facc15)',
                width: `${progress * 100}%`,
                transition: 'width 0.06s linear',
                boxShadow: `0 0 8px ${dynamicColor}80`,
              }} />
              {MILESTONES.map((m, i) => {
                const pos = (i / (N-1)) * 100
                const reached = i <= activeIndex
                const isCurrent = i === activeIndex
                return (
                  <div key={m.id} style={{
                    position: 'absolute', top: '50%', left: `${pos}%`,
                    transform: 'translate(-50%, -50%)',
                    width: isCurrent ? 11 : 7,
                    height: isCurrent ? 11 : 7,
                    borderRadius: '50%',
                    background: reached ? m.color : 'rgba(255,255,255,0.15)',
                    border: `1.5px solid ${reached ? m.color : 'rgba(255,255,255,0.2)'}`,
                    boxShadow: isCurrent ? `0 0 8px ${m.color}, 0 0 16px ${m.color}50` : 'none',
                    transition: 'all 0.4s cubic-bezier(.22,1,.36,1)',
                    zIndex: 2,
                  }} />
                )
              })}
            </div>

            {/* Logos anchored directly below each dot */}
            <div style={{ position: 'relative', height: logoSize + 18, marginTop: 8 }}>
              {MILESTONES.map((m, i) => {
                const pos = (i / (N-1)) * 100
                const isActive = i === activeIndex
                const isPast = i < activeIndex
                // edge alignment: first left, last right, others center
                const tx = i === 0 ? '0%' : i === N-1 ? '-100%' : '-50%'
                return (
                  <div key={m.id} style={{
                    position: 'absolute',
                    left: `${pos}%`,
                    top: 0,
                    transform: `translateX(${tx})`,
                    display: 'flex', flexDirection: 'column',
                    alignItems: i === 0 ? 'flex-start' : i === N-1 ? 'flex-end' : 'center',
                    gap: 4,
                  }}>
                    {m.logo ? (
                      <div style={{
                        width: logoSize, height: logoSize,
                        borderRadius: 7,
                        background: '#fff',
                        overflow: 'hidden',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: isActive ? 1 : isPast ? 0.55 : 0.2,
                        transition: 'opacity 0.4s ease, box-shadow 0.4s ease',
                        boxShadow: isActive
                          ? `0 0 0 1.5px ${m.color}, 0 0 10px ${m.color}70`
                          : 'none',
                      }}>
                        <img src={m.logo} alt={m.company}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                    ) : (
                      <div style={{
                        width: logoSize, height: logoSize,
                        borderRadius: 7,
                        border: `1.5px solid ${isActive ? m.color : 'rgba(255,255,255,0.15)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'border-color 0.4s ease',
                        boxShadow: isActive ? `0 0 10px ${m.color}70` : 'none',
                      }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                          stroke={isActive ? m.color : 'rgba(255,255,255,0.25)'}
                          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                          style={{ animation: isActive ? 'futurePulse 2s ease-in-out infinite' : 'none' }}>
                          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                        </svg>
                      </div>
                    )}
                    <span style={{
                      fontSize: isMobile ? 7 : 8,
                      fontWeight: 600,
                      color: isActive ? m.color : isPast ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.18)',
                      transition: 'color 0.4s ease',
                      whiteSpace: 'nowrap',
                      animation: m.future && isActive ? 'futurePulse 2s ease-in-out infinite' : 'none',
                    }}>
                      {m.company}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
