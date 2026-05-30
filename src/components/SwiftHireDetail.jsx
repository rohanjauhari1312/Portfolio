import { useEffect, useRef, useState } from 'react'

const YELLOW = '#facc15'
const ORANGE = '#fb923c'

const PIPELINE = [
  {
    type: 'auto',
    step: 1,
    title: 'Continuous monitoring',
    detail: 'Python script runs via launchd every 15 minutes. Calls Greenhouse and Ashby APIs for all 23 companies, classifies by role type and city, deduplicates against seen job IDs. Anything new under 3 days old fires a macOS notification.',
  },
  {
    type: 'manual',
    title: 'You open the board and decide',
    detail: 'Board filters to last 2 days, under 4 YOE, roles where sponsorship is not explicitly refused. Fit, company stage, and interest stay your call.',
  },
  {
    type: 'auto',
    step: 2,
    title: 'Resume + cold email written for the role',
    detail: 'Paste the JD into Claude. It rewrites your resume around that specific role — right projects, adjusted language, reordered sections — and drafts a cold email: subject line, personalised opening, and body.',
  },
  {
    type: 'auto',
    step: 3,
    title: 'Resume download',
    detail: 'Chrome extension watches the Claude tab. When streaming stops, reads the finished LaTeX block and triggers a native browser download. PDF is in Downloads before you have switched tabs.',
  },
  {
    type: 'auto',
    step: 4,
    title: 'Contact lookup',
    detail: 'One click in the extension popup queries Apollo.io for a recruiter or hiring manager at the target company. Returns name, title, and email address.',
  },
  {
    type: 'manual',
    title: 'You confirm the contact',
    detail: 'Wrong contact wastes the entire email regardless of quality. One look before it goes out.',
  },
  {
    type: 'auto',
    step: 5,
    title: 'Email composition',
    detail: 'Extension builds an Outlook web compose URL — recipient, subject, and body pre-filled from what Claude wrote — and opens it in a new tab.',
  },
  {
    type: 'manual',
    title: 'You read, attach, and send',
    detail: 'Every email that goes out has been read once. Edit anything that does not sound right, then send.',
  },
]

const BUILT = [
  {
    name: 'Job Board',
    sub: 'swifthire-board.vercel.app',
    detail: 'React app on Vercel. No backend, no database. Job data is a JS file rewritten every time the poller finds a new role — which also triggers a Vercel redeploy automatically.',
    chips: ['Posted within 2 days', 'YOE under 4', 'Sponsorship filter', 'City filter', 'Role type: PM / SE / FDE', 'Company stage', 'Search + sort'],
  },
  {
    name: 'Chrome Extension',
    sub: 'job-to-claude (Manifest V3)',
    detail: 'No local server. Everything runs in the browser or as a service worker. Two functions: get a recruiter contact, compose the email.',
    chips: ['Resume download from Claude', 'Apollo.io contact lookup', 'Outlook deeplink compose', 'No server dependency'],
  },
  {
    name: 'Poller',
    sub: 'refresh.py via launchd',
    detail: 'Runs every 15 minutes. Handles fetching, classifying, deduplication, macOS notifications, sponsorship checks from JD text, jobs.js generation, and Vercel redeploy trigger.',
    chips: ['Greenhouse REST API', 'Ashby GraphQL', '3-day cutoff', 'Sponsorship keyword check', 'Auto-redeploy on new role'],
  },
]

