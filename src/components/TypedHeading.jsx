import { useEffect, useRef, useState } from 'react'

function renderText(str, charStyles) {
  if (!charStyles) return str
  const parts = []
  let buf = ''
  for (let i = 0; i < str.length; i++) {
    const ch = str[i]
    if (charStyles[ch]) {
      if (buf) { parts.push(buf); buf = '' }
      parts.push(<span key={i} style={charStyles[ch]}>{ch}</span>)
    } else {
      buf += ch
    }
  }
  if (buf) parts.push(buf)
  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts
}

export default function TypedHeading({ text, suffixText = '', suffixStyle = {}, style: s = {}, as: Tag = 'h2', speed = 55, cursorColor = '#facc15', charStyles }) {
  const ref = useRef(null)
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const total = text.length + suffixText.length

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect() } },
      { threshold: 0.25 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!started || count >= total) return
    const t = setTimeout(() => setCount(c => c + 1), speed)
    return () => clearTimeout(t)
  }, [started, count, total, speed])

  const mainTyped   = Math.min(count, text.length)
  const suffixTyped = Math.max(0, count - text.length)
  const done        = count >= total
  const cursorInSuffix = count > text.length

  const cursor = (
    <span style={{
      display: 'inline-block',
      width: '0.055em',
      height: '0.85em',
      background: cursorColor,
      marginLeft: 3,
      verticalAlign: 'middle',
      boxShadow: `0 0 8px ${cursorColor}`,
      animation: 'typedBlink 1.06s step-end infinite',
    }} />
  )

  if (done) {
    const tail = suffixText || text
    const sp = tail.lastIndexOf(' ')
    const head = sp >= 0 ? tail.slice(0, sp + 1) : ''
    const last = sp >= 0 ? tail.slice(sp + 1) : tail
    const gluedLast = (
      <span style={{ whiteSpace: 'nowrap' }}>{renderText(last, charStyles)}{cursor}</span>
    )
    return (
      <Tag ref={ref} style={s}>
        {suffixText ? renderText(text, charStyles) : renderText(head, charStyles)}
        {suffixText
          ? <span style={suffixStyle}>{renderText(head, charStyles)}{gluedLast}</span>
          : gluedLast}
      </Tag>
    )
  }

  return (
    <Tag ref={ref} style={s}>
      {renderText(text.slice(0, mainTyped), charStyles)}
      {!cursorInSuffix && cursor}
      <span style={{ opacity: 0 }} aria-hidden="true">{renderText(text.slice(mainTyped), charStyles)}</span>
      {suffixText && (
        <span style={suffixStyle}>
          {renderText(suffixText.slice(0, suffixTyped), charStyles)}
          {cursorInSuffix && cursor}
          <span style={{ opacity: 0 }} aria-hidden="true">{renderText(suffixText.slice(suffixTyped), charStyles)}</span>
        </span>
      )}
    </Tag>
  )
}
