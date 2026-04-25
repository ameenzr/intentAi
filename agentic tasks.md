# IntentUI Version 1 — AI Agent Task List and Prompts

Project root:

```txt
/Users/ameenzr/Desktop/intentAi
```

## Version 1 Goal

Build a MERN web app where:

1. User selects a mock professional software.
2. If image editor is selected, user uploads image.
3. User describes their goal.
4. Backend sends software capabilities + user intent to OpenAI.
5. AI returns a generated purpose-built UI schema.
6. Frontend renders sliders, buttons, color pickers, selects, text inputs.
7. Controls do not need to function yet.
8. User can ask follow-up questions.

---

# Recommended Build Order

## Group 1: Project Setup

### Task 1: Inspect/create MERN structure

Prompt to Codex:

```txt
Task 1: Inspect/create MERN structure

You are working in /Users/ameenzr/Desktop/intentAi.

Set up a clean MERN project structure for a hackathon prototype called IntentUI.

Create this structure if it does not exist:

/client
  React + Vite + TypeScript app

/server
  Express + TypeScript backend

Root package scripts:
- "dev" should run both client and server concurrently
- "client" should run the frontend
- "server" should run the backend

Use:
- React
- TypeScript
- Vite
- Express
- cors
- dotenv
- concurrently
- nodemon or tsx

Do not add authentication, database, or unnecessary complexity.
Make sure npm install and npm run dev work from the root.
```

---

## Group 2: Mock Software Capability Data

### Task 2: Add mock software profiles

Prompt:

```txt
Task 2: Add mock software profiles

Create mock software capability data for Version 1.

Add a file:

server/src/data/softwareProfiles.ts

It should export an array of software profiles.

Include at least:

1. MiniPhotoPro
domain: image_editing
description: Professional image editing software for product photos, social posts, posters, and ecommerce listings.

Capabilities:
- remove_background: button
- background_color: color_picker
- brightness: slider, min -100, max 100
- contrast: slider, min -100, max 100
- sharpness: slider, min 0, max 100
- noise_reduction: slider, min 0, max 100
- product_shadow: slider, min 0, max 100
- crop_ratio: select, options ["original", "1:1", "4:5", "16:9", "9:16"]
- export_ecommerce: button
- headline_text: text_input
- saturation: slider, min -100, max 100
- warmth: slider, min -100, max 100

Also include 2 mock non-image software profiles for demo:
2. ClipForge — video editing
3. SoundDesk — audio editing

For non-image software, include mock capabilities but no upload requirement.

Use TypeScript types.
```

---

## Group 3: Backend API

### Task 3: Create software list API

Prompt:

```txt
Task 3: Create software list API

In the Express server, create these API endpoints:

GET /api/software
Returns all software profiles, but include only:
- id
- name
- domain
- description
- capability count

GET /api/software/:id
Returns full software profile with capabilities.

Add proper error handling for unknown software id.

Use the softwareProfiles data file.
```

---

### Task 4: Add OpenAI interface generation endpoint

Prompt:

```txt
Task 4: Add OpenAI interface generation endpoint

Add OpenAI support to the Express backend.

Environment variable:
OPENAI_API_KEY

Create endpoint:

POST /api/generate-interface

Request body:
{
  "softwareId": string,
  "userIntent": string
}

Backend should:
1. Find the selected software profile.
2. Send the software name, domain, description, and capabilities to OpenAI.
3. Ask OpenAI to return a JSON object for a generated purpose-built UI.

The output JSON schema should be:

{
  "interfaceTitle": string,
  "intentSummary": string,
  "recommendedWorkflow": string[],
  "controls": [
    {
      "capabilityId": string,
      "label": string,
      "componentType": "slider" | "button" | "select" | "color_picker" | "toggle" | "text_input",
      "purpose": string,
      "suggestedDefault": string | number | boolean,
      "min"?: number,
      "max"?: number,
      "options"?: string[],
      "proTip": string
    }
  ]
}

Rules for the model:
- Only use capabilities from the selected software.
- Do not invent capability IDs.
- Generate at most 8 controls.
- Every control must explain why it helps the user's goal.
- The output should be useful for a beginner.
- Controls do not need to be functional yet.

Use the official OpenAI Node SDK.
Use JSON mode or structured outputs if available. If not, parse JSON safely.
Return a clear fallback error if generation fails.
```

