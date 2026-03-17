import { Mastra } from '@mastra/core'
import { incidentAgent } from './agents/incidentAgent'
import { LibSQLStore } from '@mastra/libsql'

export const mastra = new Mastra({
  agents: { IncidentDiagnosticAgent: incidentAgent },
  storage: new LibSQLStore({
    id: 'mastra-storage',
    url: ':memory:',
  }),
  // Custom logger with timestamps for high-fidelity terminal debugging
  logger: {
    level: 'debug',
    debug: (msg: string, ...args: any[]) => console.log(`[${new Date().toLocaleTimeString()}] 🔍 AI_DEBUG: ${msg}`, ...args),
    info: (msg: string, ...args: any[]) => console.log(`[${new Date().toLocaleTimeString()}] ℹ️ AI_INFO: ${msg}`, ...args),
    warn: (msg: string, ...args: any[]) => console.warn(`[${new Date().toLocaleTimeString()}] ⚠️ AI_WARN: ${msg}`, ...args),
    error: (msg: string, ...args: any[]) => console.error(`[${new Date().toLocaleTimeString()}] ❌ AI_ERROR: ${msg}`, ...args),
  } as any,
})
