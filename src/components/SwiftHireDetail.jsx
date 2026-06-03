import { useEffect, useRef, useState } from 'react'

const YELLOW = '#facc15'
const ORANGE = '#fb923c'

const PIPELINE = [
  {
    type: 'auto',
    title: 'Job monitoring',
    detail: 'Python script polls Greenhouse and Ashby APIs for 23 target companies every 15 minutes. Deduplicates against seen job IDs. Fires a macOS notification for anything new under 3 days old.',
  },
  {
    type: 'manual',
    title: 'You decide what to pursue',
    detail: 'Board filters to last 2 days, under 4 YOE, roles where sponsorship is not explicitly refused. Fit and interest stay your call.',
  },
  {
    type: 'auto',
    title: 'Resume tailored + cold email drafted',
    detail: 'Paste the JD. Claude rewrites your resume for that specific role (right projects, adjusted language, reordered sections) and writes a cold email: subject, personalised opening, body.',
  },
  {
    type: 'auto',
    title: 'Resume auto-downloaded',
    detail: 'Chrome extension watches the Claude tab. When streaming stops, reads the finished LaTeX block and triggers a native download. PDF lands in Downloads before you switch tabs.',
  },
  {
    type: 'auto',
    title: 'Recruiter contact looked up',
    detail: 'One click queries Apollo.io for a hiring manager or recruiter at the target company. Returns name, title, and verified email address.',
  },
  {
    type: 'manual',
    title: 'You confirm the contact',
    detail: 'Wrong contact wastes the entire email regardless of quality. One look before it goes out.',
  },
  {
    type: 'auto',
    title: 'Outlook pre-filled and opened',
    detail: 'Extension builds an Outlook web compose URL with recipient, subject, and body already filled in from what Claude wrote. Opens in a new tab.',
  },
  {
    type: 'manual',
    title: 'You read, attach, and send',
    detail: 'Every email that leaves has been read once. Edit anything that does not sound right, then send.',
  },
]

const BUILT = [
  {
    name: 'Job Board',
    sub: 'swifthire-board.vercel.app',
    detail: 'React app on Vercel. No backend, no database. Job data is a JS file rewritten every time the poller finds a new role, which also triggers a Vercel redeploy automatically.',
    chips: ['Posted within 2 days', 'YOE under 4', 'Sponsorship filter', 'City filter', 'Role type: PM / SE / FDE', 'Company stage', 'Search + sort'],
  },
  {
    name: 'Chrome Extension',
    sub: 'job-to-claude (Manifest V3)',
    detail: 'No local server. Everything runs in the browser or as a service worker. Resume auto-download from Claude, Apollo contact lookup, and Outlook deeplink compose.',
    chips: ['Resume download from Claude', 'Apollo.io contact lookup', 'Outlook deeplink compose', 'No server dependency'],
  },
  {
    name: 'Poller',
    sub: 'refresh.py via launchd',
    detail: 'Runs every 15 minutes. Fetches, classifies, deduplicates, sends notifications, checks sponsorship from JD text, rewrites jobs.js, and triggers Vercel redeploy.',
    chips: ['Greenhouse REST API', 'Ashby GraphQL', '3-day cutoff', 'Sponsorship keyword check', 'Auto-redeploy on new role'],
  },
]

const TRADEOFFS = [
  { decision: 'Static site on Vercel', why: 'Zero infrastructure. Deploys in under 2 min.', tradeoff: 'New data requires a full redeploy.' },
  { decision: 'Greenhouse + Ashby only', why: 'Both have stable public APIs. Most targets use one.', tradeoff: 'Misses companies on Workday or Lever.' },
  { decision: '3-day notification cutoff', why: 'Prevents alert floods when adding new companies.', tradeoff: 'Older roles that are still worth applying to will not notify.' },
  { decision: 'Sponsorship from JD text', why: 'Catches actual policy language, more accurate than a list.', tradeoff: 'Ashby roles default to noSponsor: false.' },
  { decision: 'No server in extension', why: 'Nothing to maintain, nothing to start before using.', tradeoff: 'LaTeX compilation depends on Claude being open.' },
  { decision: 'Human sends the email', why: 'One set of eyes on every email before it goes out.', tradeoff: 'Adds 2–5 minutes per application.' },
]

