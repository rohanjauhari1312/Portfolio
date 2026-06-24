import { useState, useEffect } from 'react'
import useIsMobile from '../hooks/useIsMobile'
import { trackClick } from '../hooks/useAnalytics'
import ChatConversation from './ChatConversation'

export default function ChatBot({ onNavigate }) {
  const [open, setOpen] = useState(false)
  const [btnVisible, setBtnVisible] = useState(false)
  const [tileDrop, setTileDrop] = useState(false)
  const [tileHidden, setTileHidden] = useState(false)
  const [tileFlash, setTileFlash] = useState(false)
  const isMobile = useIsMobile()

  // Mobile opens a dedicated /rohbot screen; desktop opens the inline drawer.
  const trigger = (source) => {
    trackClick('chatbot_open', source)
    if (isMobile) {
      onNavigate && onNavigate('rohbot')
    } else {
      setOpen(true)
    }
  }

  useEffect(() => {
    // Desktop: show tile on load. Mobile: hide until first scroll.
    const t2 = setTimeout(() => setBtnVisible(true), isMobile ? 800 : 2000)
    if (!isMobile) {
      const t1 = setTimeout(() => setTileDrop(true), 1100)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
    return () => clearTimeout(t2)
  }, [isMobile])

  // Mobile: first user scroll → flash the tile briefly, then hide.
  useEffect(() => {
    if (!isMobile) return
    let triggered = false
    const onScroll = () => {
      if (triggered || window.scrollY < 80) return
      triggered = true
      setTileDrop(true)
      setTileFlash(true)
      setTimeout(() => setTileFlash(false), 2400)
      setTimeout(() => setTileHidden(true), 3200)
      window.removeEventListener('scroll', onScroll)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isMobile])

  return (
    <>
      {/* Desktop drawer (mobile uses the /rohbot screen instead) */}
      {!isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 88, right: 24,
          width: 380,
          height: open ? 520 : 0,
          borderRadius: 16,
          overflow: 'hidden',
          background: 'rgba(12,12,12,0.97)',
          border: open ? '1px solid rgba(250,204,21,0.14)' : 'none',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: open ? '0 0 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(250,204,21,0.06)' : 'none',
          transition: 'height 0.35s cubic-bezier(.22,1,.36,1), box-shadow 0.3s ease',
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
        }}>
          {open && <ChatConversation onClose={() => setOpen(false)} onNavigate={onNavigate} />}
        </div>
      )}

      {/* AI assistant tile */}
      <style>{`
        @keyframes dropBounce {
          0%   { opacity: 0; transform: translateY(0); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes tileGlow {
          0%, 100% { box-shadow: 0 0 12px rgba(250,204,21,0.18), 0 0 28px rgba(250,204,21,0.06); }
          50%       { box-shadow: 0 0 22px rgba(250,204,21,0.38), 0 0 48px rgba(250,204,21,0.13); }
        }
        @keyframes chatFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes tileFadeOut {
          to { opacity: 0; transform: translateY(8px); }
        }
      `}</style>
      <div style={{
        position: 'fixed',
        bottom: isMobile ? 92 : 36,
        right: 88,
        zIndex: 201,
        pointerEvents: tileDrop && !open && !tileHidden ? 'auto' : 'none',
        cursor: 'pointer',
        animation: open || tileHidden
          ? 'tileFadeOut 0.4s ease forwards'
          : tileDrop ? 'dropBounce 0.9s cubic-bezier(.22,1,.36,1) forwards' : 'none',
        opacity: tileDrop && !tileHidden ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}>
        <div
          onClick={() => trigger('chatbot_tile')}
          style={{ animation: !open && !tileHidden && tileDrop ? 'chatFloat 3.5s ease-in-out infinite' : 'none' }}
        >
        <div style={{
          padding: '9px 14px',
          borderRadius: 12,
          background: 'rgba(10,10,10,0.95)',
          border: `1px solid ${tileFlash ? 'rgba(250,204,21,0.55)' : 'rgba(250,204,21,0.2)'}`,
          backdropFilter: isMobile ? 'none' : 'blur(16px)',
          display: 'flex', alignItems: 'center', gap: 9,
          whiteSpace: 'nowrap',
          animation: tileFlash
            ? 'tileGlow 1.2s ease-in-out infinite'
            : (isMobile ? 'none' : 'tileGlow 2.8s ease-in-out infinite'),
          boxShadow: isMobile && !tileFlash ? '0 0 12px rgba(250,204,21,0.18)' : undefined,
          transform: tileFlash ? 'scale(1.04)' : 'scale(1)',
          transition: 'transform 0.3s cubic-bezier(.22,1,.36,1), border-color 0.3s ease',
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: 8, flexShrink: 0,
            background: '#facc15',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 10px rgba(250,204,21,0.45)',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'rgba(250,204,21,0.6)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 2 }}>RohBot by Rohan</div>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.75)', fontStyle: 'italic', fontWeight: 400 }}>Ask me. I know his secrets!</div>
          </div>
        </div>
        </div>
      </div>

      {/* Floating button */}
      <button
        onClick={() => {
          if (open) { setOpen(false); return }
          trigger('chatbot')
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.boxShadow = '0 0 18px rgba(250,204,21,0.55), 0 0 36px rgba(250,204,21,0.20), 0 4px 16px rgba(0,0,0,0.4)' }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = open ? 'none' : '0 0 20px rgba(250,204,21,0.3), 0 4px 16px rgba(0,0,0,0.4)' }}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 60, height: 60, borderRadius: '50%',
          background: open ? 'rgba(10,10,10,0.9)' : 'transparent',
          border: open ? '1px solid rgba(255,255,255,0.12)' : '2px solid rgba(250,204,21,0.4)',
          cursor: 'pointer', zIndex: 201,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: open ? 'none' : '0 0 20px rgba(250,204,21,0.3), 0 4px 16px rgba(0,0,0,0.4)',
          opacity: btnVisible ? 1 : 0,
          transform: btnVisible ? 'scale(1)' : 'scale(0.8)',
          transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(.22,1,.36,1), background 0.2s, box-shadow 0.2s',
        }}
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <img
            src="/emoji.png"
            alt="Chat with Rohan's AI"
            style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '50%', transition: 'transform 0.25s cubic-bezier(.22,1,.36,1), filter 0.25s ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.12)'; e.currentTarget.style.filter = 'brightness(1.1)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.filter = 'brightness(1)' }}
          />
        )}
      </button>
    </>
  )
}
