import { useEffect, useRef, useState } from 'react'
import useIsMobile from '../hooks/useIsMobile'

const MILESTONES = [
  {
    id: 'lnmiit',
    company: 'LNMIIT',
    logo: '/lnmiit.png',
    role: 'BTech · Computer Science',
    period: '2017 – 2021',
    status: 'Graduated',
    color: '#60a5fa',
  },
  {
    id: 'avo',
    company: 'Avo Automation',
    logo: '/avo.jpeg',
    role: 'Product Engineer → Sr. Product Engineer',
    period: '2021 – 2024',
    status: 'Shipped',
    color: '#a855f7',
  },
  {
    id: 'mckinsey',
    company: 'McKinsey',
    logo: '/mckinsey.png',
    role: 'Product Analyst Co-op',
    period: 'Aug – Dec 2025',
    status: 'Completed',
    color: '#1a73e8',
  },
  {
    id: 'nu',
    company: 'Northeastern',
    logo: '/northeastern.png',
    role: 'MS + Research · Agentic AI',
    period: 'Jan 2026 – Present',
    status: 'Active',
    color: '#ef4444',
  },
  {
    id: 'next',
    company: 'Next Role',
    logo: null,
    role: 'Product · Strategy · AI',
    period: 'Open',
    status: 'Open',
    color: '#facc15',
    future: true,
  },
]

const N = MILESTONES.length

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

function lerpColor(a, b, t) {
  const [r1, g1, b1] = hexToRgb(a)
  const [r2, g2, b2] = hexToRgb(b)
  return `rgb(${Math.round(r1 + (r2 - r1) * t)}, ${Math.round(g1 + (g2 - g1) * t)}, ${Math.round(b1 + (b2 - b1) * t)})`
}

function getDynamicColor(progress) {
  const scaled = progress * (N - 1)
  const i = Math.min(N - 2, Math.floor(scaled))
  const t = scaled - i
  return lerpColor(MILESTONES[i].color, MILESTONES[i + 1].color, t)
}

