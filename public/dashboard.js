/* =========================
   INICIALIZAÇÃO
========================= */
lucide.createIcons();

/* =========================
   LOGIN GOOGLE
========================= */
const params = new URLSearchParams(window.location.search);
const googleToken = params.get("token");
const googleUser = params.get("user");

if (googleToken && googleUser) {
  localStorage.setItem("token", googleToken);
  localStorage.setItem("user", decodeURIComponent(googleUser));
  window.history.replaceState({}, document.title, "/");
}

/* =========================
   STORAGE
========================= */
const token = localStorage.getItem("token");
const storedUser = JSON.parse(localStorage.getItem("user"));

/* =========================
   ELEMENTOS
========================= */
const topActions = document.getElementById("topActions");
const topHeader = document.querySelector(".top-header");
const sidebarUser = document.querySelector(".user-card");
const sidebarLogout = document.getElementById("logoutBtn");

const authModal = document.getElementById("authModal");
const authOverlay = document.querySelector("#authModal .auth-overlay");
const registerModal = document.getElementById("registerModal");
const registerOverlay = document.getElementById("registerOverlay");

const openLoginModal = document.getElementById("openLoginModal");
const openRegisterModal = document.getElementById("openRegisterModal");
const openRegisterTop = document.getElementById("openRegisterTop");
const goToLoginModal = document.getElementById("goToLoginModal");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const logoutModal = document.getElementById("logoutModal");
const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");
const cancelLogoutBtn = document.getElementById("cancelLogoutBtn");

const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const settingsOverlay = document.querySelector(".settings-overlay");

const settingsAccountLogged = document.getElementById("settingsAccountLogged");
const settingsAccountGuest = document.getElementById("settingsAccountGuest");
const settingsLoginBtn = document.getElementById("settingsLoginBtn");
const settingsRegisterBtn = document.getElementById("settingsRegisterBtn");
const settingsLogoutBtn = document.getElementById("settingsLogoutBtn");

const darkThemeBtn = document.getElementById("darkThemeBtn");
const lightThemeBtn = document.getElementById("lightThemeBtn");

/* =========================
   FUNÇÕES GERAIS
========================= */
function openModal(modal) {
  if (!modal) return;
  modal.classList.remove("hidden");
  lucide.createIcons();
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.add("hidden");
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.reload();
}

function togglePassword(inputId, element) {
  const input = document.getElementById(inputId);
  if (!input) return;

  if (input.type === "password") {
    input.type = "text";
    element.innerHTML = '<i data-lucide="eye-off"></i>';
  } else {
    input.type = "password";
    element.innerHTML = '<i data-lucide="eye"></i>';
  }

  lucide.createIcons();
}

function showToast(message, success = true) {
  const toast = document.getElementById("error-toast");
  if (!toast) return;

  const text = toast.querySelector(".toast-text");
  const icon = toast.querySelector(".toast-icon");

  text.textContent = message;
  icon.textContent = success ? "✅" : "❌";

  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}

/* =========================
   USUÁRIO
========================= */
function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function updateUserUI() {
  if (token && storedUser) {
    const name = storedUser.name || storedUser.email.split("@")[0];
    const initials = getInitials(name);

    topActions?.classList.add("hidden");
    topHeader?.classList.add("hidden");

    if (sidebarUser) sidebarUser.style.display = "flex";
    if (sidebarLogout) sidebarLogout.style.display = "flex";

    settingsAccountLogged?.classList.remove("hidden");
    settingsAccountGuest?.classList.add("hidden");

    document.getElementById("sidebarUserName").textContent = name;
    document.getElementById("userAvatar").textContent = initials;
    document.getElementById("settingsUserName").textContent = name;
    document.getElementById("settingsUserAvatar").textContent = initials;
  } else {
    topActions?.classList.remove("hidden");
    topHeader?.classList.remove("hidden");

    if (sidebarUser) sidebarUser.style.display = "none";
    if (sidebarLogout) sidebarLogout.style.display = "none";

    settingsAccountLogged?.classList.add("hidden");
    settingsAccountGuest?.classList.remove("hidden");
  }
}

updateUserUI();

/* =========================
   MODAIS AUTH
========================= */
openLoginModal?.addEventListener("click", (e) => {
  e.preventDefault();
  openModal(authModal);
});

