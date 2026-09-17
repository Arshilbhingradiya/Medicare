require("dotenv").config();

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express = require("express");
const cors = require("cors");
const app = express();

const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
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
const connectdb = require("./db");

// cors (single source of truth - was previously configured twice with
// conflicting settings, which caused inconsistent CORS/session behaviour)
const corsoption = {
  origin: process.env.CLIENT_URL,
  methods: "GET,POST,DELETE,PUT,PATCH",
  credentials: true,
};
app.use(cors(corsoption));

// session (single source of truth - previously initialized twice with two
// different hardcoded secrets, the second call silently overriding the first)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-only-insecure-secret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Razorpay webhook needs raw body - register before express.json()
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

//middleware
app.use(express.json());

app.use("/api/auth", authrouter);
app.use("/api/form", contactrouter);
app.use("/api/data", servicerouter);
// admin panel
app.use("/api/admin", adminrouter);

// patient panel
app.use("/api/patientform", patientrouter);

// Doctor panel
app.use("/api/doctorform", doctorrouter);

// Notification panel
app.use("/api/notifications", notificationrouter);
app.use("/api/assistant", assistantrouter);

// Passport Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/auth/google/callback`,
    },
    (accessToken, refreshToken, profile, done) => {
      console.log("Google profile:", profile);
      return done(null, profile);
    }
  )
);

// Serialize user to store in session
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Use Google Auth Routes
app.use(googleAuthRoutes);

// app.use("/api/form", router);
// we can use this method also but mvc structure is not prefer
// app.get('/', (req,res)=>{
//     res.status(200).send("hello world");
// })

connectdb();

// Periodic renewal reminder job (every 6 hours)
setInterval(() => {
  Promise.resolve()
    .then(() => razorpayController.sendRenewalReminders())
    .catch((error) => console.error("Renewal reminder job error:", error));
}, 6 * 60 * 60 * 1000);

setInterval(() => {
  sendAppointmentReminders().catch((error) => console.error("Appointment reminder job error:", error));
}, 15 * 60 * 1000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
