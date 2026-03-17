import { useState, useEffect } from 'react'

const THINKING_STEPS = [
  "Reading incident parameters...",
  "Identifying affected system components...",
  "Cross-referencing known failure patterns...",
  "Evaluating severity indicators...",
  "Analysing symptoms for root cause...",
  "Generating mitigation strategy...",
  "Compiling immediate action items...",
  "Preparing monitoring recommendations...",
]

export default function AIPanel({ incident }: { incident: any }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [showResults, setShowResults] = useState(false)

  // Ensure minimum thinking time (3.5s) for the demo
  useEffect(() => {
    if (incident?.ai_diagnosis) {
      const timer = setTimeout(() => {
        setShowResults(true)
      }, 4000) // Hold for 4 seconds to show the IRIS chain of thought
      return () => clearTimeout(timer)
    } else {
      setShowResults(false)
    }
  }, [incident?.ai_diagnosis, incident?.id])

  // Typewriter effect
  useEffect(() => {
    if (showResults) return

    if (isTyping) {
      if (charIndex < THINKING_STEPS[stepIndex].length) {
        const timer = setTimeout(() => {
          setCharIndex(p => p + 1)
        }, 20) // 20ms per char (faster for better demo flow)
        return () => clearTimeout(timer)
      } else {
        setIsTyping(false)
        const pause = setTimeout(() => {
          setIsTyping(true)
          setCharIndex(0)
          setStepIndex(p => (p + 1) % THINKING_STEPS.length)
        }, 400) // 400ms pause after typing
        return () => clearTimeout(pause)
      }
    }
  }, [stepIndex, charIndex, isTyping, showResults])

  if (!incident) return null

  // Loading state
  if (!showResults) {
    return (
      <div key={incident.id} style={{
        background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px',
        opacity: 1, transition: 'opacity 300ms'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
            🤖 AI DIAGNOSIS
          </div>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--amber)',
            background: 'var(--amber-dim)',
            border: '1px solid var(--amber)',
            borderRadius: '20px',
            padding: '2px 8px',
            letterSpacing: '0.08em',
            animation: 'pulse 1.5s infinite'
          }}>
            THINKING...
          </span>
        </div>

        {/* Steps */}
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
          {THINKING_STEPS.slice(0, stepIndex).map((step, i) => (
            <div key={i} style={{ color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--green)', marginRight: '6px' }}>✓</span>{step}
            </div>
          ))}
          <div style={{ color: 'var(--text-primary)' }}>
            <span style={{ color: 'var(--text-muted)', marginRight: '6px' }}>›</span>
            {THINKING_STEPS[stepIndex].substring(0, charIndex)}
            <span style={{ animation: 'blink 1s infinite', display: 'inline-block' }}>_</span>
          </div>
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

  // Loaded state
  return (
    <div key={incident.id} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px', opacity: 1, transition: 'opacity 300ms' }}>
      
      {/* Header */}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '16px' }}>
        🤖 AI DIAGNOSIS
      </div>

      {/* Diagnosis text */}
      <div style={{
        borderLeft: '3px solid var(--blue)',
        paddingLeft: '14px',
        marginBottom: '20px',
        fontStyle: 'italic',
        color: 'var(--text-primary)',
        lineHeight: 1.7,
        fontSize: '14px'
      }}>
        {incident.ai_diagnosis}
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--border)', marginBottom: '16px' }} />

      {/* Immediate Actions */}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--amber)', letterSpacing: '0.12em', fontWeight: 700, marginBottom: '12px' }}>
        ⚡ IMMEDIATE ACTIONS
      </div>
      {immediateActions.map((action, i) => (
        <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-start' }}>
          <div style={{
            width: '16px', height: '16px', borderRadius: '3px',
            border: '1.5px solid var(--amber)', flexShrink: 0, marginTop: '2px'
          }} />
          <span style={{ color: 'var(--text-primary)', lineHeight: 1.6, fontSize: '13px' }}>{action}</span>
        </div>
      ))}

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--border)', margin: '16px 0' }} />

      {/* Monitor */}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--blue)', letterSpacing: '0.12em', fontWeight: 700, marginBottom: '12px' }}>
        📡 MONITOR
      </div>
      {monitor.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>
          <span style={{ color: 'var(--blue)', flexShrink: 0 }}>›</span>
          {item}
        </div>
      ))}
    </div>
  )
}