---

### Task 5: Add fallback generation

Prompt:

```txt
Task 5: Add fallback generation

Add a fallback generator for /api/generate-interface in case OpenAI fails or the API key is missing.

For MiniPhotoPro:
If user intent includes ecommerce, product, store, amazon, listing:
Return a Professional Ecommerce Product Photo interface with:
- remove_background
- background_color
- brightness
- contrast
- sharpness
- noise_reduction
- product_shadow
- export_ecommerce

If user intent includes instagram, cafe, cozy:
Return a Cozy Social Post interface with:
- warmth
- saturation
- contrast
- crop_ratio
- headline_text
- export_ecommerce

If user intent includes cinematic, poster, dramatic:
Return a Cinematic Poster interface with:
- contrast
- warmth
- product_shadow
- crop_ratio
- headline_text
- export_ecommerce

Otherwise return a general helpful interface using 4-6 relevant capabilities.

Make this fallback function clean and reusable.
```

---

## Group 4: Frontend Layout

### Task 6: Build main app layout

Prompt:

```txt
Task 6: Build main app layout

Build the React frontend UI for IntentUI.

Create a clean two-column layout:

Left panel: Developer / Software panel
- App title: IntentUI
- Subtitle: Adaptive interfaces for complex software
- Software selector
- Selected software details
- Capability list
- “Mock capability model” badge
- Capability count

Right panel: User workspace
- If selected software domain is image_editing, show image upload
- Image preview area
- User vision textarea
- Generate Interface button
- Quick prompt buttons:
  1. “I took this product photo with my mobile camera. Make it look professional for my ecommerce listing.”
  2. “Make this look like a cozy Instagram cafe post.”
  3. “Make this look like a cinematic poster.”

Use modern clean styling with CSS or Tailwind if already installed.
Do not add complex state management. Use React useState/useEffect.
```

---

### Task 7: Fetch software profiles

Prompt:

```txt
Task 7: Fetch software profiles

Connect the frontend to the backend APIs.

On page load:
- Fetch GET /api/software
- Show software options
- Auto-select MiniPhotoPro by default
- Fetch GET /api/software/:id when selected

Display capabilities in the left panel grouped by type:
- sliders
- buttons
- selects
- color pickers
- text inputs

Handle loading and error states.
```

---

## Group 5: Image Upload Preview

### Task 8: Add image upload

Prompt:

```txt
Task 8: Add image upload

Add image upload preview for image_editing software.

Requirements:
- Accept PNG, JPG, JPEG, WebP
- Show uploaded image in a preview card
- Show filename
- If no image uploaded, show empty placeholder
- Do not send the image to backend in Version 1
- The image is only for demo context
```

---

## Group 6: Generated UI Renderer

### Task 9: Create generated UI types and renderer

Prompt:

```txt
Task 9: Create generated UI types and renderer

Create TypeScript types for the generated interface schema.

Create component:

client/src/components/GeneratedInterfacePanel.tsx

It accepts generatedInterface as prop and renders:
- interfaceTitle
- intentSummary
- recommendedWorkflow
- controls

For each control, render based on componentType:
- slider: label, range input, current value, purpose, proTip
- button: button UI, purpose, proTip
- select: dropdown, purpose, proTip
- color_picker: color input, purpose, proTip
- toggle: checkbox, purpose, proTip
- text_input: text field, purpose, proTip

Controls do not need to affect the image yet.
They should be visually polished and feel real.
Show the purpose clearly under each control.
```

---

### Task 10: Connect generate button

Prompt:

```txt
Task 10: Connect generate button

Connect the Generate Interface button.

When clicked:
- Validate software is selected
- Validate userIntent is not empty
- Call POST /api/generate-interface with softwareId and userIntent
- Show loading state: “Generating purpose-built interface…”
- Render the returned GeneratedInterfacePanel
- Show errors nicely

Also make quick prompt buttons set the textarea and optionally trigger generation.
```

---

## Group 7: Follow-up Chat

### Task 11: Add follow-up chat endpoint

Prompt:

