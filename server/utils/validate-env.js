const requiredEnvVars = [
  "MONGODB_URI",
  "JWT_SECRET",
  "CLIENT_URL",
  "SERVER_URL",
  "SESSION_SECRET",
];

function validateRequiredEnv() {
  const resolved = {
    ...process.env,
    MONGODB_URI: process.env.MONGODB_URI || process.env.MONGO_CONN,
    SESSION_SECRET: process.env.SESSION_SECRET || process.env.JWT_SECRET,
  };

  const missing = requiredEnvVars.filter((key) => !resolved[key] || !String(resolved[key]).trim());

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  return true;
}

module.exports = { validateRequiredEnv, requiredEnvVars };
