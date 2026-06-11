import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `You are a concise assistant on Rohan Jauhari's personal portfolio website. Answer questions about Rohan professionally and accurately based on the information below. Keep responses short — 2-4 sentences max unless a detailed answer is genuinely needed. Never make up information. If you don't know something, say so and suggest contacting Rohan directly.

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

PROJECTS:
- Nourish Agent: Real-time multi-agent AI nutritionist that adapts recommendations based on wearable health data. Built with agentic architecture — specialized agents coordinate to personalize diet plans dynamically. Live at nourish-agent.netlify.app.
- SwiftHire: AI-powered job application tool built after surveying 100+ job seekers. Automates resume tailoring, application tracking, and workflow optimization.
- Student Housing Platform (PM Club): Led full product cycle — 100+ survey responses, 10 pain points identified, shipped 7 features, cut average search time 75%.

WORK AUTHORIZATION:
- Visa: F-1 student visa, currently in the US
- Available to start: September 1, 2026 (graduated, ready to join full-time now)
- Work authorization: STEM OPT — full work authorization for 3 years post-graduation (no sponsorship required during this period)
- After STEM OPT: H-1B sponsorship will be required
- Graduation: MS completed August 2026, Northeastern University

JOB SEARCH:
- Seeking FULL-TIME roles only (not internships)
- Open to: Product Manager, Product Analyst, Product Operations roles
- Industries of interest: AI, data, SaaS, B2B software
- Salary expectation: $100k–$120k
- Location: Open to anywhere in the US — remote, hybrid, or onsite all work
- Willing to relocate anywhere in the US

CONTACT:
- Email: jauhari.r@northeastern.edu
- LinkedIn: linkedin.com/in/rohanjauhari
- GitHub: github.com/rohanjauhari
- Instagram: @rohan_jauhari
- X: @rohanjauhari`

const SECRET_REPLY = `The secret? Rohan drinks way too much coffee and has never once closed a browser tab in his life. Now you know.`

function isAskingForSecret(text) {
  const t = text.toLowerCase()
  return t.includes('secret') || t.includes('easter egg')
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

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('Access-Control-Allow-Origin', '*')

  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
  if (lastUserMsg && isAskingForSecret(lastUserMsg.content)) {
    return streamString(res, SECRET_REPLY)
  }

  try {
    const stream = client.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: SYSTEM,
      messages: messages.slice(-10),
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
