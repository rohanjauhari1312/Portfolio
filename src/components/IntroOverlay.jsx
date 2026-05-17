import { useEffect, useRef, useState } from 'react'

const PHRASES = [
  { text: 'Visitor detected...', delay: 600 },
  { text: 'Running analysis...', delay: 2400 },
  { text: 'Interest in AI detected.', delay: 4200 },
]

const BUTTON_DELAY = 5800

function TypewriterLine({ text, startDelay, onDone }) {
  const [displayed, setDisplayed] = useState('')
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), startDelay)
    return () => clearTimeout(t)
  }, [startDelay])

  useEffect(() => {
    if (!started) return
    let i = 0
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1))
      i++
      if (i === text.length) {
        clearInterval(interval)
        if (onDone) setTimeout(onDone, 300)
      }
    }, 38)
    return () => clearInterval(interval)
  }, [started, text, onDone])

  if (!started && displayed === '') return null

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        opacity: started ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#3b82f6',
          boxShadow: '0 0 8px #3b82f6',
          flexShrink: 0,
          animation: 'introPulse 1.2s ease-in-out infinite',
        }}
      />
      <span
        style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
          fontSize: 14,
          color: 'rgba(255,255,255,0.7)',
          letterSpacing: '0.04em',
        }}
      >
        {displayed}
        {displayed.length < text.length && (
          <span style={{ animation: 'blink 0.7s step-end infinite', color: '#3b82f6' }}>|</span>
        )}
      </span>
    </div>
  )
}

/* Siri-inspired animated orb */
function SiriOrb() {
  return (
    <div style={{ position: 'relative', width: 160, height: 160 }}>
      {/* outer pulse rings */}
      {[1, 2, 3].map(i => (
        <div
          key={i}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '1px solid rgba(99,102,241,0.3)',
            animation: `orbRing 2.4s ease-out infinite ${i * 0.6}s`,
          }}
        />
      ))}

      {/* core blob layers */}
      <div
        style={{
          position: 'absolute',
          inset: 20,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 40% 40%, #6366f1 0%, #3b82f6 40%, #0ea5e9 70%, transparent 100%)',
          filter: 'blur(2px)',
          animation: 'orbRotate 4s linear infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 20,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 65% 65%, rgba(139,92,246,0.8) 0%, transparent 60%)',
          filter: 'blur(4px)',
          animation: 'orbRotate 6s linear infinite reverse',
          mixBlendMode: 'screen',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 28,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.5) 0%, transparent 50%)',
          filter: 'blur(3px)',
          animation: 'orbBreath 3s ease-in-out infinite',
        }}
      />

      {/* outer glow */}
      <div
        style={{
          position: 'absolute',
          inset: -20,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
          filter: 'blur(16px)',
          animation: 'orbBreath 3s ease-in-out infinite',
        }}
      />

      {/* frequency bars — bottom arc */}
      <div
        style={{
          position: 'absolute',
          bottom: -28,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 4,
          alignItems: 'flex-end',
        }}
      >
        {[6, 10, 16, 22, 14, 20, 12, 18, 8].map((h, i) => (
          <div
            key={i}
            style={{
              width: 3,
              height: h,
              borderRadius: 2,
              background: 'rgba(99,102,241,0.6)',
              animation: `freqBar 0.8s ease-in-out infinite ${i * 0.08}s alternate`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default function IntroOverlay({ onDone }) {
  const [btnVisible, setBtnVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setBtnVisible(true), BUTTON_DELAY)
    return () => clearTimeout(t)
  }, [])

  const handleEnter = () => {
    setLeaving(true)
    setTimeout(onDone, 700)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: '#050507',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        opacity: leaving ? 0 : 1,
        transition: 'opacity 0.7s ease',
      }}
    >
      <style>{`
        @keyframes introPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; } 50% { opacity: 0; }
        }
        @keyframes orbRing {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes orbRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbBreath {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes freqBar {
          from { transform: scaleY(0.4); opacity: 0.5; }
          to { transform: scaleY(1.4); opacity: 1; }
        }
        @keyframes btnAppear {
          from { opacity: 0; transform: translateY(16px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes scanLine {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 0.4; }
          90% { opacity: 0.4; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
      `}</style>

      {/* scan line effect */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: 2,
            background: 'linear-gradient(to right, transparent, rgba(99,102,241,0.4), rgba(99,102,241,0.6), rgba(99,102,241,0.4), transparent)',
            animation: 'scanLine 3s linear infinite',
          }}
        />
      </div>

      {/* subtle grid overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
        }}
      />

      {/* orb */}
      <SiriOrb />

      {/* phrases */}
      <div
        style={{
          marginTop: 60,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          minHeight: 100,
          alignItems: 'flex-start',
          width: 320,
        }}
      >
        {PHRASES.map((p, i) => (
          <TypewriterLine key={i} text={p.text} startDelay={p.delay} />
        ))}
      </div>

      {/* CTA button */}
      <div
        style={{
          marginTop: 48,
          opacity: btnVisible ? 1 : 0,
          animation: btnVisible ? 'btnAppear 0.6s cubic-bezier(.22,1,.36,1) forwards' : 'none',
          pointerEvents: btnVisible ? 'auto' : 'none',
        }}
      >
        <button
          onClick={handleEnter}
          style={{
            padding: '14px 36px',
            borderRadius: 999,
            fontSize: 14,
            fontWeight: 600,
            background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
            color: '#fff',
            border: 'none',
            boxShadow: '0 0 32px rgba(99,102,241,0.4), 0 0 64px rgba(59,130,246,0.2)',
            letterSpacing: '0.02em',
            transition: 'transform 0.2s, box-shadow 0.2s',
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'
            e.currentTarget.style.boxShadow = '0 0 48px rgba(99,102,241,0.6), 0 0 80px rgba(59,130,246,0.3)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)'
            e.currentTarget.style.boxShadow = '0 0 32px rgba(99,102,241,0.4), 0 0 64px rgba(59,130,246,0.2)'
          }}
        >
          <span style={{ position: 'relative', zIndex: 1 }}>
            ✦ &nbsp;Explore Rohan&apos;s AI Showcase
          </span>
        </button>
        <p
          style={{
            textAlign: 'center',
            marginTop: 14,
            fontSize: 11,
            color: 'rgba(255,255,255,0.25)',
            letterSpacing: '0.08em',
          }}
        >
          press to continue
        </p>
      </div>
    </div>
  )
}