const TRADEOFFS = [
  { decision: 'Static site on Vercel', why: 'Zero infrastructure. Deploys in under 2 min.', tradeoff: 'New data requires a full redeploy.' },
  { decision: 'Greenhouse + Ashby only', why: 'Both have stable public APIs. Most targets use one.', tradeoff: 'Misses companies on Workday or Lever.' },
  { decision: '3-day notification cutoff', why: 'Prevents alert floods when adding new companies.', tradeoff: 'Older roles that are still worth applying to will not notify.' },
  { decision: 'Sponsorship from JD text', why: 'Catches actual policy language — more accurate than a list.', tradeoff: 'Ashby roles default to noSponsor: false.' },
  { decision: 'No server in extension', why: 'Nothing to maintain, nothing to start before using.', tradeoff: 'LaTeX compilation depends on Claude being open.' },
  { decision: 'Human sends the email', why: 'One set of eyes on every email before it goes out.', tradeoff: 'Adds 2–5 minutes per application.' },
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

function PipelineStep({ step, index, totalVisible }) {
  const isManual = step.type === 'manual'
  const isLast = index === PIPELINE.length - 1

  return (
    <div
      style={{
        display: 'flex',
        gap: 20,
        opacity: totalVisible ? 1 : 0,
        transform: totalVisible ? 'translateX(0)' : 'translateX(-16px)',
        transition: `opacity 0.5s ease ${index * 70}ms, transform 0.5s cubic-bezier(.22,1,.36,1) ${index * 70}ms`,
      }}
    >
      {/* Left: icon + connector */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: isManual ? 10 : '50%',
          background: isManual ? 'rgba(251,146,60,0.1)' : 'rgba(250,204,21,0.08)',
          border: `1.5px ${isManual ? 'dashed' : 'solid'} ${isManual ? ORANGE : YELLOW}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: isManual ? 14 : 12,
          fontWeight: 700,
          color: isManual ? ORANGE : YELLOW,
          flexShrink: 0,
        }}>
          {isManual ? '◆' : step.step}
        </div>
        {!isLast && (
          <div style={{
            width: 1,
            flex: 1,
            minHeight: 28,
            background: isManual
              ? `linear-gradient(to bottom, ${ORANGE}60, rgba(255,255,255,0.06))`
              : `linear-gradient(to bottom, ${YELLOW}50, rgba(255,255,255,0.06))`,
            marginTop: 4,
          }} />
        )}
      </div>

      {/* Right: content */}
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : 28 }}>
        <div style={{
          fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: isManual ? ORANGE : 'rgba(250,204,21,0.55)',
          marginBottom: 5,
        }}>
          {isManual ? 'Your decision' : `Automated — step ${step.step}`}
        </div>
        <div style={{
          padding: '14px 18px',
          background: isManual ? 'rgba(251,146,60,0.04)' : 'rgba(255,255,255,0.025)',
          border: `1px ${isManual ? 'dashed' : 'solid'} ${isManual ? 'rgba(251,146,60,0.25)' : 'rgba(255,255,255,0.07)'}`,
          borderRadius: 10,
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: isManual ? ORANGE : '#f5f5f5', marginBottom: 5 }}>
            {step.title}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>
            {step.detail}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SwiftHireDetail({ onBack }) {
  const [heroVisible, setHeroVisible] = useState(false)
  const [pipelineRef, pipelineVisible] = useReveal(0.05)

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 60)
    return () => clearTimeout(t)
  }, [])

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
        @keyframes shPulse { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes shFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
      `}</style>

      {/* Nav */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(10,10,10,0.88)',
        backdropFilter: 'blur(12px)',
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
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>SwiftHire</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <a
            href="/swifthire.pdf"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '7px 16px', borderRadius: 8, fontSize: 12.5, fontWeight: 700,
              background: YELLOW, color: '#0a0a0a', textDecoration: 'none',
              boxShadow: `0 0 16px ${YELLOW}50`,
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
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: YELLOW, boxShadow: `0 0 8px ${YELLOW}`, display: 'inline-block', animation: 'shPulse 2.5s ease-in-out infinite' }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: YELLOW }}>Personal Project</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.6rem, 6vw, 4.2rem)', fontWeight: 800,
          letterSpacing: '-0.03em', lineHeight: 1.05, margin: '0 0 16px',
          color: '#f5f5f5',
        }}>
          SwiftHire
        </h1>
        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'rgba(255,255,255,0.45)',
          lineHeight: 1.6, maxWidth: 600, margin: '0 0 40px',
        }}>
          An automated job search pipeline — from first alert to cold email in under 10 minutes. Built for one person, tuned for one search.
        </p>

        {/* Metrics row */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 72 }}>
          {[
            { v: '23', l: 'Companies monitored' },
            { v: '15 min', l: 'Polling interval' },
            { v: '< 10 min', l: 'Alert to cold email' },
            { v: '3', l: 'Manual decision points' },
          ].map(m => (
            <div key={m.l} style={{
              padding: '14px 22px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 12,
            }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: YELLOW, letterSpacing: '-0.02em' }}>{m.v}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', marginTop: 2 }}>{m.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 32px 120px' }}>

        {/* Problem */}
        <Section label="The Problem">
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginBottom: 28 }}>
            Job boards need daily manual checking. By the time most candidates notice a role it is already 3–5 days old. Writing a tailored resume takes 30–60 minutes. Finding a recruiter email takes another 10–20. Most people either skip the work entirely or burn out doing it badly.
          </p>
          <div style={{
            background: 'rgba(250,204,21,0.04)',
            border: '1px solid rgba(250,204,21,0.12)',
            borderRadius: 12, overflow: 'hidden',
          }}>
            {[
              { step: 'Check job boards', time: 'Daily, 20–30 min', note: 'Repeated across LinkedIn, company sites, ATS portals' },
              { step: 'Filter irrelevant roles', time: '10–15 min', note: 'No way to filter by recency, YOE, or sponsorship at once' },
              { step: 'Read JD and decide', time: '5–10 min', note: 'Still required — this stays manual' },
              { step: 'Tailor resume', time: '30–60 min', note: 'Usually skipped or done poorly under time pressure' },
              { step: 'Find recruiter contact', time: '10–20 min', note: 'LinkedIn, Apollo, guesswork — often unsuccessful' },
              { step: 'Write cold email', time: '15–30 min', note: 'Usually generic. Rarely done alongside an application' },
              { step: 'Send', time: '2 min', note: 'Still requires a person' },
            ].map((row, i) => (
              <div key={row.step} style={{
                display: 'grid', gridTemplateColumns: '1fr 100px 1fr',
                gap: 16, padding: '13px 20px',
                borderBottom: i < 6 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                alignItems: 'center',
              }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#f5f5f5' }}>{row.step}</div>
                <div style={{ fontSize: 12.5, color: ORANGE, fontWeight: 500 }}>{row.time}</div>
                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.38)' }}>{row.note}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Pipeline */}
        <Section label="The Pipeline">
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 36 }}>
            Five automated steps handle everything between a role going live and an email draft landing in Outlook. Three decision points stay with you.
          </p>
          <div ref={pipelineRef}>
            {PIPELINE.map((step, i) => (
              <PipelineStep key={i} step={step} index={i} totalVisible={pipelineVisible} />
            ))}
          </div>
        </Section>

        {/* What was built */}
        <Section label="What Was Built">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {BUILT.map((item, i) => (
              <BuiltCard key={item.name} item={item} index={i} />
            ))}
          </div>
        </Section>

        {/* Decisions */}
        <Section label="Decisions and Tradeoffs">
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12, overflow: 'hidden',
          }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
              gap: 0, padding: '10px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
            }}>
              {['Decision', 'Why', 'Tradeoff'].map(h => (
                <div key={h} style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>{h}</div>
              ))}
            </div>
            {TRADEOFFS.map((row, i) => (
              <div key={row.decision} style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                gap: 0, padding: '14px 20px',
                borderBottom: i < TRADEOFFS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                alignItems: 'start',
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#f5f5f5', paddingRight: 16 }}>{row.decision}</div>
                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)', paddingRight: 16, lineHeight: 1.55 }}>{row.why}</div>
                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.3)', lineHeight: 1.55 }}>{row.tradeoff}</div>
              </div>
            ))}
          </div>
        </Section>

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
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = `rgba(250,204,21,0.2)`}
      onMouseLeave={e => e.currentTarget.style.borderColor = `rgba(255,255,255,0.07)`}
    >
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#f5f5f5' }}>{item.name}</div>
        <div style={{ fontSize: 11.5, color: 'rgba(250,204,21,0.5)', fontWeight: 500, marginTop: 2 }}>{item.sub}</div>
      </div>
      <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: '0 0 14px' }}>{item.detail}</p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {item.chips.map(c => (
          <span key={c} style={{
            padding: '4px 10px', borderRadius: 6,
            fontSize: 11.5, fontWeight: 500,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.09)',
            color: 'rgba(255,255,255,0.45)',
          }}>{c}</span>
        ))}
      </div>
    </div>
  )
}
