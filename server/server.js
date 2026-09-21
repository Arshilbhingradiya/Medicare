require("dotenv").config();
require("express-async-errors");

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const { validateRequiredEnv } = require("./utils/validate-env");
const connectdb = require("./db");
const authrouter = require("./router/auth-router");
const contactrouter = require("./router/contact-router");
const servicerouter = require("./router/service-router");
const adminrouter = require("./router/admin-router");
const patientrouter = require("./router/patient-router");
const doctorrouter = require("./router/doctor-router");
const notificationrouter = require("./router/notification-router");
const assistantrouter = require("./router/assistant-router");
const googleAuthRoutes = require("./router/google-auth.js");
const razorpayController = require("./controllers/razorpay-controller");
const { sendAppointmentReminders } = require("./services/appointment-automation");

validateRequiredEnv();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Idempotency-Key"],
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication attempts. Please slow down." },
});

const assistantLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Assistant rate limit reached. Please wait a minute and retry." },
});

app.use(generalLimiter);

app.get("/api/health", async (req, res) => {
  const healthStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.status(200).json({ ok: true, db: healthStatus });
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || "docify-dev-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 12,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.post(
  "/api/doctorform/subscription/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    req.rawBody = req.body;
    try {
      req.body = JSON.parse(req.body.toString());
    } catch {
      // leave as-is
    }
    razorpayController.razorpayWebhook(req, res);
  }
);

app.use("/api/auth", authLimiter, authrouter);
app.use("/api/form", contactrouter);
app.use("/api/data", servicerouter);
app.use("/api/admin", adminrouter);
app.use("/api/patientform", patientrouter);
app.use("/api/doctorform", doctorrouter);
app.use("/api/notifications", notificationrouter);
app.use("/api/assistant", assistantLimiter, assistantrouter);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/auth/google/callback`,
    },
    (accessToken, refreshToken, profile, done) => done(null, profile)
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
app.use(googleAuthRoutes);

connectdb();

const reminderInterval = setInterval(() => {
  Promise.resolve()
    .then(() => razorpayController.sendRenewalReminders())
    .catch((error) => console.error("Renewal reminder job error:", error));
}, 6 * 60 * 60 * 1000);

const appointmentReminderInterval = setInterval(() => {
  sendAppointmentReminders().catch((error) => console.error("Appointment reminder job error:", error));
}, 15 * 60 * 1000);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = Number(error.statusCode || error.status || 500);
  const safeMessage = error.message || "Internal server error";

  console.error("Unhandled error:", {
    url: req.originalUrl,
    method: req.method,
    statusCode,
    error: safeMessage,
  });

  res.status(statusCode).json({
    message: safeMessage,
    ...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
  });
});

const server = app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});

const shutdown = async (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      clearInterval(reminderInterval);
      clearInterval(appointmentReminderInterval);
      await mongoose.disconnect();
      process.exit(0);
    });
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});
