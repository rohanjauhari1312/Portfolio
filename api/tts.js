// Text-to-speech in Rohan's cloned voice via ElevenLabs.
// Streams audio/mpeg back to the browser. Key stays server-side.

const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 20
const hits = new Map()

function getIp(req) {
  const fwd = req.headers['x-forwarded-for']
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim()
  return req.socket?.remoteAddress || 'unknown'
}

function rateLimited(ip) {
  const now = Date.now()
  const arr = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS)
  arr.push(now)
  hits.set(ip, arr)
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (!v.some(t => now - t < WINDOW_MS)) hits.delete(k)
    }
  }
  return arr.length > MAX_PER_WINDOW
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const apiKey = process.env.ELEVENLABS_API_KEY
  const voiceId = process.env.ELEVENLABS_VOICE_ID
  if (!apiKey || !voiceId) return res.status(503).json({ error: 'TTS not configured' })

  const { text } = req.body
  if (typeof text !== 'string' || !text.trim()) return res.status(400).json({ error: 'No text' })
  if (text.length > 1500) return res.status(400).json({ error: 'Text too long' })

  if (rateLimited(getIp(req))) return res.status(429).json({ error: 'Too many requests' })

  try {
    const elevenRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?optimize_streaming_latency=2`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.0, use_speaker_boost: true },
        }),
      }
    )

    if (!elevenRes.ok || !elevenRes.body) {
      return res.status(502).json({ error: 'TTS upstream failed' })
    }

    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Cache-Control', 'no-store')

    const reader = elevenRes.body.getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      res.write(Buffer.from(value))
    }
    res.end()
  } catch {
    if (!res.headersSent) res.status(500).json({ error: 'TTS error' })
    else res.end()
  }
}
