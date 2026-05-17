import { useEffect, useRef, useState } from 'react'
import TypedHeading from './TypedHeading'

const GREEN        = '#4ade80'
const GREEN_BG     = 'rgba(74,222,128,0.09)'
const GREEN_BORDER = 'rgba(74,222,128,0.22)'

const FEATURES = [
  { title: 'Full nutrient tracking',    what: '25+ nutrients daily, not just calories',              why: 'Deficiencies are invisible until they\'re not' },
  { title: 'Food preference engine',    what: 'Learns what you like through conversation',           why: 'Suggestions you\'ll actually follow' },
  { title: 'Wearable integration',      what: 'Reads sleep, heart rate, steps from Fitbit',         why: 'Adjusts targets based on how you actually lived today' },
  { title: 'Agentic proactivity',       what: 'Reaches out before you fall short',                  why: 'Catches deficits before they become symptoms' },
  { title: 'Plain language logging',    what: '"Had dal and rice", it figures out the rest',       why: 'Zero friction means actually using it' },
  { title: 'Workout adaptation',        what: 'Recalculates targets when you train or skip',        why: 'Rest day and gym day targets are different' },
  { title: 'Passive signal detection',  what: 'Picks up cues from casual conversation',             why: 'No need to think about what to log' },
]

const LIFECYCLE = [
  { phase: 'Onboarding',        detail: '7-step setup: name, age, weight, height, goal, diet type, health concerns, allergies, medical conditions, and food preferences rated 1–5. Stored in Supabase, referenced on every future interaction.' },
  { phase: 'Daily Use',         detail: 'Log meals by talking naturally. Nourish extracts nutrients, updates gaps, adjusts suggestions. Wearable data syncs every 15 minutes automatically.' },
  { phase: 'Proactive Guidance',detail: 'Checks in at key moments: morning after reading sleep data, midday protein check, pre-workout window, evening gap catch-up. Each message is specific, the right food, the right quantity, from foods you like.' },
  { phase: 'Long-Term Learning',detail: 'Notices patterns over time: always miss zinc on rest days, feel tired when iron drops, do better with a big breakfast. Patterns feed back into suggestions, getting more accurate every week.' },
]

const AGENTS = [
  { name: 'Orchestrator',     role: 'The router',          image: '/nourish-orchestrator.jpg', description: 'A lightweight router. Every message from the app arrives here. It reads the message, picks the right specialist, passes it on. No knowledge of its own, no database access by design.' },
  { name: 'Nutrition Agent',  role: 'The brain',           image: '/nourish-nutrition.jpg',    description: 'Handles everything food and health related: meal logging, nutrient tracking, meal suggestions, profile saves, and all database writes. Has Supabase MCP access, reads your profile at the start of every conversation.' },
  { name: 'Health Monitor',   role: 'The data pipeline',   image: '/nourish-health.jpg',       description: 'Runs every 15 minutes, independent of the user. Calls the Google Fit API, pulls the latest biometrics from Fitbit, steps, heart rate, sleep, calories, active minutes, and adjusts daily targets.' },
  { name: 'Scheduling Agent', role: 'Calendar and email',  image: '/nourish-scheduling.jpg',   description: 'Handles Gmail and Google Calendar. Schedules meal prep reminders, blocks gym time, reads your calendar to understand busy days and adjusts meal suggestions around them.' },
]

const STACK = [
  { k: 'Web App',         v: 'HTML/JS PWA on Netlify, installable on phone, works offline' },
  { k: 'Auth',            v: 'Supabase Auth with Google OAuth' },
  { k: 'Agent Backend',   v: 'n8n Cloud, all four agent workflows' },
  { k: 'AI Model',        v: 'Claude (Anthropic), powers all four agents' },
  { k: 'Database',        v: 'Supabase Postgres, single DB for all tables and all agents' },
  { k: 'DB Access',       v: 'Supabase MCP, direct agent-to-database writes and reads' },
  { k: 'Wearable Data',   v: 'Google Fitness REST API, reads Fitbit via Health Connect on Pixel' },
  { k: 'Memory',          v: 'Postgres Chat Memory, conversation history per session' },
]

