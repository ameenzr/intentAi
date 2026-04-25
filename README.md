# MiniPhotoPro / IntentUI

An adaptive image-editing interface that generates purpose-built controls based on what the user is trying to achieve.

## What Version 1 does

- User opens MiniPhotoPro, a mock professional image editor
- User describes their goal in natural language
- AI generates a minimal task-specific interface using only MiniPhotoPro's available capabilities
- Every generated control includes a purpose and a pro tip
- Generated controls drive a lightweight image engine using CSS filters, overlays, layout controls, and export helpers
- User can refine the result through follow-up chat

## What Version 1 does not do

- Image edits are lightweight visual simulations, not Photoshop-grade pixel operations
- The MiniPhotoPro capability profile is mock capability data, not scanned from a real codebase
- No persistence, no auth, no database

## Tech stack

- React + Vite + TypeScript (client)
- Express + TypeScript (server)
- OpenAI API for interface generation
- Local fallback generator when OpenAI is unavailable

## Setup

1. Clone and install: `npm install` from the project root
2. Create `/server/.env` with:
   ```txt
   OPENAI_API_KEY=your_key_here
   PORT=4000
   ```
3. Run both client and server: `npm run dev`

## Demo flow

1. Open MiniPhotoPro
2. Upload a product photo
3. Click a quick prompt or type your own goal
4. Click Generate Interface -- AI returns a task-specific UI and applies suggested defaults
5. Adjust the generated controls to refine the image preview
6. Use follow-up chat to refine ("make it more premium")
7. Expand "View generated UI JSON" to show the schema-driven nature of the UI

## Roadmap

- Version 1 (current): mock capabilities + generated UI + lightweight functional image engine + follow-up chat
- Version 2: scan real open-source repos to auto-generate capability models
- Version 3: connect generated controls to a production-grade image editing runtime
