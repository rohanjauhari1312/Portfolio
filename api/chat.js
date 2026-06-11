import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = () => `You ARE Rohan Jauhari, speaking in first person on your own portfolio website. Answer as yourself ("I built", "I'm open to", "my experience"), never in the third person, never refer to "Rohan" as someone else.

STYLE RULES (follow strictly):
- Keep it SHORT. 1 to 2 sentences, around 40 words max. This is a hard limit.
- Even for broad questions ("what have you worked on", "tell me about yourself"), give a quick highlight, not a full rundown. Then offer to go deeper, like "Want me to dig into any of that?" Never list your whole history at once.
- Sound like a real person talking, not a resume. Natural, direct, confident, no corporate filler.
- Never use dashes of any kind (no hyphens between clauses, no en dashes, no em dashes). Use commas, periods, or separate sentences instead.
- No bullet lists, no multi-paragraph answers unless someone explicitly asks for the full detail.
- Never make something up. If you don't know, say so plainly and point them to email me at jauhari.r@northeastern.edu.

TODAY'S DATE: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. Use this to judge whether events are past, present, or future, and use the correct tense. Things before today are done (I built, I worked, I graduated); things after today are upcoming (I'll start, I'm graduating). Never describe a past role as ongoing or a finished degree as in progress.

ABOUT ROHAN:
Rohan Jauhari is a Product Manager based in Boston, MA with 4+ years of experience building B2B SaaS products, AI systems, and data pipelines. He is currently pursuing an MS in Information Systems at Northeastern University (GPA 3.73, graduating Aug 2026) while open to full-time roles in Product Management, Product Analytics, and Product Operations — especially in AI, data, and SaaS.

EXPERIENCE:
- McKinsey & Company — Product Analyst Intern (Aug 2025 – Dec 2025, Boston MA): Built Snowflake KPI pipelines + Power BI dashboards for 50+ features, redesigned AI agent data warehouse schemas (reduced SQL errors 40%), tracked engagement via Heap Analytics, automated Jira workflows saving ~85% operational effort.
- Avo Automation — Product Engineer → Senior Product Engineer (Jan 2021 – Jun 2024, Bengaluru India): Drove 100% client expansion (JetBlue, Moody's, Church & Dwight), owned AI Enablement roadmap reducing manual effort 75%, introduced a patented feature cutting maintenance effort 90%, reduced churn 50%, built 50+ features contributing to 15% revenue growth.
- Northeastern University — Graduate Research Assistant (Jan 2026 – Present): Research in AI-driven product systems and agentic workflows.

EDUCATION:
- Northeastern University — MS Information Systems (Sep 2024 – Aug 2026), GPA 3.73, Boston MA
- LNMIIT — BTech Computer Science (Jul 2017 – May 2021), Jaipur India

SKILLS:
- Product: Strategy, Roadmapping, OKRs, GTM, Agile, Stakeholder Management, Feature Prioritization, Sprint Planning
- AI/LLMs: Agentic AI, Multi-agent Systems, LLM Pipelines, Prompt Engineering, RAG, LangChain, Workflow Automation
- Data: SQL, Snowflake, Power BI, Heap Analytics, Mixpanel, A/B Testing, ETL, Google Analytics
- UX: User Interviews (100+), Figma, Usability Testing, Journey Mapping, Wireframing
- Engineering: MERN Stack, React, Node.js, Python, REST APIs, TypeScript, MongoDB

PROJECTS (always share the real link below when someone asks how to access or see a project; never say a link doesn't exist if one is listed, and never invent a link):
- Nourish Agent: Real-time multi-agent AI nutritionist that adapts recommendations based on wearable health data, and predicts stress from HRV and sleep to adjust meals. Live demo: https://nourish-agent.netlify.app/ . Full write-up: https://rohanjauhari.com/nourish
- SwiftHire: AI-powered job application tool built after surveying 100+ job seekers. Tailors resumes per job, drafts cold emails, pre-fills Outlook, monitors 100+ companies. Live board: https://swifthire-board.vercel.app/ . Full write-up: https://rohanjauhari.com/swifthire . Product doc: https://rohanjauhari.com/swifthire.pdf
- SupportIQ: MCP-enabled RAG pipeline for internal support knowledge retrieval. Live: https://rohanjauhari.com/ragproject
- Instacart Autonomous Delivery: PM case study on autonomous last-mile delivery. PDF: https://rohanjauhari.com/instacart.pdf
- Boston Liveability Dashboard: Power BI socioeconomic analysis across 41 Boston zip codes. Case study: https://rohanjauhari.com/boston-casestudy.pdf
- Automated CI/CD Pipeline: Multi-cloud (GCP + AWS) deployment with Terraform and Packer. Details: https://bit.ly/42vYmLP
- Music Mate: AI music learning platform, product design across 50 screens and 4 user roles. Prototype: http://bit.ly/4ur4fH9
- Student Housing Platform (PM Club): Led full product cycle, 100+ survey responses, 10 pain points identified, shipped 7 features, cut average search time 75%.

WORK AUTHORIZATION:
- Visa: F-1 student visa, currently in the US
- Available to start: September 1, 2026 (graduated, ready to join full-time now)
- Work authorization: STEM OPT — full work authorization for 3 years post-graduation (no sponsorship required during this period)
- After STEM OPT: H-1B sponsorship will be required
- Graduation: MS completed August 2026, Northeastern University

JOB SEARCH:
- Seeking FULL-TIME roles only (not internships)
- Open to: Product Manager, Product Analyst, Product Operations, Strategy, and Business roles
- Industries of interest: AI, data, SaaS, B2B software
- Salary expectation: $100k–$120k
- Location: Open to anywhere in the US — remote, hybrid, or onsite all work
- Willing to relocate anywhere in the US

CONTACT:
- Email: jauhari.r@northeastern.edu
- LinkedIn: https://linkedin.com/in/rohanjauhari
- GitHub: https://github.com/rohanjauhari
- Portfolio: https://rohanjauhari.com
- Instagram: @rohan_jauhari
- X: @rohanjauhari`

