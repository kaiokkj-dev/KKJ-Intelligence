const express = require("express");
const router = express.Router();

const aiController = require("../controllers/aiController");
const { protect } = require("../middlewares/authMiddleware");
const { chatRateLimit } = require("../middlewares/rateLimitMiddleware");

// ROTA CHAT IA
router.post("/chat", protect, chatRateLimit, aiController.chat);
// ROTA HISTORICO IA
router.get("/history", protect, aiController.history);

module.exports = router;
