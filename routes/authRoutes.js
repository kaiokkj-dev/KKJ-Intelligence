const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const passport = require("passport");
const jwt = require("jsonwebtoken");

// REGISTER
router.post("/register", authController.register);

// LOGIN
router.post("/login", authController.login);

// LOGOUT
router.get("/logout", authController.logout);

// INICIAR LOGIN GOOGLE
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// CALLBACK GOOGLE
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/",
  }),
  (req, res) => {
    const token = jwt.sign(
      {
        id: req.user.id,
        email: req.user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const user = encodeURIComponent(
      JSON.stringify({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
      })
    );

    res.redirect(`/?token=${token}&user=${user}`);
  }
);

module.exports = router;