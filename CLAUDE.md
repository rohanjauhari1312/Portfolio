# Portfolio — Claude Instructions

## Stack
- React 18 + Vite 5, Node v18 via nvm
- Dev server: `npm run dev` in /Users/rohanjauhari/Desktop/Portfolio
- No external UI libraries — all styles are inline or index.css

## Visual style
- Background: #0a0a0a (solid base), rgba(10,10,10,0.85) for sections sitting over DotGrid
- Accent palette: #facc15 (primary yellow), #fb923c (orange), #60a5fa (blue), #a78bfa (purple), #4ade80 (green)
- Cards: glassmorphism — background rgba(255,255,255,0.03), border rgba(255,255,255,0.07), borderRadius 14–16px, backdropFilter blur(8px)
- Section headers: yellow dot (7px) + uppercase label (11px, #facc15) + large h2 clamp(2rem,5vw,3.5rem) + muted subtext
- Logo containers: 72×72px, white bg, padding 3px, borderRadius 14, objectFit contain
- Buttons: solid #facc15, dark text (#0a0a0a), borderRadius ~10px (not pill-shaped)

## Images
- Use placeholder divs or gradient blocks for any missing images — never use emoji as image substitutes
- Rohan will supply real images later; mark placeholder spots clearly with a comment

## Tone and copy
- No emoji anywhere in UI — not in headings, cards, chips, labels, or icons
- Copy should read like a thoughtful human wrote it — no buzzword stacking, no AI-sounding superlatives
- Prefer specific and concrete ("reduced query errors by 40%") over vague ("optimized performance significantly")
- Sentence case for body copy; title case only for proper nouns and section headers

## Animation rules
- DotGrid: dots move away from cursor, no glow on hover — do not change this behavior
- NeuralCard: cascade-style random pulses, uniform speed (SPEED constant, no Math.random on speed) — do not switch to wave-based animation
- Entrance animations: fade + translateY, scroll-triggered via IntersectionObserver
- Nothing should feel jarring or bouncy — cubic-bezier(.22,1,.36,1) for most motion

## Behavior rules
- Ask clarifying questions before implementing any design change, new section, or feature addition
- Do not add features, abstractions, or cleanup beyond what was explicitly requested
- Do not add comments to code unless the WHY is non-obvious
- No trailing response summaries — state the result directly
- If a request is ambiguous (e.g. "make it better", "fix the layout"), push back with a specific question before touching anything
