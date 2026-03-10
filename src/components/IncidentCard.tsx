import { useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge'

const severityBorderColor: Record<string, string> = {
  critical: 'var(--red)',
  high: 'var(--amber)',
  medium: 'var(--blue)',
  low: 'var(--green)',
}

const severityTextColor: Record<string, string> = {
  critical: 'var(--red)',
  high: 'var(--amber)',
  medium: 'var(--blue)',
  low: 'var(--green)',
}

export default function IncidentCard({ incident }: { incident: any }) {
  const navigate = useNavigate()
  const sev = incident.severity?.toLowerCase() || 'low'
  const accentColor = severityBorderColor[sev] || 'var(--border-bright)'

  return (
    <div
      onClick={() => navigate(`/incidents/${incident.id}`)}
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid var(--border)`,
        borderLeft: `3px solid ${accentColor}`,
        borderRadius: 'var(--radius)',
        padding: '16px',
        cursor: 'pointer',
        transition: 'background var(--transition)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <span
          style={{
            color: 'var(--text-primary)',
            fontWeight: 600,
            fontSize: '14px',
            lineHeight: '1.4',
            flex: 1,
          }}
          className="line-clamp-2"
        >
          {incident.title}
        </span>
        <StatusBadge status={incident.status} />
      </div>

      {/* Mid row */}
      <div className="flex items-center gap-3">
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.1em',
            color: severityTextColor[sev] || 'var(--text-secondary)',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          {incident.severity}
        </span>
        <span style={{ color: 'var(--border)', fontSize: '10px' }}>·</span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-muted)',
          }}
        >
          {incident.created_by}
        </span>
      </div>

      {/* Bottom row */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          borderTop: '1px solid var(--border)',
          paddingTop: '8px',
          marginTop: '2px',
        }}
      >
        {new Date(incident.created_at).toLocaleString(undefined, {
          month: 'short', day: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })}
      </div>
    </div>
  )
}
