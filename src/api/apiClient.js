import axios from "axios";
import { getAccessToken, clearAccessToken } from "../utils/auth";
import { clearAuthUser } from "../auth/authStorage";

/**
 * Centralized API client using axios.
 * Configured with baseURL from environment or default gateway port.
 * Includes interceptors for Authorization header and handling common errors.
 */
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8087",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

const STARTUP_RETRY_DELAY_MS = 250;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isTransientStartupError = (error) => {
  const status = Number(error?.response?.status || 0);
  const code = String(error?.code || "");
  return (
    [502, 503, 504].includes(status) ||
    ["ECONNABORTED", "ERR_NETWORK", "ERR_BAD_RESPONSE"].includes(code)
  );
};

const retryOnceIfTransient = async (error, clientName) => {
  const config = error?.config;
  if (!config) return Promise.reject(error);

  const method = String(config.method || "get").toLowerCase();
  const canRetryMethod = ["get", "head", "options"].includes(method);
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
 * publicApi: No Authorization header, for public endpoints.
 */
export const publicApi = axios.create({
  baseURL: instance.defaults.baseURL,
  headers: { ...instance.defaults.headers },
  timeout: instance.defaults.timeout,
});

/**
 * authApi: Attaches Bearer token and handles 401/403.
 */
export const authApi = axios.create({
  baseURL: instance.defaults.baseURL,
  headers: { ...instance.defaults.headers },
  timeout: instance.defaults.timeout,
});

publicApi.interceptors.response.use(
  (response) => response,
  (error) => retryOnceIfTransient(error, "publicApi"),
);

// Request interceptor for authApi: Attach Bearer token
authApi.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      const trimmedToken = token.trim();
      config.headers.Authorization = trimmedToken
        .toLowerCase()
        .startsWith("bearer ")
        ? trimmedToken
        : `Bearer ${trimmedToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for authApi: Handle global error cases (401, 403)
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

    // Check for 401 or Jwt expired message
    if (status === 401 || errorMsg.toLowerCase().includes("jwt expired")) {
      console.warn(
        "Unauthorized access or expired token - clearing and redirecting to login",
      );
      clearAccessToken();
      clearAuthUser();

      if (!window.location.pathname.includes("/login")) {
        window.location.assign("/login?expired=true");
      }
    } else if (status === 403) {
      console.error("Forbidden access - insufficient permissions");
      const forbiddenError = new Error("Forbidden");
      forbiddenError.status = 403;
      forbiddenError.message = "Bạn không có quyền thực hiện hành động này";
      return Promise.reject(forbiddenError);
    }
    return Promise.reject(error);
  },
);

// Default export kept for backward compatibility (points to authApi for safety or instance)
export const api = authApi;
export default authApi;
