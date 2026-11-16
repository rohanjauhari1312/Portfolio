import { useEffect, useRef, useState } from 'react'
import useIsMobile from '../hooks/useIsMobile'

const RAD = Math.PI / 180

const LAND_COLOR = '#eab308'

const P = n => `/personal/places/${n}.jpg`
const ph = (name, lat, lon, thumb) => ({ name, lat, lon, thumb: thumb && P(thumb) })

// groups with several places collapse to one thumbnail until you zoom in
const GROUPS = [
  { name: 'Massachusetts', lat: 42.3, lon: -71.4, cover: '/personal/moments-03.jpg', photos: ['/personal/moments-03.jpg'], places: [
    { name: 'Boston', lat: 42.36, lon: -71.06, thumb: '/personal/moments-03.jpg', photos: ['/personal/moments-03.jpg'] },
    ph('Cambridge', 42.37, -71.11, 'Cambridge'), ph('Somerville', 42.39, -71.1, 'Somerville'), ph('Watertown', 42.37, -71.18, 'Watertown'),
    ph('Stoneham', 42.48, -71.1, 'Stoneham'), ph('Salem', 42.52, -70.9, 'Salem'), ph('Nahant', 42.43, -70.92, 'Nahant'),
    ph('Wrentham', 42.07, -71.33, 'Wrentham'), ph('Sharon', 42.12, -71.18, 'Sharon'),
  ] },
  { name: 'New Hampshire', lat: 43.6, lon: -71.4, cover: 'Gilford', places: [
    ph('Gilford', 43.55, -71.41, 'Gilford'), ph('Laconia', 43.53, -71.47, 'Laconia'), ph('Alton', 43.45, -71.22, 'Alton'),
  ] },
  { name: 'Maine', lat: 44.0, lon: -70.4, cover: 'Ogunquit', places: [
    ph('Ogunquit', 43.25, -70.6, 'Ogunquit'), ph('Auburn', 44.1, -70.23, 'Auburn'),
  ] },
  { name: 'Connecticut', lat: 41.6, lon: -72.5, cover: 'Willington', places: [
    ph('Willington', 41.89, -72.26, 'Willington'), ph('Tolland', 41.87, -72.37, 'Tolland'), ph('Stonington', 41.34, -71.91, 'Stonington'),
  ] },
  { name: 'New Jersey', lat: 40.5, lon: -74.4, cover: 'JerseyCity', places: [
    ph('Jersey City', 40.73, -74.06, 'JerseyCity'), ph('Hoboken', 40.74, -74.03, 'Hoboken'), ph('Secaucus', 40.79, -74.06, 'Secaucus'),
    ph('Kearny', 40.77, -74.12, 'Kearny'), ph('Newark', 40.74, -74.17, 'Newark'), ph('Robbinsville', 40.22, -74.6, 'Robbinsville'),
  ] },
  { name: 'Gujarat', lat: 22.6, lon: 72.4, cover: 'Ahmedabad', places: [
    ph('Ahmedabad', 23.02, 72.57, 'Ahmedabad'), ph('Gandhinagar', 23.22, 72.65, 'Gandhinagar'), ph('Raysan', 23.19, 72.64, 'Raysan'),
    ph('Nadiad', 22.69, 72.86, 'Nadiad'), ph('Saputara', 20.58, 73.75, 'Saputara'), ph('Diu', 20.71, 70.99, 'Diu'),
  ] },
  { name: 'Rajasthan', lat: 26.0, lon: 74.0, cover: 'Jaipur', places: [
    ph('Jaipur', 26.91, 75.79, 'Jaipur'), ph('Udaipur', 24.58, 73.68, 'Udaipur'), ph('Abu Road', 24.48, 72.78, 'Aburaj'),
  ] },
  { name: 'Uttarakhand', lat: 30.1, lon: 79.0, cover: 'Rishikesh', places: [
    ph('Rishikesh', 30.09, 78.27, 'Rishikesh'), ph('Dehradun', 30.32, 78.03, 'Dehradun'), ph('Mussoorie', 30.46, 78.07, 'Mussoorie'),
    ph('Lansdowne', 29.84, 78.68, 'Lansdowne'), ph('Joshimath', 30.56, 79.56, 'Joshimath'), ph('Chandrashila', 30.49, 79.21),
  ] },
  { name: 'Himachal Pradesh', lat: 31.7, lon: 77.2, cover: 'Dharamshala', places: [
    ph('Dharamshala', 32.22, 76.32, 'Dharamshala'), ph('Buran Ghati', 31.3, 77.95),
  ] },
  { name: 'Delhi', lat: 28.65, lon: 77.15, cover: 'Delhi', places: [
    ph('Delhi', 28.7, 77.1, 'Delhi'), ph('New Delhi', 28.61, 77.21, 'NewDelhi'),
  ] },
  { name: 'Uttar Pradesh', lat: 26.6, lon: 80.6, cover: 'Lucknow', places: [
    ph('Lucknow', 26.85, 80.95, 'Lucknow'), ph('Kanpur', 26.45, 80.35, 'NewKanpur'),
  ] },
  { name: 'Goa', lat: 15.5, lon: 73.9, cover: 'Baga', places: [
    ph('Baga', 15.56, 73.75, 'Baga'), ph('Vagator', 15.6, 73.74, 'Vagator'), ph('Maem', 15.6, 73.97, 'Maem'),
  ] },
]

