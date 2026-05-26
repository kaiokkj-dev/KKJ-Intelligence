const OpenAI = require("openai");
const db = require("../database/db");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;
    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Mensagem não enviada",
      });
    }
    // BUSCAR ÚLTIMAS CONVERSAS
    const { data: oldChats } = await db
      .from("chats")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(10);
    // MONTAR CONTEXTO
    const messages = [
      {
        role: "system",
        content:
          "Você é o assistente oficial da KKJ Intelligence.",
      },
    ];
    // ADICIONAR HISTORICO
    if (oldChats && oldChats.length > 0) {
      oldChats.forEach((chat) => {
        messages.push({
          role: "user",
          content: chat.message,
        });
        messages.push({
          role: "assistant",
          content: chat.response,
        });
      });
    }
    // ADICIONAR NOVA MENSSAGEM
    messages.push({
      role: "user",
      content: message,
    });
    // OPENAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages,
    });
    const aiResponse = completion.choices[0].message.content;
    // SALVAR CHAT
    await db.from("chats").insert([
      {
        user_id: userId,
        message,
        response: aiResponse,
      },
    ]);
    return res.status(200).json({
      success: true,
      response: aiResponse,
    });
  } catch (err) {
    console.error("Erro IA:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
exports.history = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: chats, error } = await db
      .from("chats")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(200).json({
      success: true,
      chats,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};