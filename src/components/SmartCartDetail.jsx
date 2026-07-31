import { useEffect, useRef, useState } from 'react'
import TypedHeading from './TypedHeading'

const GREEN        = '#4ade80'
const GREEN_BG     = 'rgba(74,222,128,0.07)'
const GREEN_BORDER = 'rgba(74,222,128,0.2)'
const GRAD         = { background: 'linear-gradient(90deg, #facc15, #fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }

const AGENTS = [
  { n: '1', name: 'Intent agent', role: 'Parses free text', desc: 'Turns "ramen x3, oat milk, dumplings, under $50, high-protein" into structured categories, quantities, budget, and per-item notes. Decomposes dish names like "tacos" into tortillas, protein, salsa, toppings, adjusting the protein note against your diet rules. Explicit "(x3)" hints are pulled out; anything without one defaults to 1.' },
  { n: '2', name: 'Grocery orchestrator', role: 'Fans out the work', desc: 'Takes the parsed categories and dispatches Discovery + Quality & Nutrition in parallel, one call per category. If a category came through with the ambiguous default quantity of 1 and the user has a learned typical quantity, it substitutes that in — but an explicit "(x3)" from the user always wins.' },
  { n: '3', name: 'Discovery agent', role: 'Searches the real catalog', desc: 'Searches Kroger\'s actual product catalog for each category, one call per category, run in parallel since scoring one category never depends on another.' },
  { n: '4', name: 'Quality & Nutrition agent', role: 'Reads ingredients, not keywords', desc: 'Scores every candidate. Calls a nutrition lookup, falls back to web search if empty, and reads actual ingredient lists rather than keyword-matching — catching non-obvious animal-derived stuff a keyword filter would miss: rennet in parmesan, gelatin, isinglass, fish-derived "natural flavors." Carries diet semantics correctly, so meat isn\'t falsely flagged for a nonveg or keto diet.' },
  { n: '5', name: 'Suggestion agent', role: 'Ranks and explains', desc: 'Ranks the scored candidates per category and explains the price-vs-quality trade-off in plain language, weighted by what\'s known about the user\'s preferences so far.' },
  { n: '6', name: 'Selection handler', role: 'Resolves your picks', desc: 'Takes what you actually confirmed in the UI and resolves it back against the original suggestions — matching product IDs, computing the real total against budget and free-delivery threshold.' },
  { n: '7', name: 'Cart agent', role: 'Writes for real', desc: 'Writes two things: a row in Supabase (session + cart items, real quantities) and a real write to your Kroger cart via their API. If the Kroger write fails, it says so honestly in the summary instead of claiming success.' },
  { n: '8', name: 'Preference learning agent', role: 'Fire-and-forget', desc: 'Fires immediately after the cart write, asynchronously — doesn\'t block your response. Reads the last 10 orders and updates price sensitivity, quality weighting, preferred brands per category, and typical quantities per category, conservatively.' },
]

const STACK = [
  { k: 'Frontend',        v: 'React + Vite, deployed on Vercel' },
  { k: 'Orchestration',   v: 'n8n Cloud workflows, running on Railway' },
  { k: 'Model',           v: 'Claude, via Anthropic\'s API, powering every agent' },
  { k: 'Product data',    v: 'Kroger\'s real catalog and cart API — places actual items in a real cart, not a simulated one' },
  { k: 'Nutrition data',  v: 'Open Food Facts, with a web-search fallback when a product isn\'t in that database' },
  { k: 'Memory',          v: 'Supabase — stores sessions, cart items, and a per-user preferences row' },
]

const LEARNING_RULES = [
  { title: '2-session confirmation threshold', detail: 'The same brand or the same quantity has to show up in more than one separate order before it\'s trusted as a real preference, not a coincidence. One weird order — an out-of-stock substitution, a one-off bulk buy — doesn\'t skew the whole profile.' },
  { title: 'Gradual nudging, not overfitting', detail: 'Quality weight moves from 0.5 toward 0.6, not jumping to 0.9 off one session. The system tracks a trend, not a snapshot of your most recent order.' },
  { title: 'Nothing is auto-added', detail: 'Favorite foods from onboarding pre-fill your request text, but they still go through the full discovery-and-scoring pipeline. Nothing skips the checks just because it was a past favorite.' },
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

export default function SmartCartDetail({ onBack }) {
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
          href="/trysmartcart"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '8px 20px', borderRadius: 8, fontSize: 13,
            fontWeight: 600, background: GREEN, color: '#0a0a0a',
            textDecoration: 'none',
            boxShadow: `0 0 16px ${GREEN}40`,
          }}
        >
          Try SmartCart
        </a>
      </div>

      {/* Hero */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '120px 64px 80px' }}>
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: GREEN }}>
            Multi-agent Grocery Assistant · Real Cart, Real API
          </span>
        </div>

        <h1 style={{ fontSize: 'clamp(3.2rem, 8vw, 6rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, color: GREEN, margin: '0 0 28px' }}>
          SmartCart
        </h1>

        <blockquote style={{
          borderLeft: `3px solid ${GREEN}`,
          margin: '0 0 36px', padding: '14px 24px',
          background: GREEN_BG, borderRadius: '0 8px 8px 0',
        }}>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, margin: 0, fontStyle: 'italic' }}>
            "Grocery apps make you retype the same list every week, and 'recommended for you' is generic — it doesn't know your diet, your budget, or what you actually buy. There's no reasoning happening, just search and filters."
          </p>
        </blockquote>

        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, maxWidth: 680, margin: '0 0 40px' }}>
          Type "ramen x3, oat milk, dumplings, under $50, high-protein" and eight agents parse it, search a real catalog, read actual ingredient lists for diet conflicts, rank trade-offs in plain language, and write to your real Kroger cart — while a ninth agent learns your patterns quietly in the background.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <a
            href="/trysmartcart"
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
            {['Claude', 'n8n', 'Kroger API', 'Supabase', 'Open Food Facts'].map(t => (
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

        {/* Problem */}
        <Section label="The problem">
          <TypedHeading text="No reasoning, just " suffixText="filters." suffixStyle={GRAD} speed={28} cursorColor={GREEN} style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 20px', color: '#f5f5f5' }} />
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, margin: 0, maxWidth: 680 }}>
            Grocery apps make you retype the same list every week, and "recommended for you" is generic — it doesn't know your diet, your budget, or what you actually buy. There's no reasoning happening, just search and filters.
          </p>
        </Section>

        {/* Request flow diagram */}
        <Section label="How a request flows">
          <TypedHeading text="Eight agents, one " suffixText="cart." suffixStyle={GRAD} speed={28} cursorColor={GREEN} style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 16px', color: '#f5f5f5' }} />
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, margin: '0 0 32px', maxWidth: 680 }}>
            "ramen x3, oat milk, dumplings, under $50, high-protein" hits a webhook and moves through this pipeline. Discovery and Quality & Nutrition fan out in parallel per category; everything else is sequential because each step needs the previous step's actual output.
          </p>

          <div style={{ marginBottom: 8, borderRadius: 14, overflow: 'hidden', border: `1px solid ${GREEN_BORDER}` }}>
            <svg width="100%" viewBox="0 0 680 1240" xmlns="http://www.w3.org/2000/svg" role="img" style={{ display: 'block' }} fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">
              <title>SmartCart request pipeline with tool calls per agent</title>
              <rect width="680" height="1240" fill="#0e0f12"/>
              <defs>
                <marker id="arrow-sc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                  <path d="M2 1L8 5L2 9" fill="none" stroke="#73726c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </marker>
              </defs>

              {/* spine */}
              <line x1="340" y1="96" x2="340" y2="146" stroke="#73726c" strokeWidth="2" markerEnd="url(#arrow-sc)"/>
              <line x1="340" y1="222" x2="340" y2="272" stroke="#73726c" strokeWidth="2" markerEnd="url(#arrow-sc)"/>
              {/* orchestrator fans out one agent per category, in parallel */}
              <line x1="260" y1="328" x2="100" y2="378" stroke="#73726c" strokeWidth="2" markerEnd="url(#arrow-sc)"/>
              <line x1="320" y1="328" x2="275" y2="378" stroke="#73726c" strokeWidth="2" markerEnd="url(#arrow-sc)"/>
              <line x1="380" y1="328" x2="450" y2="378" stroke="#73726c" strokeWidth="2" markerEnd="url(#arrow-sc)"/>
              <line x1="430" y1="328" x2="602" y2="378" stroke="#73726c" strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#arrow-sc)"/>
              <line x1="100" y1="434" x2="220" y2="506" stroke="#73726c" strokeWidth="2" markerEnd="url(#arrow-sc)"/>
              <line x1="275" y1="434" x2="310" y2="506" stroke="#73726c" strokeWidth="2" markerEnd="url(#arrow-sc)"/>
              <line x1="450" y1="434" x2="400" y2="506" stroke="#73726c" strokeWidth="2" markerEnd="url(#arrow-sc)"/>
              <line x1="602" y1="434" x2="470" y2="506" stroke="#73726c" strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#arrow-sc)"/>
              <line x1="200" y1="582" x2="300" y2="642" stroke="#73726c" strokeWidth="2" markerEnd="url(#arrow-sc)"/>
              <line x1="480" y1="582" x2="380" y2="642" stroke="#73726c" strokeWidth="2" markerEnd="url(#arrow-sc)"/>
              <line x1="340" y1="698" x2="340" y2="748" stroke="#73726c" strokeWidth="2" markerEnd="url(#arrow-sc)"/>
              <line x1="340" y1="804" x2="340" y2="854" stroke="#73726c" strokeWidth="2" markerEnd="url(#arrow-sc)"/>
              <line x1="340" y1="930" x2="340" y2="980" stroke="#73726c" strokeWidth="2" markerEnd="url(#arrow-sc)"/>
              {/* async fire-and-forget branch off cart agent */}
              <line x1="450" y1="930" x2="450" y2="1076" stroke="#73726c" strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#arrow-sc)"/>

              {/* You type */}
              <g><rect x="220" y="40" width="240" height="56" rx="8" fill="#17181c" stroke="#3d3d3a" strokeWidth="0.5"/><text x="340" y="58" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#e8e9ec">You type a request</text><text x="340" y="76" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#9a9da4">free text, hits a webhook</text></g>

              {/* Intent agent */}
              <g><rect x="150" y="146" width="380" height="76" rx="8" fill="#0a2e17" stroke="#4ade80" strokeWidth="0.5"/><text x="340" y="166" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#9FE1CB">Intent agent</text><text x="340" y="186" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#5DCAA5">parses categories, quantities, budget, dish decomposition</text><text x="340" y="206" textAnchor="middle" dominantBaseline="central" fontSize="10" fill="#73726c" fontStyle="italic">tools: none — pure parsing, no tool calls</text></g>

              {/* Orchestrator */}
              <g><rect x="150" y="272" width="380" height="56" rx="8" fill="#0a2e17" stroke="#4ade80" strokeWidth="0.5"/><text x="340" y="290" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#9FE1CB">Grocery orchestrator</text><text x="340" y="308" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#5DCAA5">fans out per category, applies learned quantities</text></g>

              {/* One Discovery + Quality agent instance PER category, spawned in parallel */}
              <g><rect x="20" y="378" width="160" height="56" rx="8" fill="#0a2e17" stroke="#4ade80" strokeWidth="0.5"/><text x="100" y="392" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="700" fill="#9FE1CB">Category agent</text><text x="100" y="410" textAnchor="middle" dominantBaseline="central" fontSize="10" fill="#73726c" fontStyle="italic">e.g. ramen</text></g>
              <g><rect x="195" y="378" width="160" height="56" rx="8" fill="#0a2e17" stroke="#4ade80" strokeWidth="0.5"/><text x="275" y="392" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="700" fill="#9FE1CB">Category agent</text><text x="275" y="410" textAnchor="middle" dominantBaseline="central" fontSize="10" fill="#73726c" fontStyle="italic">e.g. oat milk</text></g>
              <g><rect x="370" y="378" width="160" height="56" rx="8" fill="#0a2e17" stroke="#4ade80" strokeWidth="0.5"/><text x="450" y="392" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="700" fill="#9FE1CB">Category agent</text><text x="450" y="410" textAnchor="middle" dominantBaseline="central" fontSize="10" fill="#73726c" fontStyle="italic">e.g. dumplings</text></g>
              {/* ellipsis lane — scales to however many categories you order */}
              <g>
                <rect x="545" y="378" width="115" height="56" rx="8" fill="#0a2e17" stroke="#4ade80" strokeWidth="0.5" strokeDasharray="4 3" opacity="0.6"/>
                <circle cx="588" cy="398" r="2.5" fill="#4ade80"/>
                <circle cx="602" cy="398" r="2.5" fill="#4ade80"/>
                <circle cx="616" cy="398" r="2.5" fill="#4ade80"/>
                <text x="602" y="418" textAnchor="middle" dominantBaseline="central" fontSize="9" fill="#73726c" fontStyle="italic">N more</text>
              </g>

              {/* parallel label + shared tool calls for this stage */}
              <text x="340" y="458" textAnchor="middle" fontSize="11" fill="#73726c" fontStyle="italic">one Category agent spawned per category, all running in parallel</text>
              <text x="340" y="476" textAnchor="middle" fontSize="9" fill="#73726c" fontStyle="italic">tools: search_kroger · lookup_open_food_facts · search_nutrition_online · check_diet_conflicts</text>

              {/* Suggestion agent */}
              <g><rect x="150" y="506" width="380" height="76" rx="8" fill="#0a2e17" stroke="#4ade80" strokeWidth="0.5"/><text x="340" y="526" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#9FE1CB">Suggestion agent</text><text x="340" y="546" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#5DCAA5">ranks, explains price vs quality trade-offs</text><text x="340" y="566" textAnchor="middle" dominantBaseline="central" fontSize="10" fill="#73726c" fontStyle="italic">tools: none — reasons over data already passed in</text></g>

              {/* You pick */}
              <g><rect x="220" y="642" width="240" height="56" rx="8" fill="#17181c" stroke="#3d3d3a" strokeWidth="0.5"/><text x="340" y="660" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#e8e9ec">You pick</text><text x="340" y="678" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#9a9da4">ranked options, editable quantity stepper</text></g>

              {/* Selection handler */}
              <g><rect x="150" y="748" width="380" height="56" rx="8" fill="#0a2e17" stroke="#4ade80" strokeWidth="0.5"/><text x="340" y="766" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#9FE1CB">Selection handler</text><text x="340" y="784" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#5DCAA5">resolves picks, computes real total vs budget</text></g>

              {/* Cart agent */}
              <g><rect x="150" y="854" width="380" height="76" rx="8" fill="#0a2e17" stroke="#4ade80" strokeWidth="0.5"/><text x="340" y="874" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#9FE1CB">Cart agent</text><text x="340" y="894" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#5DCAA5">writes Supabase row + real Kroger cart via their API</text><text x="340" y="914" textAnchor="middle" dominantBaseline="central" fontSize="9" fill="#73726c" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">insert_grocery_session, insert_cart_items, write_kroger_cart</text></g>

              {/* Response returned */}
              <g><rect x="150" y="980" width="380" height="56" rx="8" fill="#17181c" stroke="#3d3d3a" strokeWidth="0.5"/><text x="340" y="998" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#e8e9ec">Response returns</text><text x="340" y="1016" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#9a9da4">doesn't wait on learning</text></g>

              {/* Preference learning agent (async, dashed) */}
              <g><rect x="150" y="1076" width="380" height="76" rx="8" fill="#0a2e17" stroke="#4ade80" strokeWidth="0.5" strokeDasharray="5 3"/><text x="340" y="1096" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#9FE1CB">Preference learning agent</text><text x="340" y="1116" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#5DCAA5">fire-and-forget, doesn't block your response</text><text x="340" y="1136" textAnchor="middle" dominantBaseline="central" fontSize="9" fill="#73726c" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">get_user_preferences, get_session_history, upsert_user_preferences</text></g>

              <rect x="150" y="1194" width="14" height="14" rx="3" fill="#0a2e17" stroke="#4ade80" strokeWidth="0.5"/>
              <text x="172" y="1201" dominantBaseline="central" fontSize="12" fill="#9a9da4">= agent: calls tools and decides the next step itself</text>
            </svg>
          </div>
        </Section>

        {/* Agent detail cards */}
        <Section label="What each agent does">
          <TypedHeading text="Not a pipeline of " suffixText="filters." suffixStyle={GRAD} speed={28} cursorColor={GREEN} style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 32px', color: '#f5f5f5' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {AGENTS.map((a) => (
              <div key={a.n} style={{
                display: 'flex', gap: 18,
                padding: '20px 24px', borderRadius: 14,
                background: GREEN_BG, border: `1px solid ${GREEN_BORDER}`,
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(74,222,128,0.15)', border: `1px solid ${GREEN}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800, color: GREEN,
                }}>{a.n}</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: GREEN }}>{a.name}</span>
                    <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>{a.role}</span>
                  </div>
                  <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: 0 }}>{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Parallel vs sequential vs fire-and-forget */}
        <Section label="Execution model">
          <TypedHeading text="Three patterns, on " suffixText="purpose." suffixStyle={GRAD} speed={28} cursorColor={GREEN} style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 28px', color: '#f5f5f5' }} />

          <div style={{ marginBottom: 8, borderRadius: 14, overflow: 'hidden', border: `1px solid ${GREEN_BORDER}` }}>
            <svg width="100%" viewBox="0 0 680 340" xmlns="http://www.w3.org/2000/svg" role="img" style={{ display: 'block' }} fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">
              <title>Parallel, sequential, and fire-and-forget execution patterns in SmartCart</title>
              <rect width="680" height="340" fill="#0e0f12"/>

              {/* Parallel row */}
              <text x="24" y="30" fontSize="12" fontWeight="700" fill="#4ade80" letterSpacing="0.08em">PARALLEL — Discovery + Quality &amp; Nutrition</text>
              <rect x="24" y="44" width="300" height="34" rx="6" fill="#0a2e17" stroke="#4ade80" strokeWidth="0.5"/>
              <text x="174" y="61" textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#9FE1CB">ramen category</text>
              <rect x="356" y="44" width="300" height="34" rx="6" fill="#0a2e17" stroke="#4ade80" strokeWidth="0.5"/>
              <text x="506" y="61" textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#9FE1CB">oat milk category</text>
              <text x="340" y="98" textAnchor="middle" fontSize="10.5" fill="#73726c" fontStyle="italic">no category depends on another — straightforward latency win</text>

              {/* Sequential row */}
              <text x="24" y="150" fontSize="12" fontWeight="700" fill="#e8e9ec" letterSpacing="0.08em">SEQUENTIAL — everything else</text>
              <rect x="24" y="164" width="140" height="34" rx="6" fill="#17181c" stroke="#3d3d3a" strokeWidth="0.5"/>
              <text x="94" y="181" textAnchor="middle" dominantBaseline="central" fontSize="10.5" fill="#e8e9ec">discover</text>
              <line x1="164" y1="181" x2="196" y2="181" stroke="#73726c" strokeWidth="1.5" markerEnd="url(#arrow-sc)"/>
              <rect x="196" y="164" width="140" height="34" rx="6" fill="#17181c" stroke="#3d3d3a" strokeWidth="0.5"/>
              <text x="266" y="181" textAnchor="middle" dominantBaseline="central" fontSize="10.5" fill="#e8e9ec">score</text>
              <line x1="336" y1="181" x2="368" y2="181" stroke="#73726c" strokeWidth="1.5" markerEnd="url(#arrow-sc)"/>
              <rect x="368" y="164" width="140" height="34" rx="6" fill="#17181c" stroke="#3d3d3a" strokeWidth="0.5"/>
              <text x="438" y="181" textAnchor="middle" dominantBaseline="central" fontSize="10.5" fill="#e8e9ec">rank</text>
              <line x1="508" y1="181" x2="540" y2="181" stroke="#73726c" strokeWidth="1.5" markerEnd="url(#arrow-sc)"/>
              <rect x="540" y="164" width="116" height="34" rx="6" fill="#17181c" stroke="#3d3d3a" strokeWidth="0.5"/>
              <text x="598" y="181" textAnchor="middle" dominantBaseline="central" fontSize="10.5" fill="#e8e9ec">write cart</text>
              <text x="340" y="218" textAnchor="middle" fontSize="10.5" fill="#73726c" fontStyle="italic">each step needs the previous step's actual output — can't score before discovery</text>

              {/* Fire-and-forget row */}
              <text x="24" y="270" fontSize="12" fontWeight="700" fill="#4ade80" letterSpacing="0.08em">FIRE-AND-FORGET — preference learning</text>
              <rect x="24" y="284" width="200" height="34" rx="6" fill="#17181c" stroke="#3d3d3a" strokeWidth="0.5"/>
              <text x="124" y="301" textAnchor="middle" dominantBaseline="central" fontSize="10.5" fill="#e8e9ec">cart written</text>
              <line x1="224" y1="290" x2="260" y2="278" stroke="#73726c" strokeWidth="1.5" markerEnd="url(#arrow-sc)"/>
              <text x="272" y="272" fontSize="10" fill="#9a9da4">response returns</text>
              <line x1="224" y1="312" x2="260" y2="324" stroke="#73726c" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrow-sc)"/>
              <rect x="260" y="308" width="230" height="30" rx="6" fill="#0a2e17" stroke="#4ade80" strokeWidth="0.5" strokeDasharray="4 3"/>
              <text x="375" y="323" textAnchor="middle" dominantBaseline="central" fontSize="10" fill="#9FE1CB">learns in background, doesn't block you</text>
            </svg>
          </div>
        </Section>

        {/* What makes learning meaningful */}
        <Section label="Preference learning">
          <TypedHeading text="A cache is not " suffixText="learning." suffixStyle={GRAD} speed={28} cursorColor={GREEN} style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 16px', color: '#f5f5f5' }} />
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, margin: '0 0 28px', maxWidth: 680 }}>
            The easy version of "preference learning" is storing whatever the user picked last time and reusing it. That's a cache, not learning. The actual bar here is higher.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {LEARNING_RULES.map((r) => (
              <div key={r.title} style={{ padding: '18px 22px', borderRadius: 12, background: GREEN_BG, border: `1px solid ${GREEN_BORDER}` }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: GREEN, marginBottom: 6 }}>{r.title}</div>
                <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }}>{r.detail}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Stack */}
        <Section label="What it's built on">
          <TypedHeading text="Real APIs, not a " suffixText="demo." suffixStyle={GRAD} speed={28} cursorColor={GREEN} style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 28px', color: '#f5f5f5' }} />
          <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
            {STACK.map((s, i) => (
              <div key={s.k} style={{ display: 'flex', borderBottom: i < STACK.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                <div style={{ width: 150, flexShrink: 0, padding: '13px 20px', fontSize: 12, fontWeight: 700, color: GREEN, borderRight: '1px solid rgba(255,255,255,0.05)' }}>{s.k}</div>
                <div style={{ padding: '13px 20px', fontSize: 13, color: 'rgba(255,255,255,0.52)', lineHeight: 1.5 }}>{s.v}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* CTA */}
        <div style={{
          padding: '48px', borderRadius: 20,
          background: GREEN_BG, border: `1px solid ${GREEN_BORDER}`,
          textAlign: 'center',
        }}>
          <h2 style={{ fontSize: 'clamp(1.4rem,3.5vw,2rem)', fontWeight: 800, color: '#f5f5f5', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
            All 7 backend workflows are live
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', margin: '0 0 28px', lineHeight: 1.65 }}>
            Deployed and published on n8n Cloud, writing to a real Kroger cart and a real Supabase preference table. Not a staged demo — an actual running pipeline anyone with the link can try.
          </p>
          <a
            href="/trysmartcart"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '14px 36px', borderRadius: 10, fontSize: 15,
              fontWeight: 700, background: GREEN, color: '#0a0a0a',
              textDecoration: 'none',
              boxShadow: `0 0 28px ${GREEN}50`,
            }}
          >
            Open SmartCart
          </a>
        </div>

      </div>
    </div>
  )
}
