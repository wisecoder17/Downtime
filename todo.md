# Downtime Project Todo

## Phase 1: Infrastructure & Dependencies [COMPLETED]
- [x] Install @powersync/web @journeyapps/wa-sqlite uuid react-router-dom [x]
- [x] Setup Tailwind CSS (postcss, autoprefixer, config) [x]
- [x] Install Mastra & AI SDK (@ai-sdk/google, @mastra/core) [x]
- [x] Verify Vite dev server still boots [x]

## Phase 2: PowerSync Client & Schema [COMPLETED]
- [x] Create `src/lib/powersync.ts` with AppSchema [x]
- [x] Implement `connectPowerSync` with upload connector [x]
- [x] Setup `.env` with PowerSync credentials [x]

## Phase 3: Mastra AI Agent [COMPLETED]
- [x] Implement `src/mastra/agents/incidentAgent.ts` [x]
- [x] Implement `src/mastra/index.ts` [x]
- [ ] Verify Mastra dev server connectivity [ ]

## Phase 4: App Router & Root Setup [COMPLETED]
- [x] Install @powersync/react [x]
- [x] Setup `src/App.tsx` with PowerSyncContext and Routes [x]

## Phase 5: Components [PENDING]
- [ ] `SyncIndicator.tsx` (Non-negotiable) [ ]
- [ ] `StatusBadge.tsx` [ ]
- [ ] `IncidentCard.tsx` [ ]
- [ ] `AIPanel.tsx` [ ]
- [ ] `UpdateFeed.tsx` [ ]

## Phase 6: Pages Implementation [PENDING]
- [ ] `Dashboard.tsx` [ ]
- [ ] `NewIncident.tsx` (Form + Mastra Call + PowerSync Write) [ ]
- [ ] `IncidentDetail.tsx` [ ]

## Phase 7: Validation & Demo [PENDING]
- [ ] Test Offline Incident Creation [ ]
- [ ] Test AI Diagnosis generation [ ]
- [ ] Test Sync Round-trip to Neon [ ]
- [ ] Final Walkthrough of Demo Sequence [ ]
