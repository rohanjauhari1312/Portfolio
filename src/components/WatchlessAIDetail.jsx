import { useEffect, useRef, useState } from 'react'
import TypedHeading from './TypedHeading'

const CYAN        = '#22d3ee'
const CYAN_BG     = 'rgba(34,211,238,0.07)'
const CYAN_BORDER = 'rgba(34,211,238,0.2)'

const AGENTS = [
  {
    name: 'Alert engine',
    role: 'Fires on what matters',
    description: 'For agentic alerts, calls get_recent_frames to understand what was happening before the current frame, then get_recent_alert_events to check if it already fired for the same situation. Only fires again when something materially changes — no spam when the same person is still in frame.',
  },
  {
    name: 'Chat agent',
    role: 'Answers your questions',
    description: 'Given a natural language question, decides which tools to call (search_frames with keyword and time filters, get_alert_history), runs up to 5 tool iterations, then synthesizes a grounded answer. Duration questions are answered by matching first and last timestamps; identity questions use distinguishing attributes from stored frame observations.',
  },
  {
    name: 'Validation agent',
    role: 'Independent second opinion',
    description: 'Re-examines the actual JPEG and checks whether proposed alert reasons or chat answers are supported by the evidence. If it disagrees, it suppresses the alert or triggers one corrective retry with its specific objection. Fails open — errors do not block the primary output.',
  },
]

const COMPETITORS = [
  { name: 'Verkada',          gap: 'Hardware lock-in, enterprise-only, minimum $2K/camera' },
  { name: 'Arlo / Nest',      gap: 'Fixed alert categories only — person, vehicle, package. No custom conditions, no retrospective queries' },
  { name: 'BriefCam',         gap: '$50K–500K deployments. Completely inaccessible to SMBs' },
  { name: 'Twelve Labs',      gap: 'Developer API, not an end-user product. Pricing scales with video volume' },
  { name: 'AWS Rekognition',  gap: 'Requires heavy integration work. No out-of-box product' },
]

const STACK = [
  { k: 'Backend',       v: 'FastAPI, no auth, all routes open — designed for quick iteration' },
  { k: 'Frontend',      v: 'Vanilla JS SPA, no framework, no build step — 4 tabs: Cameras, Frames, Alerts, Ask' },
  { k: 'Vision',        v: 'Claude Haiku per frame — structured JSON: summary, people, objects. Single fixed call, not an agent' },
  { k: 'Storage',       v: 'SQLite via SQLAlchemy — cameras, frames, alerts, alert_events tables' },
  { k: 'Ingestion',     v: 'OpenCV cv2.VideoCapture — one background thread per camera, samples every N seconds (default 10)' },
  { k: 'Deployment',    v: 'Railway via Procfile — opencv-python-headless required; Railway Volume persists DB and frames across redeploys' },
  { k: 'Agents',        v: 'Three multi-step tool-calling loops: Alert engine, Chat agent, Validation agent' },
]

const SEGMENTS = [
  { who: 'Small business owner',  example: '"Was the register unattended after close?"',       pay: '$20–40/camera/month' },
  { who: 'Property manager',      example: '"Was the front door propped open overnight?"',      pay: '$15–25/camera/month' },
  { who: 'Home power user',       example: '"When did the kids get home?"',                     pay: '$10–20/month total' },
  { who: 'Warehouse operator',    example: '"How long was loading dock 2 idle on Tuesday?"',    pay: '$30–60/camera/month' },
]

function useReveal(threshold = 0.1) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

