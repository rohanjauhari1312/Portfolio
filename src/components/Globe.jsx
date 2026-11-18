import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import useIsMobile from '../hooks/useIsMobile'

const RAD = Math.PI / 180

const LAND_COLOR = '#a16207'

const P = n => `/personal/places/${n}.jpg`
const ph = (name, lat, lon, thumb, n = 1) => ({
  name, lat, lon, thumb: thumb && P(thumb),
  slides: thumb ? Array.from({ length: n }, (_, i) => P(i ? `${thumb}-${i + 1}` : thumb)) : [],
})

// groups with several places collapse to one thumbnail until you zoom in
const GROUPS = [
  { name: 'Massachusetts', lat: 42.3, lon: -71.4, cover: '/personal/moments-03.jpg', photos: ['/personal/moments-03.jpg'], places: [
    { name: 'Boston', lat: 42.36, lon: -71.06, thumb: '/personal/moments-03.jpg', photos: ['/personal/moments-03.jpg'], slides: ['/personal/moments-03.jpg', P('Boston-2'), P('Boston-3'), P('Boston-4')] },
    ph('Cambridge', 42.37, -71.11, 'Cambridge'), ph('Somerville', 42.39, -71.1, 'Somerville', 4), ph('Watertown', 42.37, -71.18, 'Watertown', 4),
    ph('Stoneham', 42.48, -71.1, 'Stoneham', 4), ph('Salem', 42.52, -70.9, 'Salem', 4), ph('Nahant', 42.43, -70.92, 'Nahant', 4),
    ph('Wrentham', 42.07, -71.33, 'Wrentham', 3), ph('Sharon', 42.12, -71.18, 'Sharon'),
  ] },
  { name: 'New Hampshire', lat: 43.6, lon: -71.4, cover: 'Gilford', places: [
    ph('Gilford', 43.55, -71.41, 'Gilford', 4), ph('Laconia', 43.53, -71.47, 'Laconia', 4), ph('Alton', 43.45, -71.22, 'Alton', 4),
  ] },
  { name: 'Maine', lat: 44.0, lon: -70.4, cover: 'Ogunquit', places: [
    ph('Ogunquit', 43.25, -70.6, 'Ogunquit', 4), ph('Auburn', 44.1, -70.23, 'Auburn'),
  ] },
  { name: 'Connecticut', lat: 41.6, lon: -72.5, cover: 'Willington', places: [
    ph('Willington', 41.89, -72.26, 'Willington', 4), ph('Tolland', 41.87, -72.37, 'Tolland', 4), ph('Stonington', 41.34, -71.91, 'Stonington', 4),
  ] },
  { name: 'New Jersey', lat: 40.5, lon: -74.4, cover: 'JerseyCity', places: [
    ph('Jersey City', 40.73, -74.06, 'JerseyCity', 4), ph('Hoboken', 40.74, -74.03, 'Hoboken', 4), ph('Secaucus', 40.79, -74.06, 'Secaucus', 4),
    ph('Kearny', 40.77, -74.12, 'Kearny', 4), ph('Newark', 40.74, -74.17, 'Newark'), ph('Robbinsville', 40.22, -74.6, 'Robbinsville', 4),
  ] },
  { name: 'Gujarat', lat: 22.6, lon: 72.4, cover: 'Ahmedabad', places: [
    ph('Ahmedabad', 23.02, 72.57, 'Ahmedabad', 4), ph('Gandhinagar', 23.22, 72.65, 'Gandhinagar'), ph('Raysan', 23.19, 72.64, 'Raysan'),
    ph('Nadiad', 22.69, 72.86, 'Nadiad'), ph('Saputara', 20.58, 73.75, 'Saputara', 4), ph('Diu', 20.71, 70.99, 'Diu'),
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

const REGIONS = {
  us: {
    label: 'United States', center: { lon: -96, lat: 38 }, fitW: 0.5, fitH: 0.32,
    box: { lonLo: -128, lonHi: -65, latLo: 24, latHi: 50 },
    pan: { lonLo: -125, lonHi: -67, latLo: 25, latHi: 48 },
  },
  india: {
    label: 'India', center: { lon: 80, lat: 22 }, fitW: 0.37, fitH: 0.3,
    box: { lonLo: 66, lonHi: 99, latLo: 5, latHi: 38 },
    pan: { lonLo: 70, lonHi: 95, latLo: 8, latHi: 34 },
  },
}

const inBox = (b, o) => o.lat >= b.latLo && o.lat <= b.latHi && o.lon >= b.lonLo && o.lon <= b.lonHi

function buildSet(box) {
  const items = []
  SOLOS.filter(p => inBox(box, p)).forEach(p => items.push({ ...p, kind: 'solo', rank: p.photos ? 0 : 1 }))
  GROUPS.filter(g => inBox(box, g)).forEach(g => {
    const gi = items.length
    items.push({ name: g.name, lat: g.lat, lon: g.lon, thumb: resolve(g.cover), photos: g.photos, kind: 'group', n: g.places.length, rank: g.photos ? 0 : 1, childThumbs: g.places.map(p => p.thumb).filter(t => t && t !== resolve(g.cover)) })
    g.places.forEach(p => items.push({ ...p, kind: 'child', parent: gi, rank: p.photos ? 0 : 2 }))
  })
  const order = items.map((_, i) => i).sort((a, b) => items[a].rank - items[b].rank)
  return { items, order }
}
const SETS = { us: buildSet(REGIONS.us.box), india: buildSet(REGIONS.india.box) }

let dataP
const loadData = () => dataP || (dataP = fetch('/land-50m.json').then(r => r.json()).then(t => buildMask(decodeLand(t))))

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

const MASK_W = 4096
const MASK_H = 2048

function buildMask(polys) {
  const cv = document.createElement('canvas')
  cv.width = MASK_W; cv.height = MASK_H
  const g = cv.getContext('2d', { willReadFrequently: true })
  g.beginPath()
  polys.forEach(poly => poly.forEach(ring => {
    ring.forEach(([x, y], i) => {
      const px = ((x + 180) / 360) * MASK_W, py = ((90 - y) / 180) * MASK_H
      i ? g.lineTo(px, py) : g.moveTo(px, py)
    })
    g.closePath()
  }))
  g.fill('evenodd')
  const d = g.getImageData(0, 0, MASK_W, MASK_H).data
  const m = new Uint8Array(MASK_W * MASK_H)
  for (let i = 0; i < m.length; i++) m[i] = d[i * 4 + 3] > 127 ? 1 : 0
  return m
}

const T = 46
const T2 = 28
const PW = 300
const PH = 262

const slidesOf = it => {
  if (it.kind === 'group') return [it.thumb, ...it.childThumbs].filter(Boolean)
  if (it.slides && it.slides.length > 1) return it.slides
  return it.photos || it.slides || (it.thumb ? [it.thumb] : [])
}

export default function Globe({ onOpenPhoto, region }) {
  const isMobile = useIsMobile()
  const R0 = REGIONS[region]
  const { items: ITEMS, order: ORDER } = SETS[region]
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const pinRefs = useRef([])
  const labelRefs = useRef([])
  const popRef = useRef(null)
  const hoverRef = useRef(-1)
  const state = useRef({
    cur: { ...R0.center, z: 3 },
    tgt: { ...R0.center, z: 3 },
    z0: 0, mask: null, inView: false, drag: null, moved: 0, last: Date.now(), hovering: false,
  })
  const [hover, setHover] = useState(-1)
  const [slide, setSlide] = useState(0)
  const [paused, setPaused] = useState(false)
  const [big, setBig] = useState(null)
  const leaveT = useRef(0)

  useEffect(() => {
    let dead = false
    loadData().then(mask => { if (!dead) state.current.mask = mask })
    return () => { dead = true }
  }, [])

  useEffect(() => { setSlide(0); setPaused(false) }, [hover])

  useEffect(() => {
    if (hover < 0 || paused || big || slidesOf(ITEMS[hover]).length < 2) return
    const n = slidesOf(ITEMS[hover]).length
    const id = setInterval(() => setSlide(i => (i + 1) % n), 1800)
    return () => clearInterval(id)
  }, [hover, paused, big])

  useEffect(() => {
    if (!big) return
    const onKey = e => {
      if (e.key === 'Escape') setBig(null)
      else if (e.key === 'ArrowRight') setBig(b => ({ ...b, i: (b.i + 1) % b.list.length }))
      else if (e.key === 'ArrowLeft') setBig(b => ({ ...b, i: (b.i - 1 + b.list.length) % b.list.length }))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [big])

  const enter = i => { clearTimeout(leaveT.current); hoverRef.current = i; setHover(i) }
  const leave = () => {
    clearTimeout(leaveT.current)
    leaveT.current = setTimeout(() => { hoverRef.current = -1; setHover(-1) }, 280)
  }

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
      if (!s.z0) {
        const base = Math.min(w, h) * 0.43
        s.z0 = Math.max(w / 2 / (R0.fitW * base), h / 2 / (R0.fitH * base))
        c.z = t.z = s.z0
      }
      const z0 = s.z0
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

      if (s.mask) {
        const px0 = 0.9 * RAD * R
        const kk = Math.max(0, Math.ceil(Math.log2(px0 / 7.5)))
        const step = 0.9 / 2 ** kk
        const sp = px0 / 2 ** kk
        const r = Math.max(0.5, Math.min(1.3, sp * 0.17))
        const ext = Math.asin(Math.min(1, Math.hypot(w, h) / 2 / R)) / RAD
        const latLo = c.lat - ext, latHi = c.lat + ext
        const wide = latLo <= -89 || latHi >= 89
        const lonExt = wide ? 180 : Math.min(180, ext / Math.cos(Math.min(89, Math.max(Math.abs(latLo), Math.abs(latHi))) * RAD))
        const spL = Math.sin(c.lat * RAD), cpL = Math.cos(c.lat * RAD), cLon = c.lon * RAD
        ctx.fillStyle = LAND_COLOR
        ctx.beginPath()
        for (let la = Math.ceil(Math.max(-58, latLo) / step); la * step <= Math.min(84, latHi); la++) {
          const lat = la * step
          const sl = Math.sin(lat * RAD), cl = Math.cos(lat * RAD)
          const lonStep = step / Math.max(0.25, cl)
          const iy = ((90 - lat) / 180 * MASK_H) | 0
          for (let lj = Math.ceil((c.lon - lonExt) / lonStep); lj * lonStep <= c.lon + lonExt; lj++) {
            const lon = lj * lonStep
            const ix = ((((lon + 180) % 360) + 360) % 360 / 360 * MASK_W) | 0
            if (!s.mask[iy * MASK_W + ix]) continue
            const dl = lon * RAD - cLon, cd = Math.cos(dl)
            if (spL * sl + cpL * cl * cd <= 0.02) continue
            const x = cx + R * cl * Math.sin(dl), y = cy - R * (cpL * sl - spL * cl * cd)
            if (x < -r || x > w + r || y < -r || y > h + r) continue
            ctx.moveTo(x + r, y)
            ctx.arc(x, y, r, 0, Math.PI * 2)
          }
        }
        ctx.fill()
      }

      ctx.restore()

      const k = Math.min(1, 0.6 + (c.z - 1) * 0.2)
      const gf = Math.max(0, Math.min(1, (z0 * 1.6 + 0.4 - c.z) / 0.8))
      const gap = 32 * k
      const labelsOn = c.z >= z0 * 2.2
      const placed = []
      const shown = new Array(ITEMS.length).fill(null)
      ORDER.forEach(i => {
        const it = ITEMS[i]
        const p = project(it.lon * RAD, it.lat * RAD, c, R, cx, cy)
        const limb = Math.max(0, Math.min(1, (p.v - 0.05) / 0.2))
        const lvl = it.kind === 'solo' ? 1 : it.kind === 'group' ? gf : 1 - gf
        let vis = limb * lvl
        if (vis > 0.02) {
          const size = (it.photos ? T : T2) * k
          const box = labelsOn && it.kind !== 'group'
            ? { x: p.x, y: p.y + 13, hw: Math.max(size, it.name.length * 6 + 16) / 2, hh: (size + 26) / 2 }
            : { x: p.x, y: p.y, hw: gap / 2, hh: gap / 2 }
          const hit = placed.some(q => labelsOn
            ? Math.abs(q.x - box.x) < q.hw + box.hw && Math.abs(q.y - box.y) < q.hh + box.hh
            : Math.hypot(q.x - p.x, q.y - p.y) < gap)
          if (hit) vis = 0
          else placed.push(box)
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
        const lb = labelRefs.current[i]
        if (lb) lb.style.opacity = hoverRef.current === i || (labelsOn && it.kind !== 'group' && vis > 0.5) ? 1 : 0
      })

      const pop = popRef.current
      if (pop) {
        const hi = hoverRef.current
        if (hi >= 0 && shown[hi].vis > 0.5 && slidesOf(ITEMS[hi]).length) {
          const { p } = shown[hi]
          const half = ((ITEMS[hi].photos ? T : T2) / 2) * k + 4
          let top = p.y - half - PH
          if (top < 8) top = p.y + half
          top = Math.max(8, Math.min(h - PH - 8, top))
          const left = Math.max(8, Math.min(w - PW - 8, p.x - PW / 2))
          pop.style.transform = `translate3d(${left}px, ${top}px, 0)`
          pop.style.opacity = 1
          pop.style.pointerEvents = 'auto'
        } else { pop.style.opacity = 0; pop.style.pointerEvents = 'none' }
      }
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
    const pn = R0.pan
    s.tgt.lon = s.cur.lon = Math.max(pn.lonLo, Math.min(pn.lonHi, s.tgt.lon - dx * deg))
    s.tgt.lat = s.cur.lat = Math.max(pn.latLo, Math.min(pn.latHi, s.tgt.lat + dy * deg))
  }
  const onUp = () => { state.current.drag = null; state.current.last = Date.now() }

  const zoom = f => {
    const t = state.current.tgt
    state.current.last = Date.now()
    t.z = Math.max(state.current.z0 || 1, Math.min(40, t.z * f))
  }

  const pick = pl => {
    if (state.current.moved > 6) return
    const t = state.current.tgt
    state.current.last = Date.now()
    t.lon = pl.lon; t.lat = pl.lat; t.z = Math.max(t.z, pl.kind === 'group' ? 7 : 10)
    if (pl.photos) onOpenPhoto(pl.photos[0])
  }

  const ctl = {
    width: 26, height: 26, borderRadius: 8, border: 'none', background: 'rgba(0,0,0,0.06)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
  }

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
        position: 'relative', width: '100%', height: isMobile ? 320 : 400,
        borderRadius: 20, overflow: 'hidden', touchAction: 'pan-y', cursor: 'grab',
        background: 'rgba(255,255,255,0.35)', border: '1px solid rgba(0,0,0,0.07)',
      }}
    >
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />
      <span style={{
        position: 'absolute', left: 14, top: 14, zIndex: 4, fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
        textTransform: 'uppercase', color: '#171717', background: 'rgba(255,255,255,0.8)', padding: '4px 10px', borderRadius: 8, pointerEvents: 'none',
      }}>{R0.label}</span>

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
              onMouseEnter={() => enter(i)}
              onMouseLeave={leave}
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
            <span ref={el => { labelRefs.current[i] = el }} style={{
              position: 'absolute', left: 0, top: size / 2 + 6, transform: 'translateX(-50%)',
              whiteSpace: 'nowrap', fontSize: 11, fontWeight: 600, color: '#171717',
              background: 'rgba(255,255,255,0.88)', padding: '2px 8px', borderRadius: 6, pointerEvents: 'none',
              opacity: 0, transition: 'opacity 0.25s ease',
            }}>
              {pl.name}
            </span>
          </div>
        )
      })}

      <div ref={popRef} onMouseEnter={() => clearTimeout(leaveT.current)} onMouseLeave={leave} onPointerDown={e => e.stopPropagation()} style={{
        position: 'absolute', left: 0, top: 0, width: PW, height: PH, opacity: 0, zIndex: 20, pointerEvents: 'none', cursor: 'default',
        padding: 6, boxSizing: 'border-box', borderRadius: 16, background: '#fff', boxShadow: '0 18px 48px rgba(0,0,0,0.28)',
        transition: 'opacity 0.2s ease',
      }}>
        {hover >= 0 && (() => {
          const it = ITEMS[hover]
          const sl = slidesOf(it)
          return (
            <>
              <div style={{ position: 'relative', width: '100%', height: PH - 46, borderRadius: 11, overflow: 'hidden', background: 'linear-gradient(135deg, #fde68a, #fb923c)' }}>
                {sl.map((src, j) => (
                  <div key={src} style={{
                    position: 'absolute', inset: 0, background: `url(${src}) center/cover`,
                    opacity: j === slide % sl.length ? 1 : 0, transition: 'opacity 0.5s ease',
                  }} />
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 34, padding: '0 4px' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#171717' }}>{it.name}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {sl.length > 1 && (
                    <span style={{ display: 'flex', gap: 4 }}>
                      {sl.map((_, j) => (
                        <span key={j} style={{ width: 5, height: 5, borderRadius: '50%', background: j === slide % sl.length ? '#171717' : 'rgba(0,0,0,0.18)' }} />
                      ))}
                    </span>
                  )}
                  {sl.length > 1 && (
                    <button onClick={() => setPaused(v => !v)} aria-label={paused ? 'Play slideshow' : 'Pause slideshow'} style={ctl}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="#171717">
                        {paused ? <path d="M3 1.5v9l7.5-4.5z" /> : <><rect x="2.5" y="1.5" width="2.5" height="9" rx="0.5" /><rect x="7" y="1.5" width="2.5" height="9" rx="0.5" /></>}
                      </svg>
                    </button>
                  )}
                  <button onClick={() => setBig({ list: sl, i: slide % sl.length })} aria-label="Enlarge photo" style={ctl}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#171717" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7.5 1.5h3v3M4.5 10.5h-3v-3M10.5 1.5L7 5M1.5 10.5L5 7" />
                    </svg>
                  </button>
                </span>
              </div>
            </>
          )
        })()}
      </div>

      {big && createPortal(
        <div onClick={() => setBig(null)} style={{
          position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(10,10,10,0.92)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out',
        }}>
          <img src={big.list[big.i]} alt="" onClick={e => e.stopPropagation()} style={{
            maxWidth: '92vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: 12, cursor: 'default',
          }} />
          {big.list.length > 1 && [-1, 1].map(d => (
            <button key={d} onClick={e => { e.stopPropagation(); setBig(b => ({ ...b, i: (b.i + d + b.list.length) % b.list.length })) }}
              aria-label={d < 0 ? 'Previous photo' : 'Next photo'} style={{
                position: 'absolute', top: '50%', [d < 0 ? 'left' : 'right']: 16, transform: 'translateY(-50%)',
                width: 40, height: 40, borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 20, cursor: 'pointer',
              }}>{d < 0 ? '\u2039' : '\u203a'}</button>
          ))}
          <button onClick={() => setBig(null)} aria-label="Close" style={{
            position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 20, cursor: 'pointer',
          }}>&times;</button>
        </div>,
        document.body
      )}

      <div style={{ position: 'absolute', right: 14, bottom: 14, display: 'flex', flexDirection: "column", gap: 6, zIndex: 4 }}>
        <button style={btn} onClick={() => zoom(1.6)} aria-label="Zoom in">+</button>
        <button style={btn} onClick={() => zoom(1 / 1.6)} aria-label="Zoom out">&minus;</button>
      </div>
    </div>
  )
}
