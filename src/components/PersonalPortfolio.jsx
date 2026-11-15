import { useEffect, useRef, useState } from 'react'
import TypedHeading from './TypedHeading'
import ModeToggle from './ModeToggle'
import Globe from './Globe'
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

const p = (name, ratio) => ({ src: `/personal/${name}.jpg`, ratio, caption: '' })

const SECTIONS = [
  {
    id: 'travel',
    label: 'Travel',
    heading: "Places I've ",
    suffix: 'been.',
    sub: 'Trips, detours and the photos I took along the way.',
    photos: [p('travel-01', 0.8), p('travel-02', 0.8), p('travel-03', 0.8), p('travel-04', 0.903), p('travel-05', 1.094)],
  },
  {
    id: 'hobbies',
    label: 'Hobbies',
    heading: 'Things I do ',
    suffix: 'for fun.',
    sub: "What fills the hours that aren't work.",
    photos: [p('hobbies-01', 0.75), p('hobbies-02', 1.626), p('hobbies-03', 1), p('hobbies-04', 1.228)],
  },
  {
    id: 'moments',
    label: 'People',
    heading: 'People and ',
    suffix: 'moments.',
    sub: 'Friends, family and the occasions worth keeping.',
    photos: [p('moments-01', 1), p('moments-02', 0.75), p('moments-03', 1.141)],
  },
]

const HERO_STACK = [
  { src: '/personal/moments-01.jpg', x: -150, y: 30, r: -7 },
  { src: '/personal/travel-02.jpg', x: 0, y: -10, r: 3 },
  { src: '/personal/hobbies-04.jpg', x: 150, y: 50, r: 8 },
]

const subs = new Set()
function useScrollLink(fn) {
  const ref = useRef(fn)
  ref.current = fn
  useEffect(() => {
    const cb = () => ref.current(window.scrollY, window.innerHeight)
    subs.add(cb)
    cb()
    return () => { subs.delete(cb) }
  }, [])
}

function Reveal({ children, delay = 0, from = 24, style }) {
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
      transform: visible ? 'translateY(0) scale(1)' : `translateY(${from}px) scale(0.97)`,
      transition: `opacity 0.8s ease ${delay}ms, transform 0.9s cubic-bezier(.22,1,.36,1) ${delay}ms`,
      ...style,
    }}>
      {children}
    </div>
  )
}

function SectionHeader({ section, index }) {
  return (
    <Reveal style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#facc15', boxShadow: '0 0 8px rgba(250,204,21,0.8)' }} />
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: LABEL }}>
          {String(index + 1).padStart(2, '0')} / {section.label}
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
  const imgRef = useRef(null)
  const btnRef = useRef(null)
  const c = ACCENTS[index % ACCENTS.length]

  useScrollLink((_, vh) => {
    if (!imgRef.current || !btnRef.current) return
    const r = btnRef.current.getBoundingClientRect()
    const off = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / vh))
    imgRef.current.style.transform = `translate3d(0, ${off * -6}%, 0) scale(1.14)`
  })

  return (
    <Reveal delay={(index % 3) * 90} from={44} style={{ breakInside: 'avoid', marginBottom: gap }}>
      <button
        ref={btnRef}
        onClick={onOpen}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-label={photo.caption || `Open ${label} photo ${index + 1}`}
        style={{
          display: 'block', width: '100%', padding: 0, border: '1px solid rgba(0,0,0,0.07)',
          borderRadius: 16, overflow: 'hidden', cursor: 'pointer', position: 'relative',
          aspectRatio: photo.ratio,
          background: photo.src ? '#fff' : `linear-gradient(135deg, ${c}40, ${c}0d)`,
          boxShadow: hover ? '0 14px 34px rgba(0,0,0,0.14)' : '0 2px 10px rgba(0,0,0,0.05)',
          transition: 'box-shadow 0.4s cubic-bezier(.22,1,.36,1)',
        }}
      >
        {photo.src && (
          <img
            ref={imgRef}
            src={photo.src}
            alt={photo.caption || ''}
            loading="lazy"
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              transform: 'scale(1.14)', transition: 'transform 0.6s cubic-bezier(.22,1,.36,1)', willChange: 'transform',
            }}
          />
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
        animation: 'lbIn 0.35s cubic-bezier(.22,1,.36,1)',
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
          <img key={photo.src} src={photo.src} alt={photo.caption || ''} style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 170px)', borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', animation: 'lbIn 0.35s cubic-bezier(.22,1,.36,1)' }} />
        ) : (
          <div style={{
            width: `min(80vw, calc((100vh - 170px) * ${photo.ratio}))`, aspectRatio: photo.ratio,
            borderRadius: 14, border: '1px solid rgba(0,0,0,0.07)',
            background: `linear-gradient(135deg, ${c}40, ${c}0d)`,
          }} />
        )}
        <div style={{ fontSize: 13, color: MUTED, textAlign: 'center' }}>
          {photo.caption}
          <span style={{ marginLeft: photo.caption ? 10 : 0, color: 'rgba(23,23,23,0.35)' }}>{index + 1} / {section.photos.length}</span>
        </div>
      </div>
    </div>
  )
}

