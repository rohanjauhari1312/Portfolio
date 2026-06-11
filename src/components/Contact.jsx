import { useEffect, useRef, useState, useCallback } from 'react'
import TypedHeading from './TypedHeading'
import useIsMobile from '../hooks/useIsMobile'

function ResumeActions({ isMobile }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = `${window.location.origin}/resume.pdf`
    if (navigator.share) {
      try { await navigator.share({ title: 'Rohan Jauhari — Resume', url }); return } catch (_) {}
    }
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const btn = (accent) => ({
    display: 'inline-flex', alignItems: 'center', gap: 7,
    padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
    cursor: 'pointer', textDecoration: 'none',
    background: `rgba(${accent},0.1)`, color: `rgb(${accent})`,
    border: `1px solid rgba(${accent},0.25)`,
    transition: 'background 0.2s, box-shadow 0.2s, transform 0.2s',
  })
  const hover = (e, accent) => { e.currentTarget.style.background = `rgba(${accent},0.18)`; e.currentTarget.style.boxShadow = `0 0 22px rgba(${accent},0.4)`; e.currentTarget.style.transform = 'translateY(-2px)' }
  const leave = (e, accent) => { e.currentTarget.style.background = `rgba(${accent},0.1)`; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }

  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: isMobile ? 32 : 48 }}>
      <a href="/resume.pdf" target="_blank" rel="noreferrer"
        style={btn('250,204,21')}
        onMouseEnter={e => hover(e, '250,204,21')} onMouseLeave={e => leave(e, '250,204,21')}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
        </svg>
        View Resume
      </a>

      <a href="/resume.pdf" download="Rohan_Jauhari_Resume.pdf"
        style={btn('96,165,250')}
        onMouseEnter={e => hover(e, '96,165,250')} onMouseLeave={e => leave(e, '96,165,250')}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Download Resume
      </a>

      <button onClick={handleShare}
        style={{ ...btn(copied ? '74,222,128' : '168,85,247'), outline: 'none' }}
        onMouseEnter={e => !copied && hover(e, '168,85,247')} onMouseLeave={e => leave(e, copied ? '74,222,128' : '168,85,247')}>
        {copied ? (
          <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Link Copied</>
        ) : (
          <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>Share Resume</>
        )}
      </button>
    </div>
  )
}

const LINKS = [
  {
    label: 'GitHub',
    handle: '@rohanjauhari1312',
    href: 'https://github.com/rohanjauhari1312',
    color: '#e6edf3',
    bg: 'rgba(230,237,243,0.07)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
      </svg>
    ),
  },
  {
    label: 'X',
    handle: '@rohanjauhari',
    href: 'https://x.com/rohanjauhari',
    color: '#e7e9ea',
    bg: 'rgba(231,233,234,0.07)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
]

function EmailCopy() {
  const [copied, setCopied] = useState(false)
  const copy = useCallback(() => {
    navigator.clipboard.writeText('jauhari.r@northeastern.edu')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 12, margin: '32px 0 32px',
    }}>
      <span style={{
        fontSize: 15, color: 'rgba(255,255,255,0.55)',
        letterSpacing: '0.01em', fontWeight: 400,
      }}>
        jauhari.r@northeastern.edu
      </span>
      <button
        onClick={copy}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
          background: copied ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${copied ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.1)'}`,
          color: copied ? '#4ade80' : 'rgba(255,255,255,0.45)',
          fontSize: 12, fontWeight: 500,
          transition: 'all 0.2s ease',
        }}
      >
        {copied ? (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Copied
          </>
        ) : (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy
          </>
        )}
      </button>
    </div>
  )
}

