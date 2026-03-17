import { column, Schema, Table } from '@powersync/web'
import { PowerSyncDatabase } from '@powersync/web'

const incidents = new Table({
  title: column.text,
  description: column.text,
  severity: column.text,
  status: column.text,
  ai_diagnosis: column.text,
  ai_actions: column.text,
  created_by: column.text,
  created_at: column.text,
  resolved_at: column.text,
})

const incident_updates = new Table({
  incident_id: column.text,
  content: column.text,
  author: column.text,
  created_at: column.text,
})

export const AppSchema = new Schema({ incidents, incident_updates })

export const db = new PowerSyncDatabase({
  schema: AppSchema,
  database: { dbFilename: 'downtime.db' },
})

export async function connectPowerSync() {
  await db.connect({
    async fetchCredentials() {
      return {
        endpoint: import.meta.env.VITE_POWERSYNC_URL,
        token: import.meta.env.VITE_POWERSYNC_TOKEN,
      }
    },
    async uploadData(database) {
      const transaction = await database.getNextCrudTransaction()
      if (!transaction) return
      try {
        for (const op of transaction.crud) {
          const record = { ...op.opData, id: op.id }
          await fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ table: op.table, op: op.op.toUpperCase(), record }),
          })
        }
        await transaction.complete()
      } catch (e) {
        // Offline or server unreachable — leave transaction in queue, PowerSync will retry
        console.debug('[uploadData] Upload deferred (offline):', e)
      }
    },
  })
}
