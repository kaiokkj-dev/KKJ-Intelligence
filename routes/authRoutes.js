const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const passport = require("passport");

// ========================
// AUTH API
// ========================

// REGISTER
router.post("/register", authController.register);

// LOGIN
router.post("/login", authController.login);

// LOGOUT
router.get("/logout", authController.logout);

// ========================
// GOOGLE LOGIN
// ========================

// iniciar login google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// callback do google
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login.html",
  }),
  (req, res) => {
    res.redirect("/dashboard.html");
  }
);
module.exports = router;