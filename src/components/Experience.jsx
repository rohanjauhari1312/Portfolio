import { useEffect, useRef, useState } from 'react'
import TypedHeading from './TypedHeading'
import useIsMobile from '../hooks/useIsMobile'
import { trackSection, trackExternalLink } from '../hooks/useAnalytics'

const JOBS = [
  {
    id: 'mckinsey',
    company: 'McKinsey & Company',
    href: 'https://www.mckinsey.com',
    logo: '/mckinsey.png',
    accentColor: '#1a73e8',
    bgColor: 'rgba(26,115,232,0.13)',
    role: 'Product Analyst Co-op (AI/ML Products)',
    period: 'Aug 2025 – Dec 2025',
    location: 'Boston, MA',
    type: 'Co-op',
    highlights: [
      'Built an end-to-end data product covering 50+ feature-level KPIs from raw sources to leadership dashboards, directly informing quarterly roadmap prioritization decisions',
      'Identified adoption gaps and surfaced optimization opportunities by analyzing engagement across 100+ product metrics using Heap Analytics, shaping the next planning cycle',
      'Reduced manual analysis effort by 60% by defining requirements for and shipping an AI agent that translated natural language queries into SQL, enabling non-technical PMs to self-serve data',
    ],
    tags: ['SQL', 'Snowflake', 'Power BI', 'Heap Analytics', 'AI Agents'],
    metrics: [
      { v: '50+', l: 'KPIs tracked' },
      { v: '60%', l: 'Analysis effort cut' },
      { v: '100+', l: 'Metrics analyzed' },
    ],
  },
  {
    id: 'avo',
    company: 'Avo Automation',
    href: 'https://avoautomation.com',
    description: 'Growth Stage · B2B No-code Automation SaaS',
    logo: '/avo.jpeg',
    accentColor: '#a855f7',
    bgColor: 'rgba(168,85,247,0.13)',
    role: 'Product Engineer → Senior Product Engineer',
    period: 'Aug 2021 – Jul 2024',
    location: 'Bengaluru, India',
    type: 'Full-time',
    highlights: [
      'Cut total manual effort by 90% by owning AI enablement end-to-end: defined the roadmap, presented strategy to VP and Director stakeholders, and led 6 engineers and 2 designers to ship',
      'Drove 33% expansion in clientele by validating market opportunities, sizing use cases per segment, and developing tailored roadmaps and user journeys to capture them',
      'Owned PRD authoring and cross-functional execution across 50+ features, coordinating engineering, design, and go-to-market to ship on time',
      'Reduced churn by 50% by building a structured feedback loop with stakeholders to surface and resolve issues across 100+ product areas and features',
    ],
    tags: ['SaaS', 'AI Enablement', 'B2B', 'Roadmapping', 'PRDs'],
    metrics: [
      { v: '90%', l: 'Effort cut' },
      { v: '33%', l: 'Client growth' },
      { v: '50%', l: 'Churn reduced' },
    ],
  },
  {
    id: 'northeastern',
    company: 'Northeastern University',
    logo: '/northeastern.png',
    accentColor: '#ef4444',
    bgColor: 'rgba(239,68,68,0.13)',
    role: 'Research Assistant [Agentic Systems, Health Monitoring]',
    period: 'Jan 2026 – Present',
    location: 'Boston, MA',
    type: 'Research',
    highlights: [
      'Built an agentic monitoring system pulling real-time data from 5+ Apple Watch sensors, reaching 85% accuracy predicting patient falls and hospitalizations',
    ],
    tags: ['Agentic AI', 'Apple Watch', 'Health Monitoring', 'Research'],
    metrics: [
      { v: '85%', l: 'Prediction accuracy' },
      { v: '5+', l: 'Apple Watch sensors' },
    ],
  },
]

