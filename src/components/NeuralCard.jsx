import { useEffect, useRef, useState } from 'react'

// Input → Hidden1 → Hidden2 → Output (left to right)
// Forward pass:  signal travels  LEFT → RIGHT  (prediction at OUTPUT = right)
// Backprop:      gradient travels RIGHT → LEFT  (error propagates back)
const LAYERS = [
  [0.12, [0.18, 0.50, 0.82]],          // Input  (3 nodes)
  [0.37, [0.12, 0.37, 0.63, 0.88]],    // H1     (4 nodes)
  [0.63, [0.25, 0.52, 0.78]],          // H2     (3 nodes)
  [0.88, [0.33, 0.67]],                // Output (2 nodes) ← prediction here
]
const NODE_R = 4.5
const CW = 244, CH = 155

function buildGraph() {
  const nodes = LAYERS.flatMap(([xr, yrs], li) =>
    yrs.map(yr => ({ x: xr * CW, y: yr * CH, layer: li }))
  )
  const edges = []
  for (let li = 0; li < LAYERS.length - 1; li++) {
    const src = nodes.filter(n => n.layer === li)
    const dst = nodes.filter(n => n.layer === li + 1)
    for (const s of src) for (const d of dst) edges.push({ from: s, to: d })
  }
  return { nodes, edges }
}
const { nodes: NODES, edges: EDGES } = buildGraph()

