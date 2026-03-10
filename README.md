# Downtime - Offline-First AI Incident Response Tool

Downtime is an **offline-first AI incident response** coordination tool built for site reliability engineers (SREs). It allows engineers to log, diagnose, and manage critical system incidents entirely offline or in harsh remote connectivity areas (like data centres). Everything syncs securely to the team dashboard the moment network connections return.

Built for the **PowerSync AI Hackathon**. 

## Core Tech Stack
- **Frontend Framework:** React + Vite + TypeScript (React Router DOM)
- **Local DB / Sync Engine:** PowerSync Web SDK (Sync Streams Edition 3) + local SQLite
- **Backend DB:** Neon Postgres Serverless
- **AI Agent Framework:** Mastra AI + Google Gemini (`gemini-2.0-flash`)
- **UI & Styling:** Tailwind CSS 

---

## Setup & Demo Instructions

### 1. Environment Variables
Make sure an `.env` file exists at the root of the project with the following configured tokens:
```env
VITE_POWERSYNC_URL=your_powersync_instance_url
VITE_POWERSYNC_TOKEN=your_powersync_dev_token
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
VITE_DATABASE_URL=your_neon_postgres_url
```

### 2. Running Locally (Windows / Multi-Process)
Because this project utilizes a React frontend, an Express sync router, and a Mastra AI diagnostic background server, there are 3 distinct processes required for development testing.
You must run these locally in **three separate terminal/command prompt tabs**:

**Terminal 1 (Vite Frontend):**
```bash
npm install
npm run dev
```

**Terminal 2 (Sync Express Backend):**
```bash
npm run dev:server
```

**Terminal 3 (Mastra AI Engine):**
```bash
npm run dev:mastra
```

### 3. Execution and Testing Flow (The SRE Journey)
1. **Load Dashboard:** Open `http://localhost:5173`. You should see the top-right indicator show **"Synced"** (Green).
2. **Go Offline:** Open Chrome DevTools -> Network Tab -> Change throttling from 'No throttling' to **'Offline'**. The sync indicator will immediately turn red.
3. **Declare Severe Incident:** Hit *New Incident*. Report a critical outage (e.g. "Database connection pool exhausted" / "API returning 503 timeouts").
4. **Instant Action:** Even while completely offline, the incident persists to local SQLite and instantly drops into the incident dashboard.
5. **AI Evaluation Request:** A background Mastra generation request evaluates the outage against deep Google Gemini telemetry (simulated off `gemini-2.0-flash`) and locks out the action checklist. If Mastra gets blocked entirely by the offline switch, it provides a silent *Diagnosis unavailable* fallback so engineers aren't gridlocked.
6. **Chronological Updates:** Engineers on your team can type chronological timeline fixes directly into the incident view entirely locally.
7. **Come Back Online:** Switch DevTools back to **'No throttling'**. Real-time websockets catch the network, the indicator flips to **"Syncing..." (Amber Pulsing)** > **"Synced"**. All data instantly dumps to the backend Neon db, validating the Powercast architecture requirement.

---

## Troubleshooting

### Port 3001 Already In Use
If `npm run dev:server` exits immediately with an `EADDRINUSE` error, a stale Node process is still holding port 3001. Kill it with:
```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess -Force
```
Then re-run `npm run dev:server`.

### PowerSync Token Expired
Dev tokens expire every **12 hours**. If the SyncIndicator stays red with no network errors and the browser console shows `401` from PowerSync, regenerate the token in the [PowerSync Dashboard](https://app.powersync.com) and update `VITE_POWERSYNC_TOKEN` in `.env`. Restart `npm run dev` after.

### Mastra Agent Not Responding
If the AI panel shows "Diagnosis unavailable" immediately (not after a delay), the Mastra server may not be running or has crashed. Check Terminal 3 and re-run:
```bash
npm run dev:mastra
```
The agent endpoint must be live at `http://localhost:4111` for AI diagnosis to work. Offline incidents will still be created — the fallback is intentional and non-blocking.

