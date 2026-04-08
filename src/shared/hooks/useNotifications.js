import { useCallback, useMemo, useState } from "react";
import notificationApi from "../../features/notifications/api/notificationApi";
import { toNotificationViewModel } from "../utils/notificationUtils";

const DEFAULT_LIMIT = 20;

const useNotifications = (limit = DEFAULT_LIMIT, options = {}) => {
  const enabled = options?.enabled !== false;
  const [notifications, setNotifications] = useState([]);
  const [dismissedIds, setDismissedIds] = useState(() => new Set());
  const [pendingReadIds, setPendingReadIds] = useState(() => new Set());
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [countLoading, setCountLoading] = useState(false);
  const [error, setError] = useState("");
  const [initialized, setInitialized] = useState(false);

  const visibleNotifications = useMemo(
    () => notifications.filter((item) => !dismissedIds.has(item.id)),
    [dismissedIds, notifications],
  );

  const refreshUnreadCount = useCallback(async () => {
    if (!enabled) {
      setUnreadCount(0);
      return;
    }

    setCountLoading(true);
    try {
      const count = await notificationApi.getUnreadNotificationCount();
      setUnreadCount(Math.max(0, Number(count) || 0));
    } catch (err) {
      const status = Number(err?.status || err?.response?.status || 0);
      if (status === 401 || status === 403) {
        setUnreadCount(0);
        return;
      }
      console.warn("[Notifications] Failed to refresh unread count", err);
    } finally {
      setCountLoading(false);
    }
  }, [enabled]);

  const refreshNotifications = useCallback(async () => {
    if (!enabled) {
      setNotifications([]);
      setError("");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await notificationApi.getMyNotifications(limit);
      const items = Array.isArray(data?.items)
        ? data.items.map(toNotificationViewModel)
        : [];
      setNotifications(items);
      setUnreadCount(Math.max(0, Number(data?.unreadCount || 0)));
      setInitialized(true);
    } catch (err) {
      const status = Number(err?.status || err?.response?.status || 0);
      if (status === 401 || status === 403) {
        setNotifications([]);
        setUnreadCount(0);
        setError("");
        setInitialized(true);
        return;
      }
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể tải thông báo",
      );
      setInitialized(true);
    } finally {
      setLoading(false);
    }
  }, [enabled, limit]);

  const initialize = useCallback(async () => {
    if (!enabled) return;
    await refreshUnreadCount();
  }, [enabled, refreshUnreadCount]);

  const openPanel = useCallback(async () => {
    if (!enabled) return;
    await refreshNotifications();
  }, [enabled, refreshNotifications]);

  const markAsReadLocal = useCallback((notificationId) => {
    setNotifications((prev) => {
      let changed = false;
      const next = prev.map((item) => {
        if (item.id !== notificationId || item.read) return item;
        changed = true;
        return { ...item, read: true };
      });
      if (changed) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
      return next;
    });
  }, []);

  const markAsRead = useCallback(
    async (notificationId) => {
      if (!enabled) return;
      if (!notificationId) return;
      let shouldCallApi = false;

      setNotifications((prev) => {
        const target = prev.find((item) => item.id === notificationId);
        if (!target || target.read) return prev;
        shouldCallApi = true;
        return prev.map((item) =>
          item.id === notificationId ? { ...item, read: true } : item,
        );
      });

      if (!shouldCallApi) return;

      setUnreadCount((count) => Math.max(0, count - 1));

      try {
        await notificationApi.markNotificationAsRead(notificationId);
      } catch (err) {
        console.warn("[Notifications] markAsRead failed, resyncing", err);
        await refreshNotifications();
      }
    },
    [enabled, refreshNotifications],
  );

  const queueReadOnClose = useCallback((notificationId) => {
    if (!notificationId) return;

    setNotifications((prev) => {
      const target = prev.find((item) => item.id === notificationId);
      if (!target || target.read) return prev;

      setPendingReadIds((prevIds) => {
        const next = new Set(prevIds);
        next.add(notificationId);
        return next;
      });

      setUnreadCount((count) => Math.max(0, count - 1));

      return prev.map((item) =>
        item.id === notificationId ? { ...item, read: true } : item,
      );
    });
  }, []);

  const flushPendingReads = useCallback(async () => {
    if (!enabled) return;
    const ids = Array.from(pendingReadIds);
    if (!ids.length) return;

    setPendingReadIds(new Set());
    await Promise.allSettled(
      ids.map((id) => notificationApi.markNotificationAsRead(id)),
    );
    await refreshUnreadCount();
  }, [enabled, pendingReadIds, refreshUnreadCount]);

  const dismissNotification = useCallback(
    async (notificationId) => {
      if (!enabled) return;
      if (!notificationId) return;

      const target = notifications.find((item) => item.id === notificationId);
      const wasUnread = Boolean(target && !target.read);

      if (wasUnread) {
        markAsReadLocal(notificationId);
      }

      setNotifications((prev) =>
        prev.filter((item) => item.id !== notificationId),
      );
      setDismissedIds((prev) => {
        const next = new Set(prev);
        next.add(notificationId);
        return next;
      });

      try {
        await notificationApi.deleteNotification(notificationId);
      } catch (err) {
        const status = Number(err?.status || err?.response?.status || 0);
        if (status === 404) {
          return;
        }
        console.warn("[Notifications] delete failed, resyncing", err);
        await refreshNotifications();
      }
    },
    [enabled, markAsReadLocal, notifications, refreshNotifications],
  );

  return {
    notifications: visibleNotifications,
    unreadCount,
    loading,
    countLoading,
    error,
    initialized,
    initialize,
    openPanel,
    refreshNotifications,
    refreshUnreadCount,
    markAsRead,
    queueReadOnClose,
    flushPendingReads,
    dismissNotification,
    markAsReadLocal,
  };
};

export default useNotifications;
