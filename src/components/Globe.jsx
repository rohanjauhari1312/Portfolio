import { useEffect, useRef, useState } from 'react'
import useIsMobile from '../hooks/useIsMobile'

const RAD = Math.PI / 180

const CONTINENT_COLORS = ['#facc15', '#4ade80', '#60a5fa', '#fb923c', '#a78bfa', '#2dd4bf']

const PLACES = [
  { name: 'New York City', lat: 40.73, lon: -73.99, photos: ['/personal/travel-03.jpg', '/personal/moments-01.jpg', '/personal/travel-02.jpg'] },
  { name: 'Washington, D.C.', lat: 38.89, lon: -77.035, photos: ['/personal/travel-01.jpg'] },
  { name: 'Boston', lat: 42.36, lon: -71.05, photos: ['/personal/moments-03.jpg'] },
  { name: 'Jaipur', lat: 26.91, lon: 75.79 },
  { name: 'Bangalore', lat: 12.97, lon: 77.59 },
  { name: 'New Jersey', lat: 40.1, lon: -74.5 },
  { name: 'Connecticut', lat: 41.6, lon: -72.7 },
  { name: 'Rhode Island', lat: 41.7, lon: -71.5 },
  { name: 'New Hampshire', lat: 43.7, lon: -71.6 },
  { name: 'Vermont', lat: 44.0, lon: -72.7 },
  { name: 'Maine', lat: 45.3, lon: -69.2 },
  { name: 'Georgia', lat: 32.7, lon: -83.4 },
  { name: 'Tennessee', lat: 35.8, lon: -86.4 },
]

function continent(lon, lat) {
  if (lat < -10 && lon > 110) return 5
  if (lon >= 141 && lat < 0) return 5
  if (lon < -25) return (lat >= 12 || lon < -83) ? 0 : 1
  if (lat > 58 && lon < -10) return 0
  if (lon <= 45 && lat >= 36 && !(lon > 26 && lat < 42)) return 2
  if (lon >= -20 && lon < 34.5 && lat < 35.5) return 3
  if (lon >= 34.5 && lon < 52 && lat < 12 && lat > -36) return 3
  if (lon >= 25 && lon < 52 && lat <= -10) return 3
  return 4
}

function decodeLand(topo) {
  const { scale, translate } = topo.transform
  const arcs = topo.arcs.map(arc => {
    let x = 0, y = 0
    return arc.map(([dx, dy]) => {
      x += dx; y += dy
      return [x * scale[0] + translate[0], y * scale[1] + translate[1]]
    })
  })
  const ring = idxs => {
    const pts = []
    idxs.forEach(i => {
      const a = i < 0 ? arcs[~i].slice().reverse() : arcs[i]
      pts.push(...(pts.length ? a.slice(1) : a))
    })
    return pts
  }
  const polys = []
  topo.objects.land.geometries.forEach(g => {
    const list = g.type === 'Polygon' ? [g.arcs] : g.arcs
    list.forEach(poly => polys.push(poly.map(ring)))
  })
  return polys
}