export default function PersonalPortfolio({ onBack }) {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(null)
  const barRef = useRef(null)
  const heroTextRef = useRef(null)
  const stackRef = useRef(null)
  const blobARef = useRef(null)
  const blobBRef = useRef(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    const prev = document.documentElement.style.background
    document.documentElement.style.background = BG
    document.body.style.background = BG
    const cursor = document.createElement('style')
    cursor.textContent = '* { cursor: auto !important; } button { cursor: pointer !important; }'
    document.head.appendChild(cursor)

    let raf = null
    const run = () => { raf = null; subs.forEach(f => f()) }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(run) }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
      document.documentElement.style.background = prev
      document.body.style.background = ''
      cursor.remove()
    }
  }, [])

  useScrollLink((y, vh) => {
    const doc = document.documentElement.scrollHeight - vh
    if (barRef.current) barRef.current.style.transform = `scaleX(${doc > 0 ? Math.min(1, y / doc) : 0})`
    const hp = Math.min(1, y / (vh * 0.7))
    if (heroTextRef.current) {
      heroTextRef.current.style.transform = `translate3d(0, ${y * 0.28}px, 0)`
      heroTextRef.current.style.opacity = String(1 - hp * 0.85)
    }
    if (stackRef.current) {
      const kids = stackRef.current.children
      for (let i = 0; i < kids.length; i++) {
        const s = HERO_STACK[i]
        const spread = isMobile ? 0.55 : 1
        kids[i].style.transform =
          `translate3d(${s.x * spread * (1 + hp * 0.5)}px, ${s.y - hp * (60 + i * 30) + y * 0.05 * i}px, 0) rotate(${s.r * (1 + hp * 1.2)}deg) scale(${1 - hp * 0.12})`
      }
      stackRef.current.style.opacity = String(1 - hp * 0.7)
    }
    if (blobARef.current) blobARef.current.style.transform = `translate3d(0, ${y * -0.18}px, 0)`
    if (blobBRef.current) blobBRef.current.style.transform = `translate3d(0, ${y * 0.12}px, 0)`
  })

  const openSection = open ? SECTIONS.find(s => s.id === open.id) : null
  const step = (dir) => setOpen(o => {
    const n = SECTIONS.find(s => s.id === o.id).photos.length
    return { ...o, i: (o.i + dir + n) % n }
  })
  const close = () => setOpen(null)
  const openBySrc = (src) => {
    for (const s of SECTIONS) {
      const i = s.photos.findIndex(ph => ph.src === src)
      if (i >= 0) { setOpen({ id: s.id, i }); return }
    }
  }

  const gap = isMobile ? 10 : 16
  const pad = isMobile ? '0 20px' : '0 64px'
  const cardW = isMobile ? 150 : 220
  const cardH = isMobile ? 200 : 290

  return (
    <div style={{
      minHeight: '100vh', color: INK, background: BG, position: 'relative', overflow: 'hidden',
      backgroundImage: 'radial-gradient(rgba(0,0,0,0.07) 1px, transparent 1px)',
      backgroundSize: '28px 28px',
    }}>
      <style>{`@keyframes lbIn { from { opacity: 0; transform: scale(0.97) } to { opacity: 1; transform: scale(1) } }`}</style>

      <div ref={blobARef} style={{ position: 'absolute', top: -120, left: -160, width: 620, height: 620, borderRadius: '50%', background: 'radial-gradient(circle, rgba(250,204,21,0.30), transparent 65%)', pointerEvents: 'none' }} />
      <div ref={blobBRef} style={{ position: 'absolute', top: 700, right: -200, width: 640, height: 640, borderRadius: '50%', background: 'radial-gradient(circle, rgba(96,165,250,0.18), transparent 65%)', pointerEvents: 'none' }} />

      <div ref={barRef} style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 101,
        background: 'linear-gradient(90deg, #facc15, #fb923c)', transformOrigin: 'left', transform: 'scaleX(0)',
      }} />

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

      <div style={{ maxWidth: 1320, margin: '0 auto', padding: pad, position: 'relative' }}>
        <section style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center',
          flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between',
          gap: isMobile ? 40 : 64, padding: isMobile ? '110px 0 56px' : '96px 0 64px',
        }}>
          <div ref={heroTextRef} style={{ flex: 1, willChange: 'transform, opacity' }}>
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
            <p style={{ fontSize: isMobile ? 16 : 18, color: MUTED, lineHeight: 1.7, margin: '0 0 32px', maxWidth: 520 }}>
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
          </div>

          <div style={{ position: 'relative', width: isMobile ? '100%' : 520, height: isMobile ? cardH + 60 : 440, flexShrink: 0 }}>
            <div ref={stackRef} style={{ position: 'absolute', inset: 0, willChange: 'opacity' }}>
              {HERO_STACK.map((s, i) => (
                <img
                  key={s.src}
                  src={s.src}
                  alt=""
                  style={{
                    position: 'absolute', left: '50%', top: '50%',
                    width: cardW, height: cardH, marginLeft: -cardW / 2, marginTop: -cardH / 2,
                    objectFit: 'cover', borderRadius: 16, border: '5px solid #fff',
                    boxShadow: '0 18px 44px rgba(0,0,0,0.18)', zIndex: i === 1 ? 2 : 1,
                    willChange: 'transform',
                    transform: `translate3d(${s.x * (isMobile ? 0.55 : 1)}px, ${s.y}px, 0) rotate(${s.r}deg)`,
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        {SECTIONS.map((section, si) => (
          <section key={section.id} id={section.id} style={{ padding: isMobile ? '24px 0 56px' : '40px 0 96px' }}>
            <SectionHeader section={section} index={si} />
            {section.id === 'travel' && <Globe onOpenPhoto={openBySrc} />}
            <div style={{ columnCount: isMobile ? 2 : 3, columnGap: gap }}>
              {section.photos.map((photo, i) => (
                <Tile
                  key={photo.src}
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
