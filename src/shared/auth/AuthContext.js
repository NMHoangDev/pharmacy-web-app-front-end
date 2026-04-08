import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { publicApi } from "../api/httpClients";
import {
  clearAccessToken,
  clearAuthUser,
  clearRefreshToken,
  getAccessToken,
  getAuthUser,
  getRefreshToken,
  setAccessToken,
  setAuthUser,
  setRefreshToken,
} from "./authStorage";
import {
  decodeJwt,
  getRolesFromToken,
  getJwtExpirationMs,
  isTokenExpired,
} from "./jwt";

const AuthContext = createContext(null);

const CLOCK_SKEW_MS = 5_000;
const REFRESH_WINDOW_MS = 60_000;

const buildSnapshotFromStorage = () => {
  const accessToken = (getAccessToken() || "").trim();
  const refreshToken = (getRefreshToken() || "").trim();
  const expired = accessToken
    ? isTokenExpired(accessToken, CLOCK_SKEW_MS)
    : true;

  const token = accessToken;
  const decoded = token ? decodeJwt(token) : null;

  const storedUser = token || refreshToken ? getAuthUser() : null;
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
    refreshToken,
    authUser: token || refreshToken ? user : null,
    roles,
    userId,
  };
};

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [snapshot, setSnapshot] = useState(() => buildSnapshotFromStorage());

  const refreshTimerRef = useRef(null);
  const refreshPromiseRef = useRef(null);

  const clearTimers = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const syncFromStorage = useCallback(() => {
    setSnapshot(buildSnapshotFromStorage());
  }, []);

  const logout = useCallback(() => {
    clearTimers();
    clearAccessToken();
    clearRefreshToken();
    clearAuthUser();
    setSnapshot({
      accessToken: "",
      refreshToken: "",
      authUser: null,
      roles: [],
      userId: null,
    });
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
      const persistedToken = (getAccessToken() || "").trim();
      if (!persistedToken) {
        logout();
        return;
      }

      const nextRefreshToken =
        typeof data === "string" ? "" : data?.refreshToken;
      setRefreshToken(nextRefreshToken || "");

      const decoded = decodeJwt(persistedToken);
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
        accessToken: persistedToken,
        refreshToken: String(getRefreshToken() || "").trim(),
        authUser: userObj,
        roles: getRolesFromToken(persistedToken),
        userId: decoded?.sub || userObj?.id || null,
      });
    },
    [logout],
  );

  const maybeRefreshAccessToken = useCallback(async () => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const refreshToken = (getRefreshToken() || "").trim();
    if (!refreshToken) {
      return null;
    }

    const refreshPromise = publicApi
      .post("/api/auth/refresh", { refreshToken })
      .then(({ data }) => {
        const nextToken = String(data?.token || "").trim();
        if (!nextToken) {
          throw new Error("No access token returned from refresh endpoint");
        }

        setAccessToken(nextToken);
        const persistedToken = (getAccessToken() || "").trim();
        if (!persistedToken) {
          throw new Error(
            "Invalid access token returned from refresh endpoint",
          );
        }

        const nextRefreshToken = String(
          data?.refreshToken || refreshToken,
        ).trim();
        setRefreshToken(nextRefreshToken);

        const decoded = decodeJwt(persistedToken);
        const currentUser = getAuthUser();
        const userObj =
          currentUser ||
          (decoded
            ? {
                id: decoded?.sub,
                email: decoded?.email,
                fullName: decoded?.name,
              }
            : null);

        if (userObj) {
          setAuthUser(userObj);
        }

        const nextSnapshot = {
          accessToken: persistedToken,
          refreshToken: String(getRefreshToken() || "").trim(),
          authUser: userObj,
          roles: getRolesFromToken(persistedToken),
          userId: decoded?.sub || userObj?.id || null,
        };

        setSnapshot(nextSnapshot);
        return nextToken;
      })
      .catch((err) => {
        const status = Number(err?.response?.status || err?.status || 0);
        if (status === 400 || status === 401) {
          clearAccessToken();
          clearRefreshToken();
          clearAuthUser();
          setSnapshot({
            accessToken: "",
            refreshToken: "",
            authUser: null,
            roles: [],
            userId: null,
          });
          return null;
        }

        return null;
      })
      .finally(() => {
        refreshPromiseRef.current = null;
      });

    refreshPromiseRef.current = refreshPromise;
    return refreshPromise;
  }, []);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        const token = (getAccessToken() || "").trim();
        const refreshToken = (getRefreshToken() || "").trim();

        if (token && isTokenExpired(token, CLOCK_SKEW_MS)) {
          const refreshed = await maybeRefreshAccessToken();
          if (!refreshed) syncFromStorage();
        } else if (!token && refreshToken) {
          const refreshed = await maybeRefreshAccessToken();
          if (!refreshed) syncFromStorage();
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

  useEffect(() => {
    const handler = () => syncFromStorage();
    window.addEventListener("storage", handler);
    window.addEventListener("auth:changed", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("auth:changed", handler);
    };
  }, [syncFromStorage]);

  useEffect(() => {
    clearTimers();

    const token = snapshot.accessToken;
    if (!token) return undefined;

    const expMs = getJwtExpirationMs(token);
    if (!expMs) return undefined;

    const now = Date.now();
    const refreshInMs = Math.max(0, expMs - now - REFRESH_WINDOW_MS);

    refreshTimerRef.current = setTimeout(() => {
      maybeRefreshAccessToken().then((refreshed) => {
        if (!refreshed) {
          syncFromStorage();
        }
      });
    }, refreshInMs);

    return () => clearTimers();
  }, [
    clearTimers,
    maybeRefreshAccessToken,
    snapshot.accessToken,
    syncFromStorage,
  ]);

  const roles = snapshot.roles;
  const hasValidAccessToken =
    Boolean(snapshot.accessToken) &&
    !isTokenExpired(snapshot.accessToken, CLOCK_SKEW_MS);
  const isAuthenticated = hasValidAccessToken || Boolean(snapshot.refreshToken);

  const isAdmin = roles.includes("ADMIN");
  const isStaff = roles.includes("STAFF") || isAdmin;
  const isPharmacist = roles.includes("PHARMACIST") || isAdmin;
  const isUser =
    isAuthenticated ||
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
