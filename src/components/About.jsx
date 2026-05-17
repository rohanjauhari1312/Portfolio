import { useEffect, useRef, useState } from 'react'
import useIsMobile from '../hooks/useIsMobile'

const EDUCATION = [
  {
    school: 'Northeastern University',
    logo: '/northeastern.png',
    degree: 'MS · Information Systems',
    period: 'Sep 2024 – Aug 2026',
    note: 'GPA 3.73',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.1)',
    location: 'Boston, MA',
  },
  {
    school: 'LNM Institute of Information Technology',
    logo: '/lnmiit.png',
    degree: 'BTech · Computer Science',
    period: 'Jul 2017 – May 2021',
    note: '',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.1)',
    location: 'Jaipur, India',
  },
]


export default function About() {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.1 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const fadeStyle = (delay = 0) => ({
    opacity:   visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(24px)',
    transition: `opacity 0.7s ease ${delay}ms, transform 0.7s cubic-bezier(.22,1,.36,1) ${delay}ms`,
  })

  return (
    <section style={{ background: 'rgba(10,10,10,0.85)', padding: isMobile ? '24px 0 48px' : '40px 0 80px' }}>
      <div style={{
        height: 1,
        background: 'linear-gradient(to right, transparent, rgba(250,204,21,0.12), transparent)',
        marginBottom: isMobile ? 32 : 48,
      }} />

      <div ref={ref} style={{ maxWidth: 1320, margin: '0 auto', padding: isMobile ? '0 24px' : '0 64px' }}>

        {/* Section label */}
        <div style={{ ...fadeStyle(0), marginBottom: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#facc15', boxShadow: '0 0 8px #facc15', display: 'inline-block',
            }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#facc15' }}>
              About
            </span>
          </div>
          <h2 style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 800, color: '#f5f5f5', letterSpacing: '-0.02em', lineHeight: 1.1, margin: '0 0 16px' }}>
            Building AI products<br />
            <span style={{ color: 'rgba(255,255,255,0.35)' }}>that actually work.</span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', maxWidth: 620, lineHeight: 1.75, margin: 0 }}>
            I build products that make complex things feel simple, automating workflows for enterprise teams,
            turning raw data into decisions, and shipping AI into the hands of everyday users.
            4 years across McKinsey and a growth-stage SaaS, currently finishing my MS at Northeastern (GPA 3.73).
          </p>
        </div>

        {/* Education */}
        <div style={{ ...fadeStyle(200) }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: '0 0 28px' }}>
            Education
          </h3>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {EDUCATION.map(e => (
              <div key={e.school} style={{
                flex: 1, minWidth: 280,
                padding: '22px 24px', borderRadius: 14,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderLeft: `3px solid ${e.color}`,
                display: 'flex', gap: 16, alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 72, height: 72, borderRadius: 14, flexShrink: 0,
                  background: '#fff', padding: 3,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 14px rgba(0,0,0,0.28)',
                  overflow: 'hidden',
                }}>
                  <img src={e.logo} alt={e.school} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#f5f5f5', marginBottom: 3 }}>{e.school}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{e.degree}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 6, display: 'flex', gap: 10 }}>
                    <span>{e.period}</span>
                    {e.note && <><span>·</span><span style={{ color: e.color }}>{e.note}</span></>}
                    <span>· {e.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
