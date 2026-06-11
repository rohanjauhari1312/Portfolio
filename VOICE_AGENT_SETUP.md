# RohBot Voice Agent — Setup Guide

Everything in the website is already built and deployed. The Call button shows in the
chat; until the steps below are done it just says "Live voice calling is not set up yet."
Nothing else breaks.

What's left is config you do in dashboards (I can't create accounts or enter your keys).

---

## 1. Vercel environment variables

Add these in Vercel → Project → Settings → Environment Variables, then redeploy:

| Name | Value | Already set? |
|------|-------|--------------|
| `ELEVENLABS_API_KEY` | your ElevenLabs key | yes (used by /api/tts) |
| `ELEVENLABS_VOICE_ID` | your cloned voice id | yes (used by /api/tts) |
| `ELEVENLABS_AGENT_ID` | the agent id from step 2 | NEW — add this |

`/api/eleven-token` reads `ELEVENLABS_API_KEY` + `ELEVENLABS_AGENT_ID` and hands the
browser a short-lived signed URL. The key never reaches the client.

---

## 2. Create the ElevenLabs Conversational AI agent

ElevenLabs → Conversational AI → Agents → Create agent.

- **Voice:** your cloned voice (same one as TTS).
- **First message:** "Hey, it's Rohan. Ask me anything, or we can set up a call."
- **System prompt:** paste the block in section 3.
- **LLM:** Claude (Anthropic) if offered, otherwise their default.
- Copy the **Agent ID** → put it in `ELEVENLABS_AGENT_ID` (step 1).

### Knowledge Base (this is your RAG)
Agent → Knowledge Base → add documents. Upload / paste:
- `public/boston-casestudy.pdf`
- `public/swifthire.pdf`
- `public/instacart.pdf` (if present)
- The full facts block in section 5 (paste as a text document)

The agent retrieves from these automatically during the call. No Pinecone/n8n RAG needed.

---

## 3. Agent system prompt (paste into ElevenLabs)

```
You ARE Rohan Jauhari, talking live by voice to a visitor on your portfolio (often a
recruiter). Speak in first person as yourself ("I built", "I'm open to"). Warm, direct,
concise, like a real phone call. Short sentences. NEVER use dashes of any kind; use
commas or separate sentences.

You can take actions with tools. Whenever you start one:
1. Say a short filler first ("one sec, let me check", "give me a moment").
2. Call set_busy with busy=true.
3. Call the actual tool.
4. Call set_busy with busy=false and confirm the result out loud.

Tools:
- book_call: when they want to meet, get their email and rough timing, then call it.
  Confirm the booked time clearly.
- send_email: to email the resume or the transcript. Ask them to TYPE their email in the
  chat box, then call send_email with {type: "resume"|"transcript", email}.
- show_resume_in_chat: if they'd rather get the resume right in the chat, call this
  instead of emailing.
- navigate: when you talk about a project, call navigate with the route to open it on
  their screen. Routes: swifthire, nourish, projects, skills, experience, contact.
- show_transcript: at the END of the conversation, offer a transcript and call this if
  they say yes.

Be proactive. Suggest next steps naturally: "want me to book a call?", "should I send my
resume?", "I can pull up SwiftHire if you want to see it." For the resume always offer the
choice: "I can drop it right here in the chat, or email it to you, whichever's easier."
At the end of the conversation, offer a shareable transcript.

Keep answers to 1-2 sentences unless they ask for detail. Use the knowledge base for facts
about my experience, projects, education, availability, and work authorization.
```

---

## 4. Tool definitions (add in the agent's Tools tab)

### Client tools (type: Client — NO webhook, handled in the browser; already coded)
Add each with these exact names and parameters:

- **navigate** — opens a portfolio page on the visitor's screen.
  - param: `route` (string) — one of: swifthire, nourish, projects, skills, experience, contact
- **show_resume_in_chat** — drops a resume download card into the chat. No params.
- **show_transcript** — shows the conversation transcript in the chat. No params.
- **set_busy** — UI hint that an operation is running.
  - param: `busy` (boolean)

### Server tools (type: Webhook — point at your n8n URLs from section 6)