// ─── Canvas ────────────────────────────────────────────────────────────────
function NetCanvas({ animPhase }) {
  const canvasRef  = useRef(null)
  const pulsesRef  = useRef([])
  const nodeGlow   = useRef(NODES.map(() => 0))
  const edgeGlow   = useRef(EDGES.map(() => 0))
  const rafRef     = useRef(null)
  const lastRef    = useRef(null)
  const spawnTimer = useRef(0)
  const phaseRef   = useRef(animPhase)
  const inViewRef  = useRef(true)

  useEffect(() => { phaseRef.current = animPhase }, [animPhase])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    canvas.width  = CW * window.devicePixelRatio
    canvas.height = CH * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Pause RAF when card scrolled off screen
    const io = new IntersectionObserver(
      ([e]) => {
        const wasIn = inViewRef.current
        inViewRef.current = e.isIntersecting
        if (!wasIn && e.isIntersecting) {
          lastRef.current = null
          rafRef.current = requestAnimationFrame(draw)
        }
      },
      { threshold: 0 }
    )
    io.observe(canvas)

    const SPEED = 1.6   // uniform — no random

    const spawnForward = () => {
      const pool = EDGES.filter(e => e.from.layer === 0)
      const e    = pool[Math.floor(Math.random() * pool.length)]
      pulsesRef.current.push({ edge: e, t: 0, speed: SPEED, dir: 1 })
    }

    const spawnBackward = () => {
      const pool = EDGES.filter(e => e.to.layer === LAYERS.length - 1)
      const e    = pool[Math.floor(Math.random() * pool.length)]
      pulsesRef.current.push({ edge: e, t: 1, speed: SPEED, dir: -1 })
    }

    const draw = (ts) => {
      if (!inViewRef.current) { rafRef.current = null; return }
      if (!lastRef.current) lastRef.current = ts
      const dt = Math.min(ts - lastRef.current, 40) / 1000
      lastRef.current = ts
      ctx.clearRect(0, 0, CW, CH)

      const ph = phaseRef.current
      if (ph === 'forward' || ph === 'backward') {
        spawnTimer.current += dt
        if (spawnTimer.current > 0.22) {
          spawnTimer.current = 0
          ph === 'forward' ? spawnForward() : spawnBackward()
        }
      }

      // decay
      nodeGlow.current = nodeGlow.current.map(g => Math.max(0, g - dt * 1.8))
      edgeGlow.current = edgeGlow.current.map(g => Math.max(0, g - dt * 1.2))

      // advance pulses
      const alive = []
      for (const p of pulsesRef.current) {
        p.t += p.dir * dt * p.speed
        const arrived = p.dir === 1 ? p.t >= 1 : p.t <= 0

        if (arrived) {
          const target = p.dir === 1 ? p.edge.to : p.edge.from
          const ni = NODES.indexOf(target)
          if (ni >= 0) nodeGlow.current[ni] = 1
          const ei = EDGES.indexOf(p.edge)
          if (ei >= 0) edgeGlow.current[ei] = 1

          // cascade to next layer
          const nextL = target.layer + p.dir
          if (nextL >= 0 && nextL < LAYERS.length) {
            const nextEdges = p.dir === 1
              ? EDGES.filter(e => e.from === target)
              : EDGES.filter(e => e.to   === target)
            for (const ne of nextEdges)
              if (Math.random() < 0.65)
                alive.push({ edge: ne, t: p.dir === 1 ? 0 : 1, speed: SPEED, dir: p.dir })
          }
        } else {
          alive.push(p)
        }
      }
      pulsesRef.current = alive.slice(-48)

      const isBack = ph === 'backward'

      // ── edges ──
      EDGES.forEach((e, ei) => {
        const eg = edgeGlow.current[ei]
        ctx.beginPath(); ctx.moveTo(e.from.x, e.from.y); ctx.lineTo(e.to.x, e.to.y)
        ctx.strokeStyle = isBack
          ? `rgba(251,100,60,${0.26 + eg * 0.38})`
          : `rgba(250,204,21,${0.20 + eg * 0.35})`
        ctx.lineWidth = 0.9 + eg * 0.6
        ctx.stroke()
        if (eg > 0.08) {
          ctx.beginPath(); ctx.moveTo(e.from.x, e.from.y); ctx.lineTo(e.to.x, e.to.y)
          ctx.strokeStyle = isBack
            ? `rgba(251,100,60,${eg * 0.16})`
            : `rgba(250,204,21,${eg * 0.16})`
          ctx.lineWidth = 5 + eg * 3
          ctx.stroke()
        }
      })

      // ── pulse trails ──
      for (const p of pulsesRef.current) {
        const t     = Math.max(0, Math.min(1, p.t))
        const tTail = Math.max(0, Math.min(1, p.dir === 1 ? t - 0.2 : t + 0.2))
        const hx = p.edge.from.x + (p.edge.to.x - p.edge.from.x) * t
        const hy = p.edge.from.y + (p.edge.to.y - p.edge.from.y) * t
        const tx = p.edge.from.x + (p.edge.to.x - p.edge.from.x) * tTail
        const ty = p.edge.from.y + (p.edge.to.y - p.edge.from.y) * tTail

        const pg = ctx.createLinearGradient(tx, ty, hx, hy)
        if (p.dir === -1) {
          pg.addColorStop(0, 'rgba(220,50,30,0)')
          pg.addColorStop(1, 'rgba(255,120,60,1)')
        } else {
          pg.addColorStop(0, 'rgba(250,204,21,0)')
          pg.addColorStop(1, 'rgba(255,245,140,1)')
        }
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy)
        ctx.strokeStyle = pg; ctx.lineWidth = 1.8; ctx.stroke()

        const c = p.dir === -1 ? '255,110,50' : '255,240,100'
        const hg = ctx.createRadialGradient(hx, hy, 0, hx, hy, 5.5)
        hg.addColorStop(0, `rgba(${c},0.95)`)
        hg.addColorStop(1, `rgba(${c},0)`)
        ctx.beginPath(); ctx.arc(hx, hy, 5.5, 0, Math.PI * 2)
        ctx.fillStyle = hg; ctx.fill()
      }

      // ── nodes ──
      NODES.forEach((n, i) => {
        const g        = nodeGlow.current[i]
        const isOutput = n.layer === LAYERS.length - 1
        const isInput  = n.layer === 0

        if (g > 0.05) {
          const og = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, NODE_R * 3.8)
          og.addColorStop(0, `rgba(${isBack ? '255,110,50' : '250,204,21'},${g * 0.42})`)
          og.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.beginPath(); ctx.arc(n.x, n.y, NODE_R * 3.8, 0, Math.PI * 2)
          ctx.fillStyle = og; ctx.fill()
        }

        const al = (isOutput || isInput ? 0.55 : 0.35) + g * 0.5
        const ng = ctx.createRadialGradient(n.x - 1, n.y - 1.5, 0, n.x, n.y, NODE_R)
        ng.addColorStop(0, `rgba(255,248,160,${al})`)
        ng.addColorStop(1, `rgba(251,146,60,${al * 0.5})`)
        ctx.beginPath(); ctx.arc(n.x, n.y, NODE_R, 0, Math.PI * 2)
        ctx.fillStyle = ng; ctx.fill()

        ctx.beginPath(); ctx.arc(n.x, n.y, NODE_R, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(250,204,21,${0.28 + g * 0.55})`
        ctx.lineWidth = 1; ctx.stroke()
      })

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => {
      io.disconnect()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return <canvas ref={canvasRef} style={{ width: CW, height: CH, display: 'block' }} />
}

// ─── Typewriter line ───────────────────────────────────────────────────────
function TypeLine({ text, active, done }) {
  const [chars, setChars] = useState('')
  useEffect(() => {
    if (!active) return
    setChars('')
    let i = 0
    const id = setInterval(() => { i++; setChars(text.slice(0, i)); if (i >= text.length) clearInterval(id) }, CHAR_MS)
    return () => clearInterval(id)
  }, [active, text])

  const fullyTyped = chars.length >= text.length
  const live = active && fullyTyped   // typed but waiting for animation to finish

  if (!active && !done) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, animation: active ? 'ncUp 0.2s ease' : 'none' }}>
      <span style={{
        width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
        background: done ? '#facc15' : '#fb923c',
        transition: 'background 0.4s',
        animation: live ? 'ncLiveDot 1s ease-in-out infinite' : 'none',
        boxShadow: done ? '0 0 5px #facc15' : '0 0 5px #fb923c',
      }} />
      {live ? (
        <span style={{
          fontFamily: 'monospace', fontSize: 13.5, letterSpacing: '0.03em',
          background: 'linear-gradient(90deg, rgba(255,255,255,0.65) 0%, #fb923c 40%, #facc15 55%, rgba(255,255,255,0.65) 100%)',
          backgroundSize: '250% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'ncShimmer 1.6s linear infinite',
        }}>
          {chars}
        </span>
      ) : (
        <span style={{ fontFamily: 'monospace', fontSize: 13.5, letterSpacing: '0.03em', color: done ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.82)' }}>
          {chars}
          {active && !fullyTyped && <span style={{ animation: 'ncBlink .6s step-end infinite', color: '#fb923c' }}>▌</span>}
        </span>
      )}
    </div>
  )
}

// ─── Sequence timing ───────────────────────────────────────────────────────
// Each phase gates on the previous completing:
// P0 types → fwd pass → P1 types → bwd pass → convergence + P2 types → button
const CHAR_MS    = 22                          // ms per character (matches setInterval)
const P0_CHARS   = 'Visitor detected...'.length   // 19
const P1_CHARS   = 'Running analysis...'.length   // 19
const P2_CHARS   = 'Interest in AI detected.'.length // 24

const P0_DELAY   = 300
const FWD_START  = P0_DELAY  + P0_CHARS * CHAR_MS + 180   // after P0 finishes typing
const FWD_DUR    = 900                                     // fast forward pass
const P1_DELAY   = FWD_START + FWD_DUR                    // P1 starts after fwd pass ends
const BWD_START  = P1_DELAY  + P1_CHARS * CHAR_MS + 180   // backprop starts after P1 finishes
const BWD_DUR    = 2000                                    // longer backprop
const CONV_START = BWD_START + BWD_DUR                     // convergence = backprop done
const P2_DELAY   = CONV_START + 350                        // Interest appears AFTER animation fully ends
const BTN_DELAY  = P2_DELAY  + P2_CHARS * CHAR_MS + 500   // button after P2 finishes

export default function NeuralCard({ active = false, onNavigate, onReplay }) {
  const [visible,   setVisible]   = useState(false)
  const [animPhase, setAnimPhase] = useState('idle')
  const [step,      setStep]      = useState(-1)
  const [showBtn,   setShowBtn]   = useState(false)

  useEffect(() => {
    if (!active) return
    const t0 = setTimeout(() => setVisible(true), 80)
    const t1 = setTimeout(() => setStep(0),                   P0_DELAY)
    const t2 = setTimeout(() => setAnimPhase('forward'),      FWD_START)
    const t3 = setTimeout(() => setStep(1),                   P1_DELAY)
    const t4 = setTimeout(() => setAnimPhase('backward'),     BWD_START)
    const t5 = setTimeout(() => setStep(2),                   P2_DELAY)
    const t6 = setTimeout(() => setAnimPhase('converged'),    CONV_START)
    const t7 = setTimeout(() => setShowBtn(true),             BTN_DELAY)
    return () => [t0,t1,t2,t3,t4,t5,t6,t7].forEach(clearTimeout)
  }, [active])

  const label = animPhase === 'forward' ? 'Forward Pass'
              : animPhase === 'backward' ? 'Backpropagation'
              : animPhase === 'converged' ? 'Converged'
              : 'Initialising'

  return (
    <>
      <style>{`
        @keyframes ncBlink  { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes ncUp     { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ncPop    { from{opacity:0;transform:translateY(6px) scale(0.96)} to{opacity:1;transform:none} }
        @keyframes ncDot    { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.15)} }
        @keyframes ncLiveDot { 0%,100%{box-shadow:0 0 4px #fb923c;opacity:.7;transform:scale(1)} 50%{box-shadow:0 0 12px #fb923c,0 0 24px rgba(251,146,60,0.5);opacity:1;transform:scale(1.3)} }
        @keyframes ncShimmer { 0%{background-position:-250% center} 100%{background-position:250% center} }
        @keyframes btnSwipe      { 0%{transform:translateX(-130%)} 100%{transform:translateX(130%)} }
        @keyframes btnTextShimmer{ 0%{background-position:-300% center} 100%{background-position:300% center} }
        @keyframes ncPhaseFlash {
          0%   { color:#fff; letter-spacing:0.22em; text-shadow:0 0 14px rgba(255,255,255,0.9),0 0 28px rgba(251,146,60,0.7); }
          45%  { color:rgba(255,255,255,0.7); letter-spacing:0.16em; text-shadow:0 0 6px rgba(251,146,60,0.3); }
          100% { color:rgba(255,255,255,0.32); letter-spacing:0.14em; text-shadow:none; }
        }
        @keyframes ncHeaderPulse {
          0%   { background:rgba(251,146,60,0.14); box-shadow:inset 0 0 0 1px rgba(251,146,60,0.3); }
          100% { background:transparent; box-shadow:inset 0 0 0 1px transparent; }
        }
        @keyframes ncDotPop {
          0%   { transform:scale(2.2); box-shadow:0 0 0 4px rgba(251,146,60,0.3),0 0 16px rgba(251,146,60,0.8); }
          60%  { transform:scale(1.3); box-shadow:0 0 8px rgba(251,146,60,0.5); }
          100% { transform:scale(1);   box-shadow:0 0 8px rgba(251,146,60,0.4); }
        }
        @keyframes ncFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @property --nba { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
        @keyframes nc-spin { to { --nba: 360deg; } }
        .nc-border { animation: nc-spin 4s linear infinite; }
      `}</style>

      <div style={{ animation: visible ? 'ncFloat 4s ease-in-out infinite' : 'none' }}>
      <div
        className="nc-border"
        style={{
          borderRadius: 17,
          padding: 0.2,
          background: 'conic-gradient(from var(--nba), #facc15 0%, #fb923c 20%, #ef4444 40%, #a855f7 55%, #60a5fa 75%, #4ade80 90%, #facc15 100%)',
          width: 260,
        }}
      >
      <div style={{
        borderRadius: 16,
        background: '#0a0a0c',
        border: 'none',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'blur(12px)',
        overflow: 'hidden',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.6s ease, transform 0.7s cubic-bezier(.22,1,.36,1)',
        boxShadow: '0 0 0 1px rgba(251,169,40,0.06), 0 8px 32px rgba(0,0,0,0.3), 0 0 40px rgba(251,169,40,0.04)',
      }}>

        {/* header */}
        <div
          key={animPhase}
          style={{
            padding: '11px 14px 9px',
            borderBottom: '1px solid rgba(251,169,40,0.07)',
            display: 'flex', alignItems: 'center', gap: 8,
            animation: animPhase !== 'idle' ? 'ncHeaderPulse 1.4s ease-out forwards' : 'none',
          }}
        >
          <span
            key={animPhase + '-dot'}
            style={{
              width: 6, height: 6, borderRadius: '50%',
              background: animPhase === 'converged' ? '#facc15' : '#fb923c',
              display: 'inline-block',
              animation: animPhase !== 'idle'
                ? 'ncDotPop 0.7s cubic-bezier(.22,1,.36,1) forwards'
                : 'ncDot 2s ease-in-out infinite',
              transition: 'background 0.4s',
            }}
          />
          <span
            key={animPhase + '-label'}
            style={{
              fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
              animation: animPhase !== 'idle' ? 'ncPhaseFlash 1.6s ease-out forwards' : 'none',
              color: 'rgba(255,255,255,0.32)',
            }}
          >
            {label}
          </span>
          <span style={{
            marginLeft: 'auto', fontFamily: 'monospace', fontSize: 8, letterSpacing: '0.1em',
            color: animPhase === 'converged' ? 'rgba(250,204,21,0.6)' : 'rgba(251,146,60,0.6)',
            transition: 'color 0.4s',
          }}>
            {animPhase === 'converged' ? 'DONE' : animPhase === 'idle' ? 'IDLE' : 'LIVE'}
          </span>
        </div>

        {/* network — layer labels above */}
        <div style={{ padding: '8px 11px 5px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, padding: '0 2px' }}>
            {['Input', 'H1', 'H2', 'Output'].map(l => (
              <span key={l} style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.05em' }}>{l}</span>
            ))}
          </div>
          <NetCanvas animPhase={animPhase} />
        </div>

        {/* divider */}
        <div style={{ height: 1, background: 'rgba(251,169,40,0.07)', margin: '0 12px' }} />

        {/* phrases */}
        <div style={{ padding: '11px 14px 10px', display: 'flex', flexDirection: 'column', gap: 9, minHeight: 76 }}>
          {['Visitor detected...', 'Running analysis...', 'Interest in AI detected.'].map((p, i) => (
            <TypeLine key={i} text={p} active={step === i} done={step > i} />
          ))}
        </div>

        {/* button — only after converged */}
        {showBtn && (
          <div style={{ padding: '0 13px 13px', display: 'flex', flexDirection: 'column', gap: 7 }}>
            <button
              onClick={() => { const el = document.querySelector('#projects'); if (el) el.scrollIntoView({ behavior: 'smooth' }) }}
              style={{
                width: '100%', padding: '10px 0', borderRadius: 8, cursor: 'pointer',
                fontSize: 12, fontWeight: 700, letterSpacing: '0.03em',
                background: '#facc15',
                color: '#0a0a0a',
                border: 'none',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                animation: 'ncPop 0.5s cubic-bezier(.22,1,.36,1) forwards',
                transition: 'background 0.2s, box-shadow 0.2s, transform 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#fde047'
                e.currentTarget.style.boxShadow = '0 0 18px rgba(250,204,21,0.4)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#facc15'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {/* slow wide red swipe */}
              <span style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(105deg, transparent 15%, rgba(180,10,10,0.18) 35%, rgba(230,40,20,0.65) 50%, rgba(255,140,80,0.4) 60%, rgba(180,10,10,0.18) 72%, transparent 88%)',
                animation: 'btnSwipe 2s cubic-bezier(.25,.46,.45,.94) 0.3s forwards',
                pointerEvents: 'none',
              }} />
              {/* one-time text shimmer matching "Interest" style */}
              <span style={{
                background: 'linear-gradient(90deg, #0a0a0a 0%, #5a0000 28%, #cc1500 42%, #ff5533 50%, #cc1500 58%, #5a0000 72%, #0a0a0a 100%)',
                backgroundSize: '300% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'btnTextShimmer 2s ease-in-out 0.4s forwards',
                backgroundPosition: '-300% center',
                fontWeight: 700,
              }}>
                View Rohan&apos;s AI Showcase
              </span>
              <span style={{ color: '#0a0a0a', fontSize: 13, opacity: 0.6 }}>→</span>
            </button>
            {onReplay && (
              <button
                onClick={onReplay}
                style={{
                  width: '100%', padding: '7px 0', borderRadius: 8, cursor: 'pointer',
                  fontSize: 11, fontWeight: 600, letterSpacing: '0.02em',
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.3)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  transition: 'border-color 0.2s, color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(250,204,21,0.25)'; e.currentTarget.style.color = 'rgba(250,204,21,0.7)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
                </svg>
                Replay
              </button>
            )}
          </div>
        )}
      </div>
      </div>
      </div>
    </>
  )
}
