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
    failureRedirect: "/api/auth/login-failed",
  }),
  (req, res) => {
    res.json({
      success: true,
      message: "Login com Google realizado",
      user: req.user,
    });
  }
);

// rota de erro login google
router.get("/login-failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "Falha no login",
  });
});

module.exports = router;