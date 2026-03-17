import { useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge'

const severityConfig: Record<string, { border: string, label: string, color: string }> = {
  critical: { border: 'var(--red)',   label: 'CRITICAL', color: 'var(--red)' },
  high:     { border: 'var(--amber)', label: 'HIGH',     color: 'var(--amber)' },
  medium:   { border: 'var(--blue)',  label: 'MEDIUM',   color: 'var(--blue)' },
  low:      { border: 'var(--green)', label: 'LOW',      color: 'var(--green)' },
}

export default function IncidentCard({ incident }: { incident: any }) {
  const navigate = useNavigate()
  const sev = incident.severity?.toLowerCase() || 'low'
  const config = severityConfig[sev] || severityConfig.low

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderLeft: `3px solid ${config.border}`,
      borderRadius: 'var(--radius)',
      padding: '16px 20px',
      cursor: 'pointer',
      transition: 'background var(--transition)',
      marginBottom: '8px'
    }}
    onClick={() => navigate(`/incidents/${incident.id}`)}
    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
    onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-surface)'}
    >
      {/* Row 1: Title + StatusBadge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>{incident.title}</span>
        <StatusBadge status={incident.status} />
      </div>

      {/* Row 2: Severity pill + reported by */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          color: config.color,
          background: config.border + '22',
          border: `1px solid ${config.border}`,
          borderRadius: '3px',
          padding: '2px 7px'
        }}>{config.label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
          {incident.created_by}
        </span>
      </div>

      {/* Row 3: Timestamp */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--border)',
        paddingTop: '8px',
        marginTop: '8px',
        borderColor: 'rgba(42, 42, 58, 0.3)' // ~0.3 opacity of var(--border) which is #2a2a3a
      }}>
        {new Date(incident.created_at).toLocaleString()}
      </div>
    </div>
  )
}
