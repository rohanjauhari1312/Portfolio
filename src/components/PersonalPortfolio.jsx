import { useEffect, useRef, useState } from 'react'
import TypedHeading from './TypedHeading'
import ModeToggle from './ModeToggle'
import useIsMobile from '../hooks/useIsMobile'

const BG = '#faf8f3'
const INK = '#171717'
const MUTED = 'rgba(23,23,23,0.55)'
const LABEL = '#ca8a04'
const ACCENTS = ['#facc15', '#fb923c', '#60a5fa', '#a78bfa', '#4ade80']
const GRADIENT = {
  background: 'linear-gradient(90deg, #eab308, #f97316)',
  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
}

// Replace src: null with the real file, e.g. '/personal/travel-01.jpg'. ratio is width / height.
const SECTIONS = [
  {
    id: 'travel',
    label: 'Travel',
    heading: "Places I've ",
    suffix: 'been.',
    sub: 'Trips, detours and the photos I took along the way.',
    photos: [
      { src: null, ratio: 0.8, caption: '' },
      { src: null, ratio: 1.4, caption: '' },
      { src: null, ratio: 1, caption: '' },
      { src: null, ratio: 1.25, caption: '' },
      { src: null, ratio: 0.75, caption: '' },
      { src: null, ratio: 1.5, caption: '' },
      { src: null, ratio: 0.9, caption: '' },
      { src: null, ratio: 1.2, caption: '' },
      { src: null, ratio: 0.8, caption: '' },
    ],
  },
  {
    id: 'hobbies',
    label: 'Hobbies',
    heading: 'Things I do ',
    suffix: 'for fun.',
    sub: "What fills the hours that aren't work.",
    photos: [
      { src: null, ratio: 1.3, caption: '' },
      { src: null, ratio: 0.85, caption: '' },
      { src: null, ratio: 1, caption: '' },
      { src: null, ratio: 0.8, caption: '' },
      { src: null, ratio: 1.4, caption: '' },
      { src: null, ratio: 1.1, caption: '' },
    ],
  },
  {
    id: 'moments',
    label: 'People',
    heading: 'People and ',
    suffix: 'moments.',
    sub: 'Friends, family and the occasions worth keeping.',
    photos: [
      { src: null, ratio: 0.8, caption: '' },
      { src: null, ratio: 1.2, caption: '' },
      { src: null, ratio: 1, caption: '' },
      { src: null, ratio: 1.5, caption: '' },
      { src: null, ratio: 0.9, caption: '' },
      { src: null, ratio: 1.3, caption: '' },
    ],
  },
]

