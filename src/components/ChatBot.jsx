import { useState, useRef, useEffect, useCallback } from 'react'
import useIsMobile from '../hooks/useIsMobile'
import { trackClick, trackEvent } from '../hooks/useAnalytics'

const SUGGESTED = [
  'What has Rohan worked on?',
  'Is he open to work?',
  'What are his AI skills?',
]

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
      <div style={{
        padding: '12px 16px',
        borderRadius: '14px 14px 14px 4px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', gap: 5,
      }}>
        <style>{`
          @keyframes typingDot {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
            30% { transform: translateY(-5px); opacity: 1; }
          }
        `}</style>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#facc15',
            display: 'inline-block',
            animation: `typingDot 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
    </div>
  )
}

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 12,
    }}>
      <div style={{
        maxWidth: '82%',
        padding: '10px 14px',
        borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
        background: isUser ? 'rgba(250,204,21,0.1)' : 'rgba(255,255,255,0.04)',
        border: isUser ? '1px solid rgba(250,204,21,0.2)' : '1px solid rgba(255,255,255,0.07)',
        fontSize: 13.5,
        lineHeight: 1.65,
        color: isUser ? '#facc15' : 'rgba(255,255,255,0.8)',
        whiteSpace: 'pre-wrap',
      }}>
        {msg.content}
        {msg.streaming && msg.content && (
          <span style={{
            display: 'inline-block', width: 2, height: 13,
            background: '#facc15', marginLeft: 3, verticalAlign: 'middle',
            animation: 'typedBlink 0.6s step-end infinite',
          }} />
        )}
      </div>
    </div>
  )
}

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [btnVisible, setBtnVisible] = useState(false)
  const [tileDrop, setTileDrop] = useState(false)
  const [tileHidden, setTileHidden] = useState(false)
  const [tileFlash, setTileFlash] = useState(false)
  const isMobile = useIsMobile()
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

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

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus()
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = useCallback(async (text) => {
    const content = (text || input).trim()
    if (!content || loading) return

    trackEvent('chatbot_message_sent', { message_preview: content.slice(0, 50) })
    const userMsg = { role: 'user', content }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)

    const assistantId = Date.now()
    setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true, id: assistantId }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6)
          if (raw === '[DONE]') break
          try {
            const { text, error } = JSON.parse(raw)
            if (error) {
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, content: error, streaming: false } : m
              ))
            } else if (text) {
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, content: m.content + text } : m
              ))
            }
          } catch {}
        }
      }
    } catch {
      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, content: 'Something went wrong. Try again.', streaming: false } : m
      ))
    }

    setMessages(prev => prev.map(m =>
      m.id === assistantId ? { ...m, streaming: false } : m
    ))
    setLoading(false)
  }, [input, messages, loading])

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const drawerW = isMobile ? '100vw' : 380
  const drawerH = isMobile ? '85vh' : 520

  return (
    <>
      {/* Chat drawer */}
      <div style={{
        position: 'fixed',
        bottom: isMobile ? 0 : 88,
        right: isMobile ? 0 : 24,
        width: drawerW,
        height: open ? drawerH : 0,
        borderRadius: isMobile ? '20px 20px 0 0' : 16,
        overflow: 'hidden',
        background: isMobile ? '#0a0a0a' : 'rgba(12,12,12,0.97)',
        border: open ? '1px solid rgba(250,204,21,0.14)' : 'none',
        backdropFilter: isMobile ? 'none' : 'blur(24px)',
        WebkitBackdropFilter: isMobile ? 'none' : 'blur(24px)',
        boxShadow: open ? '0 0 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(250,204,21,0.06)' : 'none',
        transition: 'height 0.35s cubic-bezier(.22,1,.36,1), box-shadow 0.3s ease',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid rgba(250,204,21,0.08)',
          background: 'rgba(250,204,21,0.03)',
          display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
        }}>
          <img src="/emoji.png" alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(250,204,21,0.2)' }} />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#f5f5f5', letterSpacing: '-0.01em' }}>Rohan's AI</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 5px #4ade80', display: 'inline-block' }} />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em' }}>Powered by Claude</span>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{
              marginLeft: 'auto', background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.25)', fontSize: 20, cursor: 'pointer',
              lineHeight: 1, padding: 4,
            }}
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 20 }}>
                Ask me anything about Rohan
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {SUGGESTED.map(s => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    style={{
                      padding: '9px 14px', borderRadius: 10, cursor: 'pointer',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.55)', fontSize: 12.5,
                      textAlign: 'left', transition: 'border-color 0.2s, color 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(250,204,21,0.25)'; e.currentTarget.style.color = '#facc15' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            m.streaming && !m.content
              ? <TypingIndicator key={m.id ?? i} />
              : <Message key={m.id ?? i} msg={m} />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '10px 12px 14px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
          display: 'flex', gap: 8, alignItems: 'flex-end',
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Ask something..."
            rows={1}
            style={{
              flex: 1, background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10, padding: '9px 12px',
              color: '#f5f5f5', fontSize: 13, resize: 'none',
              outline: 'none', fontFamily: 'Inter, sans-serif',
              lineHeight: 1.5, maxHeight: 100, overflowY: 'auto',
            }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: input.trim() && !loading ? '#facc15' : 'rgba(255,255,255,0.06)',
              border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={input.trim() && !loading ? '#0a0a0a' : 'rgba(255,255,255,0.25)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>

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
        @keyframes tileFadeOut {
          to { opacity: 0; transform: translateY(8px); }
        }
      `}</style>
      <div style={{
        position: 'fixed',
        bottom: isMobile ? 92 : 36,
        right: 88,
        zIndex: 201,
        pointerEvents: 'none',
        animation: open || tileHidden
          ? 'tileFadeOut 0.4s ease forwards'
          : tileDrop ? 'dropBounce 0.9s cubic-bezier(.22,1,.36,1) forwards' : 'none',
        opacity: tileDrop && !tileHidden ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}>
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
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(250,204,21,0.6)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>AI Assistant</div>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.75)', fontStyle: 'italic', fontWeight: 400 }}>Ask me. I know his secrets!</div>
          </div>
        </div>
      </div>

      {/* Floating button */}
      <button
        onClick={() => { const next = !open; setOpen(next); if (next) trackClick('chatbot_open', 'chatbot') }}
        style={{
          position: 'fixed',
          bottom: isMobile ? 80 : 24,
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
          <img src="/emoji.png" alt="Chat with Rohan's AI" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '50%' }} />
        )}
      </button>
    </>
  )
}
