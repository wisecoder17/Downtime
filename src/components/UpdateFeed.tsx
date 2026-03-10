export default function UpdateFeed({ updates }: { updates: any[] }) {
  if (!updates || updates.length === 0) {
    return (
      <div
        style={{
          padding: '32px 16px',
          textAlign: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--text-muted)',
          letterSpacing: '0.08em',
        }}
      >
        NO UPDATES YET
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0px' }}>
      {/* Vertical left line */}
      <div
        style={{
          position: 'absolute',
          left: '7px',
          top: '8px',
          bottom: '8px',
          width: '1px',
          background: 'var(--border)',
        }}
      />

      {updates.map((update, idx) => (
        <div
          key={idx}
          style={{
            display: 'flex',
            gap: '16px',
            paddingBottom: idx === updates.length - 1 ? '0' : '20px',
          }}
        >
          {/* Dot on the line */}
          <div
            style={{
              width: '15px',
              height: '15px',
              borderRadius: '50%',
              background: 'var(--bg-base)',
              border: '1px solid var(--border-bright)',
              flexShrink: 0,
              marginTop: '3px',
              zIndex: 1,
            }}
          />

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px',
                gap: '8px',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 600,
                }}
              >
                {update.author}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  flexShrink: 0,
                }}
              >
                {new Date(update.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <p
              style={{
                color: 'var(--text-primary)',
                fontSize: '13px',
                lineHeight: '1.6',
              }}
            >
              {update.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
