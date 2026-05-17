import { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const outerRef = useRef(null)
  const innerRef = useRef(null)
  const pos = useRef({ x: -100, y: -100 })
  const smoothPos = useRef({ x: -100, y: -100 })
  const rafRef = useRef(null)
  const [onLink, setOnLink] = useState(false)

  useEffect(() => {
    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY }
    }
    const onOver = (e) => {
      if (e.target.closest && e.target.closest('a, button')) setOnLink(true)
    }
    const onOut = (e) => {
      if (e.target.closest && e.target.closest('a, button') && !e.relatedTarget?.closest?.('a, button')) setOnLink(false)
    }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)

    const animate = () => {
      smoothPos.current.x += (pos.current.x - smoothPos.current.x) * 0.12
      smoothPos.current.y += (pos.current.y - smoothPos.current.y) * 0.12

      if (outerRef.current) {
        outerRef.current.style.transform = `translate(${smoothPos.current.x - 20}px, ${smoothPos.current.y - 20}px)`
      }
      if (innerRef.current) {
        innerRef.current.style.transform = `translate(${pos.current.x - 3}px, ${pos.current.y - 3}px)`
      }
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <>
      {/* outer ring */}
      <div
        ref={outerRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{ willChange: 'transform' }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: `${onLink ? 2 : 1.5}px solid ${onLink ? '#ef4444' : 'rgba(255,255,255,0.65)'}`,
            borderRadius: '50%',
            transform: onLink ? 'scale(1.25)' : 'scale(1)',
            transformOrigin: 'center',
            boxShadow: onLink ? '0 0 22px rgba(239,68,68,0.55)' : 'none',
            transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
          }}
        />
      </div>
      {/* inner dot */}
      <div
        ref={innerRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{ willChange: 'transform' }}
      >
        <div
          style={{
            width: onLink ? 8 : 6,
            height: onLink ? 8 : 6,
            backgroundColor: onLink ? '#ef4444' : '#ffffff',
            borderRadius: '50%',
            boxShadow: onLink ? '0 0 10px rgba(239,68,68,0.7)' : 'none',
            transition: 'background-color 0.18s ease, width 0.18s ease, height 0.18s ease',
          }}
        />
      </div>
    </>
  )
}
