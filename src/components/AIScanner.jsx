import { useEffect, useRef, useState } from 'react'

const PHRASES = [
  { text: 'Visitor detected...', duration: 1600 },
  { text: 'Running analysis...', duration: 1600 },
  { text: 'Interest in AI detected.', duration: 1800 },
]

/* typewriter that fires onDone when finished */
function TypeLine({ text, active, onDone }) {
  const [chars, setChars] = useState('')

  useEffect(() => {
    if (!active) return
    setChars('')
    let i = 0
    const id = setInterval(() => {
      i++
      setChars(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(id)
        setTimeout(() => onDone?.(), 420)
      }
    }, 36)
    return () => clearInterval(id)
  }, [active, text])

  if (!active && chars === '') return null

  return (
    <span style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'monospace', fontSize: 13, letterSpacing: '0.04em' }}>
      {chars}
      {chars.length < text.length && (
        <span style={{ animation: 'scanBlink 0.6s step-end infinite', color: '#fb923c' }}>▌</span>
      )}
    </span>
  )
}

/* Siri/FaceID orb — morphing blob + rotating scanner arc */
function SiriOrb({ scanning }) {
  return (
    <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
      {/* morphing blob core */}
      <div
        style={{
          position: 'absolute',
          inset: 8,
          background: 'radial-gradient(circle at 38% 38%, #fde047 0%, #fb923c 45%, #f97316 80%)',
          animation: 'blobMorph 3.5s ease-in-out infinite, blobBreath 2s ease-in-out infinite',
          filter: 'blur(1px)',
        }}
      />
      {/* inner highlight */}
      <div
        style={{
          position: 'absolute',
          inset: 16,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.55) 0%, transparent 55%)',
          animation: 'blobMorph 4.5s ease-in-out infinite reverse',
        }}
      />
      {/* outer glow */}
      <div
        style={{
          position: 'absolute',
          inset: -10,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(251,146,60,0.35) 0%, transparent 70%)',
          filter: 'blur(10px)',
          animation: 'blobBreath 2.5s ease-in-out infinite',
        }}
      />
      {/* Face-ID style rotating scanner arc (SVG) */}
      {scanning && (
        <svg
          style={{
            position: 'absolute',
            inset: -6,
            width: 84,
            height: 84,
            animation: 'arcSpin 1.8s linear infinite',
          }}
          viewBox="0 0 84 84"
          fill="none"
        >
          {/* full dim ring */}
          <circle cx="42" cy="42" r="38" stroke="rgba(251,146,60,0.12)" strokeWidth="1.5" />
          {/* bright arc segment */}
          <circle
            cx="42" cy="42" r="38"
            stroke="url(#arcGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="60 180"
            strokeDashoffset="0"
          />
          {/* corner ticks — FaceID feel */}
          {[[0, 0], [84, 0], [84, 84], [0, 84]].map(([cx, cy], i) => {
            const len = 8
            const dirs = [
              [[cx + 4, cy], [cx + 4 + len, cy], [cx, cy + 4], [cx, cy + 4 + len]],
              [[cx - 4, cy], [cx - 4 - len, cy], [cx, cy + 4], [cx, cy + 4 + len]],
              [[cx - 4, cy], [cx - 4 - len, cy], [cx, cy - 4], [cx, cy - 4 - len]],
              [[cx + 4, cy], [cx + 4 + len, cy], [cx, cy - 4], [cx, cy - 4 - len]],
            ][i]
            return (
              <g key={i}>
                <line x1={dirs[0][0]} y1={dirs[0][1]} x2={dirs[1][0]} y2={dirs[1][1]} stroke="rgba(251,146,60,0.6)" strokeWidth="2" strokeLinecap="round" />
                <line x1={dirs[2][0]} y1={dirs[2][1]} x2={dirs[3][0]} y2={dirs[3][1]} stroke="rgba(251,146,60,0.6)" strokeWidth="2" strokeLinecap="round" />
              </g>
            )
          })}
          <defs>
            <linearGradient id="arcGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="84" y2="84">
              <stop offset="0%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
        </svg>
      )}
      {/* done state — full ring + stroke-in checkmark */}
      {!scanning && (
        <svg
          style={{ position: 'absolute', inset: -6, width: 84, height: 84 }}
          viewBox="0 0 84 84"
          fill="none"
        >
          {/* completed ring */}
          <circle cx="42" cy="42" r="38" stroke="rgba(250,204,21,0.18)" strokeWidth="1.5" />
          <circle
            cx="42" cy="42" r="38"
            stroke="url(#doneGrad)"
            strokeWidth="2"
            strokeDasharray="239"
            strokeDashoffset="0"
            style={{ animation: 'ringFill 0.6s ease forwards' }}
          />
          {/* checkmark — strokes in */}
          <polyline
            points="26,44 36,54 58,30"
            stroke="url(#tickGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            style={{
              strokeDasharray: 48,
              strokeDashoffset: 48,
              animation: 'tickDraw 0.5s cubic-bezier(.22,1,.36,1) 0.5s forwards',
            }}
          />
          <defs>
            <linearGradient id="doneGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="84" y2="84">
              <stop offset="0%" stopColor="#facc15" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="tickGrad" gradientUnits="userSpaceOnUse" x1="26" y1="44" x2="58" y2="30">
              <stop offset="0%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#fb923c" />
            </linearGradient>
          </defs>
        </svg>
      )}
    </div>
  )
}

