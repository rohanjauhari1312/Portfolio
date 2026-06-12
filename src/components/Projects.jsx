import { useEffect, useRef, useState } from 'react'
import TypedHeading from './TypedHeading'
import useIsMobile from '../hooks/useIsMobile'
import { trackSection, trackExternalLink, trackClick } from '../hooks/useAnalytics'

const PROJECTS = [
  {
    id: 'rohbot',
    image: '/emoji.png',
    imageFit: 'contain',
    imageBg: '#b6babd',
    link: '/rohbot',
    linkLabel: 'Talk to it',
    hasDetail: 'voice-agent',
    name: 'RohBot',
    tagline: 'AI Voice Agent in My Own Voice',
    bullets: [
      'A **live voice agent** on this site that answers in my cloned voice, knows my work, and takes real actions while you talk',
      'Checks my **calendar and books a call**, emails you my **resume or the transcript**, and opens project pages on your screen mid-conversation',
      'Built on **ElevenLabs voice + Claude + RAG** over my case studies, with **n8n** wiring up Google Calendar and Gmail behind the scenes',
    ],
    gradient: 'linear-gradient(135deg, #0a0f1a 0%, #0f2240 50%, #1a3a6b 100%)',
    iconBg: 'linear-gradient(135deg, #1d4ed8, #60a5fa)',
    icon: 'R',
    accentColor: '#60a5fa',
    tags: ['Voice AI', 'ElevenLabs', 'Claude', 'RAG', 'n8n', 'Tool calling'],
    metrics: [
      { v: 'Voice', l: 'In my cloned voice' },
      { v: 'Live', l: 'Books calls, emails you' },
      { v: 'RAG', l: 'Over my case studies' },
    ],
    status: 'Personal Project',
  },
  {
    id: 'nourish',
    image: '/nourish.jpeg',
    link: 'https://nourish-agent.netlify.app/',
    hasDetail: 'nourish',
    name: 'Nourish Agent',
    tagline: 'Multi-agent AI Nutritionist',
    bullets: [
      'Orchestrated **multiple specialized agents** (meal planner, grocery optimizer, health analyzer) coordinating in real time',
      'Synced **live wearable data** (activity, sleep, heart rate) to dynamically adapt nutrition recommendations',
      'Predicts **stress levels** from HRV and sleep patterns via a lightweight ML model, then adjusts meal timing, macros, and hydration targets accordingly',
      '**Personalization loop** updates diet plans without manual re-entry as user lifestyle data changes',
    ],
    gradient: 'linear-gradient(135deg, #052e16 0%, #14532d 50%, #166534 100%)',
    iconBg: 'linear-gradient(135deg, #16a34a, #4ade80)',
    icon: 'N',
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
    link: 'https://swifthire-board.vercel.app/',
    linkLabel: 'Try it',
    hasDetail: 'swifthire',
    extraLinks: [
      { label: 'Product Doc', href: '/swifthire.pdf' },
    ],
    name: 'SwiftHire',
    tagline: 'Automated Job Search Pipeline',
    bullets: [
      'Resume is rewritten per JD by Claude, cold email is drafted, **Outlook is pre-filled** with the right contact. You read, attach, send',
      'Python poller checks Greenhouse and Ashby APIs every 15 min; Chrome extension **auto-downloads the tailored resume** from Claude and looks up a recruiter on Apollo',
      'From job alert to a **cold email sitting in Outlook drafts**, automated in under 10 minutes, with three decisions left for the human',
    ],
    gradient: 'linear-gradient(135deg, #1c1400 0%, #713f12 50%, #a16207 100%)',
    iconBg: 'linear-gradient(135deg, #ca8a04, #facc15)',
    icon: 'W',
    accentColor: '#facc15',
    tags: ['AI', 'Automation', 'Python', 'Chrome Extension', 'Claude API'],
    metrics: [
      { v: '100+', l: 'Companies monitored' },
      { v: '15 min', l: 'Polling interval' },
      { v: '< 10 min', l: 'Alert to cold email' },
    ],
    status: 'Personal Project',
  },
  {
    id: 'supportiq',
    image: '/rag.png',
    link: 'https://rohanjauhari.com/ragproject',
    name: 'SupportIQ',
    tagline: 'MCP-Enabled RAG Pipeline for Internal Support Knowledge Retrieval',
    bullets: [
      'Indexed internal docs and past support tickets into a **vector store**; reps query in plain English and get **cited answers** instantly',
      'Designed retrieval as an **MCP-compatible tool** so the knowledge base plugs into any LLM workflow without rework',
      'Defined eval metrics to track **answer accuracy** and measure **time-to-resolution** improvement over baseline',
    ],
    gradient: 'linear-gradient(135deg, #0f0a2e 0%, #1e1060 50%, #2d1b8a 100%)',
    iconBg: 'linear-gradient(135deg, #6d28d9, #a78bfa)',
    icon: 'S',
    accentColor: '#a78bfa',
    tags: ['RAG', 'Pinecone', 'LLM', 'MCP', 'Vector DB'],
    metrics: [
      { v: 'RAG', l: 'Pipeline' },
      { v: 'MCP', l: 'Compatible' },
      { v: 'Cited', l: 'Answers' },
    ],
    status: 'Personal Project',
  },
  {
    id: 'instacart',
    image: '/instacart.jpg',
    link: '/instacart.pdf',
    linkLabel: 'View PDF',
    name: 'Instacart Autonomous Delivery',
    tagline: 'Case Study · Autonomous Last-Mile Delivery',
    bullets: [
      'Sized the **autonomous delivery opportunity** for Instacart, segmenting by geography, order density, and regulatory readiness',
      'Synthesized user research to identify **trust and reliability** as the top adoption blockers, shaping feature prioritization',
      'Defined a **phased rollout roadmap** from pilot zones to full network, with **north star metrics** and go/no-go criteria at each stage',
    ],
    gradient: 'linear-gradient(135deg, #1a0a00 0%, #7c2d00 50%, #c2410c 100%)',
    iconBg: 'linear-gradient(135deg, #ea580c, #fb923c)',
    icon: 'I',
    accentColor: '#fb923c',
    tags: ['Case Study', 'Autonomous Delivery', 'GTM', 'Roadmapping', 'Opportunity Sizing'],
    metrics: [
      { v: 'B2C', l: 'Consumer product' },
      { v: 'Phased', l: 'Rollout strategy' },
      { v: 'Full', l: 'PM case study' },
    ],
    status: 'Case Study',
  },
  {
    id: 'boston',
    image: '/social-satellite-boston.jpg',
    link: '/boston-casestudy.pdf',
    linkLabel: 'Case Study',
    name: 'Boston Liveability Dashboard',
    tagline: 'Power BI · Socioeconomic Analysis · 41 Zip Codes',
    bullets: [
      'Collected socioeconomic data across 41 Boston zip codes via **US Census API**: income, education, unemployment, home values, and density',
      'Built a **min-max normalization pipeline** in Excel with a weighted composite score (income 30%, unemployment 25%, education 20%)',
      'Shipped an interactive **Power BI dashboard** with choropleth maps, ranked bar charts, and a variable selector across all 5 dimensions',
    ],
    gradient: 'linear-gradient(135deg, #0a0f1a 0%, #0f2240 50%, #1a3a6b 100%)',
    iconBg: 'linear-gradient(135deg, #1d4ed8, #60a5fa)',
    icon: 'B',
    accentColor: '#60a5fa',
    tags: ['Power BI', 'Data Analysis', 'Census API', 'Excel', 'Normalization'],
    metrics: [
      { v: '41', l: 'Zip codes' },
      { v: '5', l: 'Dimensions' },
      { v: 'Weighted', l: 'Composite score' },
    ],
    extraLinks: [
      { label: 'Dashboard PDF', href: '/boston-dashboard.pdf' },
    ],
    status: 'Academic Project',
  },
  {
    id: 'cicd',
    image: '/5482333126245804d5657c.png',
    imageFit: 'contain',
    imagePad: '0',
    imageBg: '#e8f4f4',
    imageFilter: 'contrast(1.8) saturate(1.1)',
    imageHeight: 220,
    link: 'https://bit.ly/42vYmLP',
    linkLabel: 'View Project',
    name: 'Automated CI/CD Pipeline',
    tagline: 'Cloud Deployment · GCP + AWS · Infrastructure-as-Code',
    bullets: [
      'Provisioned **AWS S3, EC2, GCE, and RDS** on VPCs using Terraform and Packer, building a distributed multi-cloud deployment architecture from scratch',
      'Implemented **agile auto-scaling** for EC2 instances driven by dynamic load and health check results via a load balancer, cutting idle compute cost',
      'Enforced **end-to-end testing, security scanning, and observability** on every code merge, eliminating manual deployment steps entirely',
    ],
    gradient: 'linear-gradient(135deg, #001a1a 0%, #0e4040 50%, #0f766e 100%)',
    iconBg: 'linear-gradient(135deg, #0d9488, #22d3ee)',
    icon: 'C',
    accentColor: '#22d3ee',
    tags: ['GCP', 'AWS', 'Terraform', 'Packer', 'CI/CD', 'IaC', 'Auto-scaling'],
    metrics: [
      { v: 'Multi', l: 'Cloud (GCP + AWS)' },
      { v: 'IaC', l: 'Terraform + Packer' },
      { v: 'Zero', l: 'Manual deployments' },
    ],
    status: 'Academic Project',
  },
  {
    id: 'musicmate',
    image: '/music mate.jpeg',
    link: 'https://www.figma.com/design/ZwDWRu65H6DPSlv1RFEj2A/Final-Project?node-id=0-1&t=DihlCJnJOOP7SwAQ-1',
    linkLabel: 'View in Figma',
    name: 'Music Mate',
    tagline: 'AI-Driven Music Learning Platform · Product Design',
    bullets: [
      'Led UX research across **50 screens and 4 user roles** using storyboarding, empathy mapping, competitive analysis, and persona development',
      'Designed **reusable UI components** aligned with mobile specs and accessibility standards, covering AI tutoring, tutor booking, and peer mentoring flows',
      'Built **interactive end-to-end Figma prototypes** validating 4 complete use case flows including an AI tutor, student dashboard, and admin portal',
    ],
    gradient: 'linear-gradient(135deg, #1a0030 0%, #4a0060 50%, #7c3aed 100%)',
    iconBg: 'linear-gradient(135deg, #7c3aed, #e879f9)',
    icon: 'M',
    accentColor: '#e879f9',
    tags: ['Product Design', 'UX Research', 'Figma', 'Prototyping', 'AI Features', 'Accessibility'],
    metrics: [
      { v: '50', l: 'Screens designed' },
      { v: '4', l: 'User roles' },
      { v: '4', l: 'End-to-end flows' },
    ],
    status: 'Academic Project',
  },
  {
    id: 'housing',
    image: '/housing.jpg',
    name: 'Student Housing Platform',
    tagline: 'PM Club · Full Product Cycle',
    bullets: [
      'Analyzed **100+ survey responses** to identify **10 distinct pain points** across the student housing search process',
      'Defined **north star and counter metrics**, then mapped each to specific feature bets in the roadmap',
      'Shipped **7 features** that cut average search time by **75%** from baseline',
    ],
    gradient: 'linear-gradient(135deg, #0c1445 0%, #1e3a8a 50%, #1d4ed8 100%)',
    iconBg: 'linear-gradient(135deg, #2563eb, #60a5fa)',
    icon: 'H',
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

function hl(text, color) {
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <span key={i} style={{ color }}>{p.slice(2, -2)}</span>
      : p
  )
}

function ProjectImage({ project }) {
  const [imgFailed, setImgFailed] = useState(false)
  const showImg = project.image && !imgFailed

  return (
    <div style={{
      width: '100%', height: project.imageHeight || 200,
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
          style={{
            width: '100%', height: '100%', display: 'block',
            objectFit: project.imageFit || 'cover',
            padding: project.imagePad || 0,
            boxSizing: 'border-box',
            background: project.imageBg || 'transparent',
            filter: project.imageFilter || 'none',
          }}
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
        animation: visible ? `floatCard ${4 + index * 0.4}s ease-in-out ${index * 0.7}s infinite` : 'none',
        background: 'rgba(16,16,16,0.92)',
        border: `1px solid ${project.accentColor}30`,
        borderRadius: 16,
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: `0 0 18px ${project.accentColor}18, inset 0 0 0 1px ${project.accentColor}10`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${project.accentColor}90`
        e.currentTarget.style.boxShadow = `0 0 24px ${project.accentColor}80, 0 0 60px ${project.accentColor}45, 0 0 100px ${project.accentColor}20, inset 0 0 0 1px ${project.accentColor}30`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = `${project.accentColor}30`
        e.currentTarget.style.boxShadow = `0 0 18px ${project.accentColor}18, inset 0 0 0 1px ${project.accentColor}10`
      }}
    >
      <ProjectImage project={project} />

      <div style={{ padding: '22px 24px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Name + tagline */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <h3 style={{
              fontSize: 18, fontWeight: 700, color: '#f5f5f5',
              margin: 0, letterSpacing: '-0.01em', marginRight: 2,
            }}>
              {project.name}
            </h3>
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackExternalLink(project.link, `try_${project.id}`)}
                style={{
                  padding: '5px 12px', borderRadius: 7,
                  fontSize: 11.5, fontWeight: 700,
                  background: project.accentColor,
                  color: '#0a0a0a',
                  textDecoration: 'none',
                  letterSpacing: '0.02em',
                  boxShadow: `0 0 14px ${project.accentColor}70, 0 0 28px ${project.accentColor}30`,
                  transition: 'opacity 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.boxShadow = `0 0 22px ${project.accentColor}90, 0 0 44px ${project.accentColor}45` }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.boxShadow = `0 0 14px ${project.accentColor}70, 0 0 28px ${project.accentColor}30` }}
              >
                {project.linkLabel || 'Try it'}
              </a>
            )}
            {project.hasDetail && (
              <button
                onClick={() => { trackClick(`view_project_${project.hasDetail}`, 'projects'); onNavigate && onNavigate(project.hasDetail) }}
                style={{
                  padding: '5px 12px', borderRadius: 7,
                  fontSize: 11.5, fontWeight: 700,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  color: '#f5f5f5',
                  cursor: 'pointer',
                  letterSpacing: '0.02em',
                  transition: 'background 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)' }}
              >
                View Project
              </button>
            )}
            {project.extraLinks && project.extraLinks.map(el => (
              <a
                key={el.href}
                href={el.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '5px 12px', borderRadius: 7,
                  fontSize: 11.5, fontWeight: 600,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.55)',
                  textDecoration: 'none',
                  letterSpacing: '0.02em',
                  transition: 'border-color 0.2s, color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${project.accentColor}60`; e.currentTarget.style.color = project.accentColor }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)' }}
              >
                {el.label}
              </a>
            ))}
          </div>
          <span style={{ fontSize: 12, color: project.accentColor, fontWeight: 500, marginTop: 6, display: 'block' }}>
            {project.tagline}
          </span>
        </div>

        {/* Description */}
        <ul style={{ margin: '0 0 18px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {project.bullets.map((b, i) => (
            <li key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
              <span style={{
                width: 4, height: 4, borderRadius: '50%', flexShrink: 0, marginTop: 6,
                background: project.accentColor, opacity: 0.7,
              }} />
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.52)', lineHeight: 1.65 }}>{hl(b, project.accentColor)}</span>
            </li>
          ))}
        </ul>

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

      </div>
    </div>
  )
}

export default function Projects({ onNavigate }) {
  const [titleVisible, setTitleVisible] = useState(false)
  const titleRef = useRef(null)
  const isMobile = useIsMobile()

  const wobbleStyle = ``

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTitleVisible(true); trackSection('projects'); obs.disconnect() } },
      { threshold: 0.2 }
    )
    if (titleRef.current) obs.observe(titleRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section style={{ background: 'rgba(10,10,10,0.85)', padding: isMobile ? '24px 0 48px' : '40px 0 80px' }} id="projects">
      <style>{`@keyframes floatCard { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }`}</style>
      <style>{wobbleStyle}</style>
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
          <TypedHeading text="What I've shipped." style={{
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
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: isMobile ? 16 : 24,
        }}>
          {PROJECTS.map((p, i) => <ProjectCard key={p.id} project={p} index={i} onNavigate={onNavigate} />)}
        </div>
      </div>
    </section>
  )
}
