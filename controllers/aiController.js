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
content: `
Você é o assistente oficial da KKJ Intelligence.
Responda sempre no mesmo idioma do usuário.

Quando o usuário pedir listas, exercícios, passos ou perguntas:
1. Use numeração.
2. Coloque cada item em uma linha separada.
3. Nunca escreva vários itens na mesma linha.
4. Não coloque apenas o número sozinho em uma linha.

Exemplo correto:
1. 2 + 3 = ?
2. 5 + 4 = ?
3. 10 - 6 = ?

Exemplo errado:
1. 2 + 3 = ? 2. 5 + 4 = ? 3. 10 - 6 = ?
`
      }
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
function normalizeResponse(text) {
  return text
    .replace(/\s+(?=\d+\.\s)/g, "\n\n")
    .replace(/\?\s+(?=\d+\.\s)/g, "?\n\n")
    .trim();
}
    const aiResponse = normalizeResponse(
  completion.choices[0].message.content
);
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
      message: "Erro interno ao processar mensagem",
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
    console.error("Erro ao buscar histórico:", err);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao buscar histórico",
    });
  }
};
