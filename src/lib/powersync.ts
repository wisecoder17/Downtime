import { column, Schema, Table, PowerSyncDatabase, WASQLiteOpenFactory, WASQLiteVFS } from '@powersync/web'

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

const enableMultiTabs = typeof SharedWorker !== 'undefined'

export const db = new PowerSyncDatabase({
  schema: AppSchema,
  database: new WASQLiteOpenFactory({
    dbFilename: 'downtime_v2.db', // New version for OPFS
    vfs: WASQLiteVFS.OPFSCoopSyncVFS,
    flags: { enableMultiTabs }
  }),
  flags: {
    enableMultiTabs,
    broadcastLogs: true,
    useWebWorker: true
  }
})

export const backendConnector = {
  async fetchCredentials() {
    return {
      endpoint: import.meta.env.VITE_POWERSYNC_URL,
      token: import.meta.env.VITE_POWERSYNC_TOKEN,
    }
  },
  async uploadData(database: any) {
    let transaction
    while ((transaction = await database.getNextCrudTransaction())) {
      try {
        for (const op of transaction.crud) {
          const record = { ...op.opData, id: op.id }
          const response = await fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ table: op.table, op: op.op.toUpperCase(), record }),
          })
          if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${await response.text()}`)
          }
        }
        await transaction.complete()
      } catch (e) {
        console.error('[uploadData] Sync failed, will retry:', e)
        throw e // Re-throw so PowerSync knows to retry this transaction
      }
    }
  },
}

export async function connectPowerSync() {
  await db.connect(backendConnector)
}