const SOLOS = [
  { name: 'New York City', lat: 40.73, lon: -73.99, thumb: '/personal/travel-03.jpg', photos: ['/personal/travel-03.jpg', '/personal/moments-01.jpg', '/personal/travel-02.jpg'] },
  { name: 'Washington, D.C.', lat: 38.89, lon: -77.035, thumb: '/personal/travel-01.jpg', photos: ['/personal/travel-01.jpg'] },
  ph('Atlanta', 33.75, -84.39, 'Atlanta'),
  ph('Nashville', 36.16, -86.78, 'Nashville'),
  ph('Rhode Island', 41.63, -71.69, 'WestGreenwich'),
  ph('Vermont', 44.0, -72.7),
  ph('Bengaluru', 12.97, 77.59, 'Bengaluru'),
  ph('Mumbai', 19.08, 72.88, 'Mumbai'),
  ph('Ooty', 11.41, 76.7, 'Ooty'),
  ph('Gurugram', 28.46, 77.03, 'Gurugram'),
  ph('Kerala', 10.5, 76.5), ph('Madhya Pradesh', 23.5, 78.5),
  ph('Punjab', 31.0, 75.3), ph('Jammu & Kashmir', 34.0, 74.8),
]

const resolve = t => (t && (t.startsWith('/') ? t : P(t)))

const ITEMS = []
SOLOS.forEach(p => ITEMS.push({ ...p, thumb: p.thumb, kind: 'solo', rank: p.photos ? 0 : 1 }))
GROUPS.forEach(g => {
  const gi = ITEMS.length
  ITEMS.push({ name: g.name, lat: g.lat, lon: g.lon, thumb: resolve(g.cover), photos: g.photos, kind: 'group', n: g.places.length, rank: g.photos ? 0 : 1 })
  g.places.forEach(p => ITEMS.push({ ...p, kind: 'child', parent: gi, rank: p.photos ? 0 : 2 }))
})
const ORDER = ITEMS.map((_, i) => i).sort((a, b) => ITEMS[a].rank - ITEMS[b].rank)