export default function Contact() {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.15 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const fade = (delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(28px)',
    transition: `opacity 0.7s ease ${delay}ms, transform 0.7s cubic-bezier(.22,1,.36,1) ${delay}ms`,
  })

  return (
    <section id="contact" style={{ background: 'rgba(10,10,10,0.85)', padding: isMobile ? '24px 0 0' : '40px 0 0' }}>
      {/* divider */}
      <div style={{
        height: 1,
        background: 'linear-gradient(to right, transparent, rgba(250,204,21,0.12), transparent)',
        marginBottom: isMobile ? 48 : 64,
      }} />

      <div ref={ref} style={{ maxWidth: 1320, margin: '0 auto', padding: isMobile ? '0 24px' : '0 64px' }}>

        {/* CTA block */}
        <div style={{ textAlign: 'center', maxWidth: 680, margin: isMobile ? '0 auto 48px' : '0 auto 64px' }}>
          <div style={{ ...fade(0), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#facc15', boxShadow: '0 0 8px #facc15', display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#facc15' }}>
              Let&apos;s Connect
            </span>
          </div>

          <TypedHeading
            text="Open to the right "
            suffixText="opportunity."
            suffixStyle={{
              background: 'linear-gradient(90deg, #facc15, #fb923c)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}
            style={{ fontSize: 'clamp(2.2rem,6vw,4rem)', fontWeight: 800, color: '#f5f5f5', letterSpacing: '-0.025em', lineHeight: 1.1, margin: '0 0 20px' }}
          />

          <p style={{ ...fade(160), fontSize: 17, color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, margin: '0 0 40px' }}>
            Product, strategy, or operations. If you&apos;re building in AI, data, or SaaS, I&apos;d love to connect.
          </p>

          <div style={{ ...fade(220), display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="mailto:jauhari.r@northeastern.edu"
              style={{
                padding: '11px 24px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: 'rgba(250,204,21,0.1)', color: '#facc15',
                border: '1px solid rgba(250,204,21,0.22)', textDecoration: 'none',
                transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.2s',
                display: 'inline-block',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(250,204,21,0.18)'
                e.currentTarget.style.borderColor = 'rgba(250,204,21,0.5)'
                e.currentTarget.style.boxShadow = '0 0 22px rgba(250,204,21,0.50), 0 0 48px rgba(250,204,21,0.20)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(250,204,21,0.1)'
                e.currentTarget.style.borderColor = 'rgba(250,204,21,0.22)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              Send an Email
            </a>
            <a
              href="https://www.linkedin.com/in/rohanjauhari/"
              target="_blank"
              rel="noreferrer"
              style={{
                padding: '11px 24px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: 'rgba(10,102,194,0.12)', color: '#60a5fa',
                border: '1px solid rgba(10,102,194,0.3)', textDecoration: 'none',
                transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.2s',
                display: 'inline-flex', alignItems: 'center', gap: 7,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(10,102,194,0.22)'
                e.currentTarget.style.borderColor = 'rgba(10,102,194,0.5)'
                e.currentTarget.style.boxShadow = '0 0 22px rgba(96,165,250,0.50), 0 0 48px rgba(96,165,250,0.20)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(10,102,194,0.12)'
                e.currentTarget.style.borderColor = 'rgba(10,102,194,0.3)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </a>
          </div>
        </div>

        {/* Resume actions */}
        <ResumeActions isMobile={isMobile} />

        {/* Social link cards */}
        <div style={{ ...fade(280), display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : undefined, marginBottom: isMobile ? 32 : 48 }}>
          {LINKS.map(l => (
            <a
              key={l.label}
              href={l.href}
              target={l.href.startsWith('mailto') ? '_self' : '_blank'}
              rel="noreferrer"
              style={{
                padding: '16px 24px', borderRadius: 14,
                background: l.bg, border: `1px solid ${l.color}25`,
                color: l.color, textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: 12,
                transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                minWidth: isMobile ? 'auto' : 200,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = `0 0 22px ${l.color}55, 0 0 48px ${l.color}22`
                e.currentTarget.style.borderColor = `${l.color}60`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = `${l.color}25`
              }}
            >
              {l.icon}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{l.label}</div>
                <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>{l.handle}</div>
              </div>
            </a>
          ))}
        </div>

        {/* Email display + copy */}
        <EmailCopy />
      </div>

      {/* Footer strip — content stays left, assistant tile lives on the right */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.03)',
        padding: isMobile ? '20px 24px calc(36px + env(safe-area-inset-bottom))' : '28px 64px',
        display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
        flexWrap: 'wrap', gap: 20,
      }}>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.02em', fontWeight: 500 }}>
          © 2026 Rohan Jauhari. All rights reserved.
        </span>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          Built with
          <img src="/claude code.png" alt="Claude Code" style={{ height: 56, objectFit: 'contain', display: 'block' }} />
          <img src="/11labs.png" alt="ElevenLabs" style={{ height: 40, objectFit: 'contain', display: 'block' }} />
          <img src="/n8n.png" alt="n8n" style={{ height: 40, objectFit: 'contain', display: 'block' }} />
        </span>
      </div>
    </section>
  )
}
