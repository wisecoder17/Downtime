export default function StatusBadge({ status }: { status: string }) {
  let bg: string, border: string, color: string

  switch (status?.toLowerCase()) {
    case 'open':
      bg = 'var(--red-dim)'; border = 'var(--red)'; color = 'var(--red)'; break
    case 'investigating':
      bg = 'var(--amber-dim)'; border = 'var(--amber)'; color = 'var(--amber)'; break
    case 'resolved':
      bg = 'var(--green-dim)'; border = 'var(--green)'; color = 'var(--green)'; break
    default:
      bg = 'var(--bg-elevated)'; border = 'var(--border)'; color = 'var(--text-muted)'
  }

  return (
    <span
      style={{
        background: bg,
        border: `1px solid ${border}`,
        color,
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        letterSpacing: '0.12em',
        padding: '2px 8px',
        borderRadius: '4px',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        fontWeight: 600,
      }}
    >
      {status || 'UNKNOWN'}
    </span>
  )
}
