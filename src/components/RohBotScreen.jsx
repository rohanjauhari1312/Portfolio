import { useState, useEffect } from 'react'
import ChatConversation from './ChatConversation'

export default function RohBotScreen({ onBack }) {
  const [vvHeight, setVvHeight] = useState(null)

  // Resize to the visual viewport so the keyboard never covers the input.
  useEffect(() => {
    if (!window.visualViewport) return
    const vv = window.visualViewport
    const update = () => setVvHeight(vv.height)
    update()
    vv.addEventListener('resize', update)
    return () => vv.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      width: '100vw',
      height: vvHeight ? `${vvHeight}px` : '100dvh',
      background: '#0c0c0c',
      zIndex: 300,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <ChatConversation onClose={onBack} fullscreen />
    </div>
  )
}
