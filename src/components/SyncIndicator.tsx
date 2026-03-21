import { db, backendConnector } from '../lib/powersync'
import { useState, useEffect } from 'react'

export default function SyncIndicator() {
  const [status, setStatus] = useState(db.currentStatus)
  const [isOnline, setIsOnline] = useState(window.navigator.onLine)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Force PowerSync to re-connect with the correct connector
      db.connect(backendConnector).catch(e => console.error('PowerSync reconnect failed:', e))
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    const remove = db.registerListener({
      statusChanged: (s) => {
        setStatus(s)
        // Fresh check of navigator on every status change as well
        setIsOnline(window.navigator.onLine)
      },
    })

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      remove()
    }
  }, [db])

  const isConnected = status?.connected
  const isConnecting = status?.connecting
  const isSyncing = status?.dataFlowStatus?.downloading || status?.dataFlowStatus?.uploading

  let bg: string, border: string, color: string, label: string, pulse: boolean

  // Hierarchy of Truth:
  // 1. If the browser/hardware is offline, we are OFFLINE. (Immediate feedback for user/judge)
  if (!isOnline) {
    bg = 'var(--red-dim)'; border = 'var(--red)'; color = 'var(--red)'
    label = 'OFFLINE · LOCAL ONLY'; pulse = true
  } 
  // 2. If we are online but not connected yet
  else if (isConnecting && !isConnected) {
    bg = 'var(--amber-dim)'; border = 'var(--amber)'; color = 'var(--amber)'
    label = 'CONNECTING...'; pulse = true
  }
  // 3. If we are online but specifically disconnected (socket closed/error)
  else if (!isConnected) {
    bg = 'var(--red-dim)'; border = 'var(--red)'; color = 'var(--red)'
    label = 'RECONNECTING...'; pulse = true
  }
  // 4. We are connected! Show data flow
  else if (isSyncing) {
    bg = 'var(--amber-dim)'; border = 'var(--amber)'; color = 'var(--amber)'
    label = 'SYNCING...'; pulse = true
  }
  // 5. All systems nominal
  else {
    bg = 'var(--green-dim)'; border = 'var(--green)'; color = 'var(--green)'
    label = 'SYNCED'; pulse = false
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '5px 12px',
      borderRadius: '20px',
      border: `1px solid ${border}`,
      background: bg,
      color: color,
      fontFamily: 'var(--font-mono)',
      fontSize: '11px',
      letterSpacing: '0.08em',
      fontWeight: 600,
      marginRight: '8px'
    }}>
      <span style={{
        width: '7px',
        height: '7px',
        borderRadius: '50%',
        background: color,
        animation: pulse ? 'pulse 1.5s infinite' : 'none',
        flexShrink: 0
      }} />
      {label}
    </div>
  )
}