authOverlay?.addEventListener("click", () => {
  closeModal(authModal);
});

openRegisterModal?.addEventListener("click", (e) => {
  e.preventDefault();
  closeModal(authModal);
  openModal(registerModal);
});

openRegisterTop?.addEventListener("click", (e) => {
  e.preventDefault();
  openModal(registerModal);
});

registerOverlay?.addEventListener("click", () => {
  closeModal(registerModal);
});

goToLoginModal?.addEventListener("click", (e) => {
  e.preventDefault();
  closeModal(registerModal);
  openModal(authModal);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal(authModal);
    closeModal(registerModal);
    closeModal(settingsModal);
    closeModal(logoutModal);
  }
});
  function t(key) {
  const lang =
    localStorage.getItem("language") || "pt";
  return translations[lang]?.[key]
    || translations.pt[key]
    || key;
}
/* =========================
   LOGIN
========================= */
loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!data.success) {
      showToast(data.message, false);
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    showToast(t("toast.loginSuccess"), true);

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (err) {
    showToast(t("toast.serverError"), false);
  }
});

/* =========================
CADASTRO
========================= */
registerForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value.trim().toLowerCase();
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    showToast(t("toast.passwordMismatch"), false);
    return;
  }

  const turnstileToken = document.querySelector(
    '[name="cf-turnstile-response"]'
  )?.value;

  if (!turnstileToken) {
    showToast(t("toast.verifyHuman"), false);
    return;
  }

  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        turnstileToken,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      showToast(data.message, false);
      return;
    }

    showToast(t("toast.registerSuccess"), true);
    setTimeout(() => {
      closeModal(registerModal);
      openModal(authModal);
    }, 1000);
  } catch (err) {
    showToast(t("toast.serverError"), false);
  }
});

/* =========================
LOGOUT
========================= */
sidebarLogout?.addEventListener("click", () => {
  openModal(logoutModal);
});

confirmLogoutBtn?.addEventListener("click", () => {
  logout();
});

cancelLogoutBtn?.addEventListener("click", () => {
  closeModal(logoutModal);
});

/* =========================
CONFIGURAÇÕES
========================= */
settingsBtn?.addEventListener("click", () => {
  openModal(settingsModal);
});

closeSettingsBtn?.addEventListener("click", () => {
  closeModal(settingsModal);
});

settingsOverlay?.addEventListener("click", () => {
  closeModal(settingsModal);
});

settingsLoginBtn?.addEventListener("click", () => {
  closeModal(settingsModal);
  openModal(authModal);
});

settingsRegisterBtn?.addEventListener("click", () => {
  closeModal(settingsModal);
  openModal(registerModal);
});

settingsLogoutBtn?.addEventListener("click", () => {
  closeModal(settingsModal);
  openModal(logoutModal);
});

/* =========================
TEMA
========================= */
function loadTheme() {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "light") {
    document.body.classList.add("light-theme");
  }
}

function setTheme(theme) {
  if (theme === "light") {
    document.body.classList.add("light-theme");
  } else {
    document.body.classList.remove("light-theme");
  }

  localStorage.setItem("theme", theme);
}

loadTheme();

lightThemeBtn?.addEventListener("click", () => {
  setTheme("light");
});

darkThemeBtn?.addEventListener("click", () => {
  setTheme("dark");
});
/* =========================
IDIOMA
========================= */

const ptBtn = document.getElementById("ptBtn");
const enBtn = document.getElementById("enBtn");

