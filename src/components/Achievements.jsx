import { useEffect, useRef, useState } from 'react'
import TypedHeading from './TypedHeading'
import useIsMobile from '../hooks/useIsMobile'

const WINS = [
  {
    id: 'codametrix',
    event: 'CodaMetrix Hackathon',
    place: 'Winner',
    location: 'Boston, MA',
    name: 'Clinical note classification',
    image: '/codametrix-team.jpg',
    imageFit: 'cover',
    imagePos: 'center 34%',
    imageHeight: 280,
    link: '/codametrix-deck.pdf',
    linkLabel: 'View deck',
    bullets: [
      'Built an **NLP system** that reads a clinical note and routes it to the **right medical specialty**, scored with a healthcare-first metric set (per-class recall, calibration, risk-coverage)',
      'Compared **three model families** on one honest benchmark: **TF-IDF + Logistic Regression** (shipped), a fine-tuned **PubMedBERT**, and **Claude few-shot**',
      'Hit **0.70 accuracy** and **0.93 top-2**, then held up on **1,000 unseen** clinical vignettes with balanced per-class output',
    ],
    metrics: [
      { v: '0.70', l: 'Accuracy' },
      { v: '0.93', l: 'Top-2 accuracy' },
      { v: '1,000', l: 'Unseen vignettes' },
    ],
    tags: ['NLP', 'PubMedBERT', 'Claude', 'scikit-learn', 'Healthcare'],
    accent: '#facc15',
  },
  {
    id: 'brainbridge',
    event: 'Neurotech Hackathon',
    place: 'Winner',
    location: 'Boston, MA',
    name: 'BrainBridge — re-connecting brain and body',
    images: ['/brainbridge-speaking.jpg', '/brainbridge-3.jpg', '/brainbridge-team.jpg'],
    imageFit: 'cover',
    imagePos: 'center 35%',
    imageHeight: 280,
    link: '/brainbridge-deck.pdf',
    linkLabel: 'View deck',
    extraLinks: [
      { label: 'Demo', href: 'https://drive.google.com/file/d/125aogQbrzcJRQdkJZo9QDyCLUP974psM/view' },
      { label: 'Pitch', href: 'https://drive.google.com/file/d/1NsdWKHOdgwfFqOSlOyd-HIwGiYD7umLy/view' },
    ],
    bullets: [
      'A **closed-loop brain-computer interface** for spinal cord injury that reads **movement intent** and **stimulates muscles directly**, bridging the gap the injury created',
      'High-density **ECoG arrays** over the motor cortex feed **adaptive deep-learning** models that map neural signals to coordinated, multi-site **muscle stimulation**',
      'A **VR environment** handles task-specific training and calibration, cutting the long setup and frequent recalibration that limit current BCIs',
    ],
    metrics: [
      { v: '15M+', l: 'People with SCI' },
      { v: 'ECoG', l: 'Neural signal in' },
      { v: 'Closed-loop', l: 'Brain to muscle' },
    ],
    tags: ['Neurotech', 'BCI', 'ECoG', 'Deep learning', 'VR', 'Healthcare'],
    accent: '#a78bfa',
  },
  {
    id: 'pm-talk',
    event: 'Guest session, Northeastern',
    place: 'Speaker',
    badge: 'mic',
    location: 'Boston, MA',
    name: 'Product management session',
    image: '/pm-speech.jpg',
    imageFit: 'cover',
    imagePos: 'center 26%',
    imageHeight: 280,
    link: 'https://www.linkedin.com/feed/update/urn:li:activity:7394388534838632448/',
    linkLabel: 'See post',
    bullets: [
      'Led a **product management session** for the **Aspiring Product Managers Club** at Northeastern, breaking down how PMs turn **data into product decisions**',
      'Framed the PM role as the **sweet spot** between **business, technology, and the user**, and how to find where the three overlap',
      'Walked through **real case studies**, including an **airline example** on customer behavior and migration patterns, to make data-driven thinking concrete',
      'Fielded live questions on **breaking into product**, prioritization, and reading **signal from noise**',
    ],
    metrics: [],
    tags: ['Speaking', 'Product', 'Mentorship', 'McKinsey'],
    accent: '#4ade80',
  },
]

