import { useEffect, useRef, useState } from 'react'
import AIScanner from './AIScanner'
import NeuralCard from './NeuralCard'
import TypedHeading from './TypedHeading'
import useIsMobile from '../hooks/useIsMobile'

const NAME = 'Rohan Jauhari'
const TAGLINE = 'Product Management'

const ABOUT = 'I build products that make complex things feel simple, automating workflows for enterprise teams, turning raw data into decisions, and shipping AI into the hands of everyday users.'

const EDUCATION = [
  {
    school: 'Northeastern University',
    logo: '/northeastern.png',
    degree: 'MS · Information Systems',
    period: 'Sep 2024 – Aug 2026',
    note: 'GPA 3.73',
    color: '#60a5fa',
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

const TRAITS = [
  { label: '4+ Years in Product', sub: 'Shipped, patented, repeated',         color: '#facc15', bg: 'rgba(250,204,21,0.08)',  border: 'rgba(250,204,21,0.2)'  },
  { label: 'Agentic AI Expert',   sub: 'Multi-agent systems, LLM pipelines',  color: '#facc15', bg: 'rgba(250,204,21,0.08)',  border: 'rgba(250,204,21,0.2)'  },
  { label: 'Data-Driven PM',      sub: 'SQL, Snowflake, Heap, Power BI',      color: '#fb923c', bg: 'rgba(251,146,60,0.08)',  border: 'rgba(251,146,60,0.2)'  },
  { label: 'User Obsessed',       sub: '100+ user interviews and counting',   color: '#fb923c', bg: 'rgba(251,146,60,0.08)',  border: 'rgba(251,146,60,0.2)'  },
]

function AnimatedName({ name, onTyped, fast }) {
  const [count, setCount] = useState(0)
  const [cursorOn, setCursorOn] = useState(true)

  useEffect(() => {
    const delay = setTimeout(() => {
      let i = 0
      const interval = setInterval(() => {
        i++
        setCount(i)
        if (i >= name.length) {
          clearInterval(interval)
          onTyped && onTyped()
        }
      }, fast ? 32 : 55)
      return () => clearInterval(interval)
    }, fast ? 200 : 400)
    return () => clearTimeout(delay)
  }, [name, fast])

  useEffect(() => {
    const blink = setInterval(() => setCursorOn(p => !p), 700)
    return () => clearInterval(blink)
  }, [])

  const done = count >= name.length

  return (
    <h1
      className="font-extrabold tracking-tight leading-[1.05] mb-10"
      style={{ fontSize: 'clamp(2.4rem, 7vw, 5.5rem)', color: '#f5f5f5', whiteSpace: 'nowrap' }}
    >
      {name.slice(0, count)}
      <span
        style={{
          display: 'inline-block',
          width: '0.06em',
          height: '0.88em',
          background: '#facc15',
          marginLeft: 4,
          verticalAlign: 'middle',
          opacity: done ? (cursorOn ? 1 : 0) : 1,
          transition: done ? 'opacity 0.1s' : 'none',
          boxShadow: '0 0 8px #facc15',
        }}
      />
    </h1>
  )
}

function FadeIn({ children, delay = 0, className = '', direction = 'up' }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  const offset = direction === 'up' ? 'translateY(24px)' : direction === 'right' ? 'translateX(-24px)' : 'translateX(24px)'
  return (
    <div
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate(0)' : offset,
        transition: 'opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.22,1,.36,1)',
      }}
    >
      {children}
    </div>
  )
}