function Reveal({ children, delay = 0, style }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.08 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s cubic-bezier(.22,1,.36,1) ${delay}ms`,
      ...style,
    }}>
      {children}
    </div>
  )
}

function SectionHeader({ section }) {
  return (
    <Reveal style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#facc15', boxShadow: '0 0 8px rgba(250,204,21,0.8)' }} />
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: LABEL }}>
          {section.label}
        </span>
      </div>
      <TypedHeading
        text={section.heading}
        suffixText={section.suffix}
        suffixStyle={GRADIENT}
        style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 800, color: INK, letterSpacing: '-0.025em', lineHeight: 1.1, margin: '0 0 14px' }}
      />
      <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.7, margin: 0, maxWidth: 560 }}>{section.sub}</p>
    </Reveal>
  )
}

function Tile({ photo, index, label, onOpen, gap }) {
  const [hover, setHover] = useState(false)
  const c = ACCENTS[index % ACCENTS.length]
  return (
    <Reveal delay={(index % 3) * 80} style={{ breakInside: 'avoid', marginBottom: gap }}>
      <button
        onClick={onOpen}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-label={photo.caption || `Open ${label} photo ${index + 1}`}
        style={{
          display: 'block', width: '100%', padding: 0, border: '1px solid rgba(0,0,0,0.07)',
          borderRadius: 16, overflow: 'hidden', cursor: 'pointer', position: 'relative',
          aspectRatio: photo.ratio,
          background: photo.src ? '#fff' : `linear-gradient(135deg, ${c}40, ${c}0d)`,
          boxShadow: hover ? '0 14px 34px rgba(0,0,0,0.12)' : '0 2px 10px rgba(0,0,0,0.04)',
          transform: hover ? 'translateY(-3px)' : 'translateY(0)',
          transition: 'transform 0.4s cubic-bezier(.22,1,.36,1), box-shadow 0.4s cubic-bezier(.22,1,.36,1)',
        }}
      >
        {photo.src ? (
          <img src={photo.src} alt={photo.caption || ''} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <span style={{ position: 'absolute', left: 14, bottom: 12, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(23,23,23,0.35)' }}>
            {label} {String(index + 1).padStart(2, '0')}
          </span>
        )}
        {photo.caption && (
          <span style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, padding: '28px 14px 12px', textAlign: 'left',
            background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)',
            color: '#fff', fontSize: 13, fontWeight: 500,
          }}>
            {photo.caption}
          </span>
        )}
      </button>
    </Reveal>
  )
}

function Lightbox({ section, index, onClose, onStep }) {
  const photo = section.photos[index]
  const c = ACCENTS[index % ACCENTS.length]

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onStep(-1)
      if (e.key === 'ArrowRight') onStep(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, onStep])

  const arrow = (dir) => (
    <button
      onClick={e => { e.stopPropagation(); onStep(dir) }}
      aria-label={dir < 0 ? 'Previous photo' : 'Next photo'}
      style={{
        position: 'absolute', top: '50%', [dir < 0 ? 'left' : 'right']: 20, transform: 'translateY(-50%)',
        width: 44, height: 44, borderRadius: 12, cursor: 'pointer',
        background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points={dir < 0 ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} />
      </svg>
    </button>
  )

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(250,248,243,0.94)',
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '64px clamp(12px, 6vw, 72px)',
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: 'absolute', top: 18, right: 20, width: 44, height: 44, borderRadius: 12, cursor: 'pointer',
          background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {arrow(-1)}
      {arrow(1)}

      <div onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, maxWidth: '100%', maxHeight: '100%' }}>
        {photo.src ? (
          <img src={photo.src} alt={photo.caption || ''} style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 170px)', borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }} />
        ) : (
          <div style={{
            width: `min(80vw, calc((100vh - 170px) * ${photo.ratio}))`, aspectRatio: photo.ratio,
            borderRadius: 14, border: '1px solid rgba(0,0,0,0.07)',
            background: `linear-gradient(135deg, ${c}40, ${c}0d)`,
          }} />
        )}
        <div style={{ fontSize: 13, color: MUTED, textAlign: 'center' }}>
          {photo.caption || `${section.label} ${String(index + 1).padStart(2, '0')}`}
          <span style={{ marginLeft: 10, color: 'rgba(23,23,23,0.35)' }}>{index + 1} / {section.photos.length}</span>
        </div>
      </div>
    </div>
  )
}

export default function PersonalPortfolio({ onBack }) {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    const prev = document.documentElement.style.background
    document.documentElement.style.background = BG
    document.body.style.background = BG
    const cursor = document.createElement('style')
    cursor.textContent = '* { cursor: auto !important; } button { cursor: pointer !important; }'
    document.head.appendChild(cursor)
    return () => {
      document.documentElement.style.background = prev
      document.body.style.background = ''
      cursor.remove()
    }
  }, [])

  const openSection = open ? SECTIONS.find(s => s.id === open.id) : null
  const step = (dir) => setOpen(o => {
    const n = SECTIONS.find(s => s.id === o.id).photos.length
    return { ...o, i: (o.i + dir + n) % n }
  })
  const close = () => setOpen(null)

  const gap = isMobile ? 10 : 16
  const pad = isMobile ? '0 20px' : '0 64px'

  return (
    <div style={{
      minHeight: '100vh', color: INK, background: BG,
      backgroundImage: `
        radial-gradient(ellipse 70% 40% at 15% 8%, rgba(250,204,21,0.16) 0%, transparent 70%),
        radial-gradient(ellipse 60% 35% at 85% 40%, rgba(96,165,250,0.10) 0%, transparent 70%),
        radial-gradient(ellipse 50% 30% at 20% 85%, rgba(251,146,60,0.10) 0%, transparent 60%),
        radial-gradient(rgba(0,0,0,0.07) 1px, transparent 1px)
      `,
      backgroundSize: 'auto, auto, auto, 28px 28px',
    }}>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
        padding: isMobile ? '0 16px' : '0 40px',
        background: 'rgba(250,248,243,0.72)', borderBottom: '1px solid rgba(0,0,0,0.06)',
        backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>Rohan Jauhari</span>
          {!isMobile && (
            <nav style={{ display: 'flex', gap: 28 }}>
              {SECTIONS.map(s => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={e => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' }) }}
                  style={{ fontSize: 13, fontWeight: 500, color: MUTED, textDecoration: 'none' }}
                >
                  {s.label}
                </a>
              ))}
            </nav>
          )}
        </div>
        <ModeToggle mode="personal" onChange={() => onBack()} light compact={isMobile} />
      </header>

      <div style={{ maxWidth: 1320, margin: '0 auto', padding: pad }}>
        <section style={{ padding: isMobile ? '120px 0 56px' : '176px 0 96px' }}>
          <Reveal>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#facc15', boxShadow: '0 0 8px rgba(250,204,21,0.8)' }} />
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: LABEL }}>Personal</span>
            </div>
            <TypedHeading
              as="h1"
              text="Life outside "
              suffixText="work."
              suffixStyle={GRADIENT}
              style={{ fontSize: 'clamp(2.4rem,7vw,5.5rem)', fontWeight: 800, color: INK, letterSpacing: '-0.03em', lineHeight: 1.05, margin: '0 0 22px' }}
            />
            <p style={{ fontSize: isMobile ? 16 : 18, color: MUTED, lineHeight: 1.7, margin: '0 0 32px', maxWidth: 580 }}>
              Places I've been, what I do when I'm not shipping, and the people who make it worth it.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {SECTIONS.map(s => (
                <button
                  key={s.id}
                  onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' })}
                  style={{
                    padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                    background: 'rgba(255,255,255,0.6)', color: INK,
                    border: '1px solid rgba(0,0,0,0.1)', backdropFilter: 'blur(8px)',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </Reveal>
        </section>

        {SECTIONS.map(section => (
          <section key={section.id} id={section.id} style={{ padding: isMobile ? '24px 0 56px' : '40px 0 96px' }}>
            <SectionHeader section={section} />
            <div style={{ columnCount: isMobile ? 2 : 3, columnGap: gap }}>
              {section.photos.map((photo, i) => (
                <Tile
                  key={i}
                  photo={photo}
                  index={i}
                  label={section.label}
                  gap={gap}
                  onOpen={() => setOpen({ id: section.id, i })}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {open && <Lightbox section={openSection} index={open.i} onClose={close} onStep={step} />}
    </div>
  )
}
