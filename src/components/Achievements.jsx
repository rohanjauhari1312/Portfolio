import { useEffect, useRef, useState } from 'react'
import TypedHeading from './TypedHeading'
import useIsMobile from '../hooks/useIsMobile'

const WINS = [
  {
    id: 'codametrix',
    event: 'CodaMetrix Hackathon 2026',
    place: 'Winner',
    name: 'Clinical note classification',
    image: '/codametrix.jpeg',
    imageFit: 'cover',
    imagePos: 'center 28%',
    link: '/codametrix-deck.pdf',
    linkLabel: 'View deck',
    bullets: [
      'Built an NLP system that reads a clinical note and routes it to the right medical specialty, with a healthcare-first metric set (per-class recall, calibration, risk-coverage)',
      'Compared three model families on one honest benchmark: TF-IDF + Logistic Regression (shipped), a fine-tuned PubMedBERT, and Claude few-shot',
      'Hit 0.70 accuracy and 0.93 top-2, then held up on 1,000 unseen clinical vignettes with balanced per-class output',
    ],
    metrics: [
      { v: '0.70', l: 'Accuracy' },
      { v: '0.93', l: 'Top-2 accuracy' },
      { v: '1,000', l: 'Unseen vignettes' },
    ],
    tags: ['NLP', 'PubMedBERT', 'Claude', 'scikit-learn', 'Healthcare'],
    accent: '#60a5fa',
  },
  {
    id: 'brainbridge',
    event: 'BrainBridge Hackathon',
    place: 'Winner',
    name: 'BrainBridge',
    image: null,
    link: 'https://docs.google.com/presentation/d/1Qh0TQ-D1qf2rrT86fyC2IDaWy35FvN5WEA9bvk1USIQ/edit',
    bullets: [
      'Hackathon-winning build. Short description coming from the deck.',
    ],
    metrics: [],
    tags: ['Hackathon', 'Winner'],
    accent: '#a78bfa',
  },
]

function WinImage({ win }) {
  const [failed, setFailed] = useState(false)
  if (win.image && !failed) {
    return (
      <img
        src={win.image}
        alt={win.name}
        onError={() => setFailed(true)}
        style={{ width: '100%', height: 200, objectFit: win.imageFit || 'cover', objectPosition: win.imagePos || 'center', background: win.imageBg || 'transparent', display: 'block', borderRadius: '14px 14px 0 0' }}
      />
    )
  }
  return (
    <div style={{
      width: '100%', height: 200, borderRadius: '14px 14px 0 0',
      background: `linear-gradient(135deg, ${win.accent}22, ${win.accent}08)`,
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke={win.accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM17 5h2a2 2 0 0 1 0 4h-1M7 5H5a2 2 0 0 0 0 4h1"/>
      </svg>
    </div>
  )
}

function WinCard({ win, index }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.1 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(36px)',
        transition: `opacity 0.65s ease ${index * 100}ms, transform 0.75s cubic-bezier(.22,1,.36,1) ${index * 100}ms`,
        background: 'rgba(16,16,16,0.92)',
        border: `1px solid ${win.accent}30`,
        borderRadius: 16, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: `0 0 18px ${win.accent}18`,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${win.accent}90`; e.currentTarget.style.boxShadow = `0 0 24px ${win.accent}70, 0 0 60px ${win.accent}30` }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = `${win.accent}30`; e.currentTarget.style.boxShadow = `0 0 18px ${win.accent}18` }}
    >
      <div style={{ position: 'relative' }}>
        <WinImage win={win} />
        <span style={{
          position: 'absolute', top: 12, left: 12,
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 999,
          background: 'rgba(10,10,10,0.85)', border: `1px solid ${win.accent}60`,
          color: win.accent, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.03em',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"/></svg>
          {win.place}
        </span>
      </div>

      <div style={{ padding: '22px 24px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f5f5f5', margin: 0, letterSpacing: '-0.01em' }}>{win.name}</h3>
          {win.link && (
            <a href={win.link} target="_blank" rel="noopener noreferrer" style={{
              padding: '4px 11px', borderRadius: 7, fontSize: 11, fontWeight: 700,
              background: win.accent, color: '#0a0a0a', textDecoration: 'none',
            }}>{win.linkLabel || 'View'}</a>
          )}
        </div>
        <span style={{ fontSize: 12, color: win.accent, fontWeight: 500, display: 'block', marginBottom: 14 }}>{win.event}</span>

        <ul style={{ margin: '0 0 18px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {win.bullets.map((b, i) => (
            <li key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', flexShrink: 0, marginTop: 7, background: win.accent, opacity: 0.7 }} />
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }}>{b}</span>
            </li>
          ))}
        </ul>

        {win.metrics.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
            {win.metrics.map((m, i) => (
              <div key={i} style={{ padding: '6px 12px', borderRadius: 8, background: `${win.accent}12`, border: `1px solid ${win.accent}25` }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: win.accent }}>{m.v}</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginLeft: 5 }}>{m.l}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'auto' }}>
          {win.tags.map(t => (
            <span key={t} style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.38)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', padding: '3px 8px', borderRadius: 999 }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Achievements() {
  const [titleVisible, setTitleVisible] = useState(false)
  const titleRef = useRef(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTitleVisible(true); obs.disconnect() } },
      { threshold: 0.2 }
    )
    if (titleRef.current) obs.observe(titleRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section style={{ background: 'rgba(10,10,10,0.85)', padding: isMobile ? '24px 0 48px' : '40px 0 80px' }} id="achievements">
      <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(250,204,21,0.15), transparent)', marginBottom: isMobile ? 32 : 48 }} />

      <div style={{ maxWidth: 1320, margin: '0 auto', padding: isMobile ? '0 24px' : '0 64px' }}>
        <div
          ref={titleRef}
          style={{
            marginBottom: 56,
            opacity: titleVisible ? 1 : 0,
            transform: titleVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease, transform 0.7s cubic-bezier(.22,1,.36,1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#facc15', boxShadow: '0 0 8px #facc15', display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#facc15' }}>Achievements</span>
          </div>
          <TypedHeading text="Two hackathons, two wins." style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, color: '#f5f5f5', letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0 }} />
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.38)', marginTop: 12, maxWidth: 480 }}>
            Weekend builds that shipped working products and took first place.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))', gap: isMobile ? 16 : 24 }}>
          {WINS.map((w, i) => <WinCard key={w.id} win={w} index={i} />)}
        </div>
      </div>
    </section>
  )
}
