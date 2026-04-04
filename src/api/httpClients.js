import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  isTokenExpired,
  clearAccessToken,
  clearRefreshToken,
  clearAuthUser,
  setAccessToken,
  setRefreshToken,
} from "../utils/auth";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8087";
const STARTUP_RETRY_DELAY_MS = 250;

const logHttpError = (clientName, error) => {
  if (process.env.NODE_ENV === "production") return;
  const status =
    Number(error?.response?.status || error?.status || 0) || "NO_STATUS";
  const method = String(error?.config?.method || "get").toUpperCase();
  const url = error?.config?.url || "UNKNOWN_URL";
  console.error(
    `[${clientName}] ${method} ${url} -> ${status}`,
    error?.response?.data || error?.message || error,
  );
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let refreshPromise = null;

const refreshAccessTokenIfPossible = async () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = String(getRefreshToken() || "").trim();
  if (!refreshToken) {
    return null;
  }

  refreshPromise = publicApi
    .post("/api/auth/refresh", { refreshToken })
    .then(({ data }) => {
      const nextToken = String(data?.token || "").trim();
      if (!nextToken) return null;

      setAccessToken(nextToken);
      const persistedToken = String(getAccessToken() || "").trim();
      if (!persistedToken) {
        return null;
      }

      const nextRefreshToken = String(
        data?.refreshToken || refreshToken,
      ).trim();
      if (nextRefreshToken) {
        setRefreshToken(nextRefreshToken);
      }
      return persistedToken;
    })
    .catch((err) => {
      const status = Number(err?.response?.status || err?.status || 0);
      if (status === 400 || status === 401) {
        clearAccessToken();
        clearRefreshToken();
      }
      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

const isTransientStartupError = (error) => {
  const status = Number(error?.response?.status || 0);
  const code = String(error?.code || "");

  // Retry once for temporary startup/network failures.
  return (
    [502, 503, 504].includes(status) ||
    ["ECONNABORTED", "ERR_NETWORK", "ERR_BAD_RESPONSE"].includes(code)
  );
};

const retryOnceIfTransient = async (
  error,
  clientName,
  allowUnsafeMethods = false,
) => {
  const config = error?.config;
  if (!config) return Promise.reject(error);

  const method = String(config.method || "get").toLowerCase();
  const canRetryMethod = allowUnsafeMethods
    ? ["get", "head", "options", "post", "put", "delete", "patch"].includes(
        method,
      )
    : ["get", "head", "options"].includes(method);

  if (!canRetryMethod || !isTransientStartupError(error)) {
    return Promise.reject(error);
  }

  const retryCount = Number(config.__startupRetryCount || 0);
  if (retryCount >= 1) {
    return Promise.reject(error);
  }

  config.__startupRetryCount = retryCount + 1;
  await sleep(STARTUP_RETRY_DELAY_MS);

  if (process.env.NODE_ENV !== "production") {
    console.debug(
      `[${clientName}] transient startup error -> retry #${config.__startupRetryCount}: ${method.toUpperCase()} ${config.url}`,
    );
  }

  return (clientName === "publicApi" ? publicApi : authApi).request(config);
};

/**
 * Public API client - No authentication header attached.
 */
export const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
  timeout: 20000,
});

/**
 * Authenticated API client - Automatically attaches Bearer token to every request.
 */
export const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

publicApi.interceptors.request.use(
  (config) => {
    // Public endpoints must not carry bearer tokens; invalid tokens can trigger 401.
    if (config?.headers) {
      if (typeof config.headers.delete === "function") {
        config.headers.delete("Authorization");
        config.headers.delete("authorization");
      } else {
        delete config.headers.Authorization;
        delete config.headers.authorization;
      }
    }
    config.withCredentials = false;
    return config;
  },
  (error) => Promise.reject(error),
);

publicApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const retried = await retryOnceIfTransient(error, "publicApi").catch(
      () => null,
    );
    if (retried) {
      return retried;
    }
    logHttpError("publicApi", error);
    return Promise.reject(error);
  },
);

