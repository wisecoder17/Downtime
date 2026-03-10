import { usePowerSyncQuery } from '@powersync/react'
import { useNavigate } from 'react-router-dom'
import SyncIndicator from '../components/SyncIndicator'
import IncidentCard from '../components/IncidentCard'

export default function Dashboard() {
  const navigate = useNavigate()
  const { data: incidents } = usePowerSyncQuery(
    'SELECT * FROM incidents ORDER BY created_at DESC'
  )

  const open = incidents?.filter((i: any) => i.status === 'open').length ?? 0
  const investigating = incidents?.filter((i: any) => i.status === 'investigating').length ?? 0
  const resolved = incidents?.filter((i: any) => i.status === 'resolved').length ?? 0
  const total = incidents?.length ?? 0

  const stats = [
    { label: 'TOTAL', value: total, color: 'var(--text-secondary)' },
    { label: 'OPEN', value: open, color: 'var(--red)' },
    { label: 'INVESTIGATING', value: investigating, color: 'var(--amber)' },
    { label: 'RESOLVED', value: resolved, color: 'var(--green)' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Top Bar */}
      <header
        style={{
          height: '56px',
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.15em', fontSize: '14px', color: 'var(--text-primary)' }}>
          <span style={{ color: 'var(--red)' }}>●</span>{' '}DOWNTIME
        </span>
        <SyncIndicator />
      </header>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px 100px' }}>
        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}>
          {stats.map(s => (
            <div
              key={s.label}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '12px',
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 700, color: s.color }}>
                {s.value}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '4px' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Section Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Active Incidents
          </span>
          {total > 0 && (
            <span
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--text-secondary)',
                padding: '1px 7px',
              }}
            >
              {total}
            </span>
          )}
        </div>

        {/* Incident List */}
        {!total ? (
          <div
            style={{
              padding: '64px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span style={{ color: 'var(--green)', fontSize: '28px' }}>✓</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--green)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              All Systems Nominal
            </span>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '12px' }}>
            {incidents.map((incident: any) => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </div>
        )}
      </main>

      {/* FAB */}
      <button
        onClick={() => navigate('/incidents/new')}
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          background: 'var(--red)',
          color: '#fff',
          border: 'none',
          borderRadius: 'var(--radius)',
          padding: '12px 22px',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(255,71,87,0.35)',
          transition: 'background var(--transition)',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = '#ff6470')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--red)')}
      >
        + New Incident
      </button>
    </div>
  )
}
