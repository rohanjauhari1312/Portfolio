import { useState, useEffect, useRef, useMemo } from 'react'
import TypedHeading from './TypedHeading'
import useIsMobile from '../hooks/useIsMobile'
import { trackSection, trackClick } from '../hooks/useAnalytics'

const CATEGORIES = [
  {
    id: 'product', name: 'Product', color: '#facc15', bg: 'rgba(250,204,21,0.09)',
    skills: [
      'Product Strategy', 'Roadmapping', 'OKRs', 'GTM Strategy',
      'Agile / Scrum', 'Stakeholder Mgmt', 'Feature Prioritization',
      'Competitive Analysis', 'Sprint Planning', 'KPI Definition',
    ],
  },
  {
    id: 'ai', name: 'AI / LLMs', color: '#fb923c', bg: 'rgba(251,146,60,0.09)',
    skills: [
      'Agentic AI', 'LLM Pipelines', 'Multi-agent Systems', 'Prompt Engineering',
      'RAG', 'Workflow Automation', 'AI Product Design', 'Fine-tuning',
      'LangChain', 'AI Agents',
    ],
  },
  {
    id: 'data', name: 'Data', color: '#60a5fa', bg: 'rgba(96,165,250,0.09)',
    skills: [
      'SQL', 'Snowflake', 'Power BI', 'Heap Analytics',
      'Data Pipelines', 'A/B Testing', 'ETL', 'Mixpanel',
      'Google Analytics', 'BI Dashboards',
    ],
  },
  {
    id: 'ux', name: 'UX / Research', color: '#4ade80', bg: 'rgba(74,222,128,0.09)',
    skills: [
      'UX Research', 'User Interviews', 'Figma', 'Wireframing',
      'Usability Testing', 'Journey Mapping', 'Prototyping', 'Personas',
      'Heuristic Analysis', 'Design Thinking',
    ],
  },
  {
    id: 'eng', name: 'Engineering', color: '#f472b6', bg: 'rgba(244,114,182,0.09)',
    skills: [
      'MERN Stack', 'React', 'Node.js', 'REST APIs',
      'Python', 'Jira', 'Git', 'TypeScript',
      'MongoDB', 'Postman',
    ],
  },
]

const ALL_SKILLS = CATEGORIES.flatMap((cat, ci) =>
  cat.skills.map((s, si) => ({
    id: `${cat.id}-${si}`, label: s,
    color: cat.color, bg: cat.bg, catIndex: ci, skillIndex: si,
  }))
)

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const NUM_ROWS   = 12
const ROW_SPEEDS = [72, 95, 64, 88, 78, 100, 68, 92, 82, 70, 96, 75]
const CHIP_W     = 148
const CHIP_VGAP  = 3
const COL_GAP    = 14
const CAT_STAGGER_MS = 110

// Slower, softer flight
const FLIGHT_MS  = 1700
const STAGGER_MS = 70
const FLIGHT_EASE = 'cubic-bezier(.25, 1, .5, 1)'

const ETL_STAGES = [
  { key: 'extract',   label: 'Extract',   sub: 'Scanning raw skill data',   ms: 1600 },
  { key: 'transform', label: 'Transform', sub: 'Skills moving to domains',  ms: 2500 },
  { key: 'load',      label: 'Load',      sub: 'Populating data warehouse', ms: 900  },
  { key: 'analyze',   label: 'Analyze',   sub: 'Intelligence ready',        ms: 700  },
]
const ETL_TOTAL_MS = ETL_STAGES.reduce((a, b) => a + b.ms, 0)