const EXPAND_Z = 3.6

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
    cur: { lon: 70, lat: 18, z: 2.4 },
    tgt: { lon: -76, lat: 30, z: 2.4 },
    dots: null, inView: false, drag: null, moved: 0, last: Date.now(), hovering: false,
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
      if (!s.drag && !s.hovering && t.z <= 3) t.lon += 0.4
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
        s.dots.forEach(d => {
          ctx.fillStyle = LAND_COLOR
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

      const k = Math.min(1, 0.6 + (c.z - 1) * 0.2)
      const gf = Math.max(0, Math.min(1, (EXPAND_Z + 0.4 - c.z) / 0.8))
      const gap = 32 * k
      const placed = []
      const shown = new Array(ITEMS.length).fill(null)
      ORDER.forEach(i => {
        const it = ITEMS[i]
        const p = project(it.lon * RAD, it.lat * RAD, c, R, cx, cy)
        const limb = Math.max(0, Math.min(1, (p.v - 0.05) / 0.2))
        const lvl = it.kind === 'solo' ? 1 : it.kind === 'group' ? gf : 1 - gf
        let vis = limb * lvl
        if (vis > 0.02) {
          if (placed.some(q => Math.hypot(q.x - p.x, q.y - p.y) < gap)) vis = 0
          else placed.push(p)
        }
        shown[i] = { p, vis }
      })
      ITEMS.forEach((it, i) => {
        const el = pinRefs.current[i]
        if (!el) return
        const { p, vis } = shown[i]
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
    t.z = Math.max(1, Math.min(14, t.z * f))
  }

  const pick = pl => {
    if (state.current.moved > 6) return
    const t = state.current.tgt
    state.current.last = Date.now()
    t.lon = pl.lon; t.lat = pl.lat; t.z = Math.max(t.z, pl.kind === 'group' ? 7 : 10)
    if (pl.photos) onOpenPhoto(pl.photos[0])
  }

  const T = 46
  const T2 = 28
  const btn = {
    width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)',
    background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(8px)', cursor: 'pointer',
    fontSize: 18, lineHeight: 1, color: '#171717',
  }

  return (
    <div
      ref={wrapRef}
      onMouseEnter={() => { state.current.hovering = true }}
      onMouseLeave={() => { state.current.hovering = false }}
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

      {ITEMS.map((pl, i) => {
        const big = !!pl.photos
        const size = big ? T : T2
        return (
          <div
            key={pl.kind + pl.name}
            ref={el => { pinRefs.current[i] = el }}
            style={{ position: 'absolute', left: 0, top: 0, willChange: 'transform, opacity', opacity: 0, zIndex: hover === i ? 10 : big ? 3 : 2 }}
          >
            <button
              onClick={() => pick(pl)}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(-1)}
              aria-label={big ? `Open photos from ${pl.name}` : pl.name}
              style={{
                position: 'absolute', left: -size / 2, top: -size / 2, width: size, height: size, padding: 0,
                borderRadius: big ? 12 : 9, border: `${big ? 3 : 2}px solid #fff`, overflow: 'hidden', cursor: 'pointer',
                // gradient is a placeholder until a real photo is supplied for this place
                background: pl.thumb ? `url(${pl.thumb}) center/cover` : 'linear-gradient(135deg, #fde68a, #fb923c)',
                boxShadow: hover === i ? '0 10px 26px rgba(0,0,0,0.28)' : '0 4px 14px rgba(0,0,0,0.22)',
                transition: 'box-shadow 0.3s ease',
              }}
            />
            {(pl.kind === 'group' || (pl.photos && pl.photos.length > 1)) && (
              <span style={{
                position: 'absolute', left: size / 2 - 10, top: -size / 2 - 6, minWidth: 18, height: 18, borderRadius: 9,
                background: pl.kind === 'group' ? '#171717' : '#facc15', color: pl.kind === 'group' ? '#fff' : '#0a0a0a',
                fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
              }}>
                {pl.kind === 'group' ? pl.n : pl.photos.length}
              </span>
            )}
            <span style={{
              position: 'absolute', left: 0, top: size / 2 + 6, transform: 'translateX(-50%)',
              whiteSpace: 'nowrap', fontSize: 11, fontWeight: 600, color: '#171717',
              background: 'rgba(255,255,255,0.88)', padding: '2px 8px', borderRadius: 6, pointerEvents: 'none',
              opacity: hover === i ? 1 : 0, transition: 'opacity 0.25s ease',
            }}>
              {pl.name}
            </span>
          </div>
        )
      })}

      <div style={{ position: 'absolute', right: 14, bottom: 14, display: 'flex', flexDirection: "column", gap: 6, zIndex: 4 }}>
        <button style={btn} onClick={() => zoom(1.6)} aria-label="Zoom in">+</button>
        <button style={btn} onClick={() => zoom(1 / 1.6)} aria-label="Zoom out">&minus;</button>
      </div>
    </div>
  )
}
