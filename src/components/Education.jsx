import { useEffect, useRef, useState } from 'react'
import TypedHeading from './TypedHeading'
import useIsMobile from '../hooks/useIsMobile'

const EDUCATION = [
  {
    school: 'Northeastern University',
    logo: '/northeastern.png',
    degree: 'MS · Information Systems',
    period: 'Sep 2024 – Aug 2026',
    note: 'GPA 3.73',
    color: '#ef4444',
    location: 'Boston, MA',
  },
  {
    school: 'LNM Institute of Information Technology',
    logo: '/lnmiit.png',
    degree: 'BTech · Computer Science',
    period: 'Jul 2017 – May 2021',
    note: '',
    color: '#60a5fa',
    location: 'Jaipur, India',
  },
]

export default function Education() {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.08 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div id="education" style={{ background: 'rgba(10,10,10,0.85)', padding: isMobile ? '24px 0 48px' : '40px 0 80px' }}>
      <div style={{
        height: 1,
        background: 'linear-gradient(to right, transparent, rgba(250,204,21,0.12), transparent)',
        marginBottom: isMobile ? 32 : 48,
      }} />
      <div ref={ref} style={{ maxWidth: 1320, margin: '0 auto', padding: isMobile ? '0 24px' : '0 64px' }}>

        <div style={{
          marginBottom: 40,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.6s ease, transform 0.7s cubic-bezier(.22,1,.36,1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#facc15', boxShadow: '0 0 8px #facc15', display: 'inline-block',
            }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#facc15' }}>
              Education
            </span>
          </div>
          <TypedHeading text="Where I studied." style={{
            fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 800, color: '#f5f5f5',
            letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0,
          }} />
        </div>

        <style>{`
          @keyframes floatCard {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-7px); }
          }
        `}</style>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {EDUCATION.map((e, idx) => (
            <div
              key={e.school}
              style={{
                width: '100%',
                padding: isMobile ? '20px' : '24px 28px', borderRadius: 16,
                background: 'rgba(16,16,16,0.92)',
                border: `1px solid ${e.color}30`,
                borderLeft: `3px solid ${e.color}`,
                display: 'flex', gap: 16, alignItems: 'flex-start',
                boxShadow: `0 0 18px ${e.color}18, inset 0 0 0 1px ${e.color}10`,
                transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
                cursor: 'default',
                opacity: visible ? 1 : 0,
                animation: visible ? `floatCard ${3.5 + idx * 0.4}s ease-in-out ${idx * 0.6}s infinite` : 'none',
              }}
              onMouseEnter={ev => {
                ev.currentTarget.style.boxShadow = `0 0 24px ${e.color}80, 0 0 60px ${e.color}45, 0 0 100px ${e.color}20, inset 0 0 0 1px ${e.color}30`
              }}
              onMouseLeave={ev => {
                ev.currentTarget.style.boxShadow = `0 0 18px ${e.color}18, inset 0 0 0 1px ${e.color}10`
              }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: 12, flexShrink: 0,
                background: '#fff', padding: 3,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: '0 2px 14px rgba(0,0,0,0.3)',
              }}>
                <img src={e.logo} alt={e.school} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: isMobile ? 13.5 : 15, fontWeight: 700, color: '#f5f5f5', marginBottom: 4 }}>{e.school}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 10 }}>{e.degree}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontSize: 11, fontWeight: 600, letterSpacing: '0.03em',
                    color: e.color,
                    background: `${e.color}12`,
                    border: `1px solid ${e.color}30`,
                    padding: '3px 9px', borderRadius: 6,
                  }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    {e.period}
                  </span>
                  {e.note && (
                    <span style={{
                      fontSize: 11, color: 'rgba(255,255,255,0.38)',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      padding: '3px 10px', borderRadius: 6,
                      fontWeight: 600,
                    }}>{e.note}</span>
                  )}
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontSize: 11, color: 'rgba(255,255,255,0.35)',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    padding: '3px 9px', borderRadius: 6,
                  }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    {e.location}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
