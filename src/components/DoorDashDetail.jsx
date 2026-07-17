import { useEffect, useRef, useState } from 'react'
import TypedHeading from './TypedHeading'

const RED        = '#ea3a1f'
const RED_BG     = 'rgba(234,58,31,0.07)'
const RED_BORDER = 'rgba(234,58,31,0.2)'

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

function Finding({ number, title, subtitle, children, rec, exec }) {
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
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: RED, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          Finding {number}
        </span>
      </div>
      <h2 style={{ fontSize: 'clamp(1.4rem,3.5vw,2rem)', fontWeight: 800, color: '#f5f5f5', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
        {title}
      </h2>
      <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', margin: '0 0 32px', lineHeight: 1.6 }}>{subtitle}</p>
      {children}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 28 }}>
        <div style={{ padding: '20px 24px', borderRadius: 12, background: RED_BG, border: `1px solid ${RED_BORDER}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: RED, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>Recommendation</div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, margin: 0 }}>{rec}</p>
        </div>
        <div style={{ padding: '20px 24px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>Execution</div>
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

function Chart({ src, alt, caption }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', background: '#fff' }}>
        <img src={src} alt={alt} style={{ width: '100%', display: 'block' }} />
      </div>
      {caption && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', margin: '8px 0 0', fontStyle: 'italic' }}>{caption}</p>}
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
            Strategy & Operations · Data Analysis
          </span>
        </div>

        <div style={{ marginBottom: 28 }}>
          <img src="/doordash-trim.png" alt="DoorDash" style={{ height: 36, display: 'block' }} />
        </div>

        <h1 style={{ fontSize: 'clamp(2.4rem,6vw,4.5rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05, color: '#f5f5f5', margin: '0 0 24px' }}>
          What the September<br />numbers show
        </h1>

        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, maxWidth: 680, margin: '0 0 40px' }}>
          Six findings from 20,000 orders placed in September 2024 — with specific recommendations on where the business is leaking and how to fix it. Built with Python, Tableau, and SQL on a three-sided marketplace dataset.
        </p>

        {/* 4 hero stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 40 }}>
          {[
            { v: '1 day', l: 'took down two whole markets' },
            { v: '2 stores', l: 'losing driver and billing data' },
            { v: '3,240/yr', l: 'orders confirmed, then dropped' },
            { v: '15x', l: 'more orders at night than morning' },
          ].map((s) => (
            <div key={s.l} style={{
              padding: '18px 16px', borderRadius: 10,
              background: RED_BG, border: `1px solid ${RED_BORDER}`,
            }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: RED, marginBottom: 6 }}>{s.v}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>{s.l}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['Python', 'Tableau', 'SQL', 'Three-sided marketplace', 'September 2024'].map(t => (
            <span key={t} style={{
              fontSize: 11, color: 'rgba(255,255,255,0.4)',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              padding: '5px 10px', borderRadius: 6,
            }}>{t}</span>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${RED}20, transparent)` }} />

      {/* Findings */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '80px 64px 120px' }}>

        <Section label="The findings">
          <TypedHeading text="Six things worth fixing." speed={28} cursorColor={RED} style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 8px', color: '#f5f5f5' }} />
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, maxWidth: 640, margin: '0 0 0' }}>
            Each finding covers one side of the marketplace — or a failure that cut across all three. Each comes with a specific recommendation and a path to execute it without heavy engineering lift.
          </p>
        </Section>

        <Finding
          number="01"
          title="Two cities lost every order on September 4"
          subtitle="One system failure took down whole markets, and nobody caught it until the end of the month."
          rec="Have ops and engineering root-cause the September 4 outage, and make sure a region-wide failure is caught the same day, not at month end."
          exec="Add a market heartbeat: an automatic alert that pages on-call the moment a region's completion rate drops below its own baseline."
        >
          <StatRow stats={[
            { v: '122', l: 'orders failed that day' },
            { v: '90', l: 'customers got nothing' },
            { v: '$4.4K', l: 'order value lost in one day' },
            { v: '4', l: 'regions hit at the same time' },
          ]} />
          <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', padding: '20px 24px', marginBottom: 8 }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: '0 0 14px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: 10 }}>Failed orders as share of each region's month</p>
            {[
              { city: 'Las Vegas', pct: 100 },
              { city: 'Memphis', pct: 100 },
              { city: 'Greenville', pct: 95 },
              { city: 'Perth', pct: 66 },
              { city: 'Dallas', pct: 5 },
              { city: 'Scranton', pct: 2 },
              { city: 'San Francisco', pct: 2 },
            ].map((r) => (
              <div key={r.city} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <span style={{ width: 100, fontSize: 13, color: 'rgba(255,255,255,0.55)', flexShrink: 0 }}>{r.city}</span>
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)' }}>
                  <div style={{ width: `${r.pct}%`, height: '100%', borderRadius: 4, background: r.pct > 50 ? RED : 'rgba(255,255,255,0.2)' }} />
                </div>
                <span style={{ width: 38, fontSize: 13, color: r.pct > 50 ? RED : 'rgba(255,255,255,0.35)', fontWeight: 600, textAlign: 'right' }}>{r.pct}%</span>
              </div>
            ))}
          </div>
        </Finding>

        <Finding
          number="02"
          title="Two restaurants are losing order data"
          subtitle="Each has its own repeating problem, separate from the September 4 failure."
          rec="Fix the two stores' data leak, and make partner data problems surface on their own instead of turning up weeks later by accident."
          exec="Check both point-of-sale connections, then add a payment-health flag showing orders where a store's payout is at risk, so they fix it to get paid."
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
            <div style={{ padding: '20px 22px', borderRadius: 12, background: RED_BG, border: `1px solid ${RED_BORDER}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: RED, marginBottom: 10 }}>Store 25675466 — losing driver records</div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[
                  '40.5% of orders (15 of 37) delivered but lost driver and payment records',
                  'Happened on two dates three weeks apart — keeps recurring',
                  '13 customers affected',
                ].map((b, i) => (
                  <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: RED, flexShrink: 0, marginTop: 6 }} />
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ padding: '20px 22px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>Store 135488 — losing the payment</div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[
                  '10.5% of orders (113 of 1,081) delivered but recorded as $0',
                  'Averages $37.56 on other orders — real money going unrecorded',
                  '~$4,244 in revenue never recorded, across 73 customers',
                ].map((b, i) => (
                  <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', flexShrink: 0, marginTop: 6 }} />
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Finding>

        <Finding
          number="03"
          title="A small daily leak that adds up to 3,240 orders a year"
          subtitle="Every day a handful of orders get confirmed by the restaurant and then never go out."
          rec="Watch non-delivery as a weekly number, and cut the scheduled-order failure rate, which runs about 3.8x the ASAP rate."
          exec="Let Dashers reserve scheduled orders ahead for priority, so each has a committed Dasher, and notify the restaurant before pickup."
        >
          <StatRow stats={[
            { v: '270/mo', l: 'confirmed, then never sent' },
            { v: '244', l: 'customers hit this month' },
            { v: '3,240/yr', l: 'if it keeps going' },
            { v: '$3,625', l: 'refunds this month' },
          ]} />
          <Chart src="/dd-never-delivered.png" alt="Orders confirmed but never delivered over September" caption="Steady all month — about 9 a day on average, not a one-time spike." />
          <div style={{ marginTop: 20, padding: '18px 22px', borderRadius: 12, background: RED_BG, border: `1px solid ${RED_BORDER}` }}>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
              Scheduled orders fail at <span style={{ color: RED, fontWeight: 700 }}>4.81%</span> vs ASAP at <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>1.28%</span> — nearly 4x the failure rate. A committed Dasher per scheduled order closes this gap without changing the product experience for ASAP customers.
            </p>
          </div>
        </Finding>

        <Finding
          number="04"
          title="This is a nighttime business"
          subtitle="Orders pile up late at night and nearly disappear in the morning. Plan around it."
          rec="Point driver supply, incentives, and marketing at the night, where the business is."
          exec="A peak earnings signal shows Dashers where pay peaks, 9pm to 2am, so top-up pulls supply there."
        >
          <div style={{ marginBottom: 20, padding: '18px 22px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.7 }}>
              The 9pm–2am block has <span style={{ color: RED, fontWeight: 700 }}>8,943 orders</span> vs 577 from 6–11am — fifteen times more at night. Drivers per customer sits at 0.84 at night and 0.91 in the morning: drivers are waiting in the morning, not in short supply.
            </p>
          </div>
          <Chart src="/dd-heat-customers.png" alt="Customer count heatmap by hour and day of week" caption="Tableau heatmap: size = customers that hour, color = drivers per customer. The demand curve is fat late at night and nearly gone from 7–9am." />
        </Finding>

        <Finding
          number="05"
          title="Morning orders wait longest on the kitchen"
          subtitle="The slow part of a morning delivery is the food getting ready, not the drive."
          rec="Keep driver spend light: morning is low-value and already has enough drivers."
          exec="Set an honest, longer morning ETA. If demand rises, dynamic top-up pay covers the supply automatically."
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
            <div style={{ padding: '18px 20px', borderRadius: 12, background: RED_BG, border: `1px solid ${RED_BORDER}` }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: RED, marginBottom: 4 }}>~15 min</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>morning handoff time (vs 9 min midday)</div>
            </div>
            <div style={{ padding: '18px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>$27 avg</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>morning order value (vs $42 late night)</div>
            </div>
          </div>
          <Chart src="/dd-heat-prep.png" alt="Prep time and revenue heatmap by hour and day" caption="Tableau heatmap: size = median prep time, color = revenue per order. The slowest handoffs land on the least valuable orders." />
        </Finding>

        <Finding
          number="06"
          title="Refunds track kitchen prep time"
          subtitle="Overall refunds are low at 1.37%, but they climb where the food takes longest to hand off."
          rec="Get restaurants to cut morning prep time — faster kitchens mean shorter waits and fewer refunds."
          exec="A customer-facing fast-prep badge plus prep time in ranking makes faster kitchens win orders. No cash needed."
        >
          <StatRow stats={[
            { v: '1.37%', l: 'overall refund rate' },
            { v: '1.75%', l: '6–10am refund rate' },
            { v: '1.32%', l: 'rest of day refund rate' },
            { v: '~0.4', l: 'correlation with prep time' },
          ]} />
          <Chart src="/dd-refund-rate.png" alt="Refund rate and driver count heatmap by hour and day" caption="Tableau heatmap: color = refund rate, size = number of drivers. Refunds move with prep time — the hours with the slowest kitchens carry more refunds." />
        </Finding>

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
            Full 8-page report
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', margin: '0 0 28px', lineHeight: 1.65 }}>
            Includes all Tableau visualizations, methodology, and the complete recommendation set with execution steps for each.
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
