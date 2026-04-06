const KEYCLOAK_BASE_URL =
  process.env.REACT_APP_KEYCLOAK_URL || "http://localhost:8180";
const KEYCLOAK_REALM = process.env.REACT_APP_KEYCLOAK_REALM || "pharmacy";
const KEYCLOAK_CLIENT_ID =
  process.env.REACT_APP_KEYCLOAK_CLIENT_ID || "pharmacy-app";
const GOOGLE_IDP_HINT =
  process.env.REACT_APP_KEYCLOAK_GOOGLE_IDP_HINT || "google";

const CALLBACK_PATH = "/auth/callback";
const STORAGE_KEY = "auth:keycloak:pkce";

const toBase64Url = (buffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const randomString = (size = 64) => {
  const bytes = new Uint8Array(size);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ("0" + b.toString(16)).slice(-2)).join("");
};

const sha256 = async (text) => {
  const data = new TextEncoder().encode(text);
  return window.crypto.subtle.digest("SHA-256", data);
};

const getRedirectUri = () => `${window.location.origin}${CALLBACK_PATH}`;

const getAuthorizeUrl = () =>
  `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/auth`;

const getTokenUrl = () =>
  `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;

export const startGoogleOidcLogin = async ({
  nextPath = "/",
  prompt,
} = {}) => {
  const state = randomString(24);
  const verifier = randomString(64);
  const challenge = toBase64Url(await sha256(verifier));

  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      state,
      verifier,
      nextPath,
      createdAt: Date.now(),
    }),
  );

  const params = new URLSearchParams({
    client_id: KEYCLOAK_CLIENT_ID,
    redirect_uri: getRedirectUri(),
    response_type: "code",
    scope: "openid profile email",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    kc_idp_hint: GOOGLE_IDP_HINT,
  });

  if (prompt) {
    params.set("prompt", prompt);
  }

  window.location.assign(`${getAuthorizeUrl()}?${params.toString()}`);
};

export const readPendingOidcState = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const clearPendingOidcState = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
};

export const exchangeOidcCodeForTokens = async ({ code, state }) => {
  const pending = readPendingOidcState();
  if (!pending?.verifier || !pending?.state) {
    throw new Error("Thiếu trạng thái đăng nhập Google. Vui lòng thử lại.");
  }
  if (pending.state !== state) {
    clearPendingOidcState();
    throw new Error("Phiên đăng nhập Google không hợp lệ. Vui lòng thử lại.");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: KEYCLOAK_CLIENT_ID,
    code,
    redirect_uri: getRedirectUri(),
    code_verifier: pending.verifier,
  });

  const response = await fetch(getTokenUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Không thể hoàn tất đăng nhập Google.");
  }

  const data = await response.json();
  return {
    accessToken: String(data?.access_token || "").trim(),
    refreshToken: String(data?.refresh_token || "").trim(),
    nextPath: pending.nextPath || "/",
  };
};
