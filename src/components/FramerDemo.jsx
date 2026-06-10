import { useRef, useState } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  AnimatePresence,
  stagger,
  useAnimate,
} from 'framer-motion'

const YELLOW = '#facc15'
const ORANGE = '#fb923c'
const BLUE   = '#60a5fa'
const GREEN  = '#4ade80'
const PURPLE = '#a78bfa'

// ── 1. Magnetic button ────────────────────────────────────────────────────────
function MagneticButton({ children, color = YELLOW }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 300, damping: 20 })
  const sy = useSpring(y, { stiffness: 300, damping: 20 })

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - r.left - r.width / 2) * 0.35)
    y.set((e.clientY - r.top - r.height / 2) * 0.35)
  }
  const onLeave = () => { x.set(0); y.set(0) }

  return (
    <motion.button
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        x: sx, y: sy,
        padding: '12px 28px', borderRadius: 10,
        background: color, color: '#0a0a0a',
        fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer',
        boxShadow: `0 0 20px ${color}50`,
      }}
      whileHover={{ scale: 1.08, boxShadow: `0 0 36px ${color}80` }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {children}
    </motion.button>
  )
}

// ── 2. Stagger reveal list ────────────────────────────────────────────────────
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
}
const item = {
  hidden: { opacity: 0, x: -20 },
  show:   { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
}

function StaggerList() {
  const [show, setShow] = useState(false)
  const skills = ['Agentic AI', 'Product Strategy', 'Data Pipelines', 'LLM Systems', 'Power BI']

  return (
    <div>
      <motion.button
        onClick={() => setShow(s => !s)}
        style={{
          marginBottom: 16, padding: '8px 18px', borderRadius: 8,
          background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
          color: '#f5f5f5', fontWeight: 600, fontSize: 13, cursor: 'pointer',
        }}
        whileHover={{ background: 'rgba(255,255,255,0.12)' }}
        whileTap={{ scale: 0.97 }}
      >
        {show ? 'Hide' : 'Reveal'} skills
      </motion.button>

      <AnimatePresence>
        {show && (
          <motion.ul
            variants={container}
            initial="hidden"
            animate="show"
            exit="hidden"
            style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            {skills.map((s, i) => (
              <motion.li
                key={s}
                variants={item}
                style={{
                  padding: '10px 16px', borderRadius: 9,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  fontSize: 14, color: '#f5f5f5', fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: [YELLOW,ORANGE,BLUE,GREEN,PURPLE][i], flexShrink: 0 }} />
                {s}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── 3. Scroll-linked progress bar ─────────────────────────────────────────────
function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  return (
    <motion.div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 999,
        background: YELLOW, transformOrigin: '0%', scaleX,
        boxShadow: `0 0 10px ${YELLOW}`,
      }}
    />
  )
}

// ── 4. Shared layout card flip ────────────────────────────────────────────────
function LayoutCards() {
  const [selected, setSelected] = useState(null)
  const cards = [
    { id: 'a', label: 'McKinsey', color: BLUE,   detail: 'Product Analyst Intern · Built Snowflake KPI pipelines and Power BI dashboards for 50+ features.' },
    { id: 'b', label: 'Avo',      color: GREEN,  detail: 'Senior Product Engineer · Drove 100% client expansion, introduced a patented feature, reduced churn 50%.' },
    { id: 'c', label: 'Nourish',  color: PURPLE, detail: 'Personal Project · Multi-agent AI nutritionist with live wearable sync and proactive check-ins.' },
  ]

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <AnimatePresence>
        {selected ? (
          <motion.div
            key="expanded"
            layoutId={selected.id}
            onClick={() => setSelected(null)}
            style={{
              width: '100%', padding: '20px 24px', borderRadius: 14,
              background: `${selected.color}12`,
              border: `1px solid ${selected.color}40`,
              cursor: 'pointer',
            }}
            initial={{ borderRadius: 14 }}
            animate={{ borderRadius: 14 }}
          >
            <motion.div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: selected.color, marginBottom: 8 }}>
              {selected.label}
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}
            >
              {selected.detail}
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{ marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}
            >
              Click to collapse
            </motion.div>
          </motion.div>
        ) : (
          cards.map(c => (
            <motion.div
              key={c.id}
              layoutId={c.id}
              onClick={() => setSelected(c)}
              style={{
                flex: 1, minWidth: 100, padding: '14px 18px', borderRadius: 14,
                background: `${c.color}08`, border: `1px solid ${c.color}30`,
                cursor: 'pointer', fontSize: 13, fontWeight: 700, color: c.color,
              }}
              whileHover={{ scale: 1.04, background: `${c.color}14` }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {c.label}
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  )
}

// ── 5. Scroll-linked parallax text ───────────────────────────────────────────
function ParallaxText() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [40, -40])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

  return (
    <div ref={ref} style={{ overflow: 'hidden', padding: '8px 0' }}>
      <motion.div style={{ y, opacity }}>
        <div style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 800, color: '#f5f5f5', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          Scroll-linked
        </div>
        <div style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          <span style={{ color: YELLOW }}>parallax</span> heading
        </div>
        <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', marginTop: 10, lineHeight: 1.65, maxWidth: 440 }}>
          Moves at a different speed than the page as you scroll. Heading, background, and foreground elements can all move independently.
        </div>
      </motion.div>
    </div>
  )
}

// ── Demo page ─────────────────────────────────────────────────────────────────
function DemoBlock({ title, description, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ type: 'spring', stiffness: 180, damping: 22 }}
      style={{
        padding: '32px', borderRadius: 18,
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        marginBottom: 20,
      }}
    >
      <div style={{ marginBottom: 6, fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: YELLOW }}>{title}</div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', marginBottom: 24, lineHeight: 1.6 }}>{description}</div>
      {children}
    </motion.div>
  )
}

export default function FramerDemo({ onBack }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#f5f5f5', fontFamily: 'system-ui, sans-serif' }}>
      <ScrollProgress />

      {/* Nav */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <motion.button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, padding: '7px 14px', cursor: 'pointer',
            color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 500,
          }}
          whileHover={{ background: 'rgba(255,255,255,0.09)', color: '#f5f5f5' }}
          whileTap={{ scale: 0.96 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
          Back
        </motion.button>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.55)' }}>Framer Motion — what it unlocks</span>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '60px 32px 120px' }}>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 160, damping: 22, delay: 0.1 }}
          style={{ marginBottom: 56 }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: YELLOW, marginBottom: 14 }}>
            Framer Motion demo
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem,5vw,3.4rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, margin: '0 0 16px' }}>
            5 things CSS<br />can't do cleanly
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.42)', lineHeight: 1.7, margin: 0 }}>
            Scroll down to see each effect. All of these are live in the portfolio if we wire them in.
          </p>
        </motion.div>

        <DemoBlock
          title="01 — Magnetic buttons"
          description="Button physically follows your cursor. Spring physics on release. This is what makes interactions feel premium."
        >
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <MagneticButton color={YELLOW}>Hire me</MagneticButton>
            <MagneticButton color={BLUE}>View work</MagneticButton>
            <MagneticButton color={GREEN}>Download CV</MagneticButton>
          </div>
        </DemoBlock>

        <DemoBlock
          title="02 — Staggered reveals with AnimatePresence"
          description="Elements enter one after another with spring easing. Exit animations too — elements animate out, not just disappear."
        >
          <StaggerList />
        </DemoBlock>

        <DemoBlock
          title="03 — Shared layout transitions"
          description="Click a card. The element smoothly morphs position and size between states. No manual FLIP math."
        >
          <LayoutCards />
        </DemoBlock>

        <DemoBlock
          title="04 — Scroll-linked parallax"
          description="Elements move at different speeds as you scroll. Opacity, scale, blur, color — all tied to scroll position."
        >
          <ParallaxText />
        </DemoBlock>

        <DemoBlock
          title="05 — This page itself"
          description="Every block on this page uses whileInView — it fades + slides up when it enters the viewport. Replaces all your IntersectionObserver + useState boilerplate."
        >
          <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
            Currently your portfolio uses ~40 lines of IntersectionObserver + useState per component to do scroll reveals. With Framer Motion that becomes:
          </div>
          <div style={{
            marginTop: 14, padding: '14px 18px', borderRadius: 10,
            background: 'rgba(250,204,21,0.05)', border: '1px solid rgba(250,204,21,0.15)',
            fontFamily: 'monospace', fontSize: 12.5, color: YELLOW, lineHeight: 1.7,
          }}>
            {'<motion.div'}<br />
            {'  initial={{ opacity: 0, y: 24 }}'}<br />
            {'  whileInView={{ opacity: 1, y: 0 }}'}<br />
            {'  viewport={{ once: true }}'}<br />
            {'>'}<br />
            {'  ...your content'}<br />
            {'</motion.div>'}
          </div>
        </DemoBlock>

      </div>
    </div>
  )
}