const BotIcon = ({ size = 20, color = YELLOW }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="8" width="18" height="13" rx="2.5"/>
    <path d="M12 3v5"/>
    <circle cx="8.5" cy="3" r="1"/>
    <circle cx="15.5" cy="3" r="1"/>
    <circle cx="9" cy="14" r="1.5" fill={color} stroke="none"/>
    <circle cx="15" cy="14" r="1.5" fill={color} stroke="none"/>
    <path d="M9.5 18.5h5" strokeWidth="2"/>
  </svg>
)

const HumanIcon = ({ size = 20, color = 'rgba(255,255,255,0.7)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7" r="4"/>
    <path d="M4 21c0-4.418 3.582-8 8-8s8 3.582 8 8"/>
  </svg>
)

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
        marginBottom: 88,
      }}
    >
      {label && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: YELLOW, boxShadow: `0 0 8px ${YELLOW}`, display: 'inline-block' }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: YELLOW }}>
            {label}
          </span>
        </div>
      )}
      {children}
    </div>
  )
}

function PipelineNode({ step, index, total, visible, onDelete }) {
  const [hovered, setHovered] = useState(false)
  const isAuto = step.type === 'auto'
  const isLast = index === total - 1

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(-20px)',
        transition: `opacity 0.5s ease ${index * 60}ms, transform 0.5s cubic-bezier(.22,1,.36,1) ${index * 60}ms`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: 'flex', gap: 0, alignItems: 'stretch' }}>

        {/* Icon column */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 56, flexShrink: 0 }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
            background: isAuto ? 'rgba(250,204,21,0.08)' : 'rgba(255,255,255,0.04)',
            border: `1.5px solid ${isAuto ? 'rgba(250,204,21,0.45)' : 'rgba(255,255,255,0.2)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: isAuto ? `0 0 16px rgba(250,204,21,0.2)` : 'none',
            position: 'relative', zIndex: 2,
          }}>
            {isAuto ? <BotIcon size={19} color={YELLOW} /> : <HumanIcon size={19} color="rgba(255,255,255,0.65)" />}
          </div>
          {!isLast && (
            <div style={{
              width: 1, flex: 1, minHeight: 32,
              background: isAuto
                ? `linear-gradient(to bottom, rgba(250,204,21,0.35), rgba(255,255,255,0.05))`
                : `linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(255,255,255,0.04))`,
              position: 'relative', marginTop: 3,
            }}>
              <div style={{
                position: 'absolute', left: -3, width: 7, height: 7, borderRadius: '50%',
                background: isAuto ? YELLOW : 'rgba(255,255,255,0.5)',
                boxShadow: isAuto ? `0 0 6px ${YELLOW}` : 'none',
                animation: `flowDot ${1.8 + index * 0.15}s ease-in-out infinite`,
                animationDelay: `${index * 0.22}s`,
              }} />
            </div>
          )}
        </div>

        {/* Content card */}
        <div style={{ flex: 1, paddingLeft: 16, paddingBottom: isLast ? 0 : 28 }}>
          <div style={{
            padding: '14px 18px', position: 'relative',
            background: isAuto ? 'rgba(250,204,21,0.04)' : 'rgba(255,255,255,0.03)',
            border: `1px ${isAuto ? 'solid' : 'dashed'} ${isAuto ? 'rgba(250,204,21,0.18)' : 'rgba(255,255,255,0.14)'}`,
            borderRadius: 12, marginTop: -2,
          }}>
            <div style={{
              fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
              color: isAuto ? 'rgba(250,204,21,0.5)' : 'rgba(255,255,255,0.3)', marginBottom: 5,
            }}>
              {isAuto ? 'Agent' : 'You'}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: isAuto ? '#f5f5f5' : 'rgba(255,255,255,0.75)', marginBottom: 5 }}>
              {step.title}
            </div>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.38)', lineHeight: 1.65 }}>
              {step.detail}
            </div>
            {/* Delete button */}
            <button
              onClick={() => onDelete(index)}
              style={{
                position: 'absolute', top: 10, right: 10,
                width: 24, height: 24, borderRadius: 6,
                background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
                color: 'rgba(239,68,68,0.7)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: hovered ? 1 : 0,
                transition: 'opacity 0.15s, background 0.15s',
                padding: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.22)'; e.currentTarget.style.color = '#ef4444' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = 'rgba(239,68,68,0.7)' }}
              title="Delete node"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function BuiltCard({ item, index }) {
  const [ref, visible] = useReveal(0.05)
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.6s ease ${index * 80}ms, transform 0.6s cubic-bezier(.22,1,.36,1) ${index * 80}ms, border-color 0.25s`,
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 14, padding: '22px 24px',
        cursor: 'default',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(250,204,21,0.2)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
    >
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#f5f5f5' }}>{item.name}</div>
        <div style={{ fontSize: 11.5, color: 'rgba(250,204,21,0.5)', fontWeight: 500, marginTop: 2 }}>{item.sub}</div>
      </div>
      <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: '0 0 14px' }}>{item.detail}</p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {item.chips.map(c => (
          <span key={c} style={{
            padding: '4px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 500,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
            color: 'rgba(255,255,255,0.45)',
          }}>{c}</span>
        ))}
      </div>
    </div>
  )
}

