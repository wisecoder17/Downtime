import { usePowerSync } from '@powersync/react'
import { useState, useEffect } from 'react'

export default function SyncIndicator() {
  const db = usePowerSync()
  const [status, setStatus] = useState(db.currentStatus)
  const [isOnline, setIsOnline] = useState(window.navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    const remove = db.registerListener({
      statusChanged: (s) => setStatus(s),
    })

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      remove()
    }
  }, [db])

  const isConnected = status?.connected && isOnline
  const isSyncing = status?.dataFlowStatus?.downloading || status?.dataFlowStatus?.uploading

  let bg: string, border: string, color: string, label: string, pulse: boolean

  if (isConnected && !isSyncing) {
    bg = 'var(--green-dim)'; border = 'var(--green)'; color = 'var(--green)'
    label = 'SYNCED'; pulse = false
  } else if (isConnected && isSyncing) {
    bg = 'var(--amber-dim)'; border = 'var(--amber)'; color = 'var(--amber)'
    label = 'SYNCING...'; pulse = true
  } else {
    bg = 'var(--red-dim)'; border = 'var(--red)'; color = 'var(--red)'
    label = 'OFFLINE · LOCAL ONLY'; pulse = true
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
