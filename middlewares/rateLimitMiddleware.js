function createRateLimiter({ windowMs, maxRequests, message }) {
  const requests = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const identifier = req.user?.id || req.ip || req.headers["x-forwarded-for"] || "unknown";
    const key = `${req.method}:${req.originalUrl}:${identifier}`;
    const record = requests.get(key);
    if (!record || record.resetAt <= now) {
      requests.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      return next();
    }
    if (record.count >= maxRequests) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      res.set("Retry-After", String(retryAfter));
      return res.status(429).json({
        success: false,
        message,
      });
    }
    record.count += 1;
    return next();
  };
}
const failedLoginAttempts = new Map();
const loginWindowMs = 15 * 60 * 1000;
const maxFailedLogins = 5;
const loginLimitMessage = "Muitas tentativas de login. Tente novamente em alguns minutos.";

function getLoginIdentifier(req, email) {
  const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
  return `${ip}:${String(email || "").toLowerCase()}`;
}

function checkFailedLoginLimit(req, email) {
  const now = Date.now();
  const key = getLoginIdentifier(req, email);
  const record = failedLoginAttempts.get(key);

  if (!record || record.resetAt <= now) {
    failedLoginAttempts.delete(key);
    return null;
  }

  if (record.count >= maxFailedLogins) {
    return {
      retryAfter: Math.ceil((record.resetAt - now) / 1000),
      message: loginLimitMessage,
    };
  }

  return null;
}

function recordFailedLogin(req, email) {
  const now = Date.now();
  const key = getLoginIdentifier(req, email);
  const record = failedLoginAttempts.get(key);

  if (!record || record.resetAt <= now) {
    failedLoginAttempts.set(key, {
      count: 1,
      resetAt: now + loginWindowMs,
    });
    return;
  }

  record.count += 1;
}

function clearFailedLogins(req, email) {
  failedLoginAttempts.delete(getLoginIdentifier(req, email));
}

const chatRateLimit = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 20,
  message: "Muitas mensagens enviadas. Aguarde um pouco antes de tentar novamente.",
});
module.exports = {
  chatRateLimit,
  checkFailedLoginLimit,
  recordFailedLogin,
  clearFailedLogins,
};
