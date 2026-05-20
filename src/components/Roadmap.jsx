import { useEffect, useRef, useState } from 'react'
import useIsMobile from '../hooks/useIsMobile'

const MILESTONES = [
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
    company: 'McKinsey & Company',
    logo: '/mckinsey.png',
    role: 'Product Analyst Co-op',
    period: 'Aug – Dec 2025',
    status: 'Completed',
    color: '#1a73e8',
  },
  {
    id: 'nu',
    company: 'Northeastern Research',
    logo: '/northeastern.png',
    role: 'Research Assistant · Agentic AI',
    period: 'Jan 2026 – Present',
    status: 'Active',
    color: '#ef4444',
  },
  {
    id: 'next',
    company: 'Next Role',
    logo: null,
    role: 'Product · Strategy · AI',
    period: 'Open to opportunities',
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
  const sectionRef = useRef(null)
  const [progress, setProgress] = useState(0)
  const isMobile = useIsMobile()

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const scrollable = el.offsetHeight - window.innerHeight
      if (scrollable <= 0) return
      const scrolled = Math.max(0, -rect.top)
      setProgress(Math.min(1, scrolled / scrollable))
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
  const fillWidth = `${progress * 100}%`

  return (
    <div
      ref={sectionRef}
      id="roadmap"
      style={{
        height: isMobile ? '280vh' : '370vh',
        position: 'relative',
        background: 'rgba(10,10,10,0.85)',
      }}
    >
      <style>{`
        @keyframes dotPulse {
          0%, 100% { box-shadow: 0 0 0 0 currentColor; transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.15); }
        }
        @keyframes futurePulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
      `}</style>

      <div style={{
        height: 1,
        background: 'linear-gradient(to right, transparent, rgba(250,204,21,0.12), transparent)',
      }} />

      <div style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}>
        <div style={{
          width: '100%',
          maxWidth: 1320,
          margin: '0 auto',
          padding: isMobile ? '0 24px' : '0 64px',
        }}>

          {/* Header */}
          <div style={{ marginBottom: isMobile ? 36 : 52 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: dynamicColor,
                boxShadow: `0 0 8px ${dynamicColor}`,
                display: 'inline-block',
                transition: 'background 0.4s ease, box-shadow 0.4s ease',
              }} />
              <span style={{
                fontSize: 11, fontWeight: 600, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: dynamicColor,
                transition: 'color 0.4s ease',
              }}>
                Product Roadmap
              </span>
            </div>
            <h2 style={{
              fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 800,
              color: '#f5f5f5', letterSpacing: '-0.02em', lineHeight: 1.1, margin: '0 0 10px',
            }}>
              The arc so far.
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.28)', margin: 0, letterSpacing: '0.03em' }}>
              Scroll to progress through the timeline
            </p>
          </div>

          {/* Progress track */}
          <div style={{ position: 'relative', marginBottom: isMobile ? 28 : 36 }}>
            {/* Track bg */}
            <div style={{
              height: 3, background: 'rgba(255,255,255,0.06)',
              borderRadius: 999, position: 'relative',
            }}>
              {/* Fill */}
              <div style={{
                height: '100%', borderRadius: 999,
                background: `linear-gradient(to right, #a855f7, #1a73e8, #ef4444, #facc15)`,
                width: fillWidth,
                transition: 'width 0.08s linear',
                boxShadow: `0 0 12px ${dynamicColor}90, 0 0 24px ${dynamicColor}40`,
              }} />

              {/* Milestone dots */}
              {MILESTONES.map((m, i) => {
                const pos = (i / (N - 1)) * 100
                const reached = i <= activeIndex
                const isCurrent = i === activeIndex
                return (
                  <div
                    key={m.id}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: `${pos}%`,
                      transform: 'translate(-50%, -50%)',
                      width: isCurrent ? 18 : 13,
                      height: isCurrent ? 18 : 13,
                      borderRadius: '50%',
                      background: reached ? m.color : 'rgba(255,255,255,0.08)',
                      border: `2px solid ${reached ? m.color : 'rgba(255,255,255,0.12)'}`,
                      boxShadow: isCurrent ? `0 0 14px ${m.color}90, 0 0 28px ${m.color}40` : 'none',
                      transition: 'all 0.4s cubic-bezier(.22,1,.36,1)',
                      zIndex: 2,
                    }}
                  />
                )
              })}
            </div>
          </div>

          {/* Milestone cards */}
          <div style={{
            display: 'flex',
            gap: isMobile ? 10 : 20,
            alignItems: 'stretch',
          }}>
            {MILESTONES.map((m, i) => {
              const active = i === activeIndex
              const passed = i < activeIndex
              const upcoming = i > activeIndex

              return (
                <div
                  key={m.id}
                  style={{
                    flex: 1,
                    padding: isMobile ? '14px 12px' : '22px 20px',
                    borderRadius: 14,
                    background: active
                      ? `${m.color}12`
                      : passed ? `${m.color}07` : 'rgba(255,255,255,0.015)',
                    border: `1px solid ${active ? m.color + '45' : passed ? m.color + '22' : 'rgba(255,255,255,0.05)'}`,
                    borderTop: `2px solid ${passed || active ? m.color : 'rgba(255,255,255,0.06)'}`,
                    opacity: upcoming ? 0.38 : 1,
                    transform: active ? 'translateY(-6px)' : 'translateY(0)',
                    transition: 'all 0.5s cubic-bezier(.22,1,.36,1)',
                    boxShadow: active ? `0 0 28px ${m.color}22, 0 8px 32px rgba(0,0,0,0.25)` : 'none',
                  }}
                >
                  {/* Logo */}
                  <div style={{
                    width: isMobile ? 30 : 40, height: isMobile ? 30 : 40,
                    borderRadius: 9, marginBottom: isMobile ? 10 : 14,
                    background: m.logo ? '#fff' : `${m.color}18`,
                    border: `1px solid ${m.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', padding: m.logo ? 3 : 0,
                    boxShadow: active ? `0 0 14px ${m.color}50` : 'none',
                    transition: 'box-shadow 0.4s ease',
                  }}>
                    {m.logo ? (
                      <img src={m.logo} alt={m.company} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={m.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        style={{ animation: active ? 'futurePulse 2s ease-in-out infinite' : 'none' }}>
                        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                      </svg>
                    )}
                  </div>

                  <div style={{
                    fontSize: isMobile ? 10.5 : 12.5, fontWeight: 700,
                    color: active ? '#f5f5f5' : passed ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)',
                    marginBottom: 3, lineHeight: 1.2,
                    transition: 'color 0.4s ease',
                  }}>
                    {m.company}
                  </div>

                  {!isMobile && (
                    <div style={{
                      fontSize: 10.5, color: 'rgba(255,255,255,0.32)',
                      marginBottom: 10, lineHeight: 1.4,
                    }}>
                      {m.role}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-start' }}>
                    <span style={{
                      fontSize: isMobile ? 8 : 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                      color: m.color, background: `${m.color}15`, border: `1px solid ${m.color}35`,
                      padding: '2px 7px', borderRadius: 4,
                      animation: m.future && active ? 'futurePulse 2s ease-in-out infinite' : 'none',
                    }}>
                      {m.status}
                    </span>
                    {!isMobile && (
                      <span style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.22)' }}>{m.period}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Scroll hint */}
          <div style={{
            position: 'absolute',
            bottom: 36, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            opacity: progress < 0.04 ? 0.45 : 0,
            transition: 'opacity 0.5s ease',
            pointerEvents: 'none',
          }}>
            <span style={{ fontSize: 10, color: '#facc15', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Scroll</span>
            <div style={{ width: 1, height: 36, background: 'linear-gradient(to bottom, #facc15, transparent)' }} />
          </div>

        </div>
      </div>
    </div>
  )
}