export default function Skills() {
  const rowData = useMemo(() =>
    Array.from({ length: NUM_ROWS }, () => { const s = shuffle(ALL_SKILLS); return [...s, ...s] }),
  [])

  const [phase, setPhase]               = useState('grid')
  const [etlStage, setEtlStage]         = useState(-1)
  const [highlighted, setHighlighted]   = useState(new Set())

  const [overlayHidden, setOverlayHidden] = useState(false)
  const [showRows, setShowRows]           = useState(true)

  const [showHist, setShowHist]         = useState(false)
  const [histAbsolute, setHistAbsolute] = useState(true)
  const [visibleChips, setVisibleChips] = useState(new Set())
  const [done, setDone]                 = useState(false)

  const [flyChips, setFlyChips]         = useState([])
  const [flyDone, setFlyDone]           = useState(false)

  // Per-category load indicator (Load phase)
  const [loadedCats, setLoadedCats]     = useState(new Set())
  const [visibleCats, setVisibleCats]   = useState(new Set())

  const [entered, setEntered]           = useState(false)
  const [showRaw, setShowRaw]           = useState(false)
  const [showSub, setShowSub]           = useState(false)
  const [showBtn, setShowBtn]           = useState(false)
  const [lockedHeight, setLockedHeight] = useState(null)
  const [replayCount, setReplayCount]   = useState(0)

  const sectionRef  = useRef(null)
  const etlBarRef   = useRef(null)
  const timers      = useRef([])
  const isMobile    = useIsMobile()

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setEntered(true); obs.disconnect() } },
      { threshold: 0.04 }
    )
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (entered) trackSection('skills')
  }, [entered])

  useEffect(() => {
    if (!entered) return
    const t0 = setTimeout(() => setShowRaw(true), 400)
    const t1 = setTimeout(() => setShowSub(true), 900)
    const t2 = setTimeout(() => setShowBtn(true), 1300)
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2) }
  }, [entered])

  const add = (fn, ms) => { timers.current.push(setTimeout(fn, ms)) }

  const startFly = () => {
    const section = sectionRef.current
    if (!section) return

    requestAnimationFrame(() => requestAnimationFrame(() => {
      // Measure histogram targets first (they're stable now that histogram is in DOM)
      const tgtMap = {}
      ALL_SKILLS.forEach(skill => {
        const tgtEl = section.querySelector(`[data-hid="${skill.id}"]`)
        if (tgtEl) {
          const r = tgtEl.getBoundingClientRect()
          tgtMap[skill.id] = { x: r.left, y: r.top }
        }
      })

      // Then snapshot source positions IMMEDIATELY before state swap — no stale frames.
      const chips = []
      ALL_SKILLS.forEach(skill => {
        const tgt = tgtMap[skill.id]
        if (!tgt) return
        const els = section.querySelectorAll(`[data-sid="${skill.id}"]`)
        let best = null, bestDist = Infinity
        els.forEach(el => {
          const r = el.getBoundingClientRect()
          if (r.right > 80 && r.left < window.innerWidth - 80 && r.top > 80 && r.bottom < window.innerHeight - 40) {
            const dist = Math.abs((r.left + r.right) / 2 - window.innerWidth / 2)
            if (dist < bestDist) { bestDist = dist; best = { x: r.left, y: r.top } }
          }
        })
        if (best) {
          chips.push({ ...skill, fx: best.x, fy: best.y, tx: tgt.x, ty: tgt.y })
        }
      })

      // Atomic swap. Flying chips render WITH a CSS keyframe animation already running.
      setShowRows(false)
      setHistAbsolute(false)
      setFlyDone(false)
      setFlyChips(chips)

      CATEGORIES.forEach((cat, ci) => {
        const landAt = FLIGHT_MS + ci * STAGGER_MS
        add(() => {
          setVisibleChips(prev => {
            const next = new Set(prev)
            cat.skills.forEach((_, si) => next.add(`${cat.id}-${si}`))
            return next
          })
        }, landAt - 120)
      })

      const lastLand = FLIGHT_MS + (CATEGORIES.length - 1) * STAGGER_MS
      add(() => setFlyDone(true), lastLand + 80)
      add(() => setFlyChips([]),  lastLand + 700)
    }))
  }

  const handleReplay = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setPhase('grid')
    setEtlStage(-1)
    setHighlighted(new Set())
    setOverlayHidden(false)
    setShowRows(true)
    setShowHist(false)
    setHistAbsolute(true)
    setVisibleChips(new Set())
    setDone(false)
    setFlyChips([])
    setFlyDone(false)
    setLoadedCats(new Set())
    setVisibleCats(new Set())
    setLockedHeight(null)
    setReplayCount(c => c + 1)
  }

  const handleAnalyze = () => {
    if (phase !== 'grid') return
    trackClick('analyze_skills', 'skills')

    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (sectionRef.current) setLockedHeight(sectionRef.current.offsetHeight)
    setOverlayHidden(true)
    setPhase('running')

    let t = 0

    setEtlStage(0)
    ALL_SKILLS.forEach((s, i) => {
      add(() => setHighlighted(prev => new Set([...prev, s.id])), 100 + i * 28)
    })

    t += ETL_STAGES[0].ms

    add(() => {
      setEtlStage(1)
      setShowHist(true)
      // Stagger the empty category columns into view BEFORE chips fly
      CATEGORIES.forEach((cat, ci) => {
        add(() => setVisibleCats(prev => new Set([...prev, cat.id])), ci * CAT_STAGGER_MS)
      })
      // Start chip flight after categories have appeared
      add(() => startFly(), CATEGORIES.length * CAT_STAGGER_MS + 220)
    }, t)

    t += ETL_STAGES[1].ms

    add(() => {
      setEtlStage(2)
      setVisibleChips(new Set(ALL_SKILLS.map(s => s.id)))
    }, t)

    // Sequentially "index" each category during Load
    CATEGORIES.forEach((cat, ci) => {
      add(() => {
        setLoadedCats(prev => new Set([...prev, cat.id]))
      }, t + 60 + ci * 150)
    })

    t += ETL_STAGES[2].ms

    add(() => { setEtlStage(3); setDone(true) }, t)
    add(() => { setPhase('done'); setLockedHeight(0) }, t + ETL_STAGES[3].ms)
    add(() => setLockedHeight(null), t + ETL_STAGES[3].ms + 1000)
  }

  return (
    <section
      ref={sectionRef}
      id="skills"
      style={{
        position: 'relative', background: 'transparent',
        minHeight: lockedHeight ?? undefined,
        paddingBottom: isMobile ? 48 : 80,
        transition: lockedHeight !== null ? 'min-height 0.8s cubic-bezier(.22,1,.36,1)' : 'none',
      }}
    >
      <style>{`
        @keyframes scrollLeft  { from { transform: translateX(0) }    to { transform: translateX(-50%) } }
        @keyframes scrollRight { from { transform: translateX(-50%) } to { transform: translateX(0) }    }
        @keyframes etlFill     { from { width: 0% }                   to { width: 100% }                 }
        @keyframes domainExpand { from { max-height: 0; opacity: 0; margin-bottom: 0; } to { max-height: 160px; opacity: 1; margin-bottom: 20px; } }
        .etl-progress-fill {
          height: 100%;
          width: 0%;
          border-radius: 999px;
          background: linear-gradient(90deg, #facc15, #fb923c, #60a5fa, #4ade80);
          animation: etlFill ${ETL_TOTAL_MS}ms linear forwards;
        }
        .etl-progress-fill--done { width: 100%; animation: none; }
        @keyframes flyChip     {
          from { transform: translate(var(--fx, 0px), var(--fy, 0px)); }
          to   { transform: translate(0, 0); }
        }
        @keyframes btnShimmer  {
          0%   { transform: translateX(-140%) skewX(-15deg); opacity: 0; }
          8%   { opacity: 1; }
          45%  { transform: translateX(140%) skewX(-15deg); opacity: 1; }
          55%  { transform: translateX(140%) skewX(-15deg); opacity: 0; }
          100% { transform: translateX(140%) skewX(-15deg); opacity: 0; }
        }
      `}</style>

      {/* Top divider for consistent section spacing */}
      <div style={{
        height: 1,
        background: 'linear-gradient(to right, transparent, rgba(250,204,21,0.12), transparent)',
        marginTop: isMobile ? 24 : 40,
        marginBottom: isMobile ? 32 : 48,
      }} />

      {/* Label */}
      <div style={{
        maxWidth: 1320, margin: '0 auto', padding: isMobile ? '0 24px 20px' : '0 64px 20px',
        opacity: entered ? 1 : 0,
        transform: entered ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.7s ease, transform 0.7s cubic-bezier(.22,1,.36,1)',
        position: 'relative', zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#facc15', boxShadow: '0 0 8px #facc15', display: 'inline-block' }} />
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#facc15' }}>
            Skills
          </span>
        </div>
        <TypedHeading
          text="Skills I have to ship."
          style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 800, color: '#f5f5f5', letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0 }}
        />
      </div>

      {/* ── STAGE: rows + histogram overlay ── */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>

        {/* Content area — rows (absolute overlay) + histogram (in-flow). Stable height so ETL bar doesn't shift. */}
        <div style={{ position: 'relative', minHeight: 'calc(100vh - 440px)' }}>

          {showRows && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 2 }}>
              {rowData.map((row, ri) => (
                <div key={ri} style={{ overflow: 'hidden', flex: 1, display: 'flex', alignItems: 'center', lineHeight: 0 }}>
                  <div style={{
                    display: 'inline-flex', gap: 12, whiteSpace: 'nowrap',
                    animation: `${ri % 2 === 0 ? 'scrollLeft' : 'scrollRight'} ${ROW_SPEEDS[ri]}s linear infinite`,
                    willChange: 'transform',
                  }}>
                    {row.map((skill, idx) => {
                      const isOn = highlighted.has(skill.id)
                      return (
                        <span key={`${skill.id}-${idx}`} data-sid={skill.id} style={{
                          display: 'inline-block', padding: '10px 20px', borderRadius: 8,
                          background: isOn ? skill.bg : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${isOn ? skill.color + '50' : 'rgba(255,255,255,0.08)'}`,
                          fontSize: 12.5, fontWeight: 500,
                          color: isOn ? skill.color : 'rgba(255,255,255,0.35)',
                          transition: 'background 0.3s, border-color 0.3s, color 0.3s, box-shadow 0.3s',
                          boxShadow: isOn ? `0 0 14px ${skill.color}20` : 'none',
                          flexShrink: 0,
                        }}>
                          {skill.label}
                        </span>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {showRows && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 5,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: 'radial-gradient(ellipse 44% 60% at 50% 50%, rgba(10,10,10,0.96) 10%, rgba(10,10,10,0.65) 52%, transparent 100%)',
              opacity: overlayHidden ? 0 : 1,
              transition: 'opacity 0.6s ease',
              pointerEvents: overlayHidden ? 'none' : 'auto',
            }}>
              <div style={{
                fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 900, color: 'rgba(255,255,255,0.28)',
                letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 12, textAlign: 'center',
                opacity: showRaw ? 1 : 0,
                transform: showRaw ? 'translateY(0) scale(1)' : 'translateY(18px) scale(0.96)',
                transition: 'opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.22,1,.36,1)',
              }}>
                Raw Data
              </div>
              <div style={{
                fontSize: 13, color: 'rgba(255,255,255,0.24)', marginBottom: 38, letterSpacing: '0.05em',
                opacity: showSub ? 1 : 0,
                transform: showSub ? 'translateY(0)' : 'translateY(8px)',
                transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(.22,1,.36,1)',
              }}>
                {ALL_SKILLS.length} unclassified skills
              </div>
              <div style={{
                opacity: showBtn ? 1 : 0,
                transform: showBtn ? 'translateY(0)' : 'translateY(10px)',
                transition: 'opacity 0.45s ease, transform 0.45s cubic-bezier(.22,1,.36,1)',
              }}>
                <button onClick={handleAnalyze}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 18px rgba(250,204,21,0.60), 0 0 40px rgba(250,204,21,0.25)' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
                  style={{
                  position: 'relative', overflow: 'hidden',
                  background: '#facc15', color: '#0a0a0a', border: 'none',
                  padding: '14px 30px', borderRadius: 10, fontSize: 14,
                  fontWeight: 700, cursor: 'pointer', letterSpacing: '0.01em',
                  transition: 'box-shadow 0.3s ease',
                }}>
                  <span style={{ position: 'relative', zIndex: 2 }}>
                    Analyze for Business Intelligence
                  </span>
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute', top: 0, left: 0, bottom: 0,
                      width: '55%',
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,80,80,0.5) 35%, rgba(255,140,140,0.85) 50%, rgba(255,80,80,0.5) 65%, transparent 100%)',
                      filter: 'blur(2px)',
                      transform: 'translateX(-140%) skewX(-15deg)',
                      animation: showBtn ? 'btnShimmer 2.6s ease-in-out 0.6s infinite' : 'none',
                      pointerEvents: 'none',
                      zIndex: 1,
                    }}
                  />
                </button>
              </div>
            </div>
          )}

          {showHist && (
            <div style={{
              maxWidth: 1320, margin: '0 auto',
              padding: isMobile ? '0 24px 16px' : '0 64px 16px',
              position: 'relative', zIndex: 1,
            }}>
              <div style={{
                textAlign: 'center', marginBottom: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
              }}>
                {done && (
                <div style={{
                  overflow: 'hidden',
                  animation: 'domainExpand 0.7s cubic-bezier(.22,1,.36,1) forwards',
                }}>
                  <div style={{
                    fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 900, color: 'rgba(255,255,255,0.28)',
                    letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 12, textAlign: 'center',
                  }}>
                    Skills by Domain
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.24)', letterSpacing: '0.05em' }}>
                    {CATEGORIES.length} domains · {ALL_SKILLS.length} skills classified
                  </div>
                </div>
                )}
                {done && (
                  <button
                    onClick={handleReplay}
                    style={{
                      flexShrink: 0, padding: '7px 14px', borderRadius: 8,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.45)', fontSize: 11.5, fontWeight: 600,
                      cursor: 'pointer', letterSpacing: '0.02em',
                      transition: 'border-color 0.2s, color 0.2s',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(250,204,21,0.3)'; e.currentTarget.style.color = '#facc15' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)' }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
                    </svg>
                    Replay
                  </button>
                )}
              </div>
              <div style={{ overflowX: isMobile ? 'auto' : 'visible', WebkitOverflowScrolling: 'touch', paddingBottom: isMobile ? 8 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: COL_GAP, paddingBottom: 14, minWidth: isMobile ? 820 : 'auto' }}>
                {CATEGORIES.map(cat => {
                  const isLoaded = loadedCats.has(cat.id)
                  const isCatVisible = visibleCats.has(cat.id)
                  return (
                    <div key={cat.id} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: CHIP_VGAP,
                      opacity: isCatVisible ? 1 : 0,
                      transform: isCatVisible ? 'translateY(0)' : 'translateY(12px)',
                      transition: 'opacity 0.5s ease, transform 0.6s cubic-bezier(.22,1,.36,1)',
                    }}>
                      {cat.skills.map((s, si) => {
                        const id  = `${cat.id}-${si}`
                        const vis = visibleChips.has(id)
                        return (
                          <div key={id} data-hid={id} style={{
                            padding: '5px 10px', borderRadius: 6,
                            background: cat.bg, border: `1px solid ${cat.color}42`,
                            fontSize: 11, fontWeight: 500, color: cat.color,
                            whiteSpace: 'nowrap', width: CHIP_W, textAlign: 'center',
                            opacity: vis ? 1 : 0,
                            transition: 'opacity 0.45s ease',
                            boxShadow: isLoaded ? `0 0 12px ${cat.color}22` : 'none',
                          }}>
                            {s}
                          </div>
                        )
                      })}
                      <div style={{
                        width: isLoaded ? '100%' : '30%',
                        height: 2, borderRadius: 2, background: cat.color,
                        opacity: isLoaded ? 0.9 : 0.3,
                        marginTop: 5,
                        transition: 'width 0.55s cubic-bezier(.22,1,.36,1), opacity 0.45s ease',
                      }} />
                      <div style={{
                        fontSize: 14, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
                        color: cat.color, marginTop: 8,
                        display: 'flex', alignItems: 'center', gap: 6,
                        textShadow: `0 0 14px ${cat.color}55`,
                      }}>
                        <span style={{
                          color: '#4ade80', fontSize: 12, fontWeight: 900,
                          opacity: isLoaded ? 1 : 0,
                          transform: isLoaded ? 'scale(1)' : 'scale(0.5)',
                          transition: 'opacity 0.3s ease, transform 0.3s cubic-bezier(.22,1,.36,1)',
                        }}>
                          ✓
                        </span>
                        {cat.name}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>
                        {cat.skills.length} skills
                      </div>
                    </div>
                  )
                })}
              </div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '6px 0 0' }} />
              </div>
            </div>
          )}

        </div>

        {/* ── ETL BAR — in-flow at section bottom ── */}
        {etlStage >= 0 && (
          <div ref={etlBarRef} style={{
            padding: isMobile ? '20px 24px 60px' : '28px 64px 80px',
          }}>
          <div style={{ maxWidth: 1320, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 4, marginBottom: 12 }}>
              {ETL_STAGES.map((st, i) => (
                <div key={st.key} style={{
                  flex: 1, padding: isMobile ? '8px 8px' : '10px 14px', borderRadius: 8,
                  background: i === etlStage ? 'rgba(250,204,21,0.07)' : i < etlStage ? 'rgba(250,204,21,0.06)' : 'transparent',
                  border: `1px solid ${i === etlStage ? 'rgba(250,204,21,0.22)' : i < etlStage ? 'rgba(250,204,21,0.18)' : 'rgba(255,255,255,0.04)'}`,
                  transition: 'all 0.45s ease',
                }}>
                  <div style={{
                    fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: i === etlStage ? '#facc15' : i < etlStage ? 'rgba(250,204,21,0.85)' : 'rgba(255,255,255,0.13)',
                    transition: 'color 0.45s ease', display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    {i < etlStage && <span style={{ color: '#4ade80', fontSize: 9, fontWeight: 900 }}>✓</span>}
                    {st.label}
                  </div>
                  <div style={{ fontSize: 10, marginTop: 3, color: i === etlStage ? 'rgba(255,255,255,0.36)' : i < etlStage ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.09)', transition: 'color 0.45s ease' }}>
                    {st.sub}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 999, overflow: 'hidden' }}>
              <div
                key={`fill-${replayCount}`}
                className={`etl-progress-fill${phase === 'done' ? ' etl-progress-fill--done' : ''}`}
              />
            </div>
          </div>
          </div>
        )}

      </div>

      {/* ── FLYING CHIPS — CSS keyframe animation with fill-mode: both,
            so chip paints at source instantly and motion starts on its own ── */}
      {flyChips.length > 0 && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 200 }}>
          {flyChips.map(chip => (
            <div key={chip.id} style={{
              position: 'absolute',
              left: chip.tx,
              top:  chip.ty,
              width: CHIP_W,
              padding: '7px 10px',
              borderRadius: 6,
              background: chip.bg,
              border: `1px solid ${chip.color}48`,
              fontSize: 11, fontWeight: 500,
              color: chip.color,
              textAlign: 'center',
              whiteSpace: 'nowrap',
              opacity: flyDone ? 0 : 1,
              transition: 'opacity 500ms ease',
              animation: `flyChip ${FLIGHT_MS}ms ${FLIGHT_EASE} ${chip.catIndex * STAGGER_MS}ms both`,
              ['--fx']: `${chip.fx - chip.tx}px`,
              ['--fy']: `${chip.fy - chip.ty}px`,
              willChange: 'transform, opacity',
            }}>
              {chip.label}
            </div>
          ))}
        </div>
      )}

    </section>
  )
}
