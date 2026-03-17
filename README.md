# Downtime: Offline-First AI Incident Response

Downtime is an AI-powered diagnostic tool for SREs that remains fully operational during network outages.

## Why it exists

Site Reliability Engineers and responders often lose access to critical tools like Jira, PagerDuty, or cloud dashboards during the very network outages they are trying to resolve. This creates a dangerous blind spot where responders cannot log actions or collaborate when connectivity is most volatile. Downtime ensures that responders have a local-first interface that survives connectivity drops and automatically syncs state when the network returns.

## How PowerSync is central to it

PowerSync is the architectural foundation of the project rather than a peripheral addition. It provides the bidirectional sync stream that connects the local SQLite database to the cloud Postgres backend. By using PowerSync real-time queries (usePowerSyncQuery), the application UI remains reactive to both local user input and background AI updates without needing a persistent network connection. This project could not exist without PowerSync because standard REST or GraphQL architectures would fail the moment the SRE enters a dead zone or experiences a regional network partition.

## Tech stack

*   PowerSync
*   Neon
*   Mastra
*   Gemini
*   React
*   Vite
*   Express

## Architecture overview

The application is built in three decoupled layers to maximize resilience. The frontend is a React application that reads and writes exclusively to a local SQLite database managed by PowerSync in `src/lib/powersync.ts`. A lightweight Express broker in `server/index.js` acts as the sync destination, receiving local edits and committing them to Neon Postgres. Finally, a Mastra AI agent in `src/mastra/` monitors the database via the API and injects diagnostic insights back into the sync stream, which automatically propagates to the responder's offline device.

## Getting started

### Prerequisites

*   Node.js (v18 or higher)
*   A Neon Postgres database URL
*   A PowerSync instance URL and development token
*   A Google Generative AI (Gemini) API key

### Installation

1. Clone the repository.
2. Install dependencies: `npm install`.
3. Create a `.env` file in the root directory with the following variables:
   *   `VITE_POWERSYNC_URL`
   *   `VITE_POWERSYNC_TOKEN`
   *   `VITE_DATABASE_URL`
   *   `GOOGLE_GENERATIVE_AI_API_KEY`

### Running locally

Downtime requires three concurrent processes to manage the frontend, sync loop, and AI agent. Open three separate terminals and run:

1. **Frontend**: `npm run dev`
2. **Sync Broker**: `npm run dev:server`
3. **AI Agent**: `npm run dev:mastra`

### Mock Mode for Testing

To test the application flow without consuming Gemini API credits or risking rate limits, start any incident title with the prefix `MOCK:`. This triggers a deterministic local diagnostic path that simulates the AI agent behavior including the 4-second thinking state and structured output delivery.

## Hackathon Categories

*   **Local-First**: The application is built entirely on a local-first architecture where the UI never blocks on a network request for core incident logging.
*   **Mastra**: The IRIS agent uses Mastra for structured SRE persona enforcement and background diagnostic processing.
*   **Neon**: A Neon serverless Postgres database serves as the global source of truth for all synced incident records and AI insights.

## Demo

[Watch the demo video here](YOUR_VIDEO_LINK_HERE)
