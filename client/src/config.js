// Central configuration for API / Client URLs.
// Values come from client/.env (VITE_* vars) so they can be changed per environment.
// Falls back to localhost defaults for local development.

export const API_URL =
  import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

export const CLIENT_URL =
  import.meta.env.VITE_CLIENT_URL || "http://localhost:5173";

