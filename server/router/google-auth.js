// server/router/googleAuth.js

const express = require("express");
const passport = require("passport");

const router = express.Router();

// Route to start Google login
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback route that Google will redirect to
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    // You can also redirect to frontend or show a message
    res.redirect("/"); // Temporary for now, will setup later
  }
);

// Profile route to test user data after login
router.get("/", (req, res) => {
  if (req.user) {
    res.send(`Welcome, ${req.user.displayName}`);
  } else {
    res.send("Not Logged in");
  }
});

module.exports = router;