const BADGE_ICON = {
  trophy: <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"/>,
  mic: <><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></>,
}

function hl(text, color) {
  return text.split(/(\*\*.*?\*\*)/g).map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <span key={i} style={{ color }}>{p.slice(2, -2)}</span>
      : p
  )
}

function WinImage({ win }) {
  const [failed, setFailed] = useState(false)
  const [shot, setShot] = useState(0)
  const imgStyle = { width: '100%', height: win.imageHeight || 200, objectFit: win.imageFit || 'cover', objectPosition: win.imagePos || 'center', background: win.imageBg || 'transparent', display: 'block', borderRadius: '14px 14px 0 0' }

  useEffect(() => {
    if (!win.images || win.images.length < 2) return
    const t = setInterval(() => setShot(p => (p + 1) % win.images.length), 2600)
    return () => clearInterval(t)
  }, [])

  if (win.images && win.images.length) {
    return (
      <div style={{ position: 'relative', width: '100%', height: win.imageHeight || 200, borderRadius: '14px 14px 0 0', overflow: 'hidden' }}>
        {win.images.map((src, idx) => (
          <img key={src} src={src} alt={win.name} style={{ ...imgStyle, position: 'absolute', inset: 0, borderRadius: 0, opacity: idx === shot ? 1 : 0, transition: 'opacity 0.9s ease' }} />
        ))}
        <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5 }}>
          {win.images.map((_, idx) => (
            <span key={idx} style={{ width: 5, height: 5, borderRadius: '50%', background: idx === shot ? win.accent : 'rgba(255,255,255,0.35)', transition: 'background 0.3s' }} />
          ))}
        </div>
      </div>
    )
  }
  if (win.image && !failed) {
    return (
      <img
        src={win.image}
        alt={win.name}
        onError={() => setFailed(true)}
        style={imgStyle}
      />
    )
  }
  return (
    <div style={{
      width: '100%', height: win.imageHeight || 200, borderRadius: '14px 14px 0 0',
      background: `linear-gradient(135deg, ${win.accent}22, ${win.accent}08)`,
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke={win.accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {BADGE_ICON[win.badge] || BADGE_ICON.trophy}
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
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">{BADGE_ICON[win.badge] || BADGE_ICON.trophy}</svg>
          {win.place}
        </span>
      </div>

      <div style={{ padding: '22px 24px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
          <h3 style={{ fontSize: 21, fontWeight: 800, color: '#f5f5f5', margin: 0, letterSpacing: '-0.02em' }}>{win.event}</h3>
          {win.link && (
            <a href={win.link} target="_blank" rel="noopener noreferrer" style={{
              padding: '4px 11px', borderRadius: 7, fontSize: 11, fontWeight: 700,
              background: win.accent, color: '#0a0a0a', textDecoration: 'none',
            }}>{win.linkLabel || 'View'}</a>
          )}
          {win.extraLinks && win.extraLinks.map(el => (
            <a key={el.href} href={el.href} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '4px 11px', borderRadius: 7, fontSize: 11, fontWeight: 600,
              background: 'rgba(255,255,255,0.06)', border: `1px solid ${win.accent}55`,
              color: win.accent, textDecoration: 'none',
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M8 5v14l11-7z"/></svg>
              {el.label}
            </a>
          ))}
        </div>
        <span style={{ fontSize: 13, color: win.accent, fontWeight: 600, display: 'block', marginBottom: 8 }}>{win.name}</span>
        {win.location && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 14 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)' }}>{win.location}</span>
          </div>
        )}

        <ul style={{ margin: '0 0 18px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {win.bullets.map((b, i) => (
            <li key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', flexShrink: 0, marginTop: 7, background: win.accent, opacity: 0.7 }} />
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }}>{hl(b, win.accent)}</span>
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
          <TypedHeading text="Testaments of shipments — beyond resume." style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, color: '#f5f5f5', letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0 }} />
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.38)', marginTop: 12, maxWidth: 480 }}>
            Two hackathon wins, and teaching what I know.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))', gap: isMobile ? 16 : 24 }}>
          {WINS.map((w, i) => <WinCard key={w.id} win={w} index={i} />)}
        </div>
      </div>
    </section>
  )
}
