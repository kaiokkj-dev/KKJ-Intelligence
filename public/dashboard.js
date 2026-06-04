/* =========================
INICIALIZAÇÃO
========================= */
lucide.createIcons();

/* =========================
LOGIN GOOGLE
========================= */
const params = new URLSearchParams(window.location.search);
const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
const authParams = hashParams.get("token") ? hashParams : params;
const googleToken = authParams.get("token");
const googleUser = authParams.get("user");

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
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileSidebarOverlay = document.getElementById("mobileSidebarOverlay");
const newChatBtn = document.getElementById("newChatBtn");
const chatList = document.getElementById("chatList");
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
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.add("hidden");
}

function openMobileSidebar() {
  document.body.classList.add("sidebar-open");
}

function closeMobileSidebar() {
  document.body.classList.remove("sidebar-open");
}

function toggleMobileSidebar() {
  document.body.classList.toggle("sidebar-open");
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

    document.body.classList.add("is-authenticated");
    topActions?.classList.add("hidden");

    if (sidebarUser) sidebarUser.style.display = "flex";
    if (sidebarLogout) sidebarLogout.style.display = "flex";

    settingsAccountLogged?.classList.remove("hidden");
    settingsAccountGuest?.classList.add("hidden");

    document.getElementById("sidebarUserName").textContent = name;
    document.getElementById("userAvatar").textContent = initials;
    document.getElementById("settingsUserName").textContent = name;
    document.getElementById("settingsUserAvatar").textContent = initials;
  } else {
    document.body.classList.remove("is-authenticated");
    topActions?.classList.remove("hidden");

    if (sidebarUser) sidebarUser.style.display = "none";
    if (sidebarLogout) sidebarLogout.style.display = "none";

    settingsAccountLogged?.classList.add("hidden");
    settingsAccountGuest?.classList.remove("hidden");
  }
}

updateUserUI();

if (token && storedUser && window.innerWidth > 768) {
  topHeader?.classList.add("hidden");
}

mobileMenuBtn?.addEventListener("click", () => {
  toggleMobileSidebar();
});

mobileSidebarOverlay?.addEventListener("click", () => {
  closeMobileSidebar();
});

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
    closeMobileSidebar();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 768) {
    closeMobileSidebar();

    if (token && storedUser) {
      topHeader?.classList.add("hidden");
    }
    return;
  }

  topHeader?.classList.remove("hidden");
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
  closeMobileSidebar();
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
let currentConversationId = localStorage.getItem("currentConversationId");
let conversations = [];
const MAX_CONVERSATIONS = 8;

/* =========================
AJUDAS
========================= */
function getAuthToken() {
  return localStorage.getItem("token");
}

function getConversationLimitMessage() {
  return `Você atingiu o limite de ${MAX_CONVERSATIONS} chats. Exclua uma conversa para criar outra.`;
}

function setChatEmptyState(isEmpty) {
  document.body.classList.toggle("chat-empty-state", isEmpty);
}

function formatMessage(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
}

function getWelcomeTitle() {
  const lang = localStorage.getItem("language") || "pt";
  const name = storedUser?.name || storedUser?.email?.split("@")[0];

  if (token && name) {
    return lang === "en"
      ? `How can I help today, ${name}?`
      : `Como posso ajudar hoje, ${name}?`;
  }

  return t("welcome.title");
}

function removeWelcomeBox() {
  const welcomeBox = document.querySelector(".welcome-box");
  if (welcomeBox) welcomeBox.remove();
  setChatEmptyState(false);
}

/* =========================
RENDERIZAR MENSAGEM
========================= */
function renderWelcomeBox() {
  setChatEmptyState(true);
  chatContainer.innerHTML = `
    <div class="welcome-box">
      <div class="welcome-icon">
        <img src="img3.png" class="logo">
      </div>
      <h2 data-i18n="welcome.title">${getWelcomeTitle()}</h2>
      <p data-i18n="welcome.subtitle">${t("welcome.subtitle")}</p>
    </div>
  `;
}

