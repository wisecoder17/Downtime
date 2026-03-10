import { Mastra } from '@mastra/core'
import { incidentAgent } from './agents/incidentAgent'

export const mastra = new Mastra({ agents: { incidentAgent } })