function PhotoGlow({ isMobile }) {
  if (isMobile) {
    // Single static gradient — no animated blur layers, way cheaper on mobile.
    return (
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 80%, rgba(59,130,246,0.35) 0%, rgba(250,204,21,0.12) 40%, transparent 70%)',
          transform: 'scale(1.4)',
        }}
      />
    )
  }
  return (
    <>
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(250,204,21,0.2) 0%, transparent 65%)',
          transform: 'scale(1.3)',
          filter: 'blur(24px)',
          animation: 'glowPulse 3s ease-in-out infinite',
        }}
      />
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 60% 110%, rgba(59,130,246,0.55) 0%, transparent 65%)',
          transform: 'scale(1.45)',
          filter: 'blur(32px)',
          animation: 'glowPulse 4s ease-in-out infinite reverse',
        }}
      />
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 30% 100%, rgba(99,102,241,0.35) 0%, transparent 60%)',
          transform: 'scale(1.5)',
          filter: 'blur(40px)',
          animation: 'glowPulse 5s ease-in-out infinite 1s',
        }}
      />
    </>
  )
}

function ScrollIndicator() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1800)
    return () => clearTimeout(t)
  }, [])
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 36,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        opacity: visible ? 0.5 : 0,
        transition: 'opacity 0.8s ease',
      }}
    >
      <span style={{ fontSize: 10, color: '#facc15', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Scroll</span>
      <div
        style={{
          width: 1,
          height: 48,
          background: 'linear-gradient(to bottom, #facc15, transparent)',
          animation: 'scrollLine 1.8s ease-in-out infinite',
        }}
      />
    </div>
  )
}

