# BBD School Management System

Production-ready full-stack application for managing school operations, including admin, faculty, and student workflows. Built with React (Vite) on the frontend, Node.js/Express on the backend, and MongoDB for data persistence.

## Features
- Role-based authentication and protected routes (admin, faculty, student)
- Responsive UI with route-driven navigation
- Robust backend with security middleware, rate limiting, and CSRF placeholder
- Comprehensive error handling and logging across client and server
- Unit, integration, and end-to-end tests
- Dev proxy for seamless API calls; same-origin serving in production

## Documentation
- System Architecture: `docs/Architecture.md`
- Setup & Deployment: `docs/SetupDeployment.md`
- Security Guidelines: `docs/Security.md`
- Maintenance Guide: `docs/MaintenanceGuide.md`
- Integration Notes: `docs/integration.md`

## Quick Start
1. Install dependencies:
   - Frontend: `npm install`
   - Backend: `cd backend && npm install`
2. Configure environment:
   - Frontend: `.env.development` (already set: `VITE_API_BASE_URL=/api`)
   - Backend: create `backend/.env` with `PORT=5000`, `JWT_SECRET=...`, `MONGODB_URI=...`, `FRONTEND_URL=http://localhost:5177`
3. Run dev servers:
   - Backend: `cd backend && npm run dev`
   - Frontend: `npm run dev -- --port 5177`
4. Open the app: `http://localhost:5177/`

## Testing
- Frontend unit tests: `npm test`
- Backend tests: `cd backend && npm test`
- E2E tests (Playwright): `npx playwright test` (ensure dev servers running)

## Build & Preview
- Frontend production build: `npm run build`
- Preview locally: `npm run preview`

Refer to `docs/SetupDeployment.md` for detailed production deployment steps.