const translations = {
  pt: {
    "sidebar.newChat": "Novo chat",
    "sidebar.recentChats": "Chats recentes",
    "sidebar.firstChat": "Primeiro chat",
    "sidebar.newConversation": "Nova conversa",
    "settings.title": "Configurações",
    "settings.appearance": "Aparência",
    "settings.language": "Idioma",
    "settings.account": "Conta",
    "theme.dark": "Escuro",
    "theme.light": "Claro",

    "user.online": "Online",
    "user.connected": "Conta conectada",

    "auth.login": "Entrar",
    "auth.loginUpper": "Entrar",
    "auth.logout": "Sair",
    "auth.logoutAccount": "Sair da conta",
    "auth.createAccount": "Criar Conta",
    "auth.registerFree": "Cadastrar-se gratuitamente",

    "welcome.title": "Como posso ajudar hoje?",
    "welcome.subtitle": "Digite sua pergunta abaixo para começar.",

    "chat.placeholder": "Digite sua mensagem...",
    "chat.warning":
      "KKJ Intelligence utiliza modelos da OpenAI. Como toda IA, respostas imprecisas podem ocorrer. Revise informações importantes.",

    "login.title": "Login",
    "login.subtitle": "Digite seu e-mail e senha para acessar sua conta",
    "login.noAccount": "AINDA NÃO TEM CONTA?",

    "register.title": "Cadastro",
    "register.subtitle": "Digite suas informações para criar sua conta",
    "register.hasAccount": "JÁ TEM CONTA?",

    "form.name": "Nome",
    "form.email": "E-mail",
    "form.password": "Senha",
    "form.confirmPassword": "Confirmar senha",
    "form.namePlaceholder": "Digite seu nome",
    "form.emailPlaceholder": "Digite seu e-mail",
    "form.passwordPlaceholder": "Digite sua senha",
    "form.confirmPasswordPlaceholder": "Confirme sua senha",

    "terms.textStart": "Ao se cadastrar, você concorda com nossos",
    "terms.terms": "Termos de Uso",
    "terms.and": "e",
    "terms.privacy": "Política de Privacidade",

    "logout.title": "Tem certeza de que deseja sair?",
    "logout.subtitle": "Você será desconectado da KKJ Intelligence.",

    "guest.message":
      "Faça login para salvar conversas, sincronizar preferências e acessar todos os recursos da KKJ Intelligence.",

    "common.cancel": "Cancelar",
    "common.close": "Fechar",

    "toast.loginSuccess": "Login realizado com sucesso",
    "toast.registerSuccess": "Conta criada com sucesso",
    "toast.serverError": "Erro interno do servidor",
    "toast.passwordMismatch": "As senhas não coincidem",
    "toast.verifyHuman": "Confirme que você é humano",
    "toast.messageNotSent": "Mensagem não enviada"
    },

  en: {
    "sidebar.newChat": "New chat",
    "sidebar.recentChats": "Recent chats",
    "sidebar.firstChat": "First chat",
    "sidebar.newConversation": "New conversation",

    "settings.title": "Settings",
    "settings.appearance": "Appearance",
    "settings.language": "Language",
    "settings.account": "Account",

    "theme.dark": "Dark",
    "theme.light": "Light",

    "user.online": "Online",
    "user.connected": "Connected account",

    "auth.login": "Log in",
    "auth.loginUpper": "LOG IN",
    "auth.logout": "Log out",
    "auth.logoutAccount": "Log out of account",
    "auth.createAccount": "CREACT ACCOUNT",
    "auth.registerFree": "Sign up for free",

    "welcome.title": "How can I help today?",
    "welcome.subtitle": "Type your question below to get started.",

    "chat.placeholder": "Type your message...",
    "chat.warning":
      "KKJ Intelligence uses OpenAI models. Like any AI, inaccurate responses may occur. Review important information.",

    "login.title": "Login",
    "login.subtitle": "Enter your email and password to access your account",
    "login.noAccount": "DON'T HAVE AN ACCOUNT YET?",

    "register.title": "Sign up",
    "register.subtitle": "Enter your information to create your account",
    "register.hasAccount": "ALREADY HAVE AN ACCOUNT?",

    "form.name": "Name",
    "form.email": "Email",
    "form.password": "Password",
    "form.confirmPassword": "Confirm password",
    "form.namePlaceholder": "Enter your name",
    "form.emailPlaceholder": "Enter your email",
    "form.passwordPlaceholder": "Enter your password",
    "form.confirmPasswordPlaceholder": "Confirm your password",

    "terms.textStart": "By signing up, you agree to our",
    "terms.terms": "Terms of Use",
    "terms.and": "and",
    "terms.privacy": "Privacy Policy",

    "logout.title": "Are you sure you want to log out?",
    "logout.subtitle": "You will be disconnected from KKJ Intelligence.",

    "guest.message":
      "Log in to save conversations, sync preferences, and access all KKJ Intelligence features.",

    "common.cancel": "Cancel",
    "common.close": "Close",

    "toast.loginSuccess": "Login successful",
    "toast.registerSuccess": "Account created successfully",
    "toast.serverError": "Internal server error",
    "toast.passwordMismatch": "Passwords do not match",
    "toast.verifyHuman": "Please verify that you are human",
    "toast.messageNotSent": "Message not sent"
  },
};