function Section({ label, children, delay = 0 }) {
  const [ref, visible] = useReveal()
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s cubic-bezier(.22,1,.36,1) ${delay}ms`,
        marginBottom: 80,
      }}
    >
      {label && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: CYAN, boxShadow: `0 0 8px ${CYAN}`, display: 'inline-block' }} />
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: CYAN }}>
            {label}
          </span>
        </div>
      )}
      {children}
    </div>
  )
}

export default function WatchlessAIDetail({ onBack }) {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#f5f5f5' }}>

      {/* Top bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px',
        background: 'rgba(10,10,10,0.88)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(18px)',
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'none', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, padding: '7px 16px', cursor: 'pointer',
            color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 500,
            transition: 'border-color 0.2s, color 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = '#f5f5f5' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>&#8592;</span>
          Portfolio
        </button>

        <a
          href="/trywatchlessai"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '8px 20px', borderRadius: 8, fontSize: 13,
            fontWeight: 600, background: CYAN, color: '#0a0a0a',
            textDecoration: 'none',
            boxShadow: `0 0 16px ${CYAN}40`,
          }}
        >
          Try WatchlessAI
        </a>
      </div>

      {/* Hero */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '120px 64px 80px' }}>
        <div style={{ marginBottom: 16 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: CYAN,
          }}>
            Conversational AI Camera Monitor
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1,
          color: CYAN, margin: '0 0 28px',
        }}>
          WATCHLESSAI
        </h1>

        <blockquote style={{
          borderLeft: `3px solid ${CYAN}`,
          margin: '0 0 36px', padding: '14px 24px',
          background: CYAN_BG, borderRadius: '0 8px 8px 0',
        }}>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, margin: 0, fontStyle: 'italic' }}>
            "Security cameras generate hours of footage that nobody watches. By the time you look, the moment has passed."
          </p>
        </blockquote>

        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, maxWidth: 680, margin: '0 0 40px' }}>
          Point it at any RTSP stream or video file. From that point forward, ask it anything — "did anyone enter after 3pm?", "was the back door propped open?", "how long was loading dock 2 idle?" — and set alerts in plain English that fire only when something genuinely new happens.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <a
            href="/trywatchlessai"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '13px 28px', borderRadius: 8, fontSize: 14,
              fontWeight: 700, background: CYAN, color: '#0a0a0a',
              textDecoration: 'none',
              boxShadow: `0 0 24px ${CYAN}50`,
            }}
          >
            Try It Live
          </a>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Claude Haiku', 'FastAPI', 'OpenCV', 'SQLite', 'Railway'].map(t => (
              <span key={t} style={{
                fontSize: 11, color: 'rgba(255,255,255,0.4)',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '5px 10px', borderRadius: 6,
              }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${CYAN}20, transparent)` }} />

      {/* Content */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '80px 64px 120px' }}>

        {/* Problem */}
        <Section label="The Problem">
          <TypedHeading text="Hours of footage. Nobody watching." speed={28} cursorColor={CYAN} style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 20px', color: '#f5f5f5' }} />
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, margin: '0 0 16px', maxWidth: 680 }}>
            Reviewing footage after an incident means scrubbing through hours of recording manually. Existing AI camera systems — Arlo, Nest, Ring — send motion clips for preset categories: person, vehicle, package. They cannot answer retrospective questions, cannot accept custom conditions in natural language, and cannot reason about context across time.
          </p>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, margin: 0, maxWidth: 680 }}>
            You cannot ask an Arlo camera "how long was the back door open?" or "did anyone go into the office after the last employee left?" No product today lets a non-technical user ask arbitrary natural language questions about their own footage, on their own cameras, at a price that makes sense for a small business.
          </p>
        </Section>

        {/* Competitor gap */}
        <Section label="The gap">
          <TypedHeading text="Every competitor owns 2–3 of 5." speed={28} cursorColor={CYAN} style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 32px', color: '#f5f5f5' }} />

          <div style={{ marginBottom: 32, padding: '20px 24px', borderRadius: 12, background: CYAN_BG, border: `1px solid ${CYAN_BORDER}` }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>
              No product combines all five: bring your own camera, natural language retrospective queries, custom alert conditions in plain English, agentic deduplication to kill alert spam, and SMB pricing under $30/camera/month.
            </p>
          </div>

          <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '180px 1fr',
              background: 'rgba(255,255,255,0.03)',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              padding: '10px 20px',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Competitor</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>The gap WatchlessAI fills</div>
            </div>
            {COMPETITORS.map((row, i) => (
              <div key={row.name} style={{
                display: 'grid', gridTemplateColumns: '180px 1fr',
                padding: '14px 20px',
                borderBottom: i < COMPETITORS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{row.name}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{row.gap}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Three agents */}
        <Section label="Architecture">
          <TypedHeading text="Three agents. One system." speed={28} cursorColor={CYAN} style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 16px', color: '#f5f5f5' }} />
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, margin: '0 0 36px', maxWidth: 680 }}>
            Camera ingestion (OpenCV) and frame analysis (Claude Haiku vision call) are fixed single steps. The three agents each run their own multi-step tool-calling loop — they decide what to do next based on what they find.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {AGENTS.map((agent) => (
              <div key={agent.name} style={{
                padding: '24px 28px',
                borderRadius: 14,
                background: CYAN_BG,
                border: `1px solid ${CYAN_BORDER}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: CYAN }}>{agent.name}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>{agent.role}</span>
                </div>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: 0 }}>{agent.description}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Who it's for */}
        <Section label="Who it's for">
          <TypedHeading text="Any camera. Any question." speed={28} cursorColor={CYAN} style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 32px', color: '#f5f5f5' }} />
          <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 120px',
              background: 'rgba(255,255,255,0.03)',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              padding: '10px 20px',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Segment</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Example question</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: CYAN, letterSpacing: '0.15em', textTransform: 'uppercase' }}>WTP</div>
            </div>
            {SEGMENTS.map((row, i) => (
              <div key={row.who} style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 120px',
                padding: '14px 20px',
                borderBottom: i < SEGMENTS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{row.who}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, fontStyle: 'italic' }}>{row.example}</div>
                <div style={{ fontSize: 13, color: CYAN, fontWeight: 500 }}>{row.pay}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Stack */}
        <Section label="How it's built">
          <TypedHeading text="Minimal stack. Ships on Railway." speed={28} cursorColor={CYAN} style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 32px', color: '#f5f5f5' }} />
          <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
            {STACK.map((row, i) => (
              <div key={row.k} style={{
                display: 'grid', gridTemplateColumns: '140px 1fr',
                padding: '14px 20px',
                borderBottom: i < STACK.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: CYAN, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{row.k}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{row.v}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Market */}
        <Section label="Market">
          <TypedHeading text="770 million cameras. Zero that answer questions." speed={28} cursorColor={CYAN} style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 24px', color: '#f5f5f5' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
            {[
              { v: '$8B', l: 'AI video analytics market today' },
              { v: '$2.5B', l: 'SMB-addressable segment' },
              { v: '$540M', l: 'ARR at 1% penetration, $30/camera/month' },
            ].map((m) => (
              <div key={m.l} style={{
                padding: '20px 24px', borderRadius: 12,
                background: CYAN_BG, border: `1px solid ${CYAN_BORDER}`,
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: CYAN, marginBottom: 6 }}>{m.v}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{m.l}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* CTA */}
        <Section>
          <div style={{
            padding: '48px', borderRadius: 20,
            background: CYAN_BG, border: `1px solid ${CYAN_BORDER}`,
            textAlign: 'center',
          }}>
            <h2 style={{ fontSize: 'clamp(1.4rem,3.5vw,2rem)', fontWeight: 800, color: '#f5f5f5', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
              Try it with your own camera
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', margin: '0 0 28px', lineHeight: 1.65 }}>
              No account. No setup. Point it at an RTSP stream or upload a video file and start asking questions.
            </p>
            <a
              href="/trywatchlessai"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '14px 36px', borderRadius: 10, fontSize: 15,
                fontWeight: 700, background: CYAN, color: '#0a0a0a',
                textDecoration: 'none',
                boxShadow: `0 0 28px ${CYAN}50`,
              }}
            >
              Open WatchlessAI
            </a>
          </div>
        </Section>

      </div>
    </div>
  )
}
