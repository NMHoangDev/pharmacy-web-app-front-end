import React, { createContext, useContext, useMemo, useState } from "react";
import { setAccessToken } from "../api/apiClient";

// Tạo context dùng cho global state toàn app
const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // Ví dụ một global state: theme, sau này bạn có thể thêm những state khác (user, cart, ...)
  const [theme, setTheme] = useState("light");
  const [authToken, setAuthToken] = useState(() => {
    return sessionStorage.getItem("authToken") || "";
  });
  const [profile, setProfile] = useState(null);
  const [authUser, setAuthUser] = useState(() => {
    try {
      const raw = sessionStorage.getItem("authUser");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const roles = useMemo(() => {
    if (!authToken) return [];
    try {
      const payload = authToken.split(".")[1];
      if (!payload) return [];
      const json = JSON.parse(
        atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
      );
      const rawRoles = json.roles || [];
      return Array.isArray(rawRoles) ? rawRoles : [];
    } catch {
      return [];
    }
  }, [authToken]);

  const isAuthenticated = Boolean(authToken);
  const isAdmin = roles.includes("ROLE_ADMIN");
  const isUser = roles.includes("ROLE_USER") || isAdmin;

  const login = (data) => {
    setAuthToken(data.token || "");
    setAuthUser({
      id: data.userId,
      email: data.email,
      phone: data.phone,
      fullName: data.fullName,
      expiresAt: data.expiresAt,
    });
    sessionStorage.setItem("authToken", data.token || "");
    // update axios in-memory token as well
    setAccessToken(data.token || null);
    sessionStorage.setItem(
      "authUser",
      JSON.stringify({
        id: data.userId,
        email: data.email,
        phone: data.phone,
        fullName: data.fullName,
        expiresAt: data.expiresAt,
      }),
    );
  };

  const logout = () => {
    setAuthToken("");
    setAuthUser(null);
    setProfile(null);
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("authUser");
    setAccessToken(null);
  };

  const value = {
    theme,
    setTheme,
    authToken,
    authUser,
    roles,
    isAuthenticated,
    isAdmin,
    isUser,
    profile,
    setProfile,
    login,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Hook tiện dụng để dùng context trong các page / component
export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return ctx;
};

export default AppContext;
