import { useEffect, useRef, useState } from 'react'

function useCountUp(target, duration = 1800, start = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime = null
    const step = (ts) => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return value
}

export default function MetricCard({ value, label, suffix = '', prefix = '', delay = 0 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { setVisible(true); obs.disconnect() }
      }, { threshold: 0.3 })
      if (ref.current) obs.observe(ref.current)
      return () => obs.disconnect()
    }, delay)
    return () => clearTimeout(timer)
  }, [delay])

  const count = useCountUp(value, 1800, visible)

  return (
    <div
      ref={ref}
      className="flex flex-col items-center justify-center px-5 py-4 rounded-xl"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(250,204,21,0.15)',
        backdropFilter: 'blur(8px)',
        minWidth: 110,
      }}
    >
      <span className="text-2xl font-bold tracking-tight text-yellow-400">
        {prefix}{count}{suffix}
      </span>
      <span className="text-xs text-neutral-400 mt-1 text-center leading-tight">{label}</span>
    </div>
  )
}
