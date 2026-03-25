// Auth domain: JWT helpers (no React, no storage)

export const decodeJwt = (token) => {
  if (!token) return null;
  try {
    const parts = String(token).split(".");
    if (parts.length < 2) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    // Pad base64 string if needed
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );

    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(""),
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const getJwtExpirationMs = (token) => {
  const decoded = decodeJwt(token);
  const expSeconds = Number(decoded?.exp || 0);
  if (!expSeconds) return 0;
  return expSeconds * 1000;
};

/**
 * Treat missing/invalid exp as expired by default.
 * clockSkewMs allows expiring slightly early to avoid edge cases.
 */
export const isTokenExpired = (token, clockSkewMs = 0) => {
  const expMs = getJwtExpirationMs(token);
  if (!expMs) return true;
  return Date.now() >= expMs - Math.max(0, Number(clockSkewMs) || 0);
};

export const getRolesFromToken = (token) => {
  if (!token) return [];
  const decoded = decodeJwt(token);
  if (!decoded) return [];

  const roles = new Set();

  // Realm roles
  if (Array.isArray(decoded.realm_access?.roles)) {
    decoded.realm_access.roles.forEach((r) => roles.add(r));
  }

  // Client roles (fallback)
  const clientRoles = decoded.resource_access?.["pharmacy-app"]?.roles;
  if (Array.isArray(clientRoles)) {
    clientRoles.forEach((r) => roles.add(r));
  }

  return Array.from(roles);
};

export const hasAnyRole = (token, requiredRoles) => {
  if (!Array.isArray(requiredRoles) || requiredRoles.length === 0) return false;
  const userRoles = getRolesFromToken(token);
  return requiredRoles.some((role) => userRoles.includes(role));
};