const EMPTY_FORM = { type: 'auto', title: '', detail: '' }

export default function SwiftHireDetail({ onBack }) {
  const [heroVisible, setHeroVisible] = useState(false)
  const [pipelineRef, pipelineVisible] = useReveal(0.05)
  const [pipeline, setPipeline] = useState(PIPELINE)
  const [addForm, setAddForm] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 60)
    return () => clearTimeout(t)
  }, [])

  const deleteNode = (i) => setPipeline(p => p.filter((_, idx) => idx !== i))
  const submitAdd = () => {
    if (!addForm.title.trim()) return
    setPipeline(p => [...p, { type: addForm.type, title: addForm.title.trim(), detail: addForm.detail.trim() }])
    setAddForm(null)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `
        radial-gradient(ellipse 60% 40% at 20% 10%, rgba(250,204,21,0.04) 0%, transparent 70%),
        radial-gradient(ellipse 50% 35% at 80% 85%, rgba(251,146,60,0.03) 0%, transparent 70%),
        #0a0a0a
      `,
      color: '#f5f5f5',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <style>{`
        @keyframes flowDot {
          0%   { top: 0%;    opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { top: 100%;  opacity: 0; }
        }
        @keyframes shPulse { 0%,100%{opacity:0.6} 50%{opacity:1} }
      `}</style>

      {/* Nav */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '14px 32px',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, padding: '7px 14px', cursor: 'pointer',
            color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 500,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#f5f5f5' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
          Back
        </button>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>SwiftHire</span>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          <a
            href="https://swifthire-board.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '7px 16px', borderRadius: 8, fontSize: 12.5, fontWeight: 600,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.7)', textDecoration: 'none',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `rgba(250,204,21,0.4)`; e.currentTarget.style.color = YELLOW }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Try the board
          </a>
          <a
            href="/swifthire.pdf"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '7px 16px', borderRadius: 8, fontSize: 12.5, fontWeight: 700,
              background: YELLOW, color: '#0a0a0a', textDecoration: 'none',
              boxShadow: `0 0 16px rgba(250,204,21,0.35)`,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Product Doc
          </a>
        </div>
      </div>

      {/* Hero */}
      <div style={{
        maxWidth: 800, margin: '0 auto', padding: '72px 32px 0',
        opacity: heroVisible ? 1 : 0,
        transform: heroVisible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.8s ease, transform 0.8s cubic-bezier(.22,1,.36,1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%', background: YELLOW,
            boxShadow: `0 0 8px ${YELLOW}`, display: 'inline-block',
            animation: 'shPulse 2.5s ease-in-out infinite',
          }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: YELLOW }}>
            Personal Project
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.6rem, 6vw, 4.2rem)', fontWeight: 800,
          letterSpacing: '-0.03em', lineHeight: 1.05, margin: '0 0 16px', color: '#f5f5f5',
        }}>
          SwiftHire
        </h1>
        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: 'rgba(255,255,255,0.42)',
          lineHeight: 1.65, maxWidth: 580, margin: '0 0 40px',
        }}>
          An automated job search pipeline. From first alert to a cold email draft landing in Outlook, in under 10 minutes. Three decisions stay with you. Everything else runs.
        </p>

        {/* Metrics */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 80 }}>
          {[
            { v: '23', l: 'Companies monitored' },
            { v: '15 min', l: 'Polling interval' },
            { v: '< 10 min', l: 'Alert to sent email' },
            { v: '3', l: 'Human decisions' },
          ].map(m => (
            <div key={m.l} style={{
              padding: '14px 22px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12,
            }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: YELLOW, letterSpacing: '-0.02em' }}>{m.v}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{m.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 32px 120px' }}>

        {/* Pipeline legend */}
        <Section label="The Pipeline">
          <div style={{ display: 'flex', gap: 20, marginBottom: 32, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(250,204,21,0.08)', border: '1.5px solid rgba(250,204,21,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <BotIcon size={13} color={YELLOW} />
              </div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Automated</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(255,255,255,0.04)', border: '1.5px dashed rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <HumanIcon size={13} />
              </div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Your decision</span>
            </div>
          </div>

          <div ref={pipelineRef}>
            {pipeline.map((step, i) => (
              <PipelineNode key={i} step={step} index={i} total={pipeline.length} visible={pipelineVisible} onDelete={deleteNode} />
            ))}
          </div>

          {/* Add node */}
          {addForm ? (
            <div style={{
              marginTop: 12, padding: '18px 20px',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
            }}>
              {/* Type toggle */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                {['auto', 'manual'].map(t => (
                  <button key={t} onClick={() => setAddForm(f => ({ ...f, type: t }))} style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
                    fontSize: 12, fontWeight: 600,
                    background: addForm.type === t ? (t === 'auto' ? 'rgba(250,204,21,0.1)' : 'rgba(255,255,255,0.08)') : 'transparent',
                    border: `1px solid ${addForm.type === t ? (t === 'auto' ? 'rgba(250,204,21,0.4)' : 'rgba(255,255,255,0.2)') : 'rgba(255,255,255,0.07)'}`,
                    color: addForm.type === t ? (t === 'auto' ? YELLOW : '#f5f5f5') : 'rgba(255,255,255,0.35)',
                    transition: 'all 0.15s',
                  }}>
                    {t === 'auto' ? <BotIcon size={14} color={addForm.type === 'auto' ? YELLOW : 'rgba(255,255,255,0.3)'} /> : <HumanIcon size={14} color={addForm.type === 'manual' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)'} />}
                    {t === 'auto' ? 'Agent' : 'You'}
                  </button>
                ))}
              </div>
              <input
                autoFocus
                placeholder="Step title"
                value={addForm.title}
                onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && submitAdd()}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8, padding: '9px 12px', marginBottom: 8,
                  fontSize: 13.5, color: '#f5f5f5', outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              <textarea
                placeholder="Description (optional)"
                value={addForm.detail}
                onChange={e => setAddForm(f => ({ ...f, detail: e.target.value }))}
                rows={2}
                style={{
                  width: '100%', boxSizing: 'border-box', resize: 'vertical',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8, padding: '9px 12px', marginBottom: 12,
                  fontSize: 13, color: 'rgba(255,255,255,0.65)', outline: 'none',
                  fontFamily: 'inherit', lineHeight: 1.5,
                }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={submitAdd} style={{
                  padding: '8px 18px', borderRadius: 8, cursor: 'pointer',
                  background: YELLOW, border: 'none', color: '#0a0a0a',
                  fontSize: 12.5, fontWeight: 700,
                }}>Add</button>
                <button onClick={() => setAddForm(null)} style={{
                  padding: '8px 18px', borderRadius: 8, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.5)', fontSize: 12.5, fontWeight: 600,
                }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddForm({ ...EMPTY_FORM })}
              style={{
                marginTop: 12, width: '100%', padding: '11px',
                background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.12)',
                borderRadius: 10, cursor: 'pointer',
                color: 'rgba(255,255,255,0.35)', fontSize: 12.5, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `rgba(250,204,21,0.3)`; e.currentTarget.style.color = YELLOW }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
              Add node
            </button>
          )}
        </Section>

        {/* Problem */}
        <Section label="The Problem">
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginBottom: 28 }}>
            Job boards require daily manual checking. By the time most candidates notice a role it is already 3–5 days old. Tailoring a resume takes 30–60 minutes. Finding a recruiter email takes another 10–20. Writing the cold email on top of everything means most people skip it. The process is slow enough that candidates either give up on doing it well or burn out doing it badly.
          </p>
          <div style={{ background: 'rgba(250,204,21,0.03)', border: '1px solid rgba(250,204,21,0.1)', borderRadius: 12, overflow: 'hidden' }}>
            {[
              { step: 'Check job boards',      time: '20–30 min/day',  note: 'Repeated across LinkedIn, company sites, ATS portals' },
              { step: 'Filter irrelevant roles', time: '10–15 min',     note: 'No way to filter recency, YOE, and sponsorship at once' },
              { step: 'Read JD and decide',     time: '5–10 min',       note: 'Still required. This stays manual' },
              { step: 'Tailor resume',           time: '30–60 min',      note: 'Usually skipped or done poorly under time pressure' },
              { step: 'Find recruiter contact',  time: '10–20 min',      note: 'LinkedIn, Apollo, guesswork. Often unsuccessful' },
              { step: 'Write cold email',        time: '15–30 min',      note: 'Usually generic. Rarely done alongside an application' },
              { step: 'Send',                    time: '2 min',          note: 'Still requires a person' },
            ].map((row, i, arr) => (
              <div key={row.step} style={{
                display: 'grid', gridTemplateColumns: '1fr 90px 1fr',
                gap: 16, padding: '12px 20px',
                borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                alignItems: 'center',
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#f5f5f5' }}>{row.step}</div>
                <div style={{ fontSize: 12, color: ORANGE, fontWeight: 500 }}>{row.time}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{row.note}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* What was built */}
        <Section label="What Was Built">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {BUILT.map((item, i) => <BuiltCard key={item.name} item={item} index={i} />)}
          </div>
        </Section>

        {/* Tradeoffs */}
        <Section label="Decisions and Tradeoffs">
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['Decision', 'Why', 'Tradeoff'].map(h => (
                <div key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)' }}>{h}</div>
              ))}
            </div>
            {TRADEOFFS.map((row, i) => (
              <div key={row.decision} style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                padding: '13px 20px',
                borderBottom: i < TRADEOFFS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                alignItems: 'start',
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#f5f5f5', paddingRight: 16 }}>{row.decision}</div>
                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.42)', paddingRight: 16, lineHeight: 1.55 }}>{row.why}</div>
                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.28)', lineHeight: 1.55 }}>{row.tradeoff}</div>
              </div>
            ))}
          </div>
        </Section>

      </div>
    </div>
  )
}