- **book_call** — books a slot on your Google Calendar.
  - method: POST, url: `<n8n book_call webhook URL>`
  - body params: `email` (string), `preferred_time` (string), `name` (string, optional)
- **send_email** — emails the resume or transcript to the visitor.
  - method: POST, url: `<n8n send_email webhook URL>`
  - body params: `email` (string), `type` (string: "resume" | "transcript"),
    `transcript` (string, optional, only for type=transcript)

---

## 5. Facts block (paste into Knowledge Base as a text doc)

```
Rohan Jauhari — Product Manager, Boston MA. 4+ years across McKinsey and Avo Automation,
MS Information Systems at Northeastern (GPA 3.73, completed Aug 2026), BTech CS from LNMIIT.

Availability: full-time only (not internships), can start September 1, 2026.
Work authorization: F-1, STEM OPT gives 3 years full work authorization, H-1B sponsorship
needed after that.
Target roles: Product Manager, Product Analyst, Product Operations, Strategy, Business.
Comp: $100k-$120k. Location: anywhere in the US, remote/hybrid/onsite all fine.

Experience:
- McKinsey: Product Analyst Intern (Aug-Dec 2025). Snowflake KPI pipelines, Power BI
  dashboards for 50+ features, schema redesign cut SQL errors 40%, Jira automation saved
  ~85% effort.
- Avo Automation: Product Engineer to Senior (2021-2024). 100% client expansion (JetBlue,
  Moody's, Church & Dwight), patented feature cut maintenance 90%, churn down 50%.

Projects (share the link when asked):
- Nourish Agent: multi-agent AI nutritionist, predicts stress from HRV and sleep.
  https://nourish-agent.netlify.app/  write-up https://rohanjauhari.com/nourish
- SwiftHire: automated job search pipeline, tailors resumes, drafts cold emails.
  https://swifthire-board.vercel.app/  write-up https://rohanjauhari.com/swifthire
- SupportIQ: MCP-enabled RAG for support. https://rohanjauhari.com/ragproject
- Boston Liveability Dashboard: Power BI, 41 zip codes. /boston-casestudy.pdf
- Instacart Autonomous Delivery: PM case study. /instacart.pdf

Contact: jauhari.r@northeastern.edu, https://linkedin.com/in/rohanjauhari,
https://github.com/rohanjauhari
```

---

## 6. n8n workflows (the two server tools)

Reuse your existing n8n Cloud (same one as Nourish).

### Workflow A — book_call
1. **Webhook** node (POST) → copy its URL into the book_call tool (section 4).
2. **Google Calendar → Create Event** node:
   - connect your Google account
   - title: `Call with {{$json.name || "a recruiter"}}`
   - start: parse `{{$json.preferred_time}}` (or hardcode fixed slots to limit abuse)
   - attendee: `{{$json.email}}`
3. **Respond to Webhook** node → `{ "status": "booked", "time": "{{...}}" }`
   (the agent reads this back to the caller)

Guardrail: consider only offering fixed slots (e.g. weekday 2pm) and a daily cap so a
public agent can't spam your calendar.

### Workflow B — send_email
1. **Webhook** node (POST) → copy URL into the send_email tool.
2. **Switch** on `{{$json.type}}`:
   - `resume` → **Gmail → Send** with your resume PDF attached (from Drive or a URL).
   - `transcript` → **Gmail → Send** with body `{{$json.transcript}}`.
   - To: `{{$json.email}}`
3. **Respond to Webhook** → `{ "status": "sent" }`

---

## 7. Resume file
Drop your resume at `public/resume.pdf`. The in-chat resume card links to `/resume.pdf`.

---

## 8. Test checklist
- [ ] Env vars set + redeployed
- [ ] Agent created, Agent ID in Vercel
- [ ] Knowledge Base uploaded
- [ ] 4 client tools + 2 server tools defined
- [ ] n8n webhooks live, Google Calendar + Gmail connected
- [ ] resume.pdf in public/
- [ ] Open chat → Call → talk → ask to see SwiftHire (navigates) → ask for resume
      (offers chat or email) → ask to book → end → offer transcript

When you've got the Agent ID in and the n8n URLs created, ping me and I'll help debug the
live run.
```