setChatEmptyState(Boolean(document.querySelector(".welcome-box")));

function setCurrentConversation(conversationId) {
  currentConversationId = conversationId;

  if (conversationId) {
    localStorage.setItem("currentConversationId", conversationId);
  } else {
    localStorage.removeItem("currentConversationId");
  }
}

function formatMessageTime(date = new Date()) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function scrollChatToBottom() {
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function renderMessageContent(element, text, updateTime = false) {
  const content = element.querySelector(".message-content");
  if (content) {
    content.innerHTML = formatMessage(text);
    element.dataset.messageText = text;

    if (updateTime) {
      const time = element.querySelector("time");
      if (time) time.textContent = formatMessageTime();
    }

    return;
  }

  element.innerHTML = formatMessage(text);
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function addChatMessage(role, text, timestamp = new Date()) {
  removeWelcomeBox();

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
      <time>${formatMessageTime(timestamp)}</time>
    </div>
  `;

  chatContainer.appendChild(div);
  lucide.createIcons();
  scrollChatToBottom();
}

chatContainer?.addEventListener("click", async (e) => {
  const copyButton = e.target.closest(".copy-message-btn");
  if (!copyButton) return;

  const message = copyButton.closest(".chat-message");
  const text = message?.dataset.messageText || "";
  if (!text) return;

  await copyTextToClipboard(text);
  copyButton.classList.add("copied");

  setTimeout(() => {
    copyButton.classList.remove("copied");
  }, 1200);
});

/* =========================
CONVERSA SIDEBAR
========================= */
function renderConversations() {
  if (!chatList) return;

  chatList.querySelectorAll(".chat-item-row").forEach((item) => item.remove());

  if (newChatBtn) {
    const hasReachedLimit = conversations.length >= MAX_CONVERSATIONS;
    newChatBtn.disabled = hasReachedLimit;
    newChatBtn.title = hasReachedLimit
      ? `Limite de ${MAX_CONVERSATIONS} chats atingido`
      : "";
  }

  conversations.forEach((conversation) => {
    const row = document.createElement("div");
    row.className = `chat-item-row ${
      conversation.id === currentConversationId ? "active" : ""
    }`;
    row.dataset.conversationId = conversation.id;
    row.innerHTML = `
      <button class="chat-item" type="button">
        <i data-lucide="message-square"></i>
        <span>${formatMessage(conversation.title)}</span>
      </button>
      <button class="delete-chat-btn" type="button" aria-label="Excluir conversa" title="Excluir conversa">
        <i data-lucide="trash-2"></i>
      </button>
    `;

    chatList.appendChild(row);
  });

  lucide.createIcons();
}

function upsertConversation(conversation) {
  const existingConversation = conversations.find(
    (item) => item.id === conversation.id
  );

  if (!existingConversation) {
    conversations = [conversation, ...conversations];
    return;
  }

  existingConversation.title = conversation.title;
  existingConversation.updated_at =
    conversation.updated_at || new Date().toISOString();

  conversations = [
    existingConversation,
    ...conversations.filter((item) => item.id !== conversation.id),
  ];
}

function removeConversationFromList(conversationId) {
  conversations = conversations.filter(
    (conversation) => conversation.id !== conversationId
  );
}

async function loadConversations() {
  const currentToken = getAuthToken();
  if (!currentToken) return;

  const response = await fetch("/api/ai/conversations", {
    headers: {
      Authorization: `Bearer ${currentToken}`,
    },
  });

  const responseData = await response.json();

  if (!responseData.success) return;

  conversations = responseData.conversations || [];

  if (
    currentConversationId &&
    !conversations.some((conversation) => conversation.id === currentConversationId)
  ) {
    setCurrentConversation(null);
  }

  if (!currentConversationId && conversations.length > 0) {
    setCurrentConversation(conversations[0].id);
  }

  renderConversations();

  if (currentConversationId) {
    await loadConversationHistory(currentConversationId);
  } else {
    renderWelcomeBox();
  }
}

async function loadConversationHistory(conversationId) {
  const currentToken = getAuthToken();
  if (!currentToken || !conversationId) return;

  const historyUrl = `/api/ai/history?conversationId=${encodeURIComponent(
    conversationId
  )}`;

  const historyResponse = await fetch(historyUrl, {
    headers: {
      Authorization: `Bearer ${currentToken}`,
    },
  });

  const responseData = await historyResponse.json();

  chatContainer.innerHTML = "";

  if (!responseData.success) return;

  if (responseData.chats.length === 0) {
    renderWelcomeBox();
    return;
  }

  responseData.chats.reverse().forEach((chat) => {
    addChatMessage("user", chat.message, chat.created_at);
    addChatMessage("assistant", chat.response, chat.created_at);
  });
}

/* =========================
EVENTOS
========================= */
loadConversations();

newChatBtn?.addEventListener("click", async () => {
  closeMobileSidebar();
  const currentToken = getAuthToken();

  if (!currentToken) {
    showToast("Faça login para criar um novo chat", false);
    return;
  }

  if (conversations.length >= MAX_CONVERSATIONS) {
    showToast(getConversationLimitMessage(), false);
    return;
  }

  const response = await fetch("/api/ai/conversations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${currentToken}`,
    },
  });

  const responseData = await response.json();

  if (!responseData.success) {
    showToast(responseData.message || "Erro ao criar conversa", false);
    return;
  }

  upsertConversation(responseData.conversation);
  setCurrentConversation(responseData.conversation.id);
  renderConversations();
  renderWelcomeBox();
});

