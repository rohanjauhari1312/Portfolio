import { useEffect, useRef, useState } from 'react'
import useIsMobile from '../hooks/useIsMobile'
import TypedHeading from './TypedHeading'

const PRINCIPLES = [
  {
    id: 'empathy',
    title: 'Empathy',
    color: '#fb923c',
    text: 'Every feature starts with the person using it, not the dataset describing them.',
    icon: (
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    ),
  },
  {
    id: 'security',
    title: 'Security',
    color: '#60a5fa',
    text: 'Access control and data handling are part of the design, not a patch applied after launch.',
    icon: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
  },
  {
    id: 'usability',
    title: 'Usability',
    color: '#4ade80',
    text: "If it needs a walkthrough to use, it isn't finished yet.",
    icon: (
      <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
    ),
  },
]

function PrincipleCard({ p, index }) {
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.15 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: visible ? 1 : 0,
        transform: !visible ? 'translateY(28px)' : hovered ? 'translateY(-8px)' : 'translateY(0)',
        transition: !visible
          ? `opacity 0.6s ease ${index * 110}ms, transform 0.7s cubic-bezier(.22,1,.36,1) ${index * 110}ms`
          : 'transform 0.3s cubic-bezier(.22,1,.36,1)',
      }}
    >
      <div
        style={{
          animation: `floatCard ${4 + index * 0.4}s ease-in-out ${index * 0.7}s infinite`,
          padding: '28px 26px',
          borderRadius: 16,
          background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${hovered ? `${p.color}90` : `${p.color}30`}`,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          height: '100%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: hovered
            ? `0 0 24px ${p.color}80, 0 0 60px ${p.color}45, 0 0 100px ${p.color}20, inset 0 0 0 1px ${p.color}30`
            : `0 0 18px ${p.color}18, inset 0 0 0 1px ${p.color}10`,
          transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
        }}
      >
        <div
          style={{
            width: 48, height: 48, borderRadius: 12,
            background: `${p.color}14`,
            border: `1px solid ${p.color}35`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 18,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={p.color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            {p.icon}
          </svg>
        </div>
        <div style={{ fontSize: 17, fontWeight: 800, color: '#f5f5f5', marginBottom: 8, letterSpacing: '-0.01em' }}>
          {p.title}
        </div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }}>
          {p.text}
        </div>
      </div>
    </div>
  )
}

export default function Mantra() {
  const [titleVisible, setTitleVisible] = useState(false)
  const titleRef = useRef(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTitleVisible(true); obs.disconnect() } },
      { threshold: 0.2 }
    )
    if (titleRef.current) obs.observe(titleRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section style={{ background: 'rgba(10,10,10,0.85)', padding: isMobile ? '24px 0 48px' : '40px 0 80px' }} id="mantra">
      <style>{`
        @keyframes floatCard { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
      `}</style>
      <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(250,204,21,0.15), transparent)', marginBottom: isMobile ? 32 : 48 }} />

      <div style={{ maxWidth: 1320, margin: '0 auto', padding: isMobile ? '0 24px' : '0 64px' }}>
        <div
          ref={titleRef}
          style={{
            marginBottom: isMobile ? 32 : 48,
            opacity: titleVisible ? 1 : 0,
            transform: titleVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease, transform 0.7s cubic-bezier(.22,1,.36,1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#facc15', boxShadow: '0 0 8px #facc15', display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#facc15' }}>Philosophy</span>
          </div>
          <TypedHeading
            text="My shipping "
            suffixText="mantra."
            suffixStyle={{
              background: 'linear-gradient(90deg, #facc15, #fb923c)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}
            style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 800, color: '#f5f5f5', letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0 }}
          />
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.38)', marginTop: 12, maxWidth: 480 }}>
            Three things I refuse to ship without.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 16 : 24 }}>
          {PRINCIPLES.map((p, i) => <PrincipleCard key={p.id} p={p} index={i} />)}
        </div>
      </div>
    </section>
  )
}