// Request interceptor: Attach token and handle expiration
authApi.interceptors.request.use(
  async (config) => {
    // Skip attachment for CORS preflight (handled by browser)
    if (config.method === "options") return config;

    let token = getAccessToken();

    const refreshToken = String(getRefreshToken() || "").trim();
    const hadRefreshToken = Boolean(refreshToken);

    if (!token || isTokenExpired(token)) {
      token = await refreshAccessTokenIfPossible();
    }

    if (!token || isTokenExpired(token)) {
      console.warn("[authApi] Token missing or expired. Rejecting request.");

      // If refresh token existed but refresh failed due transient infra issues,
      // do not force logout. Let caller retry and keep session state.
      if (hadRefreshToken && String(getRefreshToken() || "").trim()) {
        const error = new Error("Session refresh temporarily unavailable");
        error.status = 503;
        return Promise.reject(error);
      }

      clearAccessToken();
      clearRefreshToken();
      const error = new Error("Authentication required");
      error.status = 401;
      return Promise.reject(error);
    }

    // Attach Bearer token
    const trimmedToken = token.trim();
    config.headers.Authorization = trimmedToken
      .toLowerCase()
      .startsWith("bearer ")
      ? trimmedToken
      : `Bearer ${trimmedToken}`;

    // Debug log for development
    if (process.env.NODE_ENV !== "production") {
      console.debug(
        `[authApi] Request: ${config.method.toUpperCase()} ${config.url}`,
      );
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: Handle 401/403 globally
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const retried = await retryOnceIfTransient(error, "authApi").catch(
      () => null,
    );
    if (retried) {
      return retried;
    }

    const status = error?.response?.status;
    const errorMsg = error?.response?.data?.message || "";
    const currentToken = String(getAccessToken() || "").trim();
    const currentRefreshToken = String(getRefreshToken() || "").trim();
    const hasRefreshToken = Boolean(currentRefreshToken);
    const tokenStillValid = Boolean(
      currentToken && !isTokenExpired(currentToken),
    );

    if (status && !error.status) {
      error.status = status;
    }
    if (!error.message && errorMsg) {
      error.message = errorMsg;
    }

    // ERR_CANCELED handling (don't treat as a major failure)
    if (error.code === "ERR_CANCELED") {
      return Promise.reject(error);
    }

    const originalRequest = error?.config;
    if (
      status === 401 &&
      originalRequest &&
      !originalRequest.__authRetried &&
      !String(originalRequest.url || "").includes("/api/auth/refresh")
    ) {
      originalRequest.__authRetried = true;
      const refreshedToken = await refreshAccessTokenIfPossible();
      if (refreshedToken) {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${refreshedToken}`;
        return authApi.request(originalRequest);
      }
    }

    if (status === 401 || errorMsg.toLowerCase().includes("jwt expired")) {
      // If access token is still valid locally, treat this as a resource-level
      // unauthorized response instead of forcing a logout.
      if (status === 401 && tokenStillValid) {
        return Promise.reject(error);
      }

      if (hasRefreshToken) {
        const refreshedToken = await refreshAccessTokenIfPossible();
        if (refreshedToken) {
          return Promise.reject(error);
        }

        // Keep the current session if refresh token still exists but refresh is
        // temporarily unavailable.
        if (String(getRefreshToken() || "").trim()) {
          return Promise.reject(error);
        }
      }

      console.warn("[authApi] Unauthorized/Expired - Redirecting to login");
      clearAccessToken();
      clearRefreshToken();
      clearAuthUser();

      // Redirect to login if not already there
      if (!window.location.pathname.includes("/login")) {
        window.location.assign("/login?expired=true");
      }
    } else if (status === 403) {
      console.error("[authApi] Forbidden - Insufficient permissions");
      // Optional: Handle forbidden errors (e.g., show a toast or redirect)
    }

    return Promise.reject(error);
  },
);

const httpClients = { publicApi, authApi };

export default httpClients;
