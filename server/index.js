import express from 'express'
import pg from 'pg'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const pool = new pg.Pool({ connectionString: process.env.VITE_DATABASE_URL })

// ─── Logging helpers ─────────────────────────────────────────────────────────
const log = (msg, data = '') => console.log(`[${new Date().toLocaleTimeString()}] ${msg}`, data)
const err = (msg, e = '') => console.error(`[${new Date().toLocaleTimeString()}] ❌ ${msg}`, e)

// ─── Allowed columns (SQL injection guard) ────────────────────────────────────
const INCIDENT_COLS = new Set(['title', 'description', 'severity', 'status', 'resolved_at', 'ai_diagnosis', 'ai_actions'])
const UPDATE_COLS   = new Set(['incident_id', 'content', 'author', 'created_at'])

function safePatch(record, allowed) {
  const keys = Object.keys(record).filter(k => k !== 'id' && allowed.has(k))
  if (!keys.length) return null
  const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ')
  const values = [record.id, ...keys.map(k => record[k])]
  return { setClause, values }
}

// ─── IRIS AI trigger ──────────────────────────────────────────────────────────
// Called only once per new incident (when ai_diagnosis is null).
// MOCK: prefix → instant canned response (no API call, demo-safe).
// Everything else → real Mastra/Gemini call with limp-mode fallback.
async function triggerIRIS(record) {
  const isMock = record.title?.toUpperCase().startsWith('MOCK:')

  if (isMock) {
    log(`🛠️  IRIS MOCK triggered for ${record.id}`)
    const diagnosis = 'CRITICAL: Multiple upstream health check failures detected in US-East-1. Pattern suggests database connection pool exhaustion in the checkout-service. Impact: 100% checkout failure for guest users.'
    const actions = JSON.stringify({
      immediate_actions: [
        'Force restart checkout-service pods',
        'Increase max_connections on primary DB',
        'Enable temporary maintenance page for guest checkout',
      ],
      monitor: [
        'DB connection pool saturation',
        'API P99 latency in US-East-1',
        'Error rates on /api/checkout',
      ],
    })
    // 1.5 s delay for demo realism
    setTimeout(async () => {
      try {
        await pool.query(
          'UPDATE incidents SET ai_diagnosis = $1, ai_actions = $2 WHERE id = $3',
          [diagnosis, actions, record.id]
        )
        log(`✅ IRIS MOCK saved for ${record.id}`)
      } catch (e) {
        err(`IRIS MOCK DB write failed`, e.message)
      }
    }, 1500)
    return
  }

  // Real AI flow
  log(`🤖 IRIS triggered for ${record.id}`)
  try {
    const res = await fetch('http://localhost:4111/api/agents/IncidentDiagnosticAgent/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{
          role: 'user',
          content: `Title: ${record.title}\nDescription: ${record.description}\nSeverity: ${record.severity}`
        }]
      })
    })

    if (!res.ok) throw new Error(`Mastra HTTP ${res.status}`)

    const data = await res.json()
    const parsed = JSON.parse(data.text)

    await pool.query(
      'UPDATE incidents SET ai_diagnosis = $1, ai_actions = $2 WHERE id = $3',
      [
        parsed.diagnosis,
        JSON.stringify({ immediate_actions: parsed.immediate_actions || [], monitor: parsed.monitor || [] }),
        record.id
      ]
    )
    log(`✅ IRIS diagnosis saved for ${record.id}`)
  } catch (e) {
    err(`IRIS failed (${record.id}): ${e.message}`)
    // Limp-mode fallback so the UI never hangs on THINKING
    try {
      await pool.query(
        'UPDATE incidents SET ai_diagnosis = $1, ai_actions = $2 WHERE id = $3',
        [
          '[IRIS OFFLINE] Diagnosis temporarily unavailable. Please review manually.',
          JSON.stringify({ immediate_actions: ['Review system logs', 'Page on-call engineer'], monitor: ['Retry when AI service recovers'] }),
          record.id
        ]
      )
      log(`⚠️  Limp-mode fallback saved for ${record.id}`)
    } catch (dbErr) {
      err(`Limp-mode DB write failed`, dbErr.message)
    }
  }
}

