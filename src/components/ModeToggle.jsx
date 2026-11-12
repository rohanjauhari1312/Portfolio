const OPTIONS = [
  { id: 'professional', label: 'Professional' },
  { id: 'personal', label: 'Personal' },
]

export default function ModeToggle({ mode, onChange, light = false, compact = false }) {
  const w = compact ? 84 : 96
  return (
    <div
      role="tablist"
      aria-label="Portfolio mode"
      style={{
        position: 'relative', display: 'grid', gridTemplateColumns: `${w}px ${w}px`,
        height: 30, borderRadius: 10, flexShrink: 0,
        background: light ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${light ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`,
      }}
    >
      <span style={{
        position: 'absolute', top: 2, bottom: 2, left: 2, width: w - 2,
        borderRadius: 8, background: '#facc15',
        transform: mode === 'personal' ? `translateX(${w - 2}px)` : 'translateX(0)',
        transition: 'transform 0.4s cubic-bezier(.22,1,.36,1)',
      }} />
      {OPTIONS.map(o => {
        const active = mode === o.id
        return (
          <button
            key={o.id}
            role="tab"
            aria-selected={active}
            onClick={() => { if (!active) onChange(o.id) }}
            style={{
              position: 'relative', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: compact ? 11 : 12, fontWeight: 600, letterSpacing: '0.02em',
              color: active ? '#0a0a0a' : light ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.55)',
              transition: 'color 0.3s ease',
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