```txt
Task 11: Add follow-up chat endpoint

Add backend endpoint:

POST /api/follow-up

Request:
{
  "softwareId": string,
  "userIntent": string,
  "generatedInterface": object,
  "message": string
}

The AI should respond like an experienced professional helping a beginner use the generated interface.

It can:
- explain controls
- suggest value changes
- suggest making the result more premium, natural, clean, dramatic, etc.
- optionally suggest an updated control list, but text response is enough for Version 1

Response:
{
  "reply": string
}

Add fallback response if OpenAI fails.
```

---

### Task 12: Add follow-up chat UI

Prompt:

```txt
Task 12: Add follow-up chat UI

Add follow-up chat UI below the generated interface.

Requirements:
- Text input: “Ask how to refine this…”
- Send button
- Display chat messages
- User messages and assistant messages styled differently
- Send softwareId, original userIntent, generatedInterface, and follow-up message to /api/follow-up
- Show loading state

Example follow-up:
“I want it to look more premium, not artificial.”
```

---

## Group 8: Demo Polish

### Task 13: Scan result card + generated JSON viewer

Two additive UI sections. Do not refactor existing components — only add new ones and mount them.

Prompt:

```txt
Task 13: Scan result card + generated JSON viewer

Add two new visual sections to the existing IntentUI app. Do not modify existing components beyond mounting these in the right place.

1. Scan Result Card — left panel

Create a new component that renders inside the left developer panel, above the capability list. It should display:

- Connected software: <software name>
- Domain: <software domain>
- Capabilities detected: <capability count>
- Mock capability model: active
- Runtime: simulated
- Generated UI: enabled
- Status: "Scan complete" with a small green dot

Style it like a developer/devtool status card — monospace or compact font, subtle border, label/value rows. Pull values from the already-fetched software profile state. Do not add new API calls.

2. Generated JSON Viewer — right panel

Create a new component that renders below the GeneratedInterfacePanel, only when a generatedInterface exists. It should be a collapsible section:

- Header: "View generated UI JSON" with a chevron toggle
- Collapsed by default
- When expanded, show the full generatedInterface object as JSON.stringify(value, null, 2) inside a <pre> with a dark monospace background and horizontal scroll

This proves the UI is generated from schema, not hardcoded.

Both components should match the existing app styling (Tailwind if used, otherwise existing CSS conventions). Do not introduce new styling libraries.
```

---

### Task 14: Empty states, loading, and crash-proofing

Pure defensive polish. Touches multiple components but only to add safety, not to change behavior.

Prompt:

```txt
Task 14: Empty states, loading, and crash-proofing

Harden the IntentUI frontend against empty states, loading states, and malformed data. Do not change existing logic — only add guards and visual states.

1. Empty states
- Before image upload (image_editing software only): show a placeholder card with a dashed border, upload icon, and text "Upload an image to give the AI context".
- Before any interface is generated: in the right panel where GeneratedInterfacePanel would render, show a friendly empty state: "Describe your goal above and click Generate to build your interface."

2. Loading states
- While POST /api/generate-interface is in flight: replace the empty state with a loading card showing a spinner and the text "Generating purpose-built interface…". Disable the Generate button during this time.
- While POST /api/follow-up is in flight: show a typing indicator (three dots) in the chat as a pending assistant message.

3. Error states
- If POST /api/generate-interface fails: show a red-bordered error card with the error message and a "Try again" button that re-runs the last request.
- If POST /api/follow-up fails: show the error inline in the chat as a system message, do not crash the chat.

4. Missing API key warning
- On app load, fetch GET /api/software. If the backend exposes a flag or header indicating OPENAI_API_KEY is missing, show a small yellow banner at the top: "Running in fallback mode — OpenAI key not configured. Generated interfaces will use the local fallback generator."
- If the backend does not currently expose this flag, add a simple GET /api/health endpoint that returns { openaiConfigured: boolean } based on whether process.env.OPENAI_API_KEY is set, and consume it from the frontend.

5. Crash-proofing the renderer
- In GeneratedInterfacePanel, treat every field on a control as potentially missing except capabilityId and componentType. If componentType is unknown, render a fallback card showing the label and a note "Unsupported control type". If controls is empty or missing, render the empty state from step 2.
- Wrap the renderer in an error boundary so a malformed AI response cannot blank the whole app.

Keep changes minimal and focused. Do not refactor unrelated code.
```

---

## Group 9: Final README

### Task 15: Write README