// ─── Sync endpoint ────────────────────────────────────────────────────────────
app.post('/api/sync', async (req, res) => {
  const { table, op, record } = req.body
  if (!table || !op || !record?.id) {
    return res.status(400).json({ error: 'Missing table, op, or record.id' })
  }

  log(`Sync ${op} ${table} (${record.id})`)

  try {
    if (table === 'incidents') {

      if (op === 'PUT') {
        // Upsert — protect existing AI columns with COALESCE so a client
        // re-upload never wipes a diagnosis that the server already wrote.
        await pool.query(
          `INSERT INTO incidents
             (id, title, description, severity, status, ai_diagnosis, ai_actions, created_by, created_at, resolved_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
           ON CONFLICT (id) DO UPDATE SET
             title        = EXCLUDED.title,
             description  = EXCLUDED.description,
             severity     = EXCLUDED.severity,
             status       = EXCLUDED.status,
             resolved_at  = EXCLUDED.resolved_at,
             ai_diagnosis = COALESCE(incidents.ai_diagnosis, EXCLUDED.ai_diagnosis),
             ai_actions   = COALESCE(incidents.ai_actions,   EXCLUDED.ai_actions)`,
          [
            record.id, record.title, record.description, record.severity,
            record.status, record.ai_diagnosis || null, record.ai_actions || null,
            record.created_by, record.created_at, record.resolved_at || null
          ]
        )

        // Trigger IRIS only when the incoming record has no diagnosis yet.
        // COALESCE above means the server won't overwrite a saved diagnosis
        // on re-upload, so it's safe to check record.ai_diagnosis here.
        if (!record.ai_diagnosis) {
          triggerIRIS(record).catch(e => err('triggerIRIS unhandled', e.message))
        }

      } else if (op === 'PATCH') {
        const patch = safePatch(record, INCIDENT_COLS)
        if (patch) {
          await pool.query(`UPDATE incidents SET ${patch.setClause} WHERE id = $1`, patch.values)
        }

      } else if (op === 'DELETE') {
        await pool.query('DELETE FROM incidents WHERE id = $1', [record.id])
      }

    } else if (table === 'incident_updates') {

      if (op === 'PUT') {
        await pool.query(
          `INSERT INTO incident_updates (id, incident_id, content, author, created_at)
           VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT (id) DO NOTHING`,
          [record.id, record.incident_id, record.content, record.author, record.created_at]
        )

      } else if (op === 'PATCH') {
        const patch = safePatch(record, UPDATE_COLS)
        if (patch) {
          await pool.query(`UPDATE incident_updates SET ${patch.setClause} WHERE id = $1`, patch.values)
        }

      } else if (op === 'DELETE') {
        await pool.query('DELETE FROM incident_updates WHERE id = $1', [record.id])
      }
    }

    res.json({ success: true })

  } catch (e) {
    err('/api/sync failed', e.message)
    res.status(500).json({ error: e.message })
  }
})

app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }))

// Diagnosis poll endpoint — client polls this when ai_diagnosis is null.
// Bypasses the PowerSync sync-stream delay for server-written AI data.
app.get('/api/diagnosis/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT ai_diagnosis, ai_actions FROM incidents WHERE id = $1',
      [req.params.id]
    )
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' })
    
    const { ai_diagnosis, ai_actions } = result.rows[0]
    
    // If not ready, return 200 with nulls instead of 404 to keep console clean
    res.json({ 
      ai_diagnosis: ai_diagnosis || null, 
      ai_actions: ai_actions || null,
      status: ai_diagnosis ? 'ready' : 'processing'
    })
  } catch (e) {
    err('/api/diagnosis/:id failed', e.message)
    res.status(500).json({ error: e.message })
  }
})



// ─── Process-level error guards ───────────────────────────────────────────────
pool.on('error', e => err('pg pool error', e.message))
process.on('unhandledRejection', reason => err('unhandledRejection', reason))
process.on('uncaughtException', e => { err('uncaughtException', e.message); process.exit(1) })

// ─── Start ────────────────────────────────────────────────────────────────────
const server = app.listen(3001, () => log('Backend active on :3001'))

server.on('error', e => {
  err('server error', e.message)
  if (e.code === 'EADDRINUSE') {
    err('Port 3001 in use — kill the existing process and restart.')
    process.exit(1)
  }
})