function inRing(x, y, r) {
  let inside = false
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [xi, yi] = r[i], [xj, yj] = r[j]
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

function landDots(polys, step) {
  const boxes = polys.map(p => {
    let x0 = 181, x1 = -181, y0 = 91, y1 = -91
    p[0].forEach(([x, y]) => { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y })
    return [x0, x1, y0, y1]
  })
  const out = [[], [], [], [], [], []]
  for (let lat = -58; lat <= 84; lat += step) {
    const lonStep = step / Math.max(0.25, Math.cos(lat * RAD))
    for (let lon = -180; lon < 180; lon += lonStep) {
      for (let k = 0; k < polys.length; k++) {
        const b = boxes[k]
        if (lon < b[0] || lon > b[1] || lat < b[2] || lat > b[3]) continue
        const poly = polys[k]
        if (inRing(lon, lat, poly[0]) && !poly.slice(1).some(h => inRing(lon, lat, h))) {
          out[continent(lon, lat)].push(lon * RAD, lat * RAD)
          break
        }
      }
    }
  }
  return out.map(a => new Float32Array(a))
}

export default function Globe({ onOpenPhoto }) {
  const isMobile = useIsMobile()
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const pinRefs = useRef([])
  const state = useRef({
    cur: { lon: 70, lat: 18, z: 1 },
    tgt: { lon: -76, lat: 30, z: 1 },
    dots: null, inView: false, drag: null, moved: 0, last: Date.now(),
  })
  const [hover, setHover] = useState(-1)

  useEffect(() => {
    let dead = false
    fetch('/land-110m.json').then(r => r.json()).then(t => {
      if (dead) return
      state.current.dots = landDots(decodeLand(t), 0.9)
    })
    return () => { dead = true }
  }, [])

  useEffect(() => {
    const s = state.current
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    const ctx = canvas.getContext('2d')
    const io = new IntersectionObserver(([e]) => { s.inView = e.isIntersecting }, { threshold: 0 })
    io.observe(wrap)
    let raf

    const project = (lon, lat, c, R, cx, cy) => {
      const sp = Math.sin(c.lat * RAD), cp = Math.cos(c.lat * RAD)
      const dl = lon - c.lon * RAD
      const sl = Math.sin(lat), cl = Math.cos(lat)
      return {
        x: cx + R * cl * Math.sin(dl),
        y: cy - R * (cp * sl - sp * cl * Math.cos(dl)),
        v: sp * sl + cp * cl * Math.cos(dl),
      }
    }

    const frame = () => {
      raf = requestAnimationFrame(frame)
      if (!s.inView) return
      const w = wrap.clientWidth, h = wrap.clientHeight
      const dpr = window.devicePixelRatio || 1
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr; canvas.height = h * dpr
      }
      const c = s.cur, t = s.tgt
      if (!s.drag && t.z <= 1.6 && Date.now() - s.last > 3500) t.lon += 0.16
      c.lon += (t.lon - c.lon) * 0.08
      c.lat += (t.lat - c.lat) * 0.08
      c.z += (t.z - c.z) * 0.08

      const R = Math.min(w, h) * 0.43 * c.z
      const cx = w / 2, cy = h / 2
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      const g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R)
      g.addColorStop(0, '#f6fbff')
      g.addColorStop(1, '#d9e8f6')
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.fillStyle = g; ctx.fill()
      ctx.strokeStyle = 'rgba(0,0,0,0.09)'; ctx.lineWidth = 1; ctx.stroke()

      ctx.save()
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip()

      ctx.strokeStyle = 'rgba(0,0,0,0.045)'
      for (let lon = -180; lon < 180; lon += 30) {
        ctx.beginPath(); let pen = false
        for (let lat = -90; lat <= 90; lat += 3) {
          const p = project(lon * RAD, lat * RAD, c, R, cx, cy)
          if (p.v > 0) { pen ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); pen = true } else pen = false
        }
        ctx.stroke()
      }
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath(); let pen = false
        for (let lon = -180; lon <= 180; lon += 3) {
          const p = project(lon * RAD, lat * RAD, c, R, cx, cy)
          if (p.v > 0) { pen ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); pen = true } else pen = false
        }
        ctx.stroke()
      }

      if (s.dots) {
        const r = Math.max(0.7, Math.min(2, R * 0.0048))
        s.dots.forEach((d, k) => {
          ctx.fillStyle = CONTINENT_COLORS[k]
          ctx.beginPath()
          for (let i = 0; i < d.length; i += 2) {
            const p = project(d[i], d[i + 1], c, R, cx, cy)
            if (p.v <= 0.02) continue
            ctx.moveTo(p.x + r, p.y)
            ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
          }
          ctx.fill()
        })
      }

      ctx.restore()

      PLACES.forEach((pl, i) => {
        const el = pinRefs.current[i]
        if (!el) return
        const p = project(pl.lon * RAD, pl.lat * RAD, c, R, cx, cy)
        const vis = Math.max(0, Math.min(1, (p.v - 0.05) / 0.2))
        const k = Math.min(1, 0.6 + (c.z - 1) * 0.2)
        el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) scale(${k})`
        el.style.opacity = vis
        el.style.pointerEvents = vis > 0.5 ? 'auto' : 'none'
      })
    }
    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); io.disconnect() }
  }, [])

  const onDown = e => {
    const s = state.current
    s.drag = { x: e.clientX, y: e.clientY }
    s.moved = 0
    s.last = Date.now()
  }
  const onMove = e => {
    const s = state.current
    if (!s.drag) return
    const dx = e.clientX - s.drag.x, dy = e.clientY - s.drag.y
    s.drag = { x: e.clientX, y: e.clientY }
    s.moved += Math.abs(dx) + Math.abs(dy)
    if (s.moved > 6 && !e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.setPointerCapture(e.pointerId)
    const deg = 57.3 / (Math.min(wrapRef.current.clientWidth, wrapRef.current.clientHeight) * 0.43 * s.cur.z)
    s.tgt.lon = s.cur.lon = s.tgt.lon - dx * deg
    s.tgt.lat = s.cur.lat = Math.max(-80, Math.min(80, s.tgt.lat + dy * deg))
  }
  const onUp = () => { state.current.drag = null; state.current.last = Date.now() }

  const zoom = f => {
    const t = state.current.tgt
    state.current.last = Date.now()
    t.z = Math.max(1, Math.min(8, t.z * f))
  }

  const pick = pl => {
    if (state.current.moved > 6) return
    const t = state.current.tgt
    state.current.last = Date.now()
    t.lon = pl.lon; t.lat = pl.lat; t.z = Math.max(t.z, 4.5)
    if (pl.photos) onOpenPhoto(pl.photos[0])
  }

  const T = 46
  const btn = {
    width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)',
    background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(8px)', cursor: 'pointer',
    fontSize: 18, lineHeight: 1, color: '#171717',
  }

  return (
    <div
      ref={wrapRef}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      style={{
        position: 'relative', width: '100%', height: isMobile ? 320 : 400, marginBottom: isMobile ? 32 : 48,
        borderRadius: 20, overflow: 'hidden', touchAction: 'pan-y', cursor: 'grab',
        background: 'rgba(255,255,255,0.35)', border: '1px solid rgba(0,0,0,0.07)',
      }}
    >
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />

      {PLACES.map((pl, i) => (
        <div
          key={pl.name}
          ref={el => { pinRefs.current[i] = el }}
          style={{ position: 'absolute', left: 0, top: 0, willChange: 'transform, opacity', zIndex: hover === i ? 10 : pl.photos ? 3 : 2 }}
        >
          <button
            onClick={() => pick(pl)}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(-1)}
            aria-label={pl.photos ? `Open photos from ${pl.name}` : pl.name}
            style={pl.photos ? {
              position: 'absolute', left: -T / 2, top: -T / 2, width: T, height: T, padding: 0,
              borderRadius: 12, border: '3px solid #fff', overflow: 'hidden', cursor: 'pointer',
              background: `url(${pl.photos[0]}) center/cover`,
              boxShadow: hover === i ? '0 10px 26px rgba(0,0,0,0.28)' : '0 4px 14px rgba(0,0,0,0.22)',
              transition: 'box-shadow 0.3s ease',
            } : {
              position: 'absolute', left: -5, top: -5, width: 10, height: 10, padding: 0,
              borderRadius: '50%', border: '2px solid #fff', background: '#f97316', cursor: 'pointer',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.12)',
            }}
          />
          {pl.photos && pl.photos.length > 1 && (
            <span style={{
              position: 'absolute', left: T / 2 - 10, top: -T / 2 - 6, minWidth: 18, height: 18, borderRadius: 9,
              background: '#facc15', color: '#0a0a0a', fontSize: 10, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
            }}>
              {pl.photos.length}
            </span>
          )}
          <span style={{
            position: 'absolute', left: 0, top: pl.photos ? T / 2 + 6 : 10, transform: 'translateX(-50%)',
            whiteSpace: 'nowrap', fontSize: 11, fontWeight: 600, color: '#171717',
            background: 'rgba(255,255,255,0.88)', padding: '2px 8px', borderRadius: 6, pointerEvents: 'none',
            opacity: hover === i ? 1 : 0, transition: 'opacity 0.25s ease',
          }}>
            {pl.name}
          </span>
        </div>
      ))}

      <div style={{ position: 'absolute', right: 14, bottom: 14, display: 'flex', flexDirection: "column", gap: 6, zIndex: 4 }}>
        <button style={btn} onClick={() => zoom(1.6)} aria-label="Zoom in">+</button>
        <button style={btn} onClick={() => zoom(1 / 1.6)} aria-label="Zoom out">&minus;</button>
      </div>
    </div>
  )
}
