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
  // Turn any email in the text into a mailto: link.
  const linkifyEmail = (text, prefix) =>
    text.split(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g).map((part, i) =>
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(part)
        ? <a key={`${prefix}-${i}`} href={`mailto:${part}`} style={{ color: '#facc15', textDecoration: 'underline' }}>{part}</a>
        : <span key={`${prefix}-${i}`}>{part}</span>
    )
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
            ? <strong key={i} style={{ color: '#f5f5f5', fontWeight: 600 }}>{linkifyEmail(p.slice(2, -2), `b${i}`)}</strong>
            : <span key={i}>{linkifyEmail(p, `t${i}`)}</span>
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
const SpeechRecognition = typeof window !== 'undefined'
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null

const STORE_KEY = 'rohbot_messages'

function loadMessages() {
  try {
    const raw = sessionStorage.getItem(STORE_KEY)
    if (!raw) return []
    return JSON.parse(raw).map(m => ({ ...m, streaming: false }))
  } catch {
    return []
  }
}

export default function ChatConversation({ onClose, fullscreen = false, autoFocus = true }) {
  const [messages, setMessages] = useState(loadMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [voiceOn, setVoiceOn] = useState(false) // false = Rohan writes (read), true = Rohan speaks (listen)
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const audioRef = useRef(null)
  const recogRef = useRef(null)
  const voiceOnRef = useRef(false)
  const sendRef = useRef(null)

  useEffect(() => { voiceOnRef.current = voiceOn }, [voiceOn])

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus()
  }, [autoFocus])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Persist conversation for the session so it survives close/reopen + navigation.
  useEffect(() => {
    if (messages.some(m => m.streaming)) return
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify(
        messages.map(({ role, content }) => ({ role, content }))
      ))
    } catch {}
  }, [messages])

  // Stop any audio/recognition when unmounting.
  useEffect(() => () => {
    audioRef.current?.pause()
    recogRef.current?.abort?.()
  }, [])

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setSpeaking(false)
  }, [])

  // Speak text in Rohan's cloned voice via the /api/tts route.
  const speak = useCallback(async (text) => {
    if (!text?.trim()) return
    stopSpeaking()
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.slice(0, 1500) }),
      })
      if (!res.ok) return
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audioRef.current = audio
      setSpeaking(true)
      audio.onended = () => { setSpeaking(false); URL.revokeObjectURL(url) }
      audio.onerror = () => { setSpeaking(false); URL.revokeObjectURL(url) }
      await audio.play()
    } catch {
      setSpeaking(false)
    }
  }, [stopSpeaking])

  const toggleMic = useCallback(() => {
    if (!SpeechRecognition) return
    if (listening) {
      recogRef.current?.stop()
      return
    }
    stopSpeaking()
    const recog = new SpeechRecognition()
    recog.lang = 'en-US'
    recog.interimResults = true
    recog.continuous = false
    let finalText = ''
    recog.onresult = (e) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) finalText += t
        else interim += t
      }
      setInput((finalText + interim).trim())
    }
    recog.onend = () => {
      setListening(false)
      const text = finalText.trim()
      if (text) { setInput(''); sendRef.current?.(text) }
    }
    recog.onerror = () => setListening(false)
    recogRef.current = recog
    setListening(true)
    recog.start()
  }, [listening, stopSpeaking])

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
    let finalText = ''

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
              finalText += text
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
    if (voiceOnRef.current && finalText.trim()) speak(finalText)
  }, [input, messages, loading, speak])

  useEffect(() => { sendRef.current = send }, [send])

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <>
      <style>{`
        @keyframes talkGlow {
          0%, 100% { text-shadow: 0 0 8px rgba(250,204,21,0.55), 0 0 16px rgba(250,204,21,0.25); }
          50%      { text-shadow: 0 0 14px rgba(250,204,21,0.9), 0 0 28px rgba(250,204,21,0.45); }
        }
      `}</style>
      {/* Header */}
      <div style={{
        padding: fullscreen ? 'calc(14px + env(safe-area-inset-top)) 18px 14px' : '14px 18px',
        borderBottom: '1px solid rgba(250,204,21,0.08)',
        background: 'rgba(250,204,21,0.03)',
        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
      }}>
        <img src="/emoji.png" alt="" style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(250,204,21,0.2)' }} />
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#f5f5f5', letterSpacing: '-0.01em' }}>RohBot by Rohan</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80', display: 'inline-block', flexShrink: 0 }} />
            <span style={{
              fontSize: 12, fontWeight: 700, color: '#facc15',
              letterSpacing: '0.01em',
              textShadow: '0 0 10px rgba(250,204,21,0.7), 0 0 20px rgba(250,204,21,0.35)',
              animation: 'talkGlow 2.4s ease-in-out infinite',
            }}>Talk to me, in my voice</span>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close chat"
          style={{
            marginLeft: 'auto',
            background: fullscreen ? 'rgba(255,255,255,0.05)' : 'none',
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
      <div style={{
        flex: 1, minHeight: 0, overflowY: 'auto',
        overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch',
        padding: '16px 16px 8px',
      }}>
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
      }}>
        {/* Read / Listen toggle — controls whether Rohan's reply is spoken */}
        <div style={{
          display: 'flex', gap: 5, marginBottom: 10,
          padding: 4, borderRadius: 11,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}>
          {[
            {
              on: false, label: 'Rohan writes',
              icon: <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>,
            },
            {
              on: true, label: 'Rohan speaks',
              icon: <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></>,
            },
          ].map(opt => {
            const active = voiceOn === opt.on
            return (
              <button
                key={opt.label}
                onClick={() => {
                  if (!opt.on) stopSpeaking()
                  setVoiceOn(opt.on)
                }}
                style={{
                  flex: 1, padding: '7px 0', borderRadius: 8, cursor: 'pointer',
                  border: 'none',
                  background: active ? '#facc15' : 'transparent',
                  color: active ? '#0a0a0a' : 'rgba(255,255,255,0.5)',
                  fontSize: 12.5, fontWeight: 700, letterSpacing: '0.01em',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  transition: 'background 0.2s, color 0.2s',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {opt.icon}
                </svg>
                {opt.label}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <style>{`@keyframes micPulse { 0%,100%{box-shadow:0 0 0 0 rgba(250,204,21,0.5)} 50%{box-shadow:0 0 0 7px rgba(250,204,21,0)} }`}</style>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            onFocus={() => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 350)}
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
          {SpeechRecognition && (
            <button
              onClick={toggleMic}
              aria-label={listening ? 'Stop listening' : 'Speak your question'}
              style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: listening ? '#facc15' : 'rgba(255,255,255,0.06)',
                border: listening ? 'none' : '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s',
                animation: listening ? 'micPulse 1.2s ease-in-out infinite' : 'none',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={listening ? '#0a0a0a' : 'rgba(255,255,255,0.6)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </button>
          )}
          <button
            onClick={() => (speaking ? stopSpeaking() : send())}
            disabled={!speaking && (!input.trim() || loading)}
            aria-label={speaking ? 'Stop voice' : 'Send'}
            style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: speaking ? 'rgba(255,255,255,0.12)' : (input.trim() && !loading ? '#facc15' : 'rgba(255,255,255,0.06)'),
              border: 'none', cursor: (speaking || (input.trim() && !loading)) ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s, box-shadow 0.2s',
            }}
          >
            {speaking ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="rgba(255,255,255,0.8)" stroke="none">
                <rect x="6" y="6" width="12" height="12" rx="2"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={input.trim() && !loading ? '#0a0a0a' : 'rgba(255,255,255,0.25)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
