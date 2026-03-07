const jwt = require("jsonwebtoken");

function getTokenFromHeader(req) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");
  if (scheme === "Bearer" && token) {
    return token;
  }
  return null;
}

function requireAuth(req, res, next) {
  try {
    const token = getTokenFromHeader(req);

    if (!token) {
      return res.status(401).json({ message: "Authentication token missing" });
    }

    if (!process.env.JWT_SECRET) {
      // In dev this helps diagnose misconfiguration quickly
      // Do not leak this in production logs normally.
      // eslint-disable-next-line no-console
      console.error("JWT_SECRET is not configured");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: payload.sub,
      role: payload.role,
      email: payload.email,
      name: payload.name,
      companyCode: payload.companyCode,
      companyName: payload.companyName,
      managerName: payload.managerName,
      managerEmail: payload.managerEmail,
    };

    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

function requireRole(requiredRole) {
  return function roleMiddleware(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    if (req.user.role !== requiredRole) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }
    return next();
  };
}

module.exports = {
  requireAuth,
  requireRole,
};