export default function Hero({ onNavigate }) {
  const [nameTyped,   setNameTyped]   = useState(false)
  const [neuralReady, setNeuralReady] = useState(false)
  const [neuralKey,   setNeuralKey]   = useState(0)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!nameTyped) return
    const t = setTimeout(() => setNeuralReady(true), isMobile ? 300 : 1400)
    return () => clearTimeout(t)
  }, [nameTyped, isMobile])

  const handleNeuralReplay = () => {
    setNeuralReady(false)
    setNeuralKey(k => k + 1)
    setTimeout(() => setNeuralReady(true), 80)
  }

  const photoSize = isMobile ? 200 : 300

  return (
    <>
      <style>{`
        @keyframes glowPulse {
          0%, 100% { opacity: 0.7; transform: scale(1.3); }
          50% { opacity: 1; transform: scale(1.45); }
        }
        @keyframes scrollLine {
          0% { transform: scaleY(0); transform-origin: top; opacity: 1; }
          50% { transform: scaleY(1); transform-origin: top; opacity: 1; }
          100% { transform: scaleY(1); transform-origin: bottom; opacity: 0; }
        }
        @keyframes floatPhoto {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes badgeBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>

      <section
        id="about"
        className="relative w-full overflow-hidden flex items-center"
        style={{ background: 'transparent', minHeight: '100vh' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, #0a0a0a 90%)',
          }}
        />

        <div
          className="relative z-10 w-full mx-auto"
          style={{ maxWidth: 1320, padding: isMobile ? '72px 24px 32px' : '120px 64px 64px' }}
        >

          {isMobile ? (
            // ─── MOBILE: stacked order — Name → Photo → NN card → About → Traits ───
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* 1. Tagline + Name */}
              <div>
                <AnimatedName name={NAME} onTyped={() => setNameTyped(true)} fast={true} />
              </div>

              {/* 2. Photo with badges */}
              <FadeIn delay={400}>
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <PhotoGlow isMobile />
                    <div style={{
                      width: photoSize, height: photoSize,
                      borderRadius: '50%', overflow: 'hidden',
                      border: '2px solid rgba(99,130,246,0.35)',
                      boxShadow: '0 0 60px rgba(59,130,246,0.25), 0 0 30px rgba(250,204,21,0.08), inset 0 0 40px rgba(0,0,0,0.3)',
                      position: 'relative',
                    }}>
                      <img src="/photo.jpg" alt="Rohan Jauhari" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    <div style={{
                      position: 'absolute', bottom: -8, right: -8,
                      padding: '8px 12px', borderRadius: 12,
                      background: 'rgba(10,10,10,0.92)',
                      border: '1px solid rgba(250,204,21,0.2)',
                      display: 'flex', alignItems: 'center', gap: 6,
                      animation: 'badgeBounce 3s ease-in-out infinite',
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80' }} />
                      <span style={{ color: '#facc15', fontSize: 11, fontWeight: 600 }}>Open to Work</span>
                    </div>

                    <div style={{
                      position: 'absolute', top: -8, left: -8,
                      padding: '6px 10px', borderRadius: 10,
                      background: 'rgba(10,10,10,0.92)',
                      border: '1px solid rgba(96,165,250,0.25)',
                      color: '#93c5fd',
                      fontSize: 11, fontWeight: 600,
                      animation: 'badgeBounce 4s ease-in-out infinite 1s',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      Boston, MA
                    </div>
                  </div>
                </div>
              </FadeIn>

              {/* 3. NN card (no replay button on mobile) */}
              <FadeIn delay={600}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <NeuralCard key={neuralKey} active={neuralReady} onNavigate={onNavigate} />
                </div>
              </FadeIn>

              {/* 4. About */}
              <FadeIn delay={800}>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, lineHeight: 1.75, margin: 0 }}>
                  {ABOUT}
                </p>
              </FadeIn>

              {/* 5. Traits — 2x2 grid */}
              <FadeIn delay={900}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
                }}>
                  {TRAITS.map(t => (
                    <div key={t.label} style={{
                      padding: '10px 12px', borderRadius: 10,
                      background: t.bg, border: `1px solid ${t.border}`,
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: t.color, lineHeight: 1.2 }}>{t.label}</div>
                      <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.32)', marginTop: 3, lineHeight: 1.3 }}>{t.sub}</div>
                    </div>
                  ))}
                </div>
              </FadeIn>

            </div>
          ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 80,
            }}
          >
            {/* LEFT COLUMN — photo + neural card */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', paddingLeft: 24 }}>
            <FadeIn delay={500} direction='right' className="flex-shrink-0">
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
                <div style={{ position: 'relative' }}>

                  <div
                    style={{
                      position: 'absolute',
                      inset: -16, borderRadius: '50%',
                      border: '1px solid rgba(99,130,246,0.2)',
                      animation: 'glowPulse 4s ease-in-out infinite',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: -32, borderRadius: '50%',
                      border: '1px solid rgba(59,130,246,0.08)',
                    }}
                  />

                  <div style={{ animation: isMobile ? 'none' : 'floatPhoto 5s ease-in-out infinite' }}>
                    <PhotoGlow isMobile={isMobile} />
                    <div
                      style={{
                        width: photoSize, height: photoSize,
                        borderRadius: '50%', overflow: 'hidden',
                        border: '2px solid rgba(99,130,246,0.35)',
                        boxShadow: '0 0 60px rgba(59,130,246,0.25), 0 0 100px rgba(99,102,241,0.15), 0 0 30px rgba(250,204,21,0.08), inset 0 0 40px rgba(0,0,0,0.3)',
                        position: 'relative',
                      }}
                    >
                      <img
                        src="/photo.jpg"
                        alt="Rohan Jauhari"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.nextSibling.style.display = 'flex'
                        }}
                      />
                      <div
                        style={{
                          display: 'none', position: 'absolute', inset: 0,
                          alignItems: 'center', justifyContent: 'center',
                          background: 'rgba(250,204,21,0.06)',
                          fontSize: 72, fontWeight: 800,
                          color: 'rgba(250,204,21,0.45)', letterSpacing: '-0.02em',
                        }}
                      >
                        RJ
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      position: 'absolute', bottom: -8, right: isMobile ? -8 : -16,
                      padding: '10px 16px', borderRadius: 14,
                      background: 'rgba(10,10,10,0.92)',
                      border: '1px solid rgba(250,204,21,0.2)',
                      backdropFilter: isMobile ? 'none' : 'blur(12px)',
                      display: 'flex', alignItems: 'center', gap: 8,
                      animation: 'badgeBounce 3s ease-in-out infinite',
                    }}
                  >
                    <span
                      style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: '#4ade80', boxShadow: '0 0 8px #4ade80',
                        display: 'inline-block',
                        animation: 'glowPulse 2s ease-in-out infinite',
                      }}
                    />
                    <span style={{ color: '#facc15', fontSize: 12, fontWeight: 600 }}>
                      Open to Work
                    </span>
                  </div>

                  <div
                    style={{
                      position: 'absolute', top: -8, left: isMobile ? -8 : -20,
                      padding: '8px 14px', borderRadius: 12,
                      background: 'rgba(10,10,10,0.92)',
                      border: '1px solid rgba(96,165,250,0.25)',
                      backdropFilter: isMobile ? 'none' : 'blur(12px)',
                      color: '#93c5fd',
                      fontSize: 12, fontWeight: 600,
                      animation: 'badgeBounce 4s ease-in-out infinite 1s',
                      display: 'flex', alignItems: 'center', gap: 5,
                      boxShadow: '0 0 14px rgba(96,165,250,0.12)',
                    }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    Boston, MA
                  </div>
                </div>

                <NeuralCard key={neuralKey} active={neuralReady} onNavigate={onNavigate} onReplay={handleNeuralReplay} />
              </div>
            </FadeIn>
            </div>

            {/* RIGHT COLUMN — text */}
            <div style={{ flex: 1, minWidth: 0, width: '100%' }}>

              <AnimatedName name={NAME} onTyped={() => setNameTyped(true)} fast={isMobile} />

              <FadeIn delay={800}>
                <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: isMobile ? 15 : 16, lineHeight: 1.8, maxWidth: 540, marginBottom: 0 }}>
                  {ABOUT}
                </p>
              </FadeIn>

              <FadeIn delay={900}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 48 }}>
                  {TRAITS.map(t => (
                    <div key={t.label} style={{
                      padding: '10px 16px', borderRadius: 10,
                      background: t.bg, border: `1px solid ${t.border}`,
                      backdropFilter: isMobile ? 'none' : 'blur(8px)',
                    }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: t.color }}>{t.label}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)', marginTop: 2 }}>{t.sub}</div>
                    </div>
                  ))}
                </div>
              </FadeIn>

            </div>

          </div>
          )}

        </div>

        <ScrollIndicator />
      </section>

      {/* Education */}
      <div style={{ background: 'rgba(10,10,10,0.85)', padding: isMobile ? '24px 0 48px' : '40px 0 80px' }}>
        <div style={{
          height: 1,
          background: 'linear-gradient(to right, transparent, rgba(250,204,21,0.12), transparent)',
          marginBottom: isMobile ? 32 : 48,
        }} />
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: isMobile ? '0 24px' : '0 64px' }}>

          <div style={{ marginBottom: 40 }}>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {EDUCATION.map(e => (
              <div key={e.school} style={{
                width: '100%',
                padding: isMobile ? '20px' : '24px 28px', borderRadius: 16,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderLeft: `3px solid ${e.color}`,
                display: 'flex', gap: 16, alignItems: 'flex-start',
                boxShadow: `0 0 40px ${e.color}08`,
              }}>
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
                      fontSize: 11, color: 'rgba(255,255,255,0.38)',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      padding: '3px 10px', borderRadius: 6,
                    }}>{e.period}</span>
                    {e.note && (
                      <span style={{
                        fontSize: 11, color: e.color,
                        background: `${e.color}12`,
                        border: `1px solid ${e.color}30`,
                        padding: '3px 10px', borderRadius: 6,
                        fontWeight: 600,
                      }}>{e.note}</span>
                    )}
                    <span style={{
                      fontSize: 11, color: 'rgba(255,255,255,0.38)',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      padding: '3px 10px', borderRadius: 6,
                    }}>{e.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
