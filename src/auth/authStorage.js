import { decodeJwt } from "./jwt";

const ACCESS_TOKEN_KEY = "accessToken";
const LEGACY_AUTH_TOKEN_KEY = "authToken";
const AUTH_USER_KEY = "authUser";
const REFRESH_TOKEN_KEY = "refreshToken";

const INVALID_TOKEN_VALUES = new Set([
  "",
  "null",
  "undefined",
  "none",
  "token",
  "access_token",
  "your_token",
  "placeholder",
  "bearer",
  "bearer token",
  "jwt",
]);

const normalizeTokenValue = (token) => {
  const raw = String(token || "").trim();
  if (!raw) return "";

  const noBearer = raw.toLowerCase().startsWith("bearer ")
    ? raw.slice(7).trim()
    : raw;

  const lowered = noBearer.toLowerCase();
  if (!noBearer || INVALID_TOKEN_VALUES.has(lowered)) return "";
  if (lowered.includes("placeholder")) return "";

  return noBearer;
};

export const normalizeAccessToken = (token) => {
  const candidate = normalizeTokenValue(token);
  if (!candidate) return "";

  const decoded = decodeJwt(candidate);
  return decoded ? candidate : "";
};

const normalizeRefreshToken = (token) => normalizeTokenValue(token);

const safeSessionStorage = () => {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};

const dispatchAuthChanged = () => {
  try {
    window.dispatchEvent(new Event("auth:changed"));
  } catch {
    // no-op
  }
};

export const getAccessToken = () => {
  const storage = safeSessionStorage();
  if (!storage) return "";
  const raw =
    storage.getItem(ACCESS_TOKEN_KEY) ||
    storage.getItem(LEGACY_AUTH_TOKEN_KEY) ||
    "";

  const normalized = normalizeAccessToken(raw);
  if (!normalized && raw) {
    storage.removeItem(ACCESS_TOKEN_KEY);
    storage.removeItem(LEGACY_AUTH_TOKEN_KEY);
  }

  return normalized;
};

export const setAccessToken = (token) => {
  const storage = safeSessionStorage();
  if (!storage) return;

  const value = normalizeAccessToken(token);
  if (value) {
    storage.setItem(ACCESS_TOKEN_KEY, value);
    storage.removeItem(LEGACY_AUTH_TOKEN_KEY);
  } else {
    storage.removeItem(ACCESS_TOKEN_KEY);
    storage.removeItem(LEGACY_AUTH_TOKEN_KEY);
  }
  dispatchAuthChanged();
};

export const clearAccessToken = () => {
  const storage = safeSessionStorage();
  if (!storage) return;
  storage.removeItem(ACCESS_TOKEN_KEY);
  storage.removeItem(LEGACY_AUTH_TOKEN_KEY);
  dispatchAuthChanged();
};

export const getRefreshToken = () => {
  const storage = safeSessionStorage();
  if (!storage) return "";
  const raw = storage.getItem(REFRESH_TOKEN_KEY) || "";
  const normalized = normalizeRefreshToken(raw);
  if (!normalized && raw) {
    storage.removeItem(REFRESH_TOKEN_KEY);
  }
  return normalized;
};

export const setRefreshToken = (token) => {
  const storage = safeSessionStorage();
  if (!storage) return;

  const value = normalizeRefreshToken(token);
  if (value) {
    storage.setItem(REFRESH_TOKEN_KEY, value);
  } else {
    storage.removeItem(REFRESH_TOKEN_KEY);
  }
  dispatchAuthChanged();
};

export const clearRefreshToken = () => {
  const storage = safeSessionStorage();
  if (!storage) return;
  storage.removeItem(REFRESH_TOKEN_KEY);
  dispatchAuthChanged();
};

export const getAuthUser = () => {
  const storage = safeSessionStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setAuthUser = (userObj) => {
  const storage = safeSessionStorage();
  if (!storage) return;

  try {
    if (userObj) {
      storage.setItem(AUTH_USER_KEY, JSON.stringify(userObj));
    } else {
      storage.removeItem(AUTH_USER_KEY);
    }
  } finally {
    dispatchAuthChanged();
  }
};

export const clearAuthUser = () => {
  const storage = safeSessionStorage();
  if (!storage) return;
  storage.removeItem(AUTH_USER_KEY);
  dispatchAuthChanged();
};
