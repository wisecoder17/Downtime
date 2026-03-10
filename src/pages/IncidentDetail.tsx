import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { usePowerSync, usePowerSyncQuery } from '@powersync/react'
import SyncIndicator from '../components/SyncIndicator'
import StatusBadge from '../components/StatusBadge'
import AIPanel from '../components/AIPanel'
import UpdateFeed from '../components/UpdateFeed'

const severityColor: Record<string, string> = {
  critical: 'var(--red)',
  high: 'var(--amber)',
  medium: 'var(--blue)',
  low: 'var(--green)',
}

export default function IncidentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const db = usePowerSync()

  const { data: incidents } = usePowerSyncQuery('SELECT * FROM incidents WHERE id = ?', [id])
  const { data: updates } = usePowerSyncQuery(
    'SELECT * FROM incident_updates WHERE incident_id = ? ORDER BY created_at ASC', [id]
  )

  const incident = incidents?.[0]
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('')

  if (!incident) return null

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content || !author) return
    await db.execute(
      `INSERT INTO incident_updates (id, incident_id, content, author, created_at) VALUES (?, ?, ?, ?, ?)`,
      [uuidv4(), id, content, author, new Date().toISOString()]
    )
    setContent('')
  }

  const markInvestigating = () => db.execute(`UPDATE incidents SET status = 'investigating' WHERE id = ?`, [id])
  const markResolved = () => db.execute(`UPDATE incidents SET status = 'resolved', resolved_at = ? WHERE id = ?`, [new Date().toISOString(), id])

  const sev = incident.severity?.toLowerCase()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', paddingBottom: '60px' }}>
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
        zIndex: 50,
        gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px', flexShrink: 0, transition: 'color var(--transition)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            ←
          </button>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {incident.title}
          </span>
          <StatusBadge status={incident.status} />
        </div>
        <SyncIndicator />
      </header>

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '28px 24px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px', '@media(max-width:768px)': { gridTemplateColumns: '1fr' } as any }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
          <AIPanel incident={incident} />

          {/* Updates */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <div style={{ borderBottom: '1px solid var(--border)', padding: '12px 16px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
                Updates
              </span>
            </div>
            <div style={{ padding: '16px' }}>
              <UpdateFeed updates={updates || []} />
            </div>

            {/* Add Update Form */}
            <form
              onSubmit={handleUpdate}
              style={{ borderTop: '1px solid var(--border)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              <textarea
                required
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={2}
                placeholder="Post a status update..."
                style={{ resize: 'none' }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  required
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  placeholder="Your name"
                  style={{ flex: '0 0 140px' }}
                />
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'border-color var(--transition)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-bright)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  Post Update
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right column — metadata + actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Metadata card */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <div style={{ borderBottom: '1px solid var(--border)', padding: '12px 16px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
                Metadata
              </span>
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <MetaRow label="SEVERITY">
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: severityColor[sev] || 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  {incident.severity}
                </span>
              </MetaRow>
              <MetaRow label="REPORTED BY">
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>{incident.created_by}</span>
              </MetaRow>
              <MetaRow label="OPENED">
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                  {new Date(incident.created_at).toLocaleString()}
                </span>
              </MetaRow>
              {incident.resolved_at && (
                <MetaRow label="RESOLVED">
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--green)' }}>
                    {new Date(incident.resolved_at).toLocaleString()}
                  </span>
                </MetaRow>
              )}
            </div>
          </div>

          {/* Action buttons */}
          {incident.status !== 'resolved' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <OutlineButton color="var(--amber)" onClick={markInvestigating}>
                Mark Investigating
              </OutlineButton>
              <OutlineButton color="var(--green)" onClick={markResolved}>
                Mark Resolved
              </OutlineButton>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '3px' }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function OutlineButton({ color, onClick, children }: { color: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        background: 'transparent',
        border: `1px solid ${color}`,
        borderRadius: 'var(--radius)',
        color,
        padding: '9px 12px',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        transition: 'background var(--transition)',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = color + '22')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {children}
    </button>
  )
}
