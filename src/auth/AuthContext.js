import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  clearAccessToken,
  clearAuthUser,
  getAccessToken,
  getAuthUser,
  setAccessToken,
  setAuthUser,
} from "./authStorage";
import {
  decodeJwt,
  getRolesFromToken,
  getJwtExpirationMs,
  isTokenExpired,
} from "./jwt";

const AuthContext = createContext(null);

const CLOCK_SKEW_MS = 30_000; // expire 30s early to avoid race
const REFRESH_WINDOW_MS = 60_000; // future: refresh if expiring within 60s

const buildSnapshotFromStorage = () => {
  const accessToken = (getAccessToken() || "").trim();
  const expired = accessToken
    ? isTokenExpired(accessToken, CLOCK_SKEW_MS)
    : true;

  if (accessToken && expired) {
    // If already expired at bootstrap, clear immediately.
    clearAccessToken();
    clearAuthUser();
  }

  const token = accessToken && !expired ? accessToken : "";
  const decoded = token ? decodeJwt(token) : null;

  // Prefer stored authUser (it may include extra fields), fallback to token decode.
  const storedUser = token ? getAuthUser() : null;
  const user =
    storedUser ||
    (decoded
      ? {
          id: decoded?.sub,
          email: decoded?.email,
          fullName: decoded?.name,
        }
      : null);

  const roles = token ? getRolesFromToken(token) : [];
  const userId = decoded?.sub || user?.id || null;

  return {
    accessToken: token,
    authUser: token ? user : null,
    roles,
    userId,
  };
};

export const AuthProvider = ({ children }) => {
  // Prevent UI flicker: compute initial auth state synchronously,
  // but keep an explicit loading flag for future async refresh-token integration.
  const [isLoading, setIsLoading] = useState(true);
  const [snapshot, setSnapshot] = useState(() => buildSnapshotFromStorage());

  const refreshTimerRef = useRef(null);
  const logoutTimerRef = useRef(null);

  const clearTimers = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  }, []);

  const syncFromStorage = useCallback(() => {
    setSnapshot(buildSnapshotFromStorage());
  }, []);

  const logout = useCallback(() => {
    clearTimers();
    clearAccessToken();
    clearAuthUser();
    setSnapshot({ accessToken: "", authUser: null, roles: [], userId: null });
  }, [clearTimers]);

  const login = useCallback(
    (data) => {
      const token = typeof data === "string" ? data : data?.token;
      const trimmed = String(token || "").trim();

      if (!trimmed) {
        logout();
        return;
      }

      setAccessToken(trimmed);

      const decoded = decodeJwt(trimmed);
      const userObj =
        typeof data === "string"
          ? {
              id: decoded?.sub,
              email: decoded?.email,
              fullName: decoded?.name,
            }
          : {
              id: data?.userId || decoded?.sub,
              email: data?.email || decoded?.email,
              phone: data?.phone,
              fullName: data?.fullName || decoded?.name,
              expiresAt: data?.expiresAt,
            };

      setAuthUser(userObj);
      setSnapshot({
        accessToken: trimmed,
        authUser: userObj,
        roles: getRolesFromToken(trimmed),
        userId: decoded?.sub || userObj?.id || null,
      });
    },
    [logout],
  );

  // Future refresh-token integration:
  // - If a refresh token exists, this is where we would exchange it.
  const maybeRefreshAccessToken = useCallback(async () => {
    // Placeholder: keep for future.
    return null;
  }, []);

  // Bootstrap: validate token and prepare timers.
  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        const token = (getAccessToken() || "").trim();

        if (token && isTokenExpired(token, CLOCK_SKEW_MS)) {
          // Future: attempt refresh here.
          const refreshed = await maybeRefreshAccessToken();
          if (!refreshed) {
            logout();
          }
        } else {
          syncFromStorage();
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, [logout, maybeRefreshAccessToken, syncFromStorage]);

  // Keep UI in sync across tabs and across app writes via authStorage dispatch.
  useEffect(() => {
    const handler = () => syncFromStorage();
    window.addEventListener("storage", handler);
    window.addEventListener("auth:changed", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("auth:changed", handler);
    };
  }, [syncFromStorage]);

  // Schedule refresh/logout based on token expiration.
  useEffect(() => {
    clearTimers();

    const token = snapshot.accessToken;
    if (!token) return undefined;

    const expMs = getJwtExpirationMs(token);
    if (!expMs) return undefined;

    const now = Date.now();
    const logoutInMs = Math.max(0, expMs - now - CLOCK_SKEW_MS);
    const refreshInMs = Math.max(0, expMs - now - REFRESH_WINDOW_MS);

    // Refresh timer (no-op today, but wired).
    refreshTimerRef.current = setTimeout(() => {
      maybeRefreshAccessToken().catch(() => null);
    }, refreshInMs);

    // Hard logout at (near) expiry to ensure UI updates.
    logoutTimerRef.current = setTimeout(() => {
      logout();
    }, logoutInMs);

    return () => clearTimers();
  }, [clearTimers, logout, maybeRefreshAccessToken, snapshot.accessToken]);

  const roles = snapshot.roles;
  const isAuthenticated =
    Boolean(snapshot.accessToken) &&
    !isTokenExpired(snapshot.accessToken, CLOCK_SKEW_MS);

  const isAdmin = roles.includes("ADMIN");
  const isStaff = roles.includes("STAFF") || isAdmin;
  const isPharmacist = roles.includes("PHARMACIST") || isAdmin;
  const isUser =
    roles.includes("USER") ||
    roles.includes("PHARMACIST") ||
    roles.includes("STAFF") ||
    isAdmin;

  const hasRole = useCallback(
    (requiredRoles) => {
      if (isAdmin) return true;
      if (!Array.isArray(requiredRoles)) {
        return roles.includes(requiredRoles);
      }
      return requiredRoles.some((r) => roles.includes(r));
    },
    [isAdmin, roles],
  );

  const value = useMemo(
    () => ({
      isLoading,
      accessToken: snapshot.accessToken,
      authUser: snapshot.authUser,
      userId: snapshot.userId,
      roles,
      isAuthenticated,
      isAdmin,
      isStaff,
      isPharmacist,
      isUser,
      hasRole,
      login,
      logout,
      // Future: export refresh method when implemented.
      refreshAccessToken: maybeRefreshAccessToken,
    }),
    [
      hasRole,
      isAdmin,
      isAuthenticated,
      isLoading,
      isPharmacist,
      isStaff,
      isUser,
      login,
      logout,
      maybeRefreshAccessToken,
      roles,
      snapshot.accessToken,
      snapshot.authUser,
      snapshot.userId,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};

export default AuthContext;