Prompt:

```txt
Task 15: Write README

Create README.md at the project root.

Include these sections in this order:

# IntentUI
One-line pitch: An adaptive interface layer that generates purpose-built UI for complex software based on what the user is trying to achieve.

## What Version 1 does
- User selects a mock professional software (MiniPhotoPro, ClipForge, SoundDesk)
- User describes their goal in natural language
- AI generates a minimal task-specific interface using only that software's available capabilities
- Every generated control includes a purpose and a pro tip
- User can refine the result through follow-up chat

## What Version 1 does not do
- Generated controls are visual only — they do not yet edit the uploaded image
- Software profiles are mock capability data, not scanned from real codebases
- No persistence, no auth, no database

## Tech stack
- React + Vite + TypeScript (client)
- Express + TypeScript (server)
- OpenAI API for interface generation
- Local fallback generator when OpenAI is unavailable

## Setup
1. Clone and install: `npm install` from the project root
2. Create `/server/.env` with:
   ```
   OPENAI_API_KEY=your_key_here
   PORT=5001
   ```
3. Run both client and server: `npm run dev`

## Demo flow
1. Select MiniPhotoPro
2. Upload a product photo (optional, for context)
3. Click a quick prompt or type your own goal
4. Click Generate Interface — AI returns a task-specific UI
5. Use follow-up chat to refine ("make it more premium")
6. Expand "View generated UI JSON" to show the schema-driven nature of the UI

## Roadmap
- Version 1 (current): mock capabilities + generated UI + follow-up chat
- Version 2: scan real open-source repos to auto-generate capability models
- Version 3: connect generated controls to a real image editing runtime

Keep the tone clean and factual. Do not add badges, screenshots, or marketing language.
```

---

# Best Agent Task Sequence

```txt
1. Project setup
2. Mock capability data
3. Backend APIs
4. OpenAI generation endpoint + fallback
5. Frontend layout
6. Software selector + capability display
7. Image upload preview
8. Generated UI renderer
9. Generate button integration
10. Follow-up chat
11. JSON viewer + polish
12. README
```

---

# One Master Prompt for Codex

Use this if you want one big agent run:

```txt
You are building Version 1 of IntentUI in /Users/ameenzr/Desktop/intentAi.

IntentUI is a MERN web app that demonstrates adaptive interfaces for complex software.

Version 1 scope:
- User selects a mock professional software.
- Software profiles are mock capability data.
- If selected software is image editing, user can upload an image preview.
- User describes their goal.
- Backend sends selected software capabilities and user intent to OpenAI.
- AI returns a generated purpose-built UI schema.
- Frontend renders sliders, buttons, selects, color pickers, toggles, and text inputs.
- Controls do not need to function.
- Every generated control must explain its purpose and include a pro tip.
- User can ask follow-up questions after UI generation.

Build this with:
- React + Vite + TypeScript frontend in /client
- Express + TypeScript backend in /server
- Root npm scripts to run both
- OpenAI API key from OPENAI_API_KEY
- Fallback generator if OpenAI fails

Core backend endpoints:
GET /api/software
GET /api/software/:id
POST /api/generate-interface
POST /api/follow-up

Mock software:
MiniPhotoPro with image editing capabilities:
remove_background, background_color, brightness, contrast, sharpness, noise_reduction, product_shadow, crop_ratio, export_ecommerce, headline_text, saturation, warmth.

Also add ClipForge and SoundDesk as mock software profiles.

Frontend layout:
Left panel:
- IntentUI title
- software selector
- scan result card
- capability list

Right panel:
- image upload preview if image editor
- user intent textarea
- quick prompt buttons
- generate button
- generated UI panel
- follow-up chat
- generated JSON viewer

Make the UI polished and demo-ready.
Do not add authentication, database, or functional image editing yet.
Prioritize reliability and clear hackathon storytelling.
```

---

# Environment Setup Reminder

Create:

```txt
/server/.env
```

with:

```txt
OPENAI_API_KEY=your_key_here
PORT=5001
```

Add `/server/.env` to `.gitignore`.

---

# Demo Sentence

Use this while presenting:

> Version 1 uses mock capability models. The important thing is that the AI does not generate random UI — it selects from what the chosen software is capable of and creates a beginner-friendly interface for the user’s goal.