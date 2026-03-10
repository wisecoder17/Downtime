import { useState } from 'react'

export default function AIPanel({ incident }: { incident: any }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({})

  if (!incident) return null

  // Loading state
  if (!incident.ai_diagnosis) {
    return (
      <div
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '20px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            letterSpacing: '0.05em',
          }}
          className="cursor"
        >
          Analysing incident
        </div>
      </div>
    )
  }

  let immediateActions: string[] = []
  let monitor: string[] = []

  try {
    const parsed = JSON.parse(incident.ai_actions || '[]')
    if (Array.isArray(parsed)) {
      immediateActions = parsed
    } else {
      immediateActions = parsed.immediate_actions || []
      monitor = parsed.monitor || []
    }
  } catch {
    immediateActions = []
  }

  return (
    <div
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: '1px solid var(--border)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '13px' }}>🤖</span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-muted)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          AI Diagnosis
        </span>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Diagnosis text */}
        <p
          style={{
            color: 'var(--text-primary)',
            fontSize: '14px',
            lineHeight: '1.7',
            fontStyle: 'italic',
          }}
        >
          {incident.ai_diagnosis}
        </p>

        {/* Immediate Actions */}
        {immediateActions.length > 0 && (
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--amber)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: 600,
                marginBottom: '10px',
              }}
            >
              Immediate Actions
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', listStyle: 'none' }}>
              {immediateActions.map((action, idx) => (
                <li
                  key={idx}
                  onClick={() => setChecked(p => ({ ...p, [idx]: !p[idx] }))}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    cursor: 'pointer',
                    opacity: checked[idx] ? 0.5 : 1,
                    transition: 'opacity var(--transition)',
                  }}
                >
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      border: `1px solid ${checked[idx] ? 'var(--green)' : 'var(--border-bright)'}`,
                      borderRadius: '3px',
                      background: checked[idx] ? 'var(--green-dim)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      shrink: 0,
                      marginTop: '2px',
                      flexShrink: 0,
                    }}
                  >
                    {checked[idx] && (
                      <span style={{ color: 'var(--green)', fontSize: '10px', lineHeight: 1 }}>✓</span>
                    )}
                  </div>
                  <span
                    style={{
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      textDecoration: checked[idx] ? 'line-through' : 'none',
                    }}
                  >
                    {action}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Monitor */}
        {monitor.length > 0 && (
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--blue)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: 600,
                marginBottom: '10px',
              }}
            >
              Monitor
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '6px', listStyle: 'none' }}>
              {monitor.map((item, idx) => (
                <li
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    color: 'var(--text-secondary)',
                    fontSize: '13px',
                  }}
                >
                  <span style={{ color: 'var(--blue)', marginTop: '2px' }}>›</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
