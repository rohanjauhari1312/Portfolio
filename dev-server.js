import http from 'http'
import { readFileSync } from 'fs'
import Anthropic from '@anthropic-ai/sdk'

const key = process.env.ANTHROPIC_API_KEY
if (!key) { console.error('ANTHROPIC_API_KEY not set'); process.exit(1) }

const client = new Anthropic({ apiKey: key })

// Load system prompt from api/chat.js by re-exporting SYSTEM inline
const SYSTEM = readFileSync('./api/chat.js', 'utf8').match(/const SYSTEM = `([\s\S]*?)`/)?.[1] ?? ''

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST' })
    return res.end()
  }

  if (req.url !== '/api/chat' || req.method !== 'POST') {
    res.writeHead(404); return res.end()
  }

  let body = ''
  req.on('data', d => body += d)
  req.on('end', async () => {
    const { messages } = JSON.parse(body)
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    })

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
    } catch (e) {
      res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`)
    }

    res.write('data: [DONE]\n\n')
    res.end()
  })
})

server.listen(3001, () => console.log('API dev server on http://localhost:3001'))
