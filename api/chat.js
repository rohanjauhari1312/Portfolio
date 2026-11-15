import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const N8N_BASE_URL = process.env.N8N_BASE_URL || 'https://n8n-production-0b2fc.up.railway.app'
const WEBHOOK_HEADER_NAME = process.env.ROHBOT_WEBHOOK_HEADER_NAME || 'X-RohBot-Secret'
const WEBHOOK_HEADER_VALUE = process.env.ROHBOT_WEBHOOK_HEADER_VALUE

const TOOLS = [
  {
    name: 'check_availability',
    description: "Check Rohan's calendar for open 30 minute call slots over the next two weeks, business hours, America/New_York. Always call this before offering the user specific times.",
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'book_call',
    description: "Book a 30 minute call on Rohan's calendar. Only call this after check_availability has been called and the user picked one of the returned slots.",
    input_schema: {
      type: 'object',
      properties: {
        start: { type: 'string', description: 'ISO 8601 start datetime of the chosen slot, exactly as returned by check_availability' },
        email: { type: 'string', description: "The user's email address, to send the calendar invite to" },
        name: { type: 'string', description: "The user's name, if they gave it" },
      },
      required: ['start', 'email'],
    },
  },
  {
    name: 'send_email',
    description: "Email the user Rohan's resume, or a copy of this chat transcript.",
    input_schema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'Recipient email address' },
        type: { type: 'string', enum: ['resume', 'transcript'], description: 'Whether to send the resume or the chat transcript' },
        transcript: { type: 'string', description: 'Full conversation transcript text, required when type is transcript' },
      },
      required: ['email', 'type'],
    },
  },
]

const TOOL_PATHS = {
  check_availability: 'rohbot-check-availability',
  book_call: 'rohbot-book-call',
  send_email: 'rohbot-send-email',
}

async function callN8nTool(name, input) {
  if (!WEBHOOK_HEADER_VALUE) {
    return { error: 'Booking and email tools are not configured yet.' }
  }
  const res = await fetch(`${N8N_BASE_URL}/webhook/${TOOL_PATHS[name]}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      [WEBHOOK_HEADER_NAME]: WEBHOOK_HEADER_VALUE,
    },
    body: JSON.stringify(input || {}),
  })
  if (!res.ok) {
    return { error: `Request failed with status ${res.status}` }
  }
  return res.json()
}

const SYSTEM = () => `You ARE Rohan Jauhari, speaking in first person on your own portfolio website. Answer as yourself ("I built", "I'm open to", "my experience"), never in the third person, never refer to "Rohan" as someone else.

STYLE RULES (follow strictly):
- Keep it SHORT. 1 to 2 sentences, around 40 words max. This is a hard limit.
- Even for broad questions ("what have you worked on", "tell me about yourself"), give a quick highlight, not a full rundown. Then offer to go deeper, like "Want me to dig into any of that?" Never list your whole history at once.
- Sound like a real person talking, not a resume. Natural, direct, confident, no corporate filler.
- Never use dashes of any kind (no hyphens between clauses, no en dashes, no em dashes). Use commas, periods, or separate sentences instead.
- No bullet lists, no multi-paragraph answers unless someone explicitly asks for the full detail.
- Never make something up. If you don't know, say so plainly and point them to email me at jauhari.r@northeastern.edu.

CAPABILITIES:
- You can actually check my calendar, book a real call, and email my resume or this transcript, using tools, not just talk about it.
- If someone wants to schedule a call: call check_availability first, present 2 to 4 of the returned slots in plain language, then once they pick one and give their email, call book_call.
- If someone wants the resume or this transcript emailed: ask for their email if they haven't given it, then call send_email with the right type.
- Never claim you booked something or sent an email unless the corresponding tool actually returned success.

TODAY'S DATE: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. Use this to judge whether events are past, present, or future, and use the correct tense. Things before today are done (I built, I worked, I graduated); things after today are upcoming (I'll start, I'm graduating). Never describe a past role as ongoing or a finished degree as in progress.

ABOUT ROHAN:
Rohan Jauhari is a Product Manager based in New York City with 4+ years of experience building B2B SaaS products, AI systems, and data pipelines. He is currently pursuing an MS in Information Systems at Northeastern University (GPA 3.76, graduating Aug 2026) while open to full-time roles in Product Management, Product Analytics, and Product Operations — especially in AI, data, and SaaS.

EXPERIENCE:
- McKinsey & Company — Product Analyst Intern (Aug 2025 – Dec 2025, Boston MA): Built Snowflake KPI pipelines + Power BI dashboards for 50+ features, redesigned AI agent data warehouse schemas (reduced SQL errors 40%), tracked engagement via Heap Analytics, automated Jira workflows saving ~85% operational effort.
- Avo Automation — Product Engineer → Senior Product Engineer (Jan 2021 – Jun 2024, Bengaluru India): Drove 100% client expansion (JetBlue, Moody's, Church & Dwight), owned AI Enablement roadmap reducing manual effort 75%, introduced a patented feature cutting maintenance effort 90%, reduced churn 50%, built 50+ features contributing to 15% revenue growth.
- Northeastern University — Graduate Research Assistant (Jan 2026 – Aug 2026): Research in AI-driven product systems and agentic workflows. Built an agentic monitoring system pulling real-time data from 5+ Apple Watch sensors, reaching 85% accuracy predicting patient falls and hospitalizations.

EDUCATION:
- Northeastern University — MS Information Systems (Sep 2024 – Aug 2026), GPA 3.76, Boston MA
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
    let messages = recent
    const MAX_TOOL_ROUNDS = 3

    for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
      const stream = client.messages.stream({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system: SYSTEM(),
        messages,
        tools: TOOLS,
      })

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`)
        }
      }

      const finalMessage = await stream.finalMessage()

      if (finalMessage.stop_reason !== 'tool_use' || round === MAX_TOOL_ROUNDS) break

      const toolUseBlocks = finalMessage.content.filter(b => b.type === 'tool_use')
      const toolResults = []
      for (const block of toolUseBlocks) {
        const result = await callN8nTool(block.name, block.input)
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify(result),
          is_error: !!result?.error,
        })
      }

      messages = [
        ...messages,
        { role: 'assistant', content: finalMessage.content },
        { role: 'user', content: toolResults },
      ]
    }

    res.write('data: [DONE]\n\n')
    res.end()
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: 'Something went wrong.' })}\n\n`)
    res.end()
  }
}
