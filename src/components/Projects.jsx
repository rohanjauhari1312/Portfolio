import { useEffect, useRef, useState } from 'react'
import TypedHeading from './TypedHeading'
import useIsMobile from '../hooks/useIsMobile'

const PROJECTS = [
  {
    id: 'nourish',
    image: '/nourish.jpeg',
    link: 'https://nourish-agent.netlify.app/',
    hasDetail: true,
    name: 'Nourish Agent',
    tagline: 'Multi-agent AI Nutritionist',
    description:
      'A real-time multi-agent AI system that adapts nutrition recommendations based on wearable health data and user lifestyle. Built with agentic architecture where multiple specialized agents coordinate to personalize diet plans dynamically.',
    gradient: 'linear-gradient(135deg, #052e16 0%, #14532d 50%, #166534 100%)',
    iconBg: 'linear-gradient(135deg, #16a34a, #4ade80)',
    icon: '🥗',
    accentColor: '#4ade80',
    tags: ['Agentic AI', 'Multi-agent', 'Wearables', 'Real-time', 'LLM'],
    metrics: [
      { v: 'Multi', l: 'Agent pipeline' },
      { v: 'Live', l: 'Wearable sync' },
      { v: 'Adaptive', l: 'Personalization' },
    ],
    status: 'Personal Project',
  },
  {
    id: 'swifthire',
    image: '/swifthire.jpg',
    name: 'SwiftHire',
    tagline: 'AI-Powered Job Application Tool',
    description:
      'Built after surveying 100+ job seekers to map every friction point in the application process. SwiftHire uses AI to automate and optimize the job search workflow, from tailoring resumes to tracking applications.',
    gradient: 'linear-gradient(135deg, #1c1400 0%, #713f12 50%, #a16207 100%)',
    iconBg: 'linear-gradient(135deg, #ca8a04, #facc15)',
    icon: '⚡',
    accentColor: '#facc15',
    tags: ['AI', 'User Research', 'Automation', 'Job Search', 'LLM'],
    metrics: [
      { v: '100+', l: 'Users surveyed' },
      { v: 'AI', l: 'Powered workflow' },
      { v: 'End-to-end', l: 'Automation' },
    ],
    status: 'Personal Project',
  },
  {
    id: 'housing',
    image: '/housing.jpg',
    name: 'Student Housing Platform',
    tagline: 'PM Club · Full Product Cycle',
    description:
      'Led discovery to delivery for a student housing platform. Analyzed 100+ survey responses, identified 10 pain points, defined north star + counter metrics, and shipped 7 features that cut average search time by 75%.',
    gradient: 'linear-gradient(135deg, #0c1445 0%, #1e3a8a 50%, #1d4ed8 100%)',
    iconBg: 'linear-gradient(135deg, #2563eb, #60a5fa)',
    icon: '🏠',
    accentColor: '#60a5fa',
    tags: ['Product Discovery', 'UX Research', 'OKRs', 'Metrics', 'Figma'],
    metrics: [
      { v: '↓75%', l: 'Search time' },
      { v: '10', l: 'Pain points mapped' },
      { v: '7', l: 'Features shipped' },
    ],
    status: 'PM Club',
  },
]

