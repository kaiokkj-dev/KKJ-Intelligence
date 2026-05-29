const db = require("../database/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ 
      success: false,
      message: "Preencha email e senha",
    });
  }
  try {
    const { data: user, error } = await db
      .from("users")
      .select("*")
      .eq("email", email)
      .single();
    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: "Email ou senha inválidos",
      });
    }
    const senhaCorreta = await bcrypt.compare(password, user.password);
    if (!senhaCorreta) {
      return res.status(401).json({
        success: false,
        message: "Email ou senha inválidos",
      });
    }
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
    return res.status(200).json({
      success: true,
      message: "Login realizado com sucesso",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    console.error("Erro no login:", err.message);
    return res.status(500).json({
      success: false,
      message: "Erro interno no login",
    });
  }
};
// REGISTER
exports.register = async (req, res) => {
  const { name, email, password, turnstileToken } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Preencha todos os campos",
    });
  }
  if (!turnstileToken) {
    return res.status(400).json({
      success: false,
      message: "Confirme que você é humano.",
    });
  }
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "A senha deve ter no mínimo 6 caracteres",
    });
  }
  try {
    const verifyResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: turnstileToken,
        }),
      }
    );
    const verifyData = await verifyResponse.json();
    if (!verifyData.success) {
      return res.status(400).json({
        success: false,
        message: "Verificação humana inválida.",
      });
    }
    const hash = await bcrypt.hash(password, 10);
    const { data: user, error } = await db
      .from("users")
      .insert([
        {
          name,
          email,
          password: hash,
        },
      ])
      .select()
      .single();
    if (error) {
      console.error("ERRO REAL SUPABASE:", error);
      if (error.code === "23505") {
        return res.status(400).json({
          success: false,
          message: "Este e-mail já está cadastrado.",
        });
      }
      return res.status(400).json({
        success: false,
        message: "Erro ao criar conta.",
      });
    }
    return res.status(201).json({
      success: true,
      message: "Conta criada com sucesso",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Erro no cadastro:", err.message);
    return res.status(500).json({
      success: false,
      message: "Erro ao cadastrar",
    });
  }
};
// LOGOUT
exports.logout = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logout realizado com sucesso",
  });
};