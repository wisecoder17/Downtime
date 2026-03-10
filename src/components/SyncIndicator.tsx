import { usePowerSync } from '@powersync/react'

export default function SyncIndicator() {
  const db = usePowerSync()
  const status = db.currentStatus

  const isConnected = status?.connected
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
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
      style={{
        background: bg,
        borderColor: border,
        color,
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        letterSpacing: '0.1em',
        transition: 'all var(--transition)',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${pulse ? 'pulse-dot' : ''}`}
        style={{ background: color }}
      />
      {label}
    </div>
  )
}
