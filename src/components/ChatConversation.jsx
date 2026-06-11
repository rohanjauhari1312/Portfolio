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
  // Turn emails into mailto: links and URLs into clickable links.
  const linkStyle = { color: '#facc15', textDecoration: 'underline' }
  const linkify = (text, prefix) =>
    text.split(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|https?:\/\/[^\s]+|[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.(?:com|org|net|io|edu|app|dev|ai|co|me|gov|xyz)(?:\/[^\s]*)?)/g).map((part, i) => {
      const key = `${prefix}-${i}`
      if (!part) return null
      if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(part)) {
        return <a key={key} href={`mailto:${part}`} style={linkStyle}>{part}</a>
      }
      if (/^https?:\/\//.test(part) || /^[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.(?:com|org|net|io|edu|app|dev|ai|co|me|gov|xyz)/.test(part)) {
        const trail = (part.match(/[.,!?;:)\]]+$/) || [''])[0]
        const url = trail ? part.slice(0, -trail.length) : part
        const href = /^https?:\/\//.test(url) ? url : `https://${url}`
        return <span key={key}><a href={href} target="_blank" rel="noopener noreferrer" style={linkStyle}>{url}</a>{trail}</span>
      }
      return <span key={key}>{part}</span>
    })
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
            ? <strong key={i} style={{ color: '#f5f5f5', fontWeight: 600 }}>{linkify(p.slice(2, -2), `b${i}`)}</strong>
            : <span key={i}>{linkify(p, `t${i}`)}</span>
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

const cardBtn = {
  padding: '7px 12px', borderRadius: 8, cursor: 'pointer',
  background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.3)',
  color: '#facc15', fontSize: 12, fontWeight: 600,
}

function ResumeCard() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
      <div style={{
        maxWidth: '82%', padding: '14px 16px', borderRadius: '14px 14px 14px 4px',
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(250,204,21,0.18)',
      }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 10 }}>Here's my resume.</div>
        <a href="/resume" target="_blank" rel="noopener noreferrer" style={{ ...cardBtn, textDecoration: 'none', display: 'inline-block' }}>
          Download resume (PDF)
        </a>
      </div>
    </div>
  )
}

function buildTranscript(messages) {
  return messages
    .filter(m => m.content)
    .map(m => `${m.role === 'user' ? 'You' : 'Rohan'}: ${m.content}`)
    .join('\n\n')
}

