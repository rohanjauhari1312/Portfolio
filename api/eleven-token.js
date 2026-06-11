// Returns a short-lived signed URL so the browser can open a Conversational AI
// session without ever seeing the ElevenLabs API key.

export default async function handler(req, res) {
  const apiKey = process.env.ELEVENLABS_API_KEY
  const agentId = process.env.ELEVENLABS_AGENT_ID
  if (!apiKey || !agentId) {
    return res.status(503).json({ error: 'Voice agent not configured' })
  }

  try {
    const r = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
      { headers: { 'xi-api-key': apiKey } }
    )
    if (!r.ok) return res.status(502).json({ error: 'Could not start voice session' })
    const data = await r.json()
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({ signedUrl: data.signed_url })
  } catch {
    return res.status(500).json({ error: 'Voice session error' })
  }
}
