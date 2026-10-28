#!/usr/bin/env bash
# One-step launcher (macOS / Linux). The bundled node_modules is built for Windows, so replace it here.
cd "$(dirname "$0")"
command -v node >/dev/null || { echo "Node.js 20+ is required: https://nodejs.org"; exit 1; }
if [ -d node_modules/@esbuild/win32-x64 ]; then echo "Replacing Windows node_modules with a native install..."; rm -rf node_modules; fi
[ -d node_modules ] || { echo "Installing dependencies (first run only)..."; npm install; }
echo "Starting CivicAI: web http://localhost:3000  api http://localhost:5000"
npm run dev
