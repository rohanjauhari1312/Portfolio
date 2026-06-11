import { useState, useEffect } from 'react'
import ChatConversation from './ChatConversation'

export default function RohBotScreen({ onBack }) {
  const [vp, setVp] = useState({ height: null, offsetTop: 0 })

  // Track the visual viewport. On iOS the keyboard shrinks the visual viewport
  // and can scroll the layout viewport, so we follow both height and offsetTop
  // to keep the panel pinned exactly over the visible area.
  useEffect(() => {
    if (!window.visualViewport) return
    const vv = window.visualViewport
    const update = () => setVp({ height: vv.height, offsetTop: vv.offsetTop })
    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])

  // Hard-lock the page behind: fix the body in place so iOS can't scroll it
  // when the input is focused.
  useEffect(() => {
    const scrollY = window.scrollY
    const { style } = document.body
    style.position = 'fixed'
    style.top = `-${scrollY}px`
    style.left = '0'
    style.right = '0'
    style.width = '100%'
    style.overflow = 'hidden'
    return () => {
      style.position = ''
      style.top = ''
      style.left = ''
      style.right = ''
      style.width = ''
      style.overflow = ''
      window.scrollTo(0, scrollY)
    }
  }, [])

  return (
    <div style={{
      position: 'fixed',
      left: 0, right: 0,
      top: vp.offsetTop,
      width: '100vw',
      height: vp.height ? `${vp.height}px` : '100dvh',
      background: '#0c0c0c',
      zIndex: 300,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      overscrollBehavior: 'none',
    }}>
      <ChatConversation onClose={onBack} fullscreen />
    </div>
  )
}
