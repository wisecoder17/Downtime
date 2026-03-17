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
- [x] Verify Mastra dev server connectivity [x]

## Phase 4: App Router & Root Setup [COMPLETED]
- [x] Install @powersync/react [x]
- [x] Setup `src/App.tsx` with PowerSyncContext and Routes [x]

## Phase 5: Components [COMPLETED]
- [x] `SyncIndicator.tsx` (Non-negotiable) [x]
- [x] `StatusBadge.tsx` [x]
- [x] `IncidentCard.tsx` [x]
- [x] `AIPanel.tsx` [x]
- [x] `UpdateFeed.tsx` [x]

## Phase 6: Pages Implementation [COMPLETED]
- [x] `Dashboard.tsx` [x]
- [x] `NewIncident.tsx` (Form + Mastra Call + PowerSync Write) [x]
- [x] `IncidentDetail.tsx` [x]

## Phase 7: Validation & Demo [COMPLETED]
- [x] Test Offline Incident Creation [x]
- [x] Test AI Diagnosis generation [x]
- [x] Test Sync Round-trip to Neon [x]
- [x] Final Walkthrough of Demo Sequence [x]

## Phase 8: UI Polish [COMPLETED]
- [x] Refine Top Bar across all pages [x]
- [x] Refine SyncIndicator visual design [x]
- [x] Add left severity borders to IncidentCard [x]
- [x] Adjust Dashboard Stats layout [x]
- [x] Optimize optimistic AI loading state [x]
