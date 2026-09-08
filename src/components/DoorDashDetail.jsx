import { useEffect, useRef, useState } from 'react'
import TypedHeading from './TypedHeading'

const RED        = '#ea3a1f'
const RED_BG     = 'rgba(234,58,31,0.07)'
const RED_BORDER = 'rgba(234,58,31,0.2)'

const ACTIONS = [
  { when: 'Week 1', action: 'Turn off the five markets with no Dashers', how: 'Geo-fence Memphis, Las Vegas, Greenville, Laurinburg and Honolulu until we can staff them. Contact the 79 customers whose orders failed.', owner: 'Regional Ops', metric: 'No undelivered orders in those markets' },
  { when: 'Weeks 1–4', action: 'Report ASAP and scheduled orders separately', how: '416 scheduled orders average 142 minutes because their clock starts when the customer books. One filter fixes the baseline.', owner: 'Analytics', metric: 'ASAP-only baseline used in the ops review' },
  { when: 'Weeks 2–6', action: 'Escalate orders at 35 minutes', how: "Flag and reassign before the order crosses 50 minutes, where refund incidence more than doubles.", owner: 'Regional Ops', metric: 'Share of orders over 50 min, from 6.1% down' },
  { when: 'Quarter 1', action: 'Move the discount budget into peak-hour Dasher pay', how: 'Keep the $11.7K flat. Put it into dinner incentives in the ten slowest markets. Run it as a market-matched test for six weeks so the result can be attributed.', owner: 'Growth + Dasher Ops', metric: 'Repeat rate for new customers, against a 31% target' },
  { when: 'Quarter 1', action: 'Add a food-ready timestamp', how: 'Splits the 12.5 pre-pickup minutes into merchant wait and Dasher wait, so each side can be given its own target.', owner: 'Product + Data Eng', metric: 'Merchant wait and Dasher wait reported separately' },
  { when: 'Quarter 1–2', action: 'Pay for Dasher tenure', how: 'Bonus at the 6th and 21st delivery, where prep time actually drops. Focus on dinner in Bellevue, San Antonio and Dallas.', owner: 'Dasher Ops', metric: 'Share of volume from 6+ order Dashers, 32% to 50%' },
  { when: 'Ongoing', action: 'Ready-time standard for the slowest merchants', how: 'Restaurant is the largest single factor in the pre-pickup wait, at 29.5% of the variation. Start with the four merchants above 20 minutes. Prep estimates before any penalty.', owner: 'Merchant Ops', metric: '5 minutes off prep in the three slowest markets' },
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
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: RED, boxShadow: `0 0 8px ${RED}`, display: 'inline-block' }} />
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: RED }}>
            {label}
          </span>
        </div>
      )}
      {children}
    </div>
  )
}

function PainPoint({ number, stage, title, subtitle, children, rec, exec }) {
  const [ref, visible] = useReveal()
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: 'opacity 0.7s ease, transform 0.7s cubic-bezier(.22,1,.36,1)',
        marginBottom: 80,
        borderLeft: `3px solid ${RED}30`,
        paddingLeft: 32,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: RED, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          Pain Point {number}
        </span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{stage}</span>
      </div>
      <h2 style={{ fontSize: 'clamp(1.4rem,3.5vw,2rem)', fontWeight: 800, color: '#f5f5f5', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
        {title}
      </h2>
      <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', margin: '0 0 32px', lineHeight: 1.6 }}>{subtitle}</p>
      {children}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 28 }}>
        <div style={{ padding: '20px 24px', borderRadius: 12, background: RED_BG, border: `1px solid ${RED_BORDER}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: RED, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>Growth lever</div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, margin: 0 }}>{rec}</p>
        </div>
        <div style={{ padding: '20px 24px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>Recommendation</div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, margin: 0 }}>{exec}</p>
        </div>
      </div>
    </div>
  )
}

function StatRow({ stats }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${stats.length}, 1fr)`, gap: 12, marginBottom: 28 }}>
      {stats.map((s) => (
        <div key={s.l} style={{
          padding: '18px 20px', borderRadius: 10,
          background: RED_BG, border: `1px solid ${RED_BORDER}`,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: RED, marginBottom: 4 }}>{s.v}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>{s.l}</div>
        </div>
      ))}
    </div>
  )
}

