import { useEffect, useRef, useCallback } from 'react'

const DOT_RADIUS = 1.5
const INFLUENCE_RADIUS = 130
const MAX_OFFSET = 18
const FLOAT_SPEED = 0.0008

const COMET_INTERVAL_MIN = 1800
const COMET_INTERVAL_MAX = 4000
const COMET_SPEED = 820
const COMET_TAIL   = 260

const isTouchDevice = () => window.matchMedia('(pointer: coarse)').matches

export default function DotGrid({ dotColor = 'rgba(251,169,40,0.5)' }) {
  const canvasRef     = useRef(null)
  const colorRef      = useRef(dotColor)
  const mouseRef      = useRef({ x: -9999, y: -9999 })
  const dotsRef       = useRef([])
  const cometsRef     = useRef([])
  const rafRef        = useRef(null)
  const timeRef       = useRef(0)
  const lastTsRef     = useRef(null)
  const nextCometRef  = useRef(COMET_INTERVAL_MIN + Math.random() * (COMET_INTERVAL_MAX - COMET_INTERVAL_MIN))
  const cometTimerRef = useRef(0)
  const mobileRef     = useRef(isTouchDevice())

  const spawnComet = useCallback((w, h) => {
    const fromTop = Math.random() < 0.6
    const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.35
    let sx, sy
    if (fromTop) { sx = Math.random() * w * 1.2; sy = -10 }
    else { sx = w + 10; sy = Math.random() * h * 0.5 }
    cometsRef.current.push({ sx, sy, angle, progress: 0, total: w * 1.6 })
  }, [])

  const initDots = useCallback((w, h) => {
    const mobile = mobileRef.current
    const COLS = mobile ? 14 : 28
    const ROWS = mobile ? 10 : 18
    const colGap = w / (COLS + 1)
    const rowGap = h / (ROWS + 1)
    const dots = []
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        dots.push({
          baseX: colGap * (c + 1),
          baseY: rowGap * (r + 1),
          phaseX: Math.random() * Math.PI * 2,
          phaseY: Math.random() * Math.PI * 2,
          freqX: 0.6 + Math.random() * 0.8,
          freqY: 0.6 + Math.random() * 0.8,
          ampX: 4 + Math.random() * 5,
          ampY: 4 + Math.random() * 5,
        })
      }
    }
    dotsRef.current = dots
  }, [])

  useEffect(() => { colorRef.current = dotColor }, [dotColor])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    mobileRef.current = isTouchDevice()

    const resize = () => {
      canvas.width  = canvas.offsetWidth  * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      initDots(canvas.offsetWidth, canvas.offsetHeight)
    }

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const onMouseLeave = () => { mouseRef.current = { x: -9999, y: -9999 } }

    resize()
    window.addEventListener('resize', resize)
    if (!mobileRef.current) {
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseleave', onMouseLeave)
    }

    // 30fps throttle on mobile (skip every other frame)
    let frameCount = 0

    const draw = (ts) => {
      frameCount++
      if (mobileRef.current && frameCount % 2 !== 0) {
        rafRef.current = requestAnimationFrame(draw)
        return
      }
      if (!lastTsRef.current) lastTsRef.current = ts
      const dt = Math.min(ts - lastTsRef.current, 50)
      lastTsRef.current = ts

      timeRef.current = ts * FLOAT_SPEED
      const t = timeRef.current
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight

      ctx.clearRect(0, 0, w, h)

      {
        cometTimerRef.current += dt
        if (cometTimerRef.current >= nextCometRef.current) {
          cometTimerRef.current = 0
          nextCometRef.current = COMET_INTERVAL_MIN + Math.random() * (COMET_INTERVAL_MAX - COMET_INTERVAL_MIN)
          spawnComet(w, h)
        }

        cometsRef.current = cometsRef.current.filter(c => c.progress < c.total)
        for (const c of cometsRef.current) {
          c.progress += (COMET_SPEED * dt) / 1000
          const headX = c.sx + Math.cos(c.angle) * c.progress
          const headY = c.sy + Math.sin(c.angle) * c.progress
          const tailLen = Math.min(COMET_TAIL, c.progress)
          const tailX = headX - Math.cos(c.angle) * tailLen
          const tailY = headY - Math.sin(c.angle) * tailLen

          const prog = c.progress / c.total
          const fadeIn  = Math.min(prog / 0.10, 1)
          const fadeOut = prog > 0.85 ? 1 - (prog - 0.85) / 0.15 : 1
          const alpha = fadeIn * fadeOut

          const grad = ctx.createLinearGradient(tailX, tailY, headX, headY)
          grad.addColorStop(0, `rgba(255,255,255,0)`)
          grad.addColorStop(0.55, `rgba(255,220,100,${0.18 * alpha})`)
          grad.addColorStop(0.85, `rgba(255,245,180,${0.7 * alpha})`)
          grad.addColorStop(1,   `rgba(255,255,255,${alpha})`)

          ctx.beginPath()
          ctx.moveTo(tailX, tailY)
          ctx.lineTo(headX, headY)
          ctx.strokeStyle = grad
          ctx.lineWidth = 1.5
          ctx.lineCap = 'round'
          ctx.stroke()

          const grd = ctx.createRadialGradient(headX, headY, 0, headX, headY, 6)
          grd.addColorStop(0, `rgba(255,255,220,${0.9 * alpha})`)
          grd.addColorStop(1, `rgba(255,200,80,0)`)
          ctx.beginPath()
          ctx.arc(headX, headY, 6, 0, Math.PI * 2)
          ctx.fillStyle = grd
          ctx.fill()
        }
      }

      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      for (const dot of dotsRef.current) {
        const floatX = dot.baseX + Math.sin(t * dot.freqX + dot.phaseX) * dot.ampX
        const floatY = dot.baseY + Math.sin(t * dot.freqY + dot.phaseY) * dot.ampY

        let x = floatX, y = floatY

        if (!mobileRef.current) {
          const dx = floatX - mx
          const dy = floatY - my
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < INFLUENCE_RADIUS) {
            const strength = 1 - dist / INFLUENCE_RADIUS
            x += (dx / dist) * strength * MAX_OFFSET
            y += (dy / dist) * strength * MAX_OFFSET
          }
        }

        ctx.beginPath()
        ctx.arc(x, y, DOT_RADIUS, 0, Math.PI * 2)
        ctx.fillStyle = colorRef.current
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
      cancelAnimationFrame(rafRef.current)
    }
  }, [initDots, spawnComet])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
