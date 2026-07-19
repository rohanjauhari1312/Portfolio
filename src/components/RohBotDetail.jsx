import { useEffect, useRef, useState } from 'react'
import TypedHeading from './TypedHeading'

const Y       = '#facc15'
const Y_BG    = 'rgba(250,204,21,0.09)'
const Y_BORD  = 'rgba(250,204,21,0.22)'

const PIPELINE = [
  { step: 'You talk',        detail: 'You hit the call button in the chat and speak. ElevenLabs streams your audio and transcribes it in real time, with proper turn-taking and interruptions.' },
  { step: 'Claude decides',  detail: 'Claude is the brain. It understands the question, pulls facts from a knowledge base of my case studies (RAG), and decides whether it can just answer or needs to take an action.' },
  { step: 'A tool runs',     detail: 'If an action is needed, it calls a tool mid-conversation: check my calendar, book a slot, email you my resume or the transcript, or open a project page on your screen.' },
  { step: 'I answer back',   detail: 'The reply is spoken back in my own cloned voice, and the result is confirmed out loud. The whole loop happens live, in the same chat window.' },
]

const CAPABILITIES = [
  { title: 'Answers in my voice',  what: 'Every reply is spoken in my cloned voice', why: 'It is me talking, not a generic TTS' },
  { title: 'Books a call',         what: 'Checks my real calendar, suggests open slots, books the one you pick', why: 'No back-and-forth email to schedule' },
  { title: 'Emails you',           what: 'Sends my resume or a transcript to your inbox', why: 'You leave the call with what you need' },
  { title: 'Knows my work',        what: 'Retrieves details from my case studies on demand', why: 'Specific answers, not vague ones' },
  { title: 'Shows you around',     what: 'Opens project pages on your screen as it talks', why: 'You see the thing while we discuss it' },
  { title: 'Type or talk',         what: 'You can type your email mid-call and it reads it', why: 'Voice for talk, text for precise input' },
]

const STACK = [
  { k: 'Voice + STT',     v: 'ElevenLabs Conversational AI, real-time speech in and out' },
  { k: 'My voice',        v: 'ElevenLabs instant voice clone' },
  { k: 'Brain',           v: 'Claude, runs the conversation and decides on tools' },
  { k: 'Knowledge (RAG)', v: 'ElevenLabs Knowledge Base over my case-study docs' },
  { k: 'Booking + email', v: 'n8n workflows to Google Calendar and Gmail' },
  { k: 'In-app actions',  v: 'Client tools that open pages, drop a resume card, build the transcript' },
  { k: 'Token security',  v: 'Vercel serverless function issues a signed URL, the API key never reaches the browser' },
  { k: 'Frontend',        v: 'React, the live call runs right inside the chat window' },
]

const SECURITY = [
  { k: 'Keys never exposed', v: 'Every API key (ElevenLabs, Claude) lives in server env vars. A serverless endpoint hands the browser a short-lived signed URL, so no key ever reaches the client or the bundle.' },
  { k: 'Secret-gated webhooks', v: 'The booking and email automations sit behind a shared-secret header. Only the agent knows it; any request without it is rejected with 403, so the endpoints cannot be spam-triggered.' },
  { k: 'Rate limiting', v: 'The chat and voice token endpoints are rate-limited per IP, with input size caps, to blunt abuse and runaway cost.' },
  { k: 'Agent guardrails', v: 'ElevenLabs guardrails block prompt injection, manipulation, and off-topic or unsafe output. The system prompt, model, and tool list cannot be overridden by a connecting client.' },
  { k: 'Booking limits', v: 'The agent books one call per conversation and only offers genuinely free slots, so the calendar cannot be flooded.' },
  { k: 'Private by design', v: 'No personal data sits in client code. Visitor email is only used for the action they asked for (resume or transcript), nothing is sold or compiled.' },
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

function Section({ label, children }) {
  const [ref, visible] = useReveal()
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: 'opacity 0.7s ease, transform 0.7s cubic-bezier(.22,1,.36,1)',
        marginBottom: 80,
      }}
    >
      {label && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: Y, boxShadow: `0 0 8px ${Y}`, display: 'inline-block' }} />
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: Y }}>{label}</span>
        </div>
      )}
      {children}
    </div>
  )
}

