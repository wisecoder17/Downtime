import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { usePowerSync } from '@powersync/react'
import SyncIndicator from '../components/SyncIndicator'

const severityColors: Record<string, string> = {
  low: 'var(--green)',
  medium: 'var(--blue)',
  high: 'var(--amber)',
  critical: 'var(--red)',
}

export default function NewIncident() {
  const navigate = useNavigate()
  const db = usePowerSync()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState('low')
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !description || !name) return
    setIsSubmitting(true)

    const id = uuidv4()
    const now = new Date().toISOString()

    await db.execute(
      `INSERT INTO incidents (id, title, description, severity, status, created_by, created_at)
       VALUES (?, ?, ?, ?, 'open', ?, ?)`,
      [id, title, description, severity, name, now]
    )

    navigate(`/incidents/${id}`)

    try {
      const res = await fetch('http://localhost:4111/api/agents/IncidentDiagnosticAgent/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Title: ${title}\nDescription: ${description}\nSeverity: ${severity}` }]
        })
      })
      const data = await res.json()
      const parsed = JSON.parse(data.text)
      await db.execute(
        `UPDATE incidents SET ai_diagnosis = ?, ai_actions = ? WHERE id = ?`,
        [parsed.diagnosis, JSON.stringify({ immediate_actions: parsed.immediate_actions || [], monitor: parsed.monitor || [] }), id]
      )
    } catch {
      await db.execute(
        `UPDATE incidents SET ai_diagnosis = ?, ai_actions = ? WHERE id = ?`,
        ['Diagnosis unavailable', JSON.stringify({ immediate_actions: [], monitor: [] }), id]
      )
    }
  }

  const label = (text: string) => (
    <div style={{
      fontFamily: 'var(--font-mono)',
      fontSize: '10px',
      color: 'var(--text-muted)',
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      marginBottom: '6px',
      fontWeight: 600,
    }}>
      {text}
    </div>
  )

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
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              fontSize: '18px',
              lineHeight: 1,
              transition: 'color var(--transition)',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            ←
          </button>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.12em', fontSize: '13px', color: 'var(--text-primary)' }}>
            NEW INCIDENT
          </span>
        </div>
        <SyncIndicator />
      </header>

      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 24px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <div>
            {label('Incident Title')}
            <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Database connection pool exhausted" />
          </div>

          <div>
            {label('Description')}
            <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Describe the symptoms and impact..." style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              {label('Severity')}
              <select value={severity} onChange={e => setSeverity(e.target.value)} style={{ color: severityColors[severity] || 'var(--text-primary)' }}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              {label('Your Name')}
              <input required value={name} onChange={e => setName(e.target.value)} placeholder="Engineer name" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              background: isSubmitting ? 'var(--bg-elevated)' : 'var(--red)',
              color: isSubmitting ? 'var(--text-muted)' : '#fff',
              border: 'none',
              borderRadius: 'var(--radius)',
              padding: '13px 20px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'background var(--transition)',
              marginTop: '8px',
            }}
            onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.background = '#ff6470' }}
            onMouseLeave={e => { if (!isSubmitting) e.currentTarget.style.background = 'var(--red)' }}
          >
            {isSubmitting ? 'Analysing...' : 'Declare Incident →'}
          </button>
        </form>
      </main>
    </div>
  )
}