function TranscriptCard({ messages }) {
  const [copied, setCopied] = useState(false)
  const text = buildTranscript(messages)
  const copy = async () => { try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch {} }
  const download = () => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'rohbot-transcript.txt'; a.click()
    URL.revokeObjectURL(url)
  }
  const email = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent('My chat with Rohan (RohBot)')}&body=${encodeURIComponent(text.slice(0, 1800))}`
  }
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
      <div style={{
        maxWidth: '88%', padding: '14px 16px', borderRadius: '14px 14px 14px 4px',
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(250,204,21,0.18)',
      }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 10 }}>Transcript of our conversation.</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={copy} style={cardBtn}>{copied ? 'Copied' : 'Copy'}</button>
          <button onClick={download} style={cardBtn}>Download</button>
          <button onClick={email} style={cardBtn}>Email</button>
        </div>
      </div>
    </div>
  )
}

// Self-contained chat: header + messages + input + streaming logic.
// `fullscreen` bumps the input font-size to 16px to stop iOS auto-zoom and
// adds safe-area padding for the standalone /rohbot screen.
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

export default function ChatConversation({ onClose, fullscreen = false, autoFocus = true, onNavigate }) {
  const [messages, setMessages] = useState(loadMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [voiceOn, setVoiceOn] = useState(false) // false = Rohan writes (read), true = Rohan speaks (listen)
  const [speaking, setSpeaking] = useState(false)
  const [callState, setCallState] = useState('idle') // idle | connecting | active
  const [agentBusy, setAgentBusy] = useState(false)  // agent is running a tool/operation
  const [agentSpeaking, setAgentSpeaking] = useState(false)
  const convRef = useRef(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const audioRef = useRef(null)
  const voiceOnRef = useRef(false)

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

  // Stop any audio when unmounting.
  useEffect(() => () => {
    audioRef.current?.pause()
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

      // Non-streaming error responses come back as plain JSON, not SSE.
      if (!res.ok || !res.body) {
        let msg = 'Something went wrong. Try again.'
        try { const j = await res.json(); if (j?.error) msg = j.error } catch {}
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, content: msg, streaming: false } : m
        ))
        setLoading(false)
        return
      }

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
      m.id === assistantId
        ? { ...m, content: m.content || 'Sorry, I had trouble responding. Try asking again.', streaming: false }
        : m
    ))
    setLoading(false)
    if (voiceOnRef.current && finalText.trim()) speak(finalText)
  }, [input, messages, loading, speak])

  // ── Live voice call (ElevenLabs Conversational AI) ──────────────────────────
  const addCard = (card) => setMessages(prev => [...prev, { id: `c${Date.now()}${Math.random()}`, ...card }])

  const clientTools = {
    navigate: ({ route }) => {
      const r = String(route || '').replace(/^\//, '')
      if (onNavigate && r) onNavigate(r)
      return `Opened ${r}`
    },
    show_resume_in_chat: () => { addCard({ role: 'assistant', kind: 'resume' }); return 'Resume card shown in chat' },
    show_transcript: () => { addCard({ role: 'assistant', kind: 'transcript' }); return 'Transcript shown in chat' },
    set_busy: ({ busy }) => { setAgentBusy(!!busy); return 'ok' },
  }

  const startCall = useCallback(async () => {
    setCallState('connecting')
    try {
      const res = await fetch('/api/eleven-token')
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setCallState('idle')
        addCard({ role: 'assistant', content: j.error === 'Voice agent not configured'
          ? 'Live voice calling is not set up yet.'
          : 'Could not start the call. Please try again.' })
        return
      }
      const { signedUrl } = await res.json()
      await navigator.mediaDevices.getUserMedia({ audio: true })
      // Lazy-load the SDK so it never weighs down the main bundle.
      const { Conversation } = await import('@elevenlabs/client')
      convRef.current = await Conversation.startSession({
        signedUrl,
        clientTools,
        onConnect: () => setCallState('active'),
        onDisconnect: () => { setCallState('idle'); setAgentBusy(false); setAgentSpeaking(false); convRef.current = null },
        onError: () => { setCallState('idle'); setAgentBusy(false); setAgentSpeaking(false) },
        onModeChange: ({ mode }) => setAgentSpeaking(mode === 'speaking'),
        onMessage: ({ message, source }) => {
          if (!message) return
          setMessages(prev => [...prev, {
            id: `v${Date.now()}${Math.random()}`,
            role: source === 'user' ? 'user' : 'assistant',
            content: message,
          }])
        },
      })
    } catch {
      setCallState('idle')
      addCard({ role: 'assistant', content: 'I need microphone access to start a call.' })
    }
  }, [onNavigate])

  const endCall = useCallback(async () => {
    try { await convRef.current?.endSession() } catch {}
    convRef.current = null
    setCallState('idle')
    setAgentBusy(false)
    setAgentSpeaking(false)
  }, [])

  // During a live call, typed text (e.g. an email address) is sent into the
  // voice conversation instead of the text endpoint.
  const submitInput = () => {
    if (speaking) { stopSpeaking(); return }
    const text = input.trim()
    if (!text) return
    if (callState === 'active') {
      convRef.current?.sendUserMessage?.(text)
      setMessages(prev => [...prev, { id: `u${Date.now()}${Math.random()}`, role: 'user', content: text }])
      setInput('')
    } else {
      send()
    }
  }

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitInput() }
  }

  return (
    <>
      <style>{`
        @keyframes talkGlow {
          0%, 100% { text-shadow: 0 0 8px rgba(250,204,21,0.55), 0 0 16px rgba(250,204,21,0.25); }
          50%      { text-shadow: 0 0 14px rgba(250,204,21,0.9), 0 0 28px rgba(250,204,21,0.45); }
        }
        @keyframes callPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.5; transform: scale(0.8); }
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

        {messages.map((m, i) => {
          if (m.kind === 'resume') return <ResumeCard key={m.id ?? i} />
          if (m.kind === 'transcript') return <TranscriptCard key={m.id ?? i} messages={messages} />
          return m.streaming && !m.content
            ? <TypingIndicator key={m.id ?? i} />
            : <Message key={m.id ?? i} msg={m} />
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: fullscreen ? '10px 12px calc(14px + env(safe-area-inset-bottom))' : '10px 12px 14px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}>
        {/* Live call status banner */}
        {callState !== 'idle' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10,
            padding: '9px 12px', borderRadius: 10,
            background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)',
          }}>
            <span style={{
              width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
              background: '#4ade80', boxShadow: '0 0 8px #4ade80',
              animation: 'callPulse 1.2s ease-in-out infinite',
            }} />
            <span style={{ fontSize: 12.5, color: '#4ade80', fontWeight: 600, flex: 1 }}>
              {callState === 'connecting' ? 'Connecting…'
                : agentBusy ? 'Working on it…'
                : agentSpeaking ? 'Rohan is speaking…'
                : 'Listening…'}
            </span>
            <button
              onClick={endCall}
              style={{
                padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
                background: '#ef4444', border: 'none', color: '#fff',
                fontSize: 12, fontWeight: 700,
              }}
            >
              End call
            </button>
          </div>
        )}

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
          {callState === 'idle' && (
            <button
              onClick={startCall}
              aria-label="Start voice call"
              title="Call Rohan"
              style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.35)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </button>
          )}
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            onFocus={() => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 350)}
            placeholder={callState === 'active' ? 'Type your email or a note…' : 'Ask something...'}
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
            onClick={submitInput}
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