chatList?.addEventListener("click", async (e) => {
  closeMobileSidebar();
  const row = e.target.closest(".chat-item-row");
  if (!row) return;

  const conversationId = row.dataset.conversationId;

  if (e.target.closest(".delete-chat-btn")) {
    const currentToken = getAuthToken();
    const response = await fetch(`/api/ai/conversations/${conversationId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${currentToken}`,
      },
    });

    const responseData = await response.json();

    if (!responseData.success) {
      showToast(responseData.message || "Erro ao excluir conversa", false);
      return;
    }

    removeConversationFromList(conversationId);

    if (currentConversationId === conversationId) {
      setCurrentConversation(conversations[0]?.id || null);

      if (currentConversationId) {
        await loadConversationHistory(currentConversationId);
      } else {
        renderWelcomeBox();
      }
    }

    renderConversations();
    return;
  }

  setCurrentConversation(conversationId);
  renderConversations();
  await loadConversationHistory(conversationId);
});

chatForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = chatInput.value.trim();
  if (!message) return;

  const currentToken = getAuthToken();
  const requestHeaders = {
    "Content-Type": "application/json",
  };

  if (currentToken) {
    requestHeaders.Authorization = `Bearer ${currentToken}`;
  }

  addChatMessage("user", message);
  chatInput.value = "";

  addChatMessage("assistant", "Digitando...");

  try {
    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify({
        message,
        conversationId: currentConversationId,
      }),
    });

    const responseData = await response.json();

    if (!responseData.success) {
      throw new Error(responseData.message || "Erro ao enviar mensagem");
    }

    if (responseData.conversation) {
      upsertConversation(responseData.conversation);
      setCurrentConversation(responseData.conversation.id);
      renderConversations();
    }

    const lastAssistant = chatContainer.querySelector(
      ".chat-message.assistant:last-child"
    );

    if (lastAssistant) {
      renderMessageContent(lastAssistant, responseData.response, true);
    }

    if (!currentToken && responseData.guestLimitReached) {
      showToast("Limite de 3 mensagens sem login atingido", false);
    }
  } catch (err) {
    const lastAssistant = chatContainer.querySelector(
      ".chat-message.assistant:last-child"
    );

    if (lastAssistant) {
      renderMessageContent(
        lastAssistant,
        err.message || "Erro ao enviar mensagem",
        true
      );
    }

    showToast(err.message || "Erro ao enviar mensagem", false);
  }
});