function ProjectImage({ project }) {
  const [imgFailed, setImgFailed] = useState(false)
  const showImg = project.image && !imgFailed

  return (
    <div style={{
      width: '100%', height: 200,
      background: project.gradient,
      borderRadius: '12px 12px 0 0',
      position: 'relative', overflow: 'hidden',
      flexShrink: 0,
    }}>
      {showImg ? (
        <img
          src={project.image}
          alt={project.name}
          onError={() => setImgFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `linear-gradient(${project.accentColor}18 1px, transparent 1px), linear-gradient(90deg, ${project.accentColor}18 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }} />
          <div style={{
            position: 'absolute', bottom: -30, right: -30,
            width: 120, height: 120, borderRadius: '50%',
            background: `radial-gradient(circle, ${project.accentColor}40, transparent 70%)`,
            filter: 'blur(20px)',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              position: 'relative', zIndex: 1,
              width: 64, height: 64, borderRadius: 20,
              background: project.iconBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 30,
              boxShadow: `0 8px 32px ${project.accentColor}40`,
            }}>
              {project.icon}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function ProjectCard({ project, index, onNavigate }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.1 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(36px)',
        transition: `opacity 0.65s ease ${index * 100}ms, transform 0.75s cubic-bezier(.22,1,.36,1) ${index * 100}ms`,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16,
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        transition: `opacity 0.65s ease ${index * 100}ms, transform 0.75s cubic-bezier(.22,1,.36,1) ${index * 100}ms, box-shadow 0.25s ease, border-color 0.25s ease`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${project.accentColor}30`
        e.currentTarget.style.boxShadow = `0 0 40px ${project.accentColor}12`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <ProjectImage project={project} />

      <div style={{ padding: '22px 24px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Name + tagline */}
        <div style={{ marginBottom: 12 }}>
          <h3 style={{
            fontSize: 18, fontWeight: 700, color: '#f5f5f5',
            margin: '0 0 4px', letterSpacing: '-0.01em',
          }}>
            {project.name}
          </h3>
          <span style={{ fontSize: 12, color: project.accentColor, fontWeight: 500 }}>
            {project.tagline}
          </span>
        </div>

        {/* Description */}
        <p style={{
          fontSize: 13.5, color: 'rgba(255,255,255,0.52)',
          lineHeight: 1.65, margin: '0 0 18px',
        }}>
          {project.description}
        </p>

        {/* Metrics row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
          {project.metrics.map((m, i) => (
            <div key={i} style={{
              padding: '6px 12px', borderRadius: 8,
              background: `${project.accentColor}12`,
              border: `1px solid ${project.accentColor}25`,
            }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: project.accentColor }}>{m.v}</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginLeft: 5 }}>{m.l}</span>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {project.tags.map(t => (
            <span key={t} style={{
              fontSize: 10.5, color: 'rgba(255,255,255,0.38)',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '3px 8px', borderRadius: 999,
              letterSpacing: '0.03em',
            }}>
              {t}
            </span>
          ))}
        </div>

        {/* Action buttons */}
        {(project.link || project.hasDetail) && (
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block', padding: '9px 18px', borderRadius: 8,
                  fontSize: 12.5, fontWeight: 600,
                  background: project.accentColor, color: '#0a0a0a',
                  textDecoration: 'none',
                  boxShadow: `0 0 14px ${project.accentColor}40`,
                }}
              >
                Try {project.name}
              </a>
            )}
            {project.hasDetail && (
              <button
                onClick={() => onNavigate && onNavigate('nourish')}
                style={{
                  padding: '9px 18px', borderRadius: 8,
                  fontSize: 12.5, fontWeight: 600,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s, color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = '#f5f5f5' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
              >
                {project.name} Overview
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Projects({ onNavigate }) {
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
    <section style={{ background: 'rgba(10,10,10,0.85)', padding: isMobile ? '24px 0 48px' : '40px 0 80px' }} id="projects">
      {/* Subtle divider */}
      <div style={{
        height: 1,
        background: 'linear-gradient(to right, transparent, rgba(250,204,21,0.15), transparent)',
        marginBottom: isMobile ? 32 : 48,
      }} />

      <div style={{ maxWidth: 1320, margin: '0 auto', padding: isMobile ? '0 24px' : '0 64px' }}>

        {/* Section header */}
        <div
          ref={titleRef}
          style={{
            marginBottom: 56,
            opacity: titleVisible ? 1 : 0,
            transform: titleVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease, transform 0.7s cubic-bezier(.22,1,.36,1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#facc15', boxShadow: '0 0 8px #facc15', display: 'inline-block',
            }} />
            <span style={{
              fontSize: 11, fontWeight: 600, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: '#facc15',
            }}>
              Projects
            </span>
          </div>
          <TypedHeading text="Things I've built." style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 800, color: '#f5f5f5',
            letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0,
          }} />
          <p style={{
            fontSize: 16, color: 'rgba(255,255,255,0.38)',
            marginTop: 12, maxWidth: 480,
          }}>
            Side projects at the intersection of AI, product thinking, and real user problems.
          </p>
        </div>

        {/* Cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24,
        }}>
          {PROJECTS.map((p, i) => <ProjectCard key={p.id} project={p} index={i} onNavigate={onNavigate} />)}
        </div>
      </div>
    </section>
  )
}
