# CivicAI — MVC Architecture Refactor

This version preserves the original CivicAI functionality while reorganizing the application into a clear MVC-style architecture.

## Architecture

### Backend (`apps/api/src`)
- **Models** — MongoDB/Mongoose schemas (`models/`)
- **Repositories** — data access and memory fallback (`repositories/`)
- **Controllers** — business/use-case logic (`controllers/`)
- **Routes** — HTTP endpoint definitions only (`routes/`)
- **Middleware** — authentication/authorization (`middleware/`)
- **Services** — external integrations such as Cloudinary (`services/`)
- **Constants** — departments and status definitions (`constants/`)
- **App/Server** — application composition and Socket.IO bootstrap

Flow:
`Route → Controller → Repository/Model → Response`

### Frontend (`apps/web/src`)
React does not require classic server-side MVC, so the same separation is represented as:
- **Models** — API/data access (`models/`)
- **Controllers** — state, events, filtering and application logic (`controllers/`)
- **Views** — existing pages, layouts and UI components
- **Services** — Socket.IO integration and other infrastructure

Flow:
`View → Controller Hook → Model/API → Controller State → View`

## Main CivicAI modules
- Citizen complaint reporting and tracking
- Municipality Command Center
- Authentication and role-based access
- AI complaint classification
- Incident lifecycle/status management
- Progress updates and resolution proof
- Analytics
- Geospatial/map views
- Cloudinary media upload
- Real-time Socket.IO updates
- MongoDB with in-memory development fallback

## Run

Requirements:
- Node.js 20+
- MongoDB (optional because the application has a development memory fallback)
- Python only if you use the separate AI service

From the project root:

```bash
npm install
npm run dev
```

Frontend: `http://localhost:5173`  
API: `http://localhost:5000`

Configure environment variables using `.env.example` and `apps/api/.env`.

## Important MVC files

Backend:
- `apps/api/src/controllers/incidentController.js`
- `apps/api/src/controllers/authController.js`
- `apps/api/src/controllers/aiController.js`
- `apps/api/src/controllers/analyticsController.js`
- `apps/api/src/repositories/incidentRepository.js`
- `apps/api/src/routes/incidentRoutes.js`
- `apps/api/src/models/Incident.js`
- `apps/api/src/models/User.js`

Frontend:
- `apps/web/src/controllers/useIncidentController.js`
- `apps/web/src/controllers/useAuthController.js`
- `apps/web/src/models/incidentModel.js`
- `apps/web/src/models/authModel.js`
- `apps/web/src/services/socketService.js`
- `apps/web/src/pages/`
- `apps/web/src/components/`
- `apps/web/src/layouts/`

## Notes
The original UI/pages/components are retained rather than redesigned, so this is an architectural refactor rather than a feature-removal rewrite. The legacy `store.js` and `hybridStore.js` were replaced by the repository layer to avoid mixing data access with application logic.
