import { useEffect, useState } from 'react'
import useIsMobile from '../hooks/useIsMobile'

const LINKS = [
  { label: 'About',    href: '#about' },
  { label: 'Skills',   href: '#skills' },
  { label: 'Work',     href: '#work' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact',  href: '#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [visible,  setVisible]  = useState(false)
  const [active,   setActive]   = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })

    const sections = document.querySelectorAll('section[id]')
    const obs = new IntersectionObserver(
      entries => { entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id) }) },
      { rootMargin: '-40% 0px -50% 0px' }
    )
    sections.forEach(s => obs.observe(s))

    return () => { clearTimeout(t); window.removeEventListener('scroll', onScroll); obs.disconnect() }
  }, [])

  useEffect(() => {
    if (!isMobile) setMenuOpen(false)
  }, [isMobile])

  const handleNav = (href) => {
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <>
      <header
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          height: 64,
          display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'flex-end' : 'flex-start',
          gap: 40,
          padding: isMobile ? '0 20px' : '0 40px',
          background: scrolled || menuOpen ? 'rgba(10,10,10,0.55)' : 'transparent',
          borderBottom: scrolled || menuOpen ? '1px solid rgba(250,204,21,0.08)' : '1px solid transparent',
          backdropFilter: scrolled || menuOpen ? 'blur(18px)' : 'none',
          WebkitBackdropFilter: scrolled || menuOpen ? 'blur(18px)' : 'none',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(-12px)',
          transition: 'background 0.4s, border-color 0.4s, box-shadow 0.4s, opacity 0.6s, transform 0.6s',
        }}
      >
        {isMobile ? (
          <button
            onClick={() => setMenuOpen(p => !p)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', gap: 5, padding: 8,
            }}
            aria-label="Toggle menu"
          >
            <span style={{
              display: 'block', width: 22, height: 2, borderRadius: 2,
              background: '#f5f5f5',
              transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
              transition: 'transform 0.25s ease',
            }} />
            <span style={{
              display: 'block', width: 22, height: 2, borderRadius: 2,
              background: '#f5f5f5',
              opacity: menuOpen ? 0 : 1,
              transition: 'opacity 0.25s ease',
            }} />
            <span style={{
              display: 'block', width: 22, height: 2, borderRadius: 2,
              background: '#f5f5f5',
              transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none',
              transition: 'transform 0.25s ease',
            }} />
          </button>
        ) : (
          <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            {LINKS.map((link, i) => {
              const isActive = active === link.href.slice(1)
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={e => { e.preventDefault(); handleNav(link.href) }}
                  style={{
                    color: isActive ? '#facc15' : 'rgba(255,255,255,0.5)',
                    fontSize: 13, fontWeight: isActive ? 600 : 500,
                    textDecoration: 'none', letterSpacing: '0.02em',
                    position: 'relative', paddingBottom: 2,
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(-8px)',
                    transition: `color 0.2s, opacity 0.6s ${150 + i * 60}ms, transform 0.6s ${150 + i * 60}ms`,
                  }}
                >
                  {link.label}
                  <span style={{
                    position: 'absolute', bottom: -2, left: 0, right: 0, height: 1,
                    background: '#facc15',
                    transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                    transition: 'transform 0.3s cubic-bezier(.22,1,.36,1)',
                    transformOrigin: 'left',
                  }} />
                </a>
              )
            })}
          </nav>
        )}
      </header>

      {/* Mobile dropdown menu */}
      {isMobile && (
        <div style={{
          position: 'fixed', top: 64, left: 0, right: 0, zIndex: 99,
          background: 'rgba(10,10,10,0.6)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(250,204,21,0.08)',
          display: 'flex', flexDirection: 'column',
          maxHeight: menuOpen ? 360 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.35s cubic-bezier(.22,1,.36,1)',
        }}>
          {LINKS.map((link, i) => {
            const isActive = active === link.href.slice(1)
            return (
              <a
                key={link.label}
                href={link.href}
                onClick={e => { e.preventDefault(); handleNav(link.href) }}
                style={{
                  padding: '16px 24px',
                  color: isActive ? '#facc15' : 'rgba(255,255,255,0.65)',
                  fontSize: 15, fontWeight: isActive ? 600 : 400,
                  textDecoration: 'none', letterSpacing: '0.02em',
                  borderBottom: i < LINKS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}
              >
                {link.label}
              </a>
            )
          })}
        </div>
      )}
    </>
  )
}
