# Docify audit (Phase 1 baseline)

This audit focuses on production-readiness issues that were visible in the codebase before the hardening pass.

## Critical issues

1. Startup safety
   - `server/server.js` does not validate required env vars before binding the server.
   - `server/db.js` logs the raw Mongo connection string and silently continues after connection failure.
   - Missing graceful shutdown logic means the app can exit badly during restarts or Ctrl+C.

2. Security and HTTP hardening
   - `server/server.js` enables CORS from a single hardcoded `CLIENT_URL` and does not support multi-origin allowlists.
   - No `helmet`, `compression`, rate limiting, or `trust proxy` configuration.
   - `express.json()` is not limited, allowing large payload abuse.
   - The app exposes auth routes before any health-check route, so uptime probes can hit auth middleware and receive login errors instead of health status.

3. Auth and role enforcement
   - `server/middleware/auth-middleware.js` does not validate the `Bearer` prefix robustly and returns inconsistent 401 payloads.
   - `server/middleware/admin-middleware.js` logs sensitive user info and uses a 400 status for forbidden access.
   - There is no centralized error handler or 404 route, so crashes and invalid routes are handled inconsistently.

4. Data safety and logging
   - `server/db.js` and `server/server.js` log sensitive connection values and operational details without structured logging.
   - `server/controllers/auth-controller.js` performs registration/login logic without a centralized async wrapper, so an unhandled rejection can crash a process.

5. Client configuration
   - The client uses `VITE_SERVER_URL` in `client/src/config.js`, but the rest of the app is built around `API_URL` naming and mixed local defaults.
   - There is no client-side error boundary or global 401 handling for expired tokens.
   - `client/src/App.jsx` renders the app without a global error boundary and without a SPA rewrite configuration for Vercel.

## Notes

These findings were the highest-risk items for a live medical booking platform and were addressed in the stability patch.
