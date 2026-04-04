import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import notificationApi from "../api/notificationApi";
import { toNotificationViewModel } from "../utils/notificationUtils";
import { useAuth } from "../auth/useAuth";

// Tạo context dùng cho global state toàn app
const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const auth = useAuth();

  const [theme, setTheme] = useState("light");
  const [notificationRefreshVersion, setNotificationRefreshVersion] =
    useState(0);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const {
    isLoading: authLoading,
    accessToken,
    authUser,
    userId,
    roles,
    isAuthenticated,
    isAdmin,
    isStaff,
    isPharmacist,
    isUser,
    login: authLogin,
    logout: authLogout,
    hasRole,
  } = auth;

  const shouldSkipNotifications = Boolean(isAdmin);

  const [profile, setProfileState] = useState(() => {
    try {
      const raw = sessionStorage.getItem("userProfile");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const setProfile = useCallback((data) => {
    setProfileState(data);
    if (data) {
      sessionStorage.setItem("userProfile", JSON.stringify(data));
    } else {
      sessionStorage.removeItem("userProfile");
    }
  }, []);

  const login = useCallback(
    (data) => {
      authLogin(data);
    },
    [authLogin],
  );

  const logout = useCallback(() => {
    authLogout();
    setProfile(null);
    sessionStorage.removeItem("userProfile");
  }, [authLogout, setProfile]);

  const resetNotificationState = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    setNotificationsLoading(false);
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated || !accessToken || shouldSkipNotifications) {
      setUnreadCount(0);
      return 0;
    }

    try {
      const nextCount = await notificationApi.getUnreadNotificationCount();
      const safeCount = Math.max(0, Number(nextCount) || 0);
      setUnreadCount(safeCount);
      return safeCount;
    } catch (err) {
      const status = Number(err?.status || err?.response?.status || 0);
      if (status === 401 || status === 403) {
        setUnreadCount(0);
        return 0;
      }
      console.warn("[AppContext] Failed to refresh unread count", err);
      return unreadCount;
    }
  }, [accessToken, isAuthenticated, shouldSkipNotifications, unreadCount]);

  const refreshNotifications = useCallback(async () => {
    setNotificationRefreshVersion((prev) => prev + 1);

    if (!isAuthenticated || !accessToken || shouldSkipNotifications) {
      resetNotificationState();
      return { items: [], unreadCount: 0 };
    }

    setNotificationsLoading(true);
    try {
      const data = await notificationApi.getMyNotifications(20);
      const items = Array.isArray(data?.items)
        ? data.items.map(toNotificationViewModel)
        : [];
      const nextUnreadCount = Math.max(0, Number(data?.unreadCount || 0));

      setNotifications(items);
      setUnreadCount(nextUnreadCount);

      return { items, unreadCount: nextUnreadCount };
    } catch (err) {
      const status = Number(err?.status || err?.response?.status || 0);
      if (status === 401 || status === 403) {
        resetNotificationState();
        return { items: [], unreadCount: 0 };
      }

      console.warn("[AppContext] Failed to refresh notifications", err);
      return { items: notifications, unreadCount };
    } finally {
      setNotificationsLoading(false);
    }
  }, [
    accessToken,
    isAuthenticated,
    notifications,
    resetNotificationState,
    shouldSkipNotifications,
    unreadCount,
  ]);

  useEffect(() => {
    if (!isAuthenticated || !accessToken || shouldSkipNotifications) {
      resetNotificationState();
      return;
    }

    refreshUnreadCount();
  }, [
    accessToken,
    isAuthenticated,
    refreshUnreadCount,
    resetNotificationState,
    shouldSkipNotifications,
  ]);

  const value = {
    theme,
    setTheme,
    accessToken,
    authUser,
    userId,
    roles,
    profile,
    setProfile,
    authLoading,
    isAuthenticated,
    isAdmin,
    isStaff,
    isPharmacist,
    isUser,
    notifications,
    unreadCount,
    notificationsLoading,
    notificationRefreshVersion,
    login,
    logout,
    hasRole,
    refreshUnreadCount,
    refreshNotifications,
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