const ROADMAP = [
  { phase: 'Now',     what: 'Profile save, end-to-end chat, watch data writing to DB',         when: 'This week',           active: true },
  { phase: 'Week 2',  what: 'Proactive messaging, analytics screen in app',                    when: 'Next week',           active: false },
  { phase: 'Month 2', what: 'Frailty Monitor Agent, fall risk, sensor data, caregiver alerts',when: 'After core is solid', active: false },
  { phase: 'Month 3', what: 'Multi-user support, full genericisation',                         when: 'Scale phase',         active: false },
  { phase: 'Future',  what: 'Photo meal logging, CGM integration, caregiver portal',           when: 'Post-validation',     active: false },
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
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: GREEN, boxShadow: `0 0 8px ${GREEN}`, display: 'inline-block' }} />
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: GREEN }}>
            {label}
          </span>
        </div>
      )}
      {children}
    </div>
  )
}

export default function NourishDetail({ onBack }) {
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
          href="https://nourish-agent.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '8px 20px', borderRadius: 8, fontSize: 13,
            fontWeight: 600, background: GREEN, color: '#0a0a0a',
            textDecoration: 'none',
            boxShadow: `0 0 16px ${GREEN}40`,
          }}
        >
          Try Nourish
        </a>
      </div>

      {/* Hero */}
      <div style={{
        paddingTop: 120, paddingBottom: 80,
        maxWidth: 860, margin: '0 auto', padding: '120px 64px 80px',
      }}>
        <div style={{ marginBottom: 16 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: GREEN,
          }}>
            AI Nutritionist Agent
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(3.5rem, 9vw, 6.5rem)',
          fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1,
          color: GREEN, margin: '0 0 28px',
        }}>
          NOURISH
        </h1>

        <blockquote style={{
          borderLeft: `3px solid ${GREEN}`,
          margin: '0 0 36px', padding: '14px 24px',
          background: GREEN_BG, borderRadius: '0 8px 8px 0',
        }}>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, margin: 0, fontStyle: 'italic' }}>
            "People don't fail at nutrition because they don't care. They fail because nobody told them what to do next, for them, specifically, right now."
          </p>
        </blockquote>

        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, maxWidth: 680, margin: '0 0 40px' }}>
          A personal AI nutritionist that actually knows you. Not a generic calorie counter, a system that tracks everything your body needs, learns what you like, reads your wearable data, and tells you exactly what to eat right now, in plain conversation.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <a
            href="https://nourish-agent.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '13px 28px', borderRadius: 8, fontSize: 14,
              fontWeight: 700, background: GREEN, color: '#0a0a0a',
              textDecoration: 'none',
              boxShadow: `0 0 24px ${GREEN}50`,
            }}
          >
            Try It Live
          </a>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Claude', 'n8n', 'Supabase', 'Google Fit API'].map(t => (
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

      <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${GREEN}20, transparent)` }} />

      {/* Content */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '80px 64px 120px' }}>

        {/* The Problem */}
        <Section label="The Problem">
          <TypedHeading text="The gap nobody filled." speed={28} cursorColor={GREEN} style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 20px', color: '#f5f5f5' }} />
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, margin: '0 0 16px', maxWidth: 680 }}>
            Nutritionists cost $100–300 per session and give you a static PDF. Apps track calories but never tell you what to eat. The result is paralysis, bad guesses, and giving up.
          </p>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, margin: 0, maxWidth: 680 }}>
            The specific gap: a system that knows your body, your goals, your food preferences, and what you've done today, and tells you what to eat right now, from foods you actually like.
          </p>
        </Section>

        {/* What It Does */}
        <Section label="Features">
          <TypedHeading text="What it does." speed={28} cursorColor={GREEN} style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 32px', color: '#f5f5f5' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{
                padding: '18px 20px', borderRadius: 12,
                background: GREEN_BG,
                border: `1px solid ${GREEN_BORDER}`,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: GREEN, marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>{f.what}</div>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>{f.why}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Product Lifecycle */}
        <Section label="Product Lifecycle">
          <TypedHeading text="How it works day to day." speed={28} cursorColor={GREEN} style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 32px', color: '#f5f5f5' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {LIFECYCLE.map((l, i) => (
              <div key={l.phase} style={{ display: 'flex', gap: 28, paddingBottom: i < LIFECYCLE.length - 1 ? 32 : 0 }}>
                {/* Timeline line */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: GREEN, boxShadow: `0 0 10px ${GREEN}`, flexShrink: 0, marginTop: 4 }} />
                  {i < LIFECYCLE.length - 1 && (
                    <div style={{ width: 1, flex: 1, background: `linear-gradient(to bottom, ${GREEN}40, transparent)`, marginTop: 6 }} />
                  )}
                </div>
                <div style={{ paddingBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: GREEN, marginBottom: 6 }}>{l.phase}</div>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.52)', lineHeight: 1.7, margin: 0 }}>{l.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Agent Architecture */}
        <Section label="Architecture">
          <TypedHeading text="Four agents. One system." speed={28} cursorColor={GREEN} style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 12px', color: '#f5f5f5' }} />
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', margin: '0 0 32px', lineHeight: 1.7 }}>
            Each agent has one job. The Orchestrator routes but never processes. The Nutrition Agent writes data but never routes. The Health Monitor pulls data but never suggests meals. Clean separation means each agent can be improved or extended without touching the others.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
            {AGENTS.map((a) => (
              <div key={a.name} style={{
                borderRadius: 12, overflow: 'hidden',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderTop: `2px solid ${GREEN}`,
              }}>
                <img
                  src={a.image}
                  alt={a.name}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
                <div style={{ padding: '18px 20px' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#f5f5f5', marginBottom: 3 }}>{a.name}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: GREEN, marginBottom: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{a.role}</div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.48)', lineHeight: 1.65, margin: 0 }}>{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Tech Stack */}
        <Section label="Tech Stack">
          <TypedHeading text="What it's built on." speed={28} cursorColor={GREEN} style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 28px', color: '#f5f5f5' }} />
          <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
            {STACK.map((s, i) => (
              <div key={s.k} style={{
                display: 'flex', gap: 0,
                borderBottom: i < STACK.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
              }}>
                <div style={{
                  width: 140, flexShrink: 0, padding: '13px 20px',
                  fontSize: 12, fontWeight: 700, color: GREEN,
                  borderRight: '1px solid rgba(255,255,255,0.05)',
                }}>
                  {s.k}
                </div>
                <div style={{ padding: '13px 20px', fontSize: 13, color: 'rgba(255,255,255,0.52)', lineHeight: 1.5 }}>
                  {s.v}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Roadmap */}
        <Section label="Roadmap">
          <TypedHeading text="What's next." speed={28} cursorColor={GREEN} style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 28px', color: '#f5f5f5' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ROADMAP.map(r => (
              <div key={r.phase} style={{
                display: 'flex', alignItems: 'flex-start', gap: 20,
                padding: '16px 20px', borderRadius: 10,
                background: r.active ? GREEN_BG : 'rgba(255,255,255,0.02)',
                border: `1px solid ${r.active ? GREEN_BORDER : 'rgba(255,255,255,0.06)'}`,
              }}>
                <div style={{ flexShrink: 0, minWidth: 72 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: r.active ? GREEN : 'rgba(255,255,255,0.35)' }}>{r.phase}</div>
                </div>
                <div style={{ flex: 1, fontSize: 13, color: r.active ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{r.what}</div>
                <div style={{ flexShrink: 0, fontSize: 11, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic', whiteSpace: 'nowrap' }}>{r.when}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* CTA */}
        <div style={{ textAlign: 'center', paddingTop: 20 }}>
          <a
            href="https://nourish-agent.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block', padding: '16px 40px', borderRadius: 10,
              fontSize: 15, fontWeight: 700, background: GREEN, color: '#0a0a0a',
              textDecoration: 'none',
              boxShadow: `0 0 32px ${GREEN}40`,
            }}
          >
            Try Nourish
          </a>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', marginTop: 14 }}>
            Built on Claude · n8n · Supabase · Google Fit API
          </p>
        </div>

      </div>
    </div>
  )
}