export default function AIScanner({ onReveal }) {
  const [step, setStep] = useState(0)       // 0-2 phrases, 3 = done
  const [showBtn, setShowBtn] = useState(false)

  const nextStep = () => {
    setStep(s => {
      const next = s + 1
      if (next >= PHRASES.length) {
        setTimeout(() => { setShowBtn(true); onReveal?.() }, 500)
      }
      return next
    })
  }

  return (
    <div style={{ margin: '28px 0 4px' }}>
      <style>{`
        @keyframes blobMorph {
          0%,100% { border-radius: 60% 40% 55% 45% / 55% 45% 60% 40%; }
          25%      { border-radius: 40% 60% 45% 55% / 60% 40% 55% 45%; }
          50%      { border-radius: 55% 45% 60% 40% / 45% 55% 40% 60%; }
          75%      { border-radius: 45% 55% 40% 60% / 40% 60% 45% 55%; }
        }
        @keyframes blobBreath {
          0%,100% { transform: scale(1);    opacity: 0.9; }
          50%      { transform: scale(1.08); opacity: 1;   }
        }
        @keyframes arcSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes scanBlink {
          0%,100% { opacity: 1; } 50% { opacity: 0; }
        }
        @keyframes scanFadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes btnPop {
          0%   { opacity: 0; transform: translateY(10px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes tickDraw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes ringFill {
          from { stroke-dashoffset: 239; }
          to   { stroke-dashoffset: 0; }
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <SiriOrb scanning={step < PHRASES.length} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 6 }}>
          {/* frequency bars while scanning */}
          {step < PHRASES.length && (
            <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 18, marginBottom: 4 }}>
              {[5, 9, 14, 10, 16, 8, 12, 6, 11, 7, 13].map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: 3,
                    height: h,
                    borderRadius: 2,
                    background: `rgba(${i % 2 === 0 ? '250,204,21' : '249,115,22'},0.7)`,
                    animation: `blobBreath ${0.5 + i * 0.07}s ease-in-out infinite alternate`,
                  }}
                />
              ))}
            </div>
          )}

          {/* phrases */}
          {PHRASES.map((p, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                opacity: i <= step ? 1 : 0,
                animation: i === step ? 'scanFadeUp 0.3s ease forwards' : 'none',
              }}
            >
              {/* status dot */}
              <span style={{
                width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                background: i < step ? '#facc15' : i === step ? '#fb923c' : 'rgba(255,255,255,0.15)',
                boxShadow: i <= step ? '0 0 6px #fb923c' : 'none',
                transition: 'background 0.3s',
              }} />
              {i < step ? (
                <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em' }}>
                  {p.text}
                </span>
              ) : i === step ? (
                <TypeLine text={p.text} active={true} onDone={nextStep} />
              ) : null}
            </div>
          ))}

          {/* AI Showcase button — appears after scan */}
          {showBtn && (
            <button
              style={{
                marginTop: 10,
                padding: '11px 24px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                background: 'linear-gradient(135deg, rgba(251,146,60,0.15), rgba(250,204,21,0.1))',
                color: '#fbbf24',
                border: '1px solid rgba(251,146,60,0.35)',
                letterSpacing: '0.02em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                width: 'fit-content',
                animation: 'btnPop 0.55s cubic-bezier(.22,1,.36,1) forwards',
                transition: 'background 0.2s, box-shadow 0.2s, transform 0.2s, border-color 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(251,146,60,0.28), rgba(250,204,21,0.2))'
                e.currentTarget.style.boxShadow = '0 0 22px rgba(251,146,60,0.35)'
                e.currentTarget.style.borderColor = 'rgba(251,146,60,0.6)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(251,146,60,0.15), rgba(250,204,21,0.1))'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = 'rgba(251,146,60,0.35)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#fb923c',
                boxShadow: '0 0 8px #fb923c',
                animation: 'blobBreath 2s ease-in-out infinite',
                display: 'inline-block',
              }} />
              ✦&nbsp; Explore Rohan&apos;s AI Showcase
              <span style={{ opacity: 0.5 }}>→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