function setLanguage(lang) {
  const selectedTranslations = translations[lang] || translations.pt;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");

    if (selectedTranslations[key]) {
      element.textContent = selectedTranslations[key];
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const key = element.getAttribute("data-i18n-placeholder");

    if (selectedTranslations[key]) {
      element.placeholder = selectedTranslations[key];
    }
  });

  document.documentElement.lang = lang === "en" ? "en" : "pt-BR";
  localStorage.setItem("language", lang);

  ptBtn?.classList.toggle("active", lang === "pt");
  enBtn?.classList.toggle("active", lang === "en");
}

const savedLanguage = localStorage.getItem("language") || "pt";

setLanguage(savedLanguage);

ptBtn?.addEventListener("click", () => {
  setLanguage("pt");
});

enBtn?.addEventListener("click", () => {
  setLanguage("en");
});
/* =========================
   CHAT
========================= */
const chatContainer = document.getElementById("messages");
const chatInput = document.getElementById("userMessage");
const chatForm = document.getElementById("chatForm");
function formatMessage(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
}

function getCurrentTime() {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function renderMessageContent(element, text) {
  const content = element.querySelector(".message-content");
  if (content) {
    content.innerHTML = formatMessage(text);
    element.dataset.messageText = text;
    return;
  }

  element.innerHTML = formatMessage(text);
}

function addChatMessage(role, text) {
  const welcomeBox = document.querySelector(".welcome-box");
  if (welcomeBox) welcomeBox.remove();

  const div = document.createElement("div");
  div.className = `chat-message ${role}`;

  div.dataset.messageText = text;
  div.innerHTML = `
    <div class="message-bubble">
      <div class="message-content">${formatMessage(text)}</div>
    </div>
    <div class="message-meta">
      <button class="copy-message-btn" type="button" aria-label="Copiar mensagem" title="Copiar mensagem">
        <i data-lucide="copy"></i>
      </button>
      <time>${getCurrentTime()}</time>
    </div>
  `;

  chatContainer.appendChild(div);
  lucide.createIcons();
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

chatContainer?.addEventListener("click", async (e) => {
  const copyButton = e.target.closest(".copy-message-btn");
  if (!copyButton) return;

  const message = copyButton.closest(".chat-message");
  const text = message?.dataset.messageText || "";
  if (!text) return;

  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
  copyButton.classList.add("copied");

  setTimeout(() => {
    copyButton.classList.remove("copied");
  }, 1200);
});
async function loadHistory() {
  const currentToken = localStorage.getItem("token");
  if (!currentToken) return;

  const res = await fetch("/api/ai/history", {
    headers: {
      Authorization: `Bearer ${currentToken}`,
    },
  });

  const data = await res.json();

  if (data.success) {
    data.chats.reverse().forEach((chat) => {
      addChatMessage("user", chat.message);
      addChatMessage("assistant", chat.response);
    });
  }
}

loadHistory();

chatForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = chatInput.value.trim();
  if (!message) return;

  const currentToken = localStorage.getItem("token");

  if (!currentToken) {
    showToast("Faça login para usar o chat", false);
    return;
  }

  addChatMessage("user", message);
  chatInput.value = "";

  addChatMessage("assistant", "Digitando...");

  try {
    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentToken}`,
      },
      body: JSON.stringify({ message }),
    });

let data = await response.json();

    let aiText = data.response;
    const lastAssistant = chatContainer.querySelector(
      ".chat-message.assistant:last-child"
    );

    if (lastAssistant) {
      renderMessageContent(lastAssistant, aiText);
    }

  } catch (err) {
    const lastAssistant = chatContainer.querySelector(
      ".chat-message.assistant:last-child"
    );
    if (lastAssistant) {
      lastAssistant.textContent = "Erro ao enviar mensagem";
    }
  }
});