export default function RohBotDetail({ onBack }) {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  const goChat = () => {
    history.pushState(null, '', '/rohbot')
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#f5f5f5' }}>
      {/* Top bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', background: 'rgba(10,10,10,0.88)',
        borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(18px)',
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'none', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, padding: '7px 16px', cursor: 'pointer',
            color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 500,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = '#f5f5f5' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>&#8592;</span>
          Portfolio
        </button>
        <button
          onClick={goChat}
          style={{
            padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700,
            background: Y, color: '#0a0a0a', border: 'none', cursor: 'pointer',
            boxShadow: `0 0 16px ${Y}40`,
          }}
        >
          Talk to RohBot
        </button>
      </div>

      {/* Hero */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '120px 64px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <img src="/emoji.png" alt="" style={{ width: 56, height: 56, borderRadius: '50%', border: `1px solid ${Y_BORD}` }} />
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: Y }}>
            AI Voice Agent
          </span>
        </div>

        <h1 style={{ fontSize: 'clamp(3.5rem, 9vw, 6.5rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, color: Y, margin: '0 0 28px' }}>
          RohBot
        </h1>

        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, maxWidth: 680, margin: '0 0 40px' }}>
          A live voice agent that talks back in my own cloned voice. Ask it about my work and it answers from my case studies. Ask it to set up a call and it checks my calendar, suggests times, and books one. Ask for my resume and it emails you. It all happens in the chat, while you talk.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={goChat} style={{ padding: '13px 28px', borderRadius: 8, fontSize: 14, fontWeight: 700, background: Y, color: '#0a0a0a', border: 'none', cursor: 'pointer', boxShadow: `0 0 24px ${Y}50` }}>
            Talk to it live
          </button>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['ElevenLabs', 'Claude', 'RAG', 'n8n'].map(t => (
              <span key={t} style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', padding: '5px 10px', borderRadius: 6 }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${Y}20, transparent)` }} />

      {/* Content */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '80px 64px 120px' }}>

        {/* The problem */}
        <Section label="The problem">
          <TypedHeading text="A portfolio is a one-way street." speed={28} cursorColor={Y} style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 20px', color: '#f5f5f5' }} />
          <p style={{ fontSize: 15.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, margin: '0 0 16px', maxWidth: 680 }}>
            A recruiter lands on my site, skims a few bullets, maybe opens a PDF, and leaves. I never learn who they were, what role they had, or whether it was even a fit. The page cannot answer their specific question, cannot qualify the opportunity, and cannot move anything forward.
          </p>
          <p style={{ fontSize: 15.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, margin: 0, maxWidth: 680 }}>
            Every warm lead has to email me, wait for a reply, and schedule a call over a few back-and-forth messages. Most do not bother. The interest evaporates in the gap between "interested" and "in touch."
          </p>
        </Section>

        {/* The fix */}
        <Section label="The fix">
          <TypedHeading text="So I made it talk back." speed={28} cursorColor={Y} style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 20px', color: '#f5f5f5' }} />
          <p style={{ fontSize: 15.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, margin: '0 0 16px', maxWidth: 680 }}>
            RohBot is a live voice agent inside the chat. You tap call and you are talking, out loud, to a version of me in my own cloned voice. It knows my work and answers in character, and it actually does things while you speak instead of just describing them.
          </p>
          <p style={{ fontSize: 15.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, margin: 0, maxWidth: 680 }}>
            In one conversation a recruiter goes from "interested" to "has a call booked and my resume in their inbox," without leaving the page or waiting on me. It is the difference between a brochure and a conversation.
          </p>
        </Section>

        {/* How it works */}
        <Section label="How it works">
          <TypedHeading text="The loop, end to end." speed={28} cursorColor={Y} style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 32px', color: '#f5f5f5' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {PIPELINE.map((p, i) => (
              <div key={p.step} style={{ display: 'flex', gap: 28, paddingBottom: i < PIPELINE.length - 1 ? 32 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: Y_BG, border: `1px solid ${Y_BORD}`, color: Y, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                  {i < PIPELINE.length - 1 && <div style={{ width: 1, flex: 1, background: `linear-gradient(to bottom, ${Y}40, transparent)`, marginTop: 6 }} />}
                </div>
                <div style={{ paddingBottom: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: Y, marginBottom: 6 }}>{p.step}</div>
                  <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: 0 }}>{p.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Capabilities */}
        <Section label="What it can do">
          <TypedHeading text="It talks. It also acts." speed={28} cursorColor={Y} style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 32px', color: '#f5f5f5' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
            {CAPABILITIES.map(c => (
              <div key={c.title} style={{ padding: '18px 20px', borderRadius: 12, background: Y_BG, border: `1px solid ${Y_BORD}` }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: Y, marginBottom: 6 }}>{c.title}</div>
                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>{c.what}</div>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>{c.why}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Stack */}
        <Section label="Architecture">
          <TypedHeading text="What it's built on." speed={28} cursorColor={Y} style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 28px', color: '#f5f5f5' }} />

          <div style={{ marginBottom: 36, borderRadius: 14, overflow: 'hidden', border: `1px solid ${Y_BORD}` }}>
            <svg width="100%" viewBox="0 0 680 900" xmlns="http://www.w3.org/2000/svg" role="img" style={{ display: 'block' }} fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">
              <title>RohBot: where Claude decides and which tools it calls</title>
              <rect width="680" height="900" fill="#0e0f12"/>
              <defs>
                <marker id="arrow-rb" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                  <path d="M2 1L8 5L2 9" fill="none" stroke="#73726c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </marker>
              </defs>

              {/* vertical spine */}
              <line x1="340" y1="96" x2="340" y2="156" stroke="#73726c" strokeWidth="2" markerEnd="url(#arrow-rb)"/>
              <line x1="340" y1="212" x2="340" y2="272" stroke="#73726c" strokeWidth="2" markerEnd="url(#arrow-rb)"/>
              {/* branch to 3 tools */}
              <line x1="260" y1="328" x2="130" y2="388" stroke="#73726c" strokeWidth="2" markerEnd="url(#arrow-rb)"/>
              <line x1="340" y1="328" x2="340" y2="388" stroke="#73726c" strokeWidth="2" markerEnd="url(#arrow-rb)"/>
              <line x1="420" y1="328" x2="550" y2="388" stroke="#73726c" strokeWidth="2" markerEnd="url(#arrow-rb)"/>
              {/* converge back */}
              <line x1="130" y1="444" x2="260" y2="504" stroke="#73726c" strokeWidth="2" markerEnd="url(#arrow-rb)"/>
              <line x1="340" y1="444" x2="340" y2="504" stroke="#73726c" strokeWidth="2" markerEnd="url(#arrow-rb)"/>
              <line x1="550" y1="444" x2="420" y2="504" stroke="#73726c" strokeWidth="2" markerEnd="url(#arrow-rb)"/>
              <line x1="340" y1="560" x2="340" y2="620" stroke="#73726c" strokeWidth="2" markerEnd="url(#arrow-rb)"/>
              <line x1="340" y1="676" x2="340" y2="736" stroke="#73726c" strokeWidth="2" markerEnd="url(#arrow-rb)"/>

              {/* You speak */}
              <g><rect x="220" y="40" width="240" height="56" rx="8" fill="#17181c" stroke="#3d3d3a" strokeWidth="0.5"/><text x="340" y="58" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#e8e9ec">You speak</text><text x="340" y="76" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#9a9da4">tap the call button</text></g>

              {/* ElevenLabs STT */}
              <g><rect x="180" y="156" width="320" height="56" rx="8" fill="#17181c" stroke="#3d3d3a" strokeWidth="0.5"/><text x="340" y="174" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#e8e9ec">ElevenLabs — speech to text</text><text x="340" y="192" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#9a9da4">streams audio, real-time transcription</text></g>

              {/* Claude decides — agent */}
              <g><rect x="150" y="272" width="380" height="56" rx="8" fill="#332b08" stroke="#facc15" strokeWidth="0.5"/><text x="340" y="290" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#ffe58a">Claude — decides</text><text x="340" y="308" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#e0bd52">RAG over my case studies, picks a tool or just answers</text></g>

              {/* 3 tool boxes */}
              <g><rect x="20" y="388" width="220" height="56" rx="8" fill="#332b08" stroke="#facc15" strokeWidth="0.5"/><text x="130" y="406" textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="500" fill="#ffe58a">n8n → Calendar</text><text x="130" y="424" textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#e0bd52">checks slots, books the call</text></g>
              <g><rect x="250" y="388" width="180" height="56" rx="8" fill="#332b08" stroke="#facc15" strokeWidth="0.5"/><text x="340" y="406" textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="500" fill="#ffe58a">n8n → Gmail</text><text x="340" y="424" textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#e0bd52">sends resume or transcript</text></g>
              <g><rect x="460" y="388" width="200" height="56" rx="8" fill="#17181c" stroke="#3d3d3a" strokeWidth="0.5"/><text x="560" y="406" textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="500" fill="#e8e9ec">Client tool</text><text x="560" y="424" textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#9a9da4">opens a project page live</text></g>

              {/* Claude composes reply — agent */}
              <g><rect x="150" y="504" width="380" height="56" rx="8" fill="#332b08" stroke="#facc15" strokeWidth="0.5"/><text x="340" y="522" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#ffe58a">Claude — composes reply</text><text x="340" y="540" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#e0bd52">confirms the action out loud</text></g>

              {/* ElevenLabs TTS */}
              <g><rect x="180" y="620" width="320" height="56" rx="8" fill="#17181c" stroke="#3d3d3a" strokeWidth="0.5"/><text x="340" y="638" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#e8e9ec">ElevenLabs — text to speech</text><text x="340" y="656" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#9a9da4">spoken back in my cloned voice</text></g>

              {/* You hear it */}
              <g><rect x="220" y="736" width="240" height="56" rx="8" fill="#17181c" stroke="#3d3d3a" strokeWidth="0.5"/><text x="340" y="754" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#e8e9ec">You hear it, live</text><text x="340" y="772" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#9a9da4">same chat window, no page reload</text></g>

              <rect x="150" y="826" width="14" height="14" rx="3" fill="#332b08" stroke="#facc15" strokeWidth="0.5"/>
              <text x="172" y="833" dominantBaseline="central" fontSize="12" fill="#9a9da4">= Claude: decides which tool to call, or whether one is needed at all</text>
            </svg>
          </div>

          <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
            {STACK.map((s, i) => (
              <div key={s.k} style={{ display: 'flex', borderBottom: i < STACK.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                <div style={{ width: 150, flexShrink: 0, padding: '13px 20px', fontSize: 12, fontWeight: 700, color: Y, borderRight: '1px solid rgba(255,255,255,0.05)' }}>{s.k}</div>
                <div style={{ padding: '13px 20px', fontSize: 13, color: 'rgba(255,255,255,0.52)', lineHeight: 1.5 }}>{s.v}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section label="Security & privacy">
          <TypedHeading text="Built to be safe in public." speed={28} cursorColor={Y} style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 12px', color: '#f5f5f5' }} />
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: '0 0 28px', lineHeight: 1.7, maxWidth: 640 }}>
            It is a live agent on a public site that can touch a real calendar and inbox, so it is locked down accordingly.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {SECURITY.map(s => (
              <div key={s.k} style={{ padding: '16px 18px', borderRadius: 12, background: Y_BG, border: `1px solid ${Y_BORD}` }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: Y, marginBottom: 6 }}>{s.k}</div>
                <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>{s.v}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* CTA */}
        <div style={{ textAlign: 'center', paddingTop: 10 }}>
          <button onClick={goChat} style={{ display: 'inline-block', padding: '16px 40px', borderRadius: 10, fontSize: 15, fontWeight: 700, background: Y, color: '#0a0a0a', border: 'none', cursor: 'pointer', boxShadow: `0 0 32px ${Y}40` }}>
            Talk to RohBot
          </button>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', marginTop: 14 }}>
            ElevenLabs voice · Claude · RAG · n8n
          </p>
        </div>

      </div>
    </div>
  )
}
