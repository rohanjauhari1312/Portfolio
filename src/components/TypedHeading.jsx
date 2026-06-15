import { useEffect, useRef, useState } from 'react'

export default function TypedHeading({ text, suffixText = '', suffixStyle = {}, style: s = {}, as: Tag = 'h2', speed = 55, cursorColor = '#facc15' }) {
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

  // Render the full text always, with the not-yet-typed portion transparent,
  // so the heading reserves its final size from the start and never reflows
  // (which would shift the page) as it types.
  return (
    <Tag ref={ref} style={s}>
      {text.slice(0, mainTyped)}
      {!cursorInSuffix && cursor}
      <span style={{ opacity: 0 }} aria-hidden="true">{text.slice(mainTyped)}</span>
      {suffixText && (
        <span style={suffixStyle}>
          {suffixText.slice(0, suffixTyped)}
          {cursorInSuffix && cursor}
          <span style={{ opacity: 0 }} aria-hidden="true">{suffixText.slice(suffixTyped)}</span>
        </span>
      )}
    </Tag>
  )
}