export default function Roadmap() {
  const [show, setShow] = useState(false)
  const [progress, setProgress] = useState(0)
  const isMobile = useIsMobile()

  useEffect(() => {
    const onScroll = () => {
      const skillsEl = document.getElementById('skills')
      if (!skillsEl) return

      const skillsBottom = skillsEl.offsetTop + skillsEl.offsetHeight
      const docHeight = document.documentElement.scrollHeight
      const viewH = window.innerHeight
      const scrollY = window.scrollY

      // show once Skills section bottom is within 20% of the viewport bottom
      setShow(scrollY + viewH > skillsBottom - viewH * 0.2)

      const range = docHeight - viewH - skillsBottom
      if (range <= 0) return
      setProgress(Math.min(1, Math.max(0, (scrollY - skillsBottom) / range)))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const activeIndex = MILESTONES.reduce((acc, _, i) => {
    if (progress >= i / (N - 1)) return i
    return acc
  }, 0)

  const dynamicColor = getDynamicColor(progress)
  const activeMilestone = MILESTONES[activeIndex]

  return (
    <>
      {/* Zero-height anchor in DOM flow */}
      <div id="roadmap" style={{ height: 0, pointerEvents: 'none' }} />

      <style>{`
        @keyframes futurePulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>

      <div
        style={{
          position: 'fixed',
          bottom: isMobile ? 14 : 24,
          left: '50%',
          transform: `translateX(-50%) translateY(${show ? 0 : 56}px)`,
          opacity: show ? 1 : 0,
          transition: 'opacity 0.45s ease, transform 0.45s cubic-bezier(.22,1,.36,1)',
          zIndex: 200,
          pointerEvents: show ? 'auto' : 'none',
        }}
      >
        <div
          style={{
            background: 'rgba(10,10,10,0.93)',
            border: `1px solid ${dynamicColor}35`,
            borderRadius: 16,
            backdropFilter: isMobile ? 'none' : 'blur(20px)',
            WebkitBackdropFilter: isMobile ? 'none' : 'blur(20px)',
            padding: isMobile ? '10px 14px' : '14px 22px',
            width: isMobile ? 'calc(100vw - 40px)' : 520,
            boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${dynamicColor}18`,
            transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: isMobile ? 8 : 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: dynamicColor,
                boxShadow: `0 0 6px ${dynamicColor}`,
                display: 'inline-block',
                transition: 'background 0.4s ease',
              }} />
              <span style={{
                fontSize: 9.5, fontWeight: 600, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: dynamicColor,
                transition: 'color 0.4s ease',
              }}>
                Product Roadmap
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              {activeMilestone.logo ? (
                <div style={{
                  width: 18, height: 18, borderRadius: 5,
                  background: '#fff', overflow: 'hidden', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 0 6px ${dynamicColor}60`,
                }}>
                  <img src={activeMilestone.logo} alt={activeMilestone.company}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke={dynamicColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ animation: 'futurePulse 2s ease-in-out infinite' }}>
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              )}
              <span style={{
                fontSize: 10, fontWeight: 600,
                color: activeIndex === N - 1 ? dynamicColor : 'rgba(255,255,255,0.5)',
                transition: 'color 0.4s ease',
              }}>
                {activeMilestone.company}
              </span>
            </div>
          </div>

          {/* Progress track */}
          <div style={{ position: 'relative', marginBottom: isMobile ? 8 : 10 }}>
            <div style={{
              height: 3, background: 'rgba(255,255,255,0.06)',
              borderRadius: 999, position: 'relative',
            }}>
              <div style={{
                height: '100%', borderRadius: 999,
                background: 'linear-gradient(to right, #60a5fa, #a855f7, #1a73e8, #ef4444, #facc15)',
                width: `${progress * 100}%`,
                transition: 'width 0.06s linear',
                boxShadow: `0 0 8px ${dynamicColor}80`,
              }} />
              {MILESTONES.map((m, i) => {
                const pos = (i / (N - 1)) * 100
                const reached = i <= activeIndex
                const isCurrent = i === activeIndex
                return (
                  <div
                    key={m.id}
                    style={{
                      position: 'absolute', top: '50%', left: `${pos}%`,
                      transform: 'translate(-50%, -50%)',
                      width: isCurrent ? 12 : 8,
                      height: isCurrent ? 12 : 8,
                      borderRadius: '50%',
                      background: reached ? m.color : 'rgba(255,255,255,0.08)',
                      border: `2px solid ${reached ? m.color : 'rgba(255,255,255,0.12)'}`,
                      boxShadow: isCurrent ? `0 0 8px ${m.color}90, 0 0 16px ${m.color}40` : 'none',
                      transition: 'all 0.4s cubic-bezier(.22,1,.36,1)',
                      zIndex: 2,
                    }}
                  />
                )
              })}
            </div>
          </div>

          {/* Milestone logos + labels */}
          <div style={{ display: 'flex' }}>
            {MILESTONES.map((m, i) => {
              const isActive = i === activeIndex
              const isPast = i < activeIndex
              const labelColor = isActive ? m.color : isPast ? 'rgba(255,255,255,0.38)' : 'rgba(255,255,255,0.14)'
              return (
                <div
                  key={m.id}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: i === 0 ? 'flex-start' : i === N - 1 ? 'flex-end' : 'center',
                    gap: 4,
                  }}
                >
                  {m.logo ? (
                    <div style={{
                      width: isMobile ? 20 : 24,
                      height: isMobile ? 20 : 24,
                      borderRadius: 6,
                      background: '#fff',
                      overflow: 'hidden',
                      flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: isActive ? 1 : isPast ? 0.5 : 0.18,
                      transition: 'opacity 0.4s ease, box-shadow 0.4s ease',
                      boxShadow: isActive ? `0 0 8px ${m.color}90` : 'none',
                    }}>
                      <img src={m.logo} alt={m.company}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                  ) : (
                    <div style={{
                      width: isMobile ? 20 : 24,
                      height: isMobile ? 20 : 24,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke={isActive ? m.color : 'rgba(255,255,255,0.14)'}
                        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        style={{
                          transition: 'stroke 0.4s ease',
                          animation: isActive ? 'futurePulse 2s ease-in-out infinite' : 'none',
                        }}>
                        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </div>
                  )}
                  <span style={{
                    fontSize: isMobile ? 7.5 : 8.5,
                    fontWeight: 600,
                    color: labelColor,
                    transition: 'color 0.4s ease',
                    animation: m.future && isActive ? 'futurePulse 2s ease-in-out infinite' : 'none',
                    whiteSpace: 'nowrap',
                  }}>
                    {m.company}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