function JobCard({ job, index, isMobile }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.08 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.6s ease ${index * 120}ms, transform 0.7s cubic-bezier(.22,1,.36,1) ${index * 120}ms`,
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${job.accentColor}22`,
        borderLeft: `3px solid ${job.accentColor}`,
        borderRadius: 16,
        padding: isMobile ? '20px' : '28px 32px',
        backdropFilter: isMobile ? 'none' : 'blur(8px)',
        WebkitBackdropFilter: isMobile ? 'none' : 'blur(8px)',
        boxShadow: `0 0 0 1px ${job.accentColor}08, 0 4px 24px ${job.accentColor}0a`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 18 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 12, flexShrink: 0,
          background: '#fff', padding: 3,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 14px rgba(0,0,0,0.28)', overflow: 'hidden',
        }}>
          <img src={job.logo} alt={job.company} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {job.href ? (
              <a
                href={job.href}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackExternalLink(job.href, job.company)}
                style={{
                  fontSize: isMobile ? 15 : 17, fontWeight: 700, color: '#f5f5f5',
                  letterSpacing: '-0.01em', textDecoration: 'none',
                  borderBottom: '1px dashed rgba(255,255,255,0.18)',
                  transition: 'color 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#facc15'; e.currentTarget.style.borderBottomColor = 'rgba(250,204,21,0.6)' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#f5f5f5'; e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.18)' }}
              >
                {job.company}
              </a>
            ) : (
              <span style={{ fontSize: isMobile ? 15 : 17, fontWeight: 700, color: '#f5f5f5', letterSpacing: '-0.01em' }}>
                {job.company}
              </span>
            )}
            <span style={{
              fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
              color: job.accentColor, background: job.bgColor,
              padding: '3px 9px', borderRadius: 999, textTransform: 'uppercase',
            }}>
              {job.type}
            </span>
          </div>
          {job.description && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              marginTop: 6,
              padding: '3px 10px',
              borderRadius: 6,
              background: job.bgColor,
              border: `1px solid ${job.accentColor}30`,
              fontSize: 11.5, fontWeight: 600,
              color: job.accentColor,
              letterSpacing: '0.02em',
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: job.accentColor, boxShadow: `0 0 6px ${job.accentColor}` }} />
              {job.description}
            </div>
          )}
          <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>
            {job.role}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.32)', marginTop: 4, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span>{job.period}</span>
            <span>·</span>
            <span>{job.location}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        {job.metrics.map((m, i) => (
          <div key={i} style={{
            padding: '8px 14px', borderRadius: 10,
            background: job.bgColor,
            border: `1px solid ${job.accentColor}25`,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: job.accentColor, lineHeight: 1.1 }}>{m.v}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', marginTop: 2, letterSpacing: '0.04em' }}>{m.l}</div>
          </div>
        ))}
      </div>

      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {job.highlights.map((h, i) => (
          <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{
              width: 5, height: 5, borderRadius: '50%', flexShrink: 0, marginTop: 7,
              background: job.accentColor, opacity: 0.7,
            }} />
            <span style={{ fontSize: isMobile ? 13 : 13.5, color: 'rgba(255,255,255,0.62)', lineHeight: 1.65 }}>{h}</span>
          </li>
        ))}
      </ul>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 18 }}>
        {job.tags.map(t => (
          <span key={t} style={{
            fontSize: 11, color: 'rgba(255,255,255,0.42)',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.09)',
            padding: '3px 9px', borderRadius: 999,
            letterSpacing: '0.03em',
          }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Experience() {
  const [titleVisible, setTitleVisible] = useState(false)
  const titleRef = useRef(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTitleVisible(true); trackSection('work_experience'); obs.disconnect() } },
      { threshold: 0.1 }
    )
    if (titleRef.current) obs.observe(titleRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section style={{ background: 'rgba(10,10,10,0.85)', padding: isMobile ? '24px 0 48px' : '40px 0 80px' }} id="work">
      <div style={{
        height: 1,
        background: 'linear-gradient(to right, transparent, rgba(250,204,21,0.12), transparent)',
        marginBottom: isMobile ? 32 : 48,
      }} />
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: isMobile ? '0 24px' : '0 64px' }}>

        <div
          ref={titleRef}
          style={{
            marginBottom: 48,
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
              Work Experience
            </span>
          </div>
          <TypedHeading text="Where I've shipped." style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 800, color: '#f5f5f5',
            letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0,
          }} />
          <p style={{
            fontSize: isMobile ? 14 : 16, color: 'rgba(255,255,255,0.38)',
            marginTop: 12, maxWidth: 480,
          }}>
            From growth-stage SaaS to McKinsey, building products that move metrics.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {JOBS.map((job, i) => <JobCard key={job.id} job={job} index={i} isMobile={isMobile} />)}
        </div>
      </div>
    </section>
  )
}
