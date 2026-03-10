import express from 'express'
import pg from 'pg'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const pool = new pg.Pool({ connectionString: process.env.VITE_DATABASE_URL })

app.post('/api/sync', async (req, res) => {
  const { table, op, record } = req.body
  try {
    if (table === 'incidents') {
      if (op === 'PUT') {
        await pool.query(
          `INSERT INTO incidents (id, title, description, severity, status, ai_diagnosis, ai_actions, created_by, created_at, resolved_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO UPDATE SET 
             title = EXCLUDED.title, description = EXCLUDED.description, severity = EXCLUDED.severity, 
             status = EXCLUDED.status, ai_diagnosis = EXCLUDED.ai_diagnosis, ai_actions = EXCLUDED.ai_actions,
             resolved_at = EXCLUDED.resolved_at`,
          [record.id, record.title, record.description, record.severity, record.status, record.ai_diagnosis || null, record.ai_actions || null, record.created_by, record.created_at, record.resolved_at || null]
        )
      } else if (op === 'PATCH') {
        const keys = Object.keys(record).filter(k => k !== 'id')
        if (keys.length > 0) {
          const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ')
          const values = [record.id, ...keys.map(k => record[k])]
          await pool.query(`UPDATE incidents SET ${setClause} WHERE id = $1`, values)
        }
      } else if (op === 'DELETE') {
        await pool.query(`DELETE FROM incidents WHERE id = $1`, [record.id])
      }
    } else if (table === 'incident_updates') {
      if (op === 'PUT') {
        await pool.query(
          `INSERT INTO incident_updates (id, incident_id, content, author, created_at)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO NOTHING`,
          [record.id, record.incident_id, record.content, record.author, record.created_at]
        )
      } else if (op === 'PATCH') {
        const keys = Object.keys(record).filter(k => k !== 'id')
        if (keys.length > 0) {
          const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ')
          const values = [record.id, ...keys.map(k => record[k])]
          await pool.query(`UPDATE incident_updates SET ${setClause} WHERE id = $1`, values)
        }
      } else if (op === 'DELETE') {
        await pool.query(`DELETE FROM incident_updates WHERE id = $1`, [record.id])
      }
    }
    res.json({ success: true })
  } catch (error) {
    console.error('[/api/sync] Error:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

// Catch pool-level errors so they don't kill the process
pool.on('error', (err) => {
  console.error('[pg pool] Unexpected error:', err)
})

// Catch any unhandled rejections
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason)
})

// Catch any uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err)
})

const server = app.listen(3001, () => {
  console.log('Sync server running on http://localhost:3001')
})

server.on('error', (err) => {
  console.error('[server error]', err)
  if (err.code === 'EADDRINUSE') {
    console.error('Port 3001 already in use. Kill the other process and restart.')
    process.exit(1)
  }
})