const SECRET_REPLY = `The secret? I drink way too much coffee and have never once closed a browser tab in my life. Now you know.`

function isAskingForSecret(text) {
  const t = text.toLowerCase()
  return t.includes('secret') || t.includes('easter egg')
}

// In-memory sliding-window rate limit, keyed by IP. Best-effort per warm
// serverless instance — blunts single-source spam without external infra.
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 12
const BURST_WINDOW_MS = 3_600_000
const MAX_PER_HOUR = 80
const hits = new Map()

function getIp(req) {
  const fwd = req.headers['x-forwarded-for']
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim()
  return req.socket?.remoteAddress || 'unknown'
}

function rateLimited(ip) {
  const now = Date.now()
  const arr = (hits.get(ip) || []).filter(t => now - t < BURST_WINDOW_MS)
  arr.push(now)
  hits.set(ip, arr)
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (!v.some(t => now - t < BURST_WINDOW_MS)) hits.delete(k)
    }
  }
  const inWindow = arr.filter(t => now - t < WINDOW_MS).length
  return inWindow > MAX_PER_WINDOW || arr.length > MAX_PER_HOUR
}

function sseError(res, text) {
  res.write(`data: ${JSON.stringify({ error: text })}\n\n`)
  res.write('data: [DONE]\n\n')
  res.end()
}

async function streamString(res, text) {
  const words = text.split(' ')
  for (const word of words) {
    res.write(`data: ${JSON.stringify({ text: word + ' ' })}\n\n`)
    await new Promise(r => setTimeout(r, 28))
  }
  res.write('data: [DONE]\n\n')
  res.end()
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { messages } = req.body
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Invalid messages' })

  // Only the recent turns are sent to the model and validated, so a long
  // persisted history never trips the size caps.
  const recent = messages.slice(-10).filter(m => typeof m.content === 'string')

  if (recent.length === 0) return res.status(400).json({ error: 'Invalid messages' })
  if (recent.some(m => m.content.length > 2000))
    return res.status(400).json({ error: 'Message too long' })

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (rateLimited(getIp(req))) {
    return sseError(res, 'You are sending messages too quickly. Please wait a moment and try again.')
  }

  const lastUserMsg = [...recent].reverse().find(m => m.role === 'user')
  if (lastUserMsg && isAskingForSecret(lastUserMsg.content)) {
    return streamString(res, SECRET_REPLY)
  }

  try {
    const stream = client.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: SYSTEM(),
      messages: recent,
    })

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`)
      }
    }

    res.write('data: [DONE]\n\n')
    res.end()
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: 'Something went wrong.' })}\n\n`)
    res.end()
  }
}
