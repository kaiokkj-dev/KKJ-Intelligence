const OpenAI = require("openai");
const db = require("../database/db");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_CONVERSATIONS = 8;
const GUEST_CHAT_LIMIT = 3;

function createConversationTitle(message) {
  const title = String(message || "Novo chat").trim().replace(/\s+/g, " ");
  return title.length > 40 ? `${title.slice(0, 40)}...` : title;
}

function buildSystemPrompt(userName) {
  return `
O nome do usuario logado e: ${userName || "nao informado"}.
Voce e o assistente oficial da KKJ Intelligence.
Responda sempre no mesmo idioma do usuario.
Se o usuario nao estiver logado e te falar ou voce perceber diga que so respondera 3 perguntas e incentive ele a fazer o login na platarforma.
Informacoes fixas sobre o projeto:
- Criador: Kaio Henrique
- Portfolio: https://kaiohenrique.dev
- Contato: kaiohenriquemalaquias@gmail.com
- Se o usuario perguntar quem criou o site, quem e o dono, quem desenvolveu ou pedir contato do criador, responda que foi Kaio Henrique.
Quando o usuario pedir listas, exercicios, passos ou perguntas:
1. Use numeracao.
2. Coloque cada item em uma linha separada.
3. Nunca escreva varios itens na mesma linha.
4. Nao coloque apenas o numero sozinho em uma linha.

Exemplo correto:
1. 2 + 3 = ?
2. 5 + 4 = ?
3. 10 - 6 = ?

Exemplo errado:
1. 2 + 3 = ? 2. 5 + 4 = ? 3. 10 - 6 = ?
`;
}

function normalizeResponse(text) {
  return text
    .replace(/\s+(?=\d+\.\s)/g, "\n\n")
    .replace(/\?\s+(?=\d+\.\s)/g, "?\n\n")
    .trim();
}

async function handleGuestChat(req, res, message) {
  const guestChatCount = req.session.guestChatCount || 0;

  if (guestChatCount >= GUEST_CHAT_LIMIT) {
    return res.status(429).json({
      success: false,
      message: `Voce pode enviar no maximo ${GUEST_CHAT_LIMIT} mensagens sem login. Entre na sua conta para continuar.`,
    });
  }

  const guestMessages = req.session.guestMessages || [];
  const messages = [
    {
      role: "system",
      content: buildSystemPrompt(null),
    },
    ...guestMessages,
    {
      role: "user",
      content: message,
    },
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages,
  });

  const aiResponse = normalizeResponse(completion.choices[0].message.content);

  req.session.guestChatCount = guestChatCount + 1;
  req.session.guestMessages = [
    ...guestMessages,
    { role: "user", content: message },
    { role: "assistant", content: aiResponse },
  ].slice(-6);

  return res.status(200).json({
    success: true,
    response: aiResponse,
    guestLimitReached: req.session.guestChatCount >= GUEST_CHAT_LIMIT,
    remainingGuestMessages: Math.max(
      0,
      GUEST_CHAT_LIMIT - req.session.guestChatCount
    ),
  });
}

async function ensureConversation(userId, conversationId, message) {
  if (conversationId) {
    const { data: conversation, error } = await db
      .from("conversations")
      .select("id, title")
      .eq("id", conversationId)
      .eq("user_id", userId)
      .single();

    if (error || !conversation) return null;
    return conversation;
  }

  const { count, error: countError } = await db
    .from("conversations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (countError) throw countError;

  if (Number(count || 0) >= MAX_CONVERSATIONS) {
    const limitError = new Error(
      `Voce atingiu o limite de ${MAX_CONVERSATIONS} chats. Exclua uma conversa para criar outra.`
    );
    limitError.statusCode = 429;
    throw limitError;
  }

  const { data: conversation, error } = await db
    .from("conversations")
    .insert([
      {
        user_id: userId,
        title: createConversationTitle(message),
      },
    ])
    .select("id, title")
    .single();

  if (error) throw error;
  return conversation;
}

exports.chat = async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Mensagem nao enviada",
      });
    }

    if (!req.user) {
      return handleGuestChat(req, res, message);
    }

    const userId = req.user.id;
    const { data: user } = await db
      .from("users")
      .select("name")
      .eq("id", userId)
      .single();

    const conversation = await ensureConversation(userId, conversationId, message);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversa nao encontrada",
      });
    }

    const { data: oldChats } = await db
      .from("chats")
      .select("*")
      .eq("user_id", userId)
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: false })
      .limit(10);

    const recentChats = oldChats ? oldChats.reverse() : [];
    const messages = [
      {
        role: "system",
        content: buildSystemPrompt(user?.name),
      },
    ];

    if (recentChats.length > 0) {
      recentChats.forEach((chat) => {
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

    messages.push({
      role: "user",
      content: message,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages,
    });

    const aiResponse = normalizeResponse(completion.choices[0].message.content);

    await db.from("chats").insert([
      {
        user_id: userId,
        conversation_id: conversation.id,
        message,
        response: aiResponse,
      },
    ]);

    const conversationUpdates = {
      updated_at: new Date().toISOString(),
    };

    if (conversation.title === "Novo chat") {
      conversationUpdates.title = createConversationTitle(message);
      conversation.title = conversationUpdates.title;
    }

    await db
      .from("conversations")
      .update(conversationUpdates)
      .eq("id", conversation.id)
      .eq("user_id", userId);

    return res.status(200).json({
      success: true,
      conversation,
      response: aiResponse,
    });
  } catch (err) {
    console.error("Erro IA:", err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.statusCode
        ? err.message
        : "Erro interno ao processar mensagem",
    });
  }
};

exports.history = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.query;

    if (!conversationId) {
      return res.status(200).json({
        success: true,
        chats: [],
      });
    }

    const { data: chats, error } = await db
      .from("chats")
      .select("*")
      .eq("user_id", userId)
      .eq("conversation_id", conversationId)
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
    console.error("Erro ao buscar historico:", err);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao buscar historico",
    });
  }
};

exports.conversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: conversations, error } = await db
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Erro ao buscar conversas",
      });
    }

    return res.status(200).json({
      success: true,
      conversations,
    });
  } catch (err) {
    console.error("Erro ao buscar conversas:", err);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao buscar conversas",
    });
  }
};

exports.createConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { count, error: countError } = await db
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    if (countError) {
      return res.status(400).json({
        success: false,
        message: "Erro ao verificar limite de conversas",
      });
    }

    if (Number(count || 0) >= MAX_CONVERSATIONS) {
      return res.status(429).json({
        success: false,
        message: `Voce atingiu o limite de ${MAX_CONVERSATIONS} chats. Exclua uma conversa para criar outra.`,
      });
    }

    const { data: conversation, error } = await db
      .from("conversations")
      .insert([
        {
          user_id: userId,
          title: "Novo chat",
        },
      ])
      .select("*")
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Erro ao criar conversa",
      });
    }

    return res.status(201).json({
      success: true,
      conversation,
    });
  } catch (err) {
    console.error("Erro ao criar conversa:", err);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao criar conversa",
    });
  }
};

exports.deleteConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await db
      .from("chats")
      .delete()
      .eq("user_id", userId)
      .eq("conversation_id", id);

    const { error } = await db
      .from("conversations")
      .delete()
      .eq("user_id", userId)
      .eq("id", id);

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Erro ao excluir conversa",
      });
    }

    return res.status(200).json({
      success: true,
    });
  } catch (err) {
    console.error("Erro ao excluir conversa:", err);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao excluir conversa",
    });
  }
};
