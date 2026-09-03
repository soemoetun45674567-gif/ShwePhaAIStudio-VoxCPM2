# Pwa Gyi AI Studio — Voice Clone Edition

This is a runnable React + Express app based on the supplied Pwa Gyi AI Studio code.

## Features
- Existing Gemini TTS voices and emotion controls
- AthanLab cloned-voice mode
- Refresh and select cloned voices from AthanLab
- Voice generation through a server-side API proxy
- Gemini script translation through a server-side API proxy
- Existing audio/history UI retained

## Setup
1. Install Node.js 20+.
2. Copy `.env.example` to `.env`.
3. Put your `GEMINI_API_KEY` and approved `ATHANLAB_API_KEY` in `.env`.
4. Run `npm install`.
5. Run `npm run dev`.
6. Open http://localhost:5173.

For production: `npm run build` then `npm start`.

### Voice cloning
Create/clone your own voice in AthanLab first. The public API exposes cloned voice listing and generation; this project does not invent an undocumented clone-upload endpoint. After cloning, open the Generator tab, choose **My Voice Clone**, press Refresh, and select your voice.

Use only voices you own or have explicit permission to clone.
