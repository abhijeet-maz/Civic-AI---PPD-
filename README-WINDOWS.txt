CivicAI - how to run (Windows 11, x64)
======================================
This folder IS the project (package.json is right here, next to this file).

1. Install Node.js 20 or newer: https://nodejs.org   (check with:  node -v)
2. Double-click  run-windows.bat
   (or open PowerShell in THIS folder and run:  npm run dev)
3. Open http://localhost:3000     API: http://localhost:5000
   Demo staff login: official@municipality.gov / Password123  ->  /command-center/login

Tips
- Extract with 7-Zip to a short path such as C:\CivicAI (long paths break node_modules on Windows).
- Run npm commands only in the folder that contains package.json. If you see
  "ENOENT ... package.json", you are one folder too high or too low.
- If something is broken: delete the node_modules folder, then run run-windows.bat (it reinstalls).
- Please do not move/rename the "packages" folder - the apps import @civicai/shared from it.
- Before submitting: delete apps\api\.env (it contains your private keys).

Maps & photos
-------------
- Google Maps key: index.html (live map) and apps\web\.env -> VITE_GOOGLE_MAPS_API_KEY (report-form map).
  Restart "npm run dev" after editing .env. In Google Cloud Console: enable "Maps JavaScript API",
  turn billing on, and allow http://localhost:3000/* in the key's HTTP-referrer restrictions.
  If Google rejects the key, the map now says so on screen (and the exact code is in the browser console).
- Photos not showing?  Run:   npm run check:media
  It checks your Supabase settings, bucket, signed links and every saved complaint photo, and tells you what to fix.
