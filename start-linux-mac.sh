#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
if [ ! -d node_modules ]; then npm install; fi
if [ ! -f .env ]; then cp .env.example .env; echo "Edit .env with GEMINI_API_KEY and ATHANLAB_API_KEY, then run again."; exit 0; fi
npm run dev
