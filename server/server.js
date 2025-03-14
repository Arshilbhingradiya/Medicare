require("dotenv").config();
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
const patientrouter = require("./router/patient-router.js");

const googleAuthRoutes = require("./router/google-auth.js");
app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());
const connectdb = require("./db");

// cors

const corsoption = {
  origin: "http://localhost:5173",
  method: "GET,POST,DELETE,PUT,PATCH",
  credentials: true,
};

// middleware all thingd a in all crud operation
app.use(cors(corsoption));

//middleware
app.use(express.json());

app.use("/api/auth", authrouter);
app.use("/api/form", contactrouter);
app.use("/api/data", servicerouter);
// admin panel
app.use("/api/admin", adminrouter);

app.use("/api/patientform", patientrouter);

app.use(
  cors({
    origin: "http://localhost:5173", // Your frontend URL
    credentials: true,
  })
);

// Session Setup
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
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

app.listen(3000, () => {
  console.log(`server is running on 3000`);
});
