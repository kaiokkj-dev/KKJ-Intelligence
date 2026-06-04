const express = require("express");
const router = express.Router();

const aiController = require("../controllers/aiController");
const { protect, optionalAuth } = require("../middlewares/authMiddleware");
const { chatRateLimit } = require("../middlewares/rateLimitMiddleware");

// ROTA CHAT IA
router.post("/chat", optionalAuth, chatRateLimit, aiController.chat);
// ROTAS DE CONVERSAS
router.get("/conversations", protect, aiController.conversations);
router.post("/conversations", protect, aiController.createConversation);
router.delete("/conversations/:id", protect, aiController.deleteConversation);
// ROTA HISTORICO IA
router.get("/history", protect, aiController.history);

module.exports = router;
