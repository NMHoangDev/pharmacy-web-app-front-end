import axios from "axios";

let inMemoryToken = null;

// Persist token to sessionStorage and keep in-memory copy for immediate use
export function setAccessToken(token) {
  if (token == null) {
    sessionStorage.removeItem("authToken");
    inMemoryToken = null;
  } else {
    sessionStorage.setItem("authToken", String(token));
    inMemoryToken = String(token);
  }
}

export function clearAccessToken() {
  sessionStorage.removeItem("authToken");
  inMemoryToken = null;
}

const apiClient = axios.create({
  baseURL: "http://localhost:8087",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // Determine token: in-memory (set from auth context) or sessionStorage
    const stored = inMemoryToken || sessionStorage.getItem("authToken");
    const token = stored && String(stored).trim().length ? stored : null;

    // Attach Authorization only when token is a non-empty string
    if (token) {
      config.headers = config.headers || {};
      // do not overwrite an explicit header set by caller (check case-insensitively)
      const hasAuthHeader = Object.keys(config.headers || {}).some(
        (k) => k.toLowerCase() === "authorization",
      );
      if (!hasAuthHeader) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Dev-mode debug: log URL and whether auth header exists (never log token)
    if (process.env.NODE_ENV !== "production") {
      try {
        const method = (config.method || "get").toUpperCase();
        const url = config.url || config.baseURL || "";
        const hdrs = config.headers || {};
        const hasAuth = Object.keys(hdrs).some(
          (k) => k.toLowerCase() === "authorization",
        );
        // eslint-disable-next-line no-console
        console.debug(`[api] ${method} ${url} auth:${hasAuth}`);
      } catch (e) {
        // ignore logging errors
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: log status and request auth presence in dev
apiClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV !== "production") {
      try {
        const method = (response.config.method || "get").toUpperCase();
        const url = response.config.url || response.config.baseURL || "";
        const hasAuth = !!(
          response.config.headers && response.config.headers.Authorization
        );
        // eslint-disable-next-line no-console
        console.debug(
          `[api] RESP ${method} ${url} status:${response.status} auth:${hasAuth}`,
        );
      } catch (e) {
        // ignore
      }
    }
    return response;
  },
  (error) => {
    const cfg = error?.config || {};
    const method = (cfg.method || "get").toUpperCase();
    const url = cfg.url || cfg.baseURL || "";
    const status = error?.response?.status;

    // determine auth presence case-insensitively
    const headers = cfg.headers || {};
    const hasAuth = Object.keys(headers).some(
      (k) => k.toLowerCase() === "authorization",
    );

    // Log on specific statuses and debug in dev (never log token)
    if ([401, 403, 404, 405].includes(Number(status))) {
      // eslint-disable-next-line no-console
      console.warn(`[api] ${status} ${method} ${url} auth:${hasAuth}`);
      return Promise.reject(error);
    }

    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.debug(
        `[api] RESP ${method} ${url} status:${status || "ERR"} auth:${hasAuth}`,
      );
    }

    // Retry logic for transient failures (network errors or 502/503/504)
    const shouldRetry = !status || [502, 503, 504].includes(Number(status));
    const maxRetries = 2;
    if (shouldRetry && cfg && !cfg.__isRetryRequest) {
      cfg.__retryCount = cfg.__retryCount || 0;
      if (cfg.__retryCount >= maxRetries) {
        return Promise.reject(error);
      }
      cfg.__retryCount += 1;
      const backoffs = [300, 600];
      const delay =
        backoffs[Math.min(cfg.__retryCount - 1, backoffs.length - 1)];
      cfg.__isRetryRequest = true;
      return new Promise((resolve) => setTimeout(resolve, delay)).then(() =>
        apiClient(cfg),
      );
    }

    return Promise.reject(error);
  },
);

export default apiClient;
