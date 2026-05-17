import { useEffect, useRef, useState } from 'react'

export default function TypedHeading({ text, suffixText = '', suffixStyle = {}, style: s = {}, as: Tag = 'h2', speed = 55, cursorColor = '#f5f5f5' }) {
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

  const mainChars   = text.slice(0, Math.min(count, text.length))
  const suffixChars = suffixText.slice(0, Math.max(0, count - text.length))
  const done        = count >= total

  return (
    <Tag ref={ref} style={s}>
      {mainChars}
      {suffixChars && <span style={suffixStyle}>{suffixChars}</span>}
      {!done && (
        <span style={{
          display: 'inline-block',
          width: '0.055em',
          height: '0.85em',
          background: cursorColor,
          marginLeft: 3,
          verticalAlign: 'middle',
          animation: 'typedBlink 0.35s step-end infinite',
        }} />
      )}
    </Tag>
  )
}
