// Auth domain: sessionStorage access for auth data.
// Centralizing storage keeps UI components free of direct storage calls.

const ACCESS_TOKEN_KEY = "accessToken";
const LEGACY_AUTH_TOKEN_KEY = "authToken";
const AUTH_USER_KEY = "authUser";

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
  return (
    storage.getItem(ACCESS_TOKEN_KEY) ||
    storage.getItem(LEGACY_AUTH_TOKEN_KEY) ||
    ""
  );
};

export const setAccessToken = (token) => {
  const storage = safeSessionStorage();
  if (!storage) return;

  const value = String(token || "");
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
