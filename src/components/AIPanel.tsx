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
  const hasDiagnosis = Boolean(incident?.ai_diagnosis)
  const [stepIndex, setStepIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)

  // 1. Reset logic: whenever the ID changes, restart the animation from scratch.
  useEffect(() => {
    if (incident?.id) {
      setStepIndex(0)
      setCharIndex(0)
      setIsTyping(true)
    }
  }, [incident?.id])

  // 2. Combined Animation Loop: handles both character typing and step progression.
  useEffect(() => {
    if (hasDiagnosis || !incident?.id) return

    // If typing characters in current step
    if (isTyping) {
      if (charIndex < THINKING_STEPS[stepIndex].length) {
        const t = setTimeout(() => setCharIndex(c => c + 1), 25)
        return () => clearTimeout(t)
      } else {
        setIsTyping(false)
      }
    } 
    // If waiting between steps
    else if (stepIndex < THINKING_STEPS.length - 1) {
      const t = setTimeout(() => {
        setStepIndex(s => s + 1)
        setCharIndex(0)
        setIsTyping(true)
      }, 800)
      return () => clearTimeout(t)
    }
    // Final step reached: just sits here. hasDiagnosis handled below will flip view.
  }, [incident?.id, stepIndex, charIndex, isTyping, hasDiagnosis])

  if (!incident) return null

  // ─── RESULTS VIEW ───────────────────────────────────────────────────────────
  if (hasDiagnosis) {
    let immediateActions: string[] = []
    let monitor: string[] = []

    try {
      const parsed = typeof incident.ai_actions === 'string' 
        ? JSON.parse(incident.ai_actions) 
        : (incident.ai_actions || {})
      
      immediateActions = Array.isArray(parsed) ? parsed : (parsed.immediate_actions || [])
      monitor = parsed.monitor || []
    } catch {
      immediateActions = ["Review system logs manually"]
    }

    return (
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--blue)' }}>◉</span> IRIS DIAGNOSIS
        </div>

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

        <div style={{ height: '1px', background: 'var(--border)', marginBottom: '16px' }} />

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--amber)', letterSpacing: '0.12em', fontWeight: 700, marginBottom: '12px' }}>
          ⚡ IMMEDIATE ACTIONS
        </div>
        {immediateActions.length > 0 ? immediateActions.map((action: string, i: number) => (
          <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-start' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '3px', border: '1.5px solid var(--amber)', flexShrink: 0, marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--amber)' }}>!!</div>
            <span style={{ color: 'var(--text-primary)', lineHeight: 1.6, fontSize: '13px' }}>{action}</span>
          </div>
        )) : <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No specific actions identified.</div>}

        {monitor.length > 0 && (
          <>
            <div style={{ height: '1px', background: 'var(--border)', margin: '16px 0' }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--blue)', letterSpacing: '0.12em', fontWeight: 700, marginBottom: '12px' }}>
              📡 MONITOR
            </div>
            {monitor.map((item: string, i: number) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                <span style={{ color: 'var(--blue)', flexShrink: 0 }}>›</span>
                {item}
              </div>
            ))}
          </>
        )}
      </div>
    )
  }

  // ─── THINKING VIEW ──────────────────────────────────────────────────────────
  const isFinalStep = stepIndex === THINKING_STEPS.length - 1 && !isTyping

  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px'
    }}>
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
          {isFinalStep ? 'FINALIZING...' : 'THINKING...'}
        </span>
      </div>

      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        minHeight: '44px'
      }}>
        {stepIndex > 0 && (
          <div style={{ color: 'var(--text-muted)', opacity: 0.5, fontSize: '12px' }}>
            <span style={{ color: 'var(--green)', marginRight: '6px' }}>✓</span>
            {THINKING_STEPS[stepIndex - 1]}
          </div>
        )}
        <div style={{ color: 'var(--text-primary)', lineHeight: 1.4 }}>
          <span style={{ color: 'var(--text-muted)', marginRight: '6px' }}>›</span>
          {THINKING_STEPS[stepIndex].substring(0, charIndex)}
          {(isTyping || isFinalStep) && (
            <span style={{ 
              animation: 'blink 1s infinite', 
              display: 'inline-block', 
              marginLeft: '1px',
              background: 'var(--text-primary)',
              width: '8px',
              height: '14px',
              verticalAlign: 'middle'
            }} />
          )}
        </div>
      </div>
    </div>
  )
}
