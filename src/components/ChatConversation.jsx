import { useState, useRef, useEffect, useCallback } from 'react'
import { trackEvent } from '../hooks/useAnalytics'

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
        {!isUser ? msg.content.split(/(\*\*.*?\*\*)/g).map((p, i) =>
          p.startsWith('**') && p.endsWith('**')
            ? <strong key={i} style={{ color: '#f5f5f5', fontWeight: 600 }}>{p.slice(2, -2)}</strong>
            : p
        ) : msg.content}
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

// Self-contained chat: header + messages + input + streaming logic.
// `fullscreen` bumps the input font-size to 16px to stop iOS auto-zoom and
// adds safe-area padding for the standalone /rohbot screen.
export default function ChatConversation({ onClose, fullscreen = false, autoFocus = true }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus()
  }, [autoFocus])

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

  return (
    <>
      {/* Header */}
      <div style={{
        padding: fullscreen ? 'calc(14px + env(safe-area-inset-top)) 18px 14px' : '14px 18px',
        borderBottom: '1px solid rgba(250,204,21,0.08)',
        background: 'rgba(250,204,21,0.03)',
        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
      }}>
        <img src="/emoji.png" alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(250,204,21,0.2)' }} />
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#f5f5f5', letterSpacing: '-0.01em' }}>RohBot</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 5px #4ade80', display: 'inline-block' }} />
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em' }}>Powered by Claude</span>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close chat"
          style={{
            marginLeft: 'auto', background: fullscreen ? 'rgba(255,255,255,0.05)' : 'none',
            border: fullscreen ? '1px solid rgba(255,255,255,0.1)' : 'none',
            borderRadius: fullscreen ? 8 : 0,
            width: fullscreen ? 34 : 'auto', height: fullscreen ? 34 : 'auto',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.45)', fontSize: 20, cursor: 'pointer',
            lineHeight: 1, padding: fullscreen ? 0 : 4,
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
        padding: fullscreen ? '10px 12px calc(14px + env(safe-area-inset-bottom))' : '10px 12px 14px',
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
            color: '#f5f5f5', fontSize: fullscreen ? 16 : 13, resize: 'none',
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
            transition: 'background 0.2s, box-shadow 0.2s',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={input.trim() && !loading ? '#0a0a0a' : 'rgba(255,255,255,0.25)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </>
  )
}