function Bars({ title, items, note }) {
  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', padding: '20px 24px', marginBottom: 8 }}>
      {title && <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', margin: '0 0 14px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{title}</p>}
      {items.map((r) => (
        <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <span style={{ width: 130, fontSize: 13, color: 'rgba(255,255,255,0.55)', flexShrink: 0 }}>{r.label}</span>
          <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)' }}>
            <div style={{ width: `${r.pct}%`, height: '100%', borderRadius: 4, background: r.highlight ? RED : 'rgba(255,255,255,0.2)' }} />
          </div>
          <span style={{ width: 56, fontSize: 13, color: r.highlight ? RED : 'rgba(255,255,255,0.35)', fontWeight: 600, textAlign: 'right' }}>{r.display}</span>
        </div>
      ))}
      {note && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', margin: '14px 0 0', fontStyle: 'italic' }}>{note}</p>}
    </div>
  )
}

export default function DoorDashDetail({ onBack }) {
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
          href="/doordash-report.pdf"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '8px 20px', borderRadius: 8, fontSize: 13,
            fontWeight: 600, background: RED, color: '#fff',
            textDecoration: 'none',
            boxShadow: `0 0 16px ${RED}40`,
          }}
        >
          View Full Report
        </a>
      </div>

      {/* Hero */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '120px 64px 80px' }}>
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: RED }}>
            Strategy & Operations Case Study
          </span>
        </div>

        <div style={{ marginBottom: 28 }}>
          <img src="/doordash-trim.png" alt="DoorDash" style={{ height: 36, display: 'block' }} />
        </div>

        <h1 style={{ fontSize: 'clamp(2.2rem,5.6vw,4rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, color: '#f5f5f5', margin: '0 0 24px' }}>
          Every order crosses three parties and four handoffs. The pain points cluster in one stretch of it.
        </h1>

        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, maxWidth: 680, margin: '0 0 40px' }}>
          The customer orders, the merchant prepares, a Dasher collects and delivers. Of the 28.5 minutes a customer waits, 12.5 pass before a Dasher even reaches the store. Mapped across 20,000 orders and 56 markets, with seven prioritized actions and an owner for each.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <a
            href="/doordash-report.pdf"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '13px 28px', borderRadius: 8, fontSize: 14,
              fontWeight: 700, background: RED, color: '#fff',
              textDecoration: 'none',
              boxShadow: `0 0 24px ${RED}50`,
            }}
          >
            View Full Report
          </a>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Tableau', 'SQL', 'Python', 'Three-sided marketplace', '20,000 orders'].map(t => (
              <span key={t} style={{
                fontSize: 11, color: 'rgba(255,255,255,0.4)',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                padding: '5px 10px', borderRadius: 6,
              }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${RED}20, transparent)` }} />

      {/* Content */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '80px 64px 120px' }}>

        {/* The order lifecycle diagram */}
        <Section label="The order lifecycle">
          <TypedHeading text="Three of four pain points sit " suffixText="before pickup." suffixStyle={{ color: RED }} speed={28} cursorColor={RED} style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 16px', color: '#f5f5f5' }} />
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, margin: '0 0 32px', maxWidth: 680 }}>
            The drive itself is the most consistent stage at 16.0 minutes, barely moving across markets or hours. Everything before it is where the variation — and the cost — lives.
          </p>

          <div style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${RED_BORDER}`, marginBottom: 8 }}>
            <svg width="100%" viewBox="0 0 680 340" xmlns="http://www.w3.org/2000/svg" role="img" style={{ display: 'block' }} fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">
              <title>Order lifecycle: customer orders, merchant preps, Dasher arrives, collects, delivers</title>
              <rect width="680" height="340" fill="#0e0f12"/>
              <defs>
                <marker id="arrow-dd" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M2 1L8 5L2 9" fill="none" stroke="#73726c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </marker>
              </defs>

              {/* connecting arrows between stages */}
              <line x1="126" y1="90" x2="146" y2="90" stroke="#73726c" strokeWidth="2" markerEnd="url(#arrow-dd)"/>
              <line x1="262" y1="90" x2="282" y2="90" stroke="#73726c" strokeWidth="2" markerEnd="url(#arrow-dd)"/>
              <line x1="398" y1="90" x2="418" y2="90" stroke="#73726c" strokeWidth="2" markerEnd="url(#arrow-dd)"/>
              <line x1="534" y1="90" x2="554" y2="90" stroke="#73726c" strokeWidth="2" markerEnd="url(#arrow-dd)"/>

              {/* tip dashed arc */}
              <path d="M 68 62 Q 340 10 612 62" fill="none" stroke={RED} strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrow-dd)"/>
              <text x="340" y="24" textAnchor="middle" fontSize="10.5" fill={RED} fontWeight="700">Tip, $3.75 average — tracks order size, not speed</text>

              {/* 5 stage boxes, evenly spaced with visible gaps for arrows */}
              <g><rect x="10" y="62" width="116" height="56" rx="8" fill="#17181c" stroke="#3d3d3a" strokeWidth="0.5"/><text x="68" y="82" textAnchor="middle" dominantBaseline="central" fontSize="11.5" fontWeight="500" fill="#e8e9ec">Customer orders</text><text x="68" y="99" textAnchor="middle" dominantBaseline="central" fontSize="9.5" fill="#9a9da4">20,000 · $35.98 avg</text></g>
              <g><rect x="146" y="62" width="116" height="56" rx="8" fill="#17181c" stroke="#3d3d3a" strokeWidth="0.5"/><text x="204" y="82" textAnchor="middle" dominantBaseline="central" fontSize="11.5" fontWeight="500" fill="#e8e9ec">Merchant preps</text><text x="204" y="99" textAnchor="middle" dominantBaseline="central" fontSize="9.5" fill="#9a9da4">67 merchants</text></g>
              <g><rect x="282" y="62" width="116" height="56" rx="8" fill="#2a1006" stroke={RED} strokeWidth="0.5"/><text x="340" y="82" textAnchor="middle" dominantBaseline="central" fontSize="11.5" fontWeight="500" fill="#ffb199">Dasher arrives</text><text x="340" y="99" textAnchor="middle" dominantBaseline="central" fontSize="9.5" fill="#f0866a">2.2% never do</text></g>
              <g><rect x="418" y="62" width="116" height="56" rx="8" fill="#17181c" stroke="#3d3d3a" strokeWidth="0.5"/><text x="476" y="82" textAnchor="middle" dominantBaseline="central" fontSize="11.5" fontWeight="500" fill="#e8e9ec">Dasher collects</text><text x="476" y="99" textAnchor="middle" dominantBaseline="central" fontSize="9.5" fill="#9a9da4">handoff</text></g>
              <g><rect x="554" y="62" width="116" height="56" rx="8" fill="#17181c" stroke="#3d3d3a" strokeWidth="0.5"/><text x="612" y="82" textAnchor="middle" dominantBaseline="central" fontSize="11.5" fontWeight="500" fill="#e8e9ec">Dasher delivers</text><text x="612" y="99" textAnchor="middle" dominantBaseline="central" fontSize="9.5" fill="#9a9da4">16.0 min</text></g>

              {/* bracket: before pickup */}
              <line x1="10" y1="140" x2="408" y2="140" stroke="#73726c" strokeWidth="1"/>
              <line x1="10" y1="134" x2="10" y2="146" stroke="#73726c" strokeWidth="1"/>
              <line x1="408" y1="134" x2="408" y2="146" stroke="#73726c" strokeWidth="1"/>
              <text x="209" y="158" textAnchor="middle" fontSize="11" fill="#e8e9ec" fontWeight="600">Before pickup, 12.5 min · 44% of the total wait</text>

              {/* bracket: the drive */}
              <line x1="408" y1="140" x2="670" y2="140" stroke="#73726c" strokeWidth="1"/>
              <line x1="670" y1="134" x2="670" y2="146" stroke="#73726c" strokeWidth="1"/>
              <text x="539" y="158" textAnchor="middle" fontSize="11" fill="#e8e9ec" fontWeight="600">The drive, 16.0 min</text>

              {/* bracket: total wait */}
              <line x1="10" y1="186" x2="670" y2="186" stroke={RED} strokeWidth="1.5"/>
              <line x1="10" y1="180" x2="10" y2="192" stroke={RED} strokeWidth="1.5"/>
              <line x1="670" y1="180" x2="670" y2="192" stroke={RED} strokeWidth="1.5"/>
              <text x="340" y="206" textAnchor="middle" fontSize="12" fill={RED} fontWeight="700">Total the customer waits, 28.5 min (ASAP orders)</text>

              {/* 4 pain point callouts */}
              <g>
                <circle cx="68" cy="248" r="9" fill={RED}/><text x="68" y="248" textAnchor="middle" dominantBaseline="central" fontSize="10" fontWeight="700" fill="#0a0a0a">1</text>
                <text x="68" y="270" textAnchor="middle" fontSize="10.5" fill="#e8e9ec" fontWeight="600">76% never</text>
                <text x="68" y="283" textAnchor="middle" fontSize="10.5" fill="#e8e9ec" fontWeight="600">order again</text>
              </g>
              <g>
                <circle cx="204" cy="248" r="9" fill={RED}/><text x="204" y="248" textAnchor="middle" dominantBaseline="central" fontSize="10" fontWeight="700" fill="#0a0a0a">2</text>
                <text x="204" y="270" textAnchor="middle" fontSize="10.5" fill="#e8e9ec" fontWeight="600">Prep swings</text>
                <text x="204" y="283" textAnchor="middle" fontSize="10.5" fill="#e8e9ec" fontWeight="600">10 to 23 min</text>
              </g>
              <g>
                <circle cx="340" cy="248" r="9" fill={RED}/><text x="340" y="248" textAnchor="middle" dominantBaseline="central" fontSize="10" fontWeight="700" fill="#0a0a0a">3</text>
                <text x="340" y="270" textAnchor="middle" fontSize="10.5" fill="#e8e9ec" fontWeight="600">New Dashers</text>
                <text x="340" y="283" textAnchor="middle" fontSize="10.5" fill="#e8e9ec" fontWeight="600">2x slower</text>
              </g>
              <g>
                <circle cx="612" cy="248" r="9" fill={RED}/><text x="612" y="248" textAnchor="middle" dominantBaseline="central" fontSize="10" fontWeight="700" fill="#0a0a0a">4</text>
                <text x="612" y="270" textAnchor="middle" fontSize="10.5" fill="#e8e9ec" fontWeight="600">Refunds double</text>
                <text x="612" y="283" textAnchor="middle" fontSize="10.5" fill="#e8e9ec" fontWeight="600">past 50 min</text>
              </g>
            </svg>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 28 }}>
            <div style={{ padding: '20px 24px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>The pattern</div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, margin: 0 }}>Three of the four pain points sit before the food is picked up. The drive itself is our most consistent stage, barely moving across markets or hours.</p>
            </div>
            <div style={{ padding: '20px 24px', borderRadius: 12, background: RED_BG, border: `1px solid ${RED_BORDER}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: RED, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>Growth levers</div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, margin: 0 }}>Speed on the first order, Dasher tenure, and merchant ready-time — together worth more than the $11.7K currently spent on discounts, which moves repeat rate by just 0.2 points.</p>
            </div>
          </div>
        </Section>

        <PainPoint
          number="01" stage="Customer orders"
          title="Customers who came back were served faster. Discounts made no difference."
          subtitle="76% of customers never come back, and the slow ones leave fastest."
          rec="Move the discount budget into first-order speed. Keep the $11.7K flat and spend it on peak-hour Dasher pay in the ten slowest markets, run as a market-matched test for six weeks."
          exec="Discounts shift repeat rate by only 0.2 points. Closing the gap for the slow-first-order group is worth about 676 more repeat customers in this sample."
        >
          <StatRow stats={[
            { v: '32.9 min', l: 'wait, one-time customers' },
            { v: '28.6 min', l: 'wait, repeat customers' },
            { v: '31.1%', l: 'repeat rate under 20 min' },
            { v: '17.7%', l: 'repeat rate over an hour' },
          ]} />
          <Bars
            title="Refunded amount, one-time/churned vs repeat customers"
            items={[
              { label: 'One-time / churned', pct: 100, display: '2x', highlight: true },
              { label: 'Repeat', pct: 50, display: '1x', highlight: false },
            ]}
            note="Repeat customers were refunded half as often as one-time customers. Bigger discounts did not produce bigger orders — both trend lines were flat."
          />
        </PainPoint>

        <PainPoint
          number="02" stage="Merchant preps"
          title="Across the day and across markets, the drive is steady. Everything before it is not."
          subtitle="Our slowest markets are more than twice our fastest, all of it before pickup."
          rec="Agree a ready-time standard with the slowest merchants. Start with the four merchants above 20 minutes: give them menu-level prep estimates first, then hold to the standard."
          exec="The restaurant explains 29.5% of the variation in pre-pickup time — the largest single factor. Target 5 minutes off in the three slowest markets."
        >
          <Bars
            title="Average fulfillment time by market"
            items={[
              { label: 'Bellevue', pct: 100, display: '41-45 min', highlight: true },
              { label: 'San Antonio', pct: 96, display: '41-45 min', highlight: true },
              { label: 'Dallas', pct: 92, display: '41-45 min', highlight: true },
              { label: 'Lubbock', pct: 46, display: '20-21 min', highlight: false },
              { label: 'Whistler', pct: 44, display: '20-21 min', highlight: false },
            ]}
            note="Transit stays close to flat across all markets — the gap is entirely pre-pickup. Prep swings between 10 and 23 minutes across the day while transit holds between 12 and 18."
          />
        </PainPoint>

        <PainPoint
          number="03" stage="Dasher arrives"
          title="New Dashers take twice as long to reach the store, and almost all of ours are new."
          subtitle="We pay the beginner cost on most orders, and five markets had no Dashers at all."
          rec="Pay for tenure, not sign-ups. Put a bonus at the 6th and 21st delivery, where the gain appears, focused on dinner in Bellevue, San Antonio and Dallas."
          exec="Turn off the five empty markets this week: geofence Memphis, Las Vegas, Greenville, Laurinburg and Honolulu until they can be staffed."
        >
          <StatRow stats={[
            { v: '8,932', l: 'of 9,405 Dashers are brand new' },
            { v: '95%', l: 'do 5 orders or fewer' },
            { v: '68%', l: 'of volume from that 95%' },
            { v: '5', l: 'markets delivered zero orders' },
          ]} />
          <div style={{ padding: '18px 22px', borderRadius: 12, background: RED_BG, border: `1px solid ${RED_BORDER}` }}>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
              An experienced Dasher reaches the store in <span style={{ color: RED, fontWeight: 700 }}>7.3 minutes</span> against <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>15.5</span> for a new one, and finishes the order 10.6 minutes faster. Memphis, Las Vegas, Greenville, Laurinburg and Honolulu took 108 orders between them and delivered none.
            </p>
          </div>
        </PainPoint>

        <PainPoint
          number="04" stage="Dasher delivers"
          title="Past fifty minutes the refunds start, and they climb steeply from there."
          subtitle="A small tail of slow orders carries a large share of the cost."
          rec="Treat fifty minutes as a hard line and intervene at thirty-five. Flag and reassign orders at 35 minutes so fewer reach the point where refunds spike."
          exec="Set the internal target at under 40 minutes, where the curve is still flat, and report the tail rather than the average."
        >
          <StatRow stats={[
            { v: '6.1%', l: 'of orders take longer than 50 min' },
            { v: '15%', l: 'of all refund spend comes from them' },
            { v: '2.8x', l: 'the refund cost per order' },
            { v: '1.3%→3.1%', l: 'refund incidence, before vs after' },
          ]} />
        </PainPoint>

        {/* What to do */}
        <Section label="What to do">
          <TypedHeading text="Seven actions, in the " suffixText="order I'd do them." suffixStyle={{ color: RED }} speed={28} cursorColor={RED} style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 28px', color: '#f5f5f5' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ACTIONS.map((a, i) => (
              <div key={i} style={{ padding: '18px 22px', borderRadius: 12, background: i === 0 ? RED_BG : 'rgba(255,255,255,0.03)', border: i === 0 ? `1px solid ${RED_BORDER}` : '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: i === 0 ? RED : 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', background: i === 0 ? 'rgba(234,58,31,0.15)' : 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: 5 }}>{a.when}</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{a.owner}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#f5f5f5', marginBottom: 6 }}>{a.action}</div>
                <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, margin: '0 0 8px' }}>{a.how}</p>
                <div style={{ fontSize: 12, color: RED, fontWeight: 600 }}>How we know it worked: <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>{a.metric}</span></div>
              </div>
            ))}
          </div>
        </Section>

        {/* CTA */}
        <div style={{
          padding: '48px', borderRadius: 20,
          background: RED_BG, border: `1px solid ${RED_BORDER}`,
          textAlign: 'center',
        }}>
          <div style={{ marginBottom: 16 }}>
            <img src="/doordash-trim.png" alt="DoorDash" style={{ height: 28, display: 'inline-block' }} />
          </div>
          <h2 style={{ fontSize: 'clamp(1.4rem,3.5vw,2rem)', fontWeight: 800, color: '#f5f5f5', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
            Full Strategy & Operations case study
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', margin: '0 0 28px', lineHeight: 1.65 }}>
            Includes all Tableau visualizations, methodology, and the complete seven-action plan with owners and success metrics.
          </p>
          <a
            href="/doordash-report.pdf"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '14px 36px', borderRadius: 10, fontSize: 15,
              fontWeight: 700, background: RED, color: '#fff',
              textDecoration: 'none',
              boxShadow: `0 0 28px ${RED}50`,
            }}
          >
            View Report PDF
          </a>
        </div>

      </div>
    </div>
  )
}
