import { useQuery } from '@powersync/react'
import { useNavigate } from 'react-router-dom'
import SyncIndicator from '../components/SyncIndicator'
import IncidentCard from '../components/IncidentCard'

export default function Dashboard() {
  const navigate = useNavigate()

  const { data: incidents } = useQuery(
    'SELECT * FROM incidents ORDER BY created_at DESC'
  )

  const incidentsArray = incidents || []


  const stats = [
    { label: 'TOTAL', value: incidentsArray.length, color: 'var(--text-primary)' },
    { label: 'OPEN', value: incidentsArray.filter((i: any) => i.status === 'open').length, color: 'var(--red)' },
    { label: 'INVESTIGATING', value: incidentsArray.filter((i: any) => i.status === 'investigating').length, color: 'var(--amber)' },
    { label: 'RESOLVED', value: incidentsArray.filter((i: any) => i.status === 'resolved').length, color: 'var(--green)' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Top Bar */}
      <header style={{
        height: '56px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: '13px',
            letterSpacing: '0.15em',
            color: 'var(--text-primary)'
          }}>
            <span style={{ color: 'var(--red)' }}>●</span> DOWNTIME
          </span>
        </div>
        <SyncIndicator />
      </header>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px 100px' }}>
        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '24px' }}>
          {stats.map(stat => (
            <div key={stat.label} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderTop: `2px solid ${stat.color}`,
              borderRadius: 'var(--radius)',
              padding: '14px 16px'
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 700, color: stat.color, marginBottom: '4px' }}>
                {stat.value}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Section Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Active Incidents
          </span>
          {incidentsArray.length > 0 && (
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
              {incidentsArray.length}
            </span>
          )}
        </div>

        {/* Incident List */}
        {incidentsArray.length === 0 ? (
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
            {incidentsArray.map((incident: any) => (
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
          padding: '14px 24px',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(255, 71, 87, 0.4)',
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
