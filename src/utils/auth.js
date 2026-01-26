// Lightweight JWT helpers for client-side auth checks
export function getAuthToken() {
  const t = sessionStorage.getItem("authToken");
  if (!t) return null;
  return String(t).trim();
}

function base64UrlDecode(str) {
  try {
    // Replace URL-safe chars and pad
    let s = str.replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    const decoded = atob(s);
    // decode UTF-8
    try {
      return decodeURIComponent(
        decoded
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join(""),
      );
    } catch (e) {
      return decoded;
    }
  } catch (e) {
    return null;
  }
}

export function decodeJwtPayload(token) {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = base64UrlDecode(parts[1]);
    return payload ? JSON.parse(payload) : null;
  } catch (e) {
    return null;
  }
}

export function isTokenExpired(token) {
  if (!token) return true;
  const payload = decodeJwtPayload(token);
  if (!payload) return true;
  const exp = payload.exp;
  if (!exp) return true;
  // exp is seconds since epoch
  const nowSec = Math.floor(Date.now() / 1000);
  return Number(exp) <= nowSec;
}

export function isAuthenticated() {
  const token = getAuthToken();
  if (!token) return false;
  if (isTokenExpired(token)) {
    sessionStorage.removeItem("authToken");
    return false;
  }
  return true;
}

export function requireAuthOrRedirect(navigate, redirectTo) {
  const token = getAuthToken();
  if (!token || isTokenExpired(token)) {
    try {
      sessionStorage.removeItem("authToken");
    } catch (e) {}
    // navigate to login with state
    if (typeof navigate === "function") {
      navigate("/login", { state: { from: redirectTo } });
    }
    return false;
  }
  return true;
}

export function getUserId() {
  const rawAuthUser = sessionStorage.getItem("authUser");
  if (rawAuthUser) {
    try {
      const au = JSON.parse(rawAuthUser);
      if (au?.id) return String(au.id).trim();
    } catch (err) {
      console.log(err);
    }
  }

  const storedUserId = sessionStorage.getItem("userId");
  if (storedUserId && String(storedUserId).trim().length > 0) {
    return String(storedUserId).trim();
  }

  return null;
}

export default {
  getAuthToken,
  decodeJwtPayload,
  isTokenExpired,
  isAuthenticated,
  requireAuthOrRedirect,
  getUserId,
};
