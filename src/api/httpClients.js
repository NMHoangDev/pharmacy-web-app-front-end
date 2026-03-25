import axios from "axios";
import {
  getAccessToken,
  isTokenExpired,
  clearAccessToken,
} from "../utils/auth";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8087";
const STARTUP_RETRY_DELAY_MS = 250;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
  timeout: 10000,
});

/**
 * Authenticated API client - Automatically attaches Bearer token to every request.
 */
export const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

publicApi.interceptors.response.use(
  (response) => response,
  (error) => retryOnceIfTransient(error, "publicApi"),
);

// Request interceptor: Attach token and handle expiration
authApi.interceptors.request.use(
  (config) => {
    // Skip attachment for CORS preflight (handled by browser)
    if (config.method === "options") return config;

    const token = getAccessToken();

    if (!token || isTokenExpired(token)) {
      console.warn("[authApi] Token missing or expired. Rejecting request.");
      clearAccessToken();
      // Throw an error that can be caught by the UI to redirect to login
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

    if (status === 401 || errorMsg.toLowerCase().includes("jwt expired")) {
      console.warn("[authApi] Unauthorized/Expired - Redirecting to login");
      clearAccessToken();

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

export default { publicApi, authApi };
