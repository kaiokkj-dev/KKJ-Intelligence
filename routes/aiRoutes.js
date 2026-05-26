const express = require("express");
const router = express.Router();

const aiController = require("../controllers/aiController");
const { protect } = require("../middlewares/authMiddleware");

// ROTA CHAT IA
router.post("/chat", protect, aiController.chat);
// ROTA HISTORICO IA
router.get("/history", protect, aiController.history);

module.exports = router;