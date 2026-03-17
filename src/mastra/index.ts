import { Mastra } from '@mastra/core'
import { incidentAgent } from './agents/incidentAgent'
import { LibSQLStore } from '@mastra/libsql'

export const mastra = new Mastra({
  agents: { IncidentDiagnosticAgent: incidentAgent },
  storage: new LibSQLStore({
    id: 'mastra-storage',
    url: ':memory:',
  }),
})
