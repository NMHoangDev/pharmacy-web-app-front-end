import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import useNotifications from "../../hooks/useNotifications";
import { useAppContext } from "../../context/AppContext";
import NotificationPanel from "./NotificationPanel";

const NotificationBell = () => {
  const navigate = useNavigate();
  const { isAuthenticated, accessToken, notificationRefreshVersion } =
    useAppContext();
  const notificationsEnabled = Boolean(isAuthenticated && accessToken);
  const containerRef = useRef(null);
  const flushOnUnmountRef = useRef(() => Promise.resolve());
  const [open, setOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    loading,
    error,
    initialize,
    openPanel,
    refreshNotifications,
    refreshUnreadCount,
    markAsRead,
    queueReadOnClose,
    flushPendingReads,
    dismissNotification,
  } = useNotifications(20, { enabled: notificationsEnabled });

  useEffect(() => {
    if (!notificationsEnabled) return;
    initialize();
  }, [initialize, notificationsEnabled]);

  useEffect(() => {
    if (!notificationsEnabled) return;
    if (open) {
      refreshNotifications();
      return;
    }
    refreshUnreadCount();
  }, [
    notificationRefreshVersion,
    notificationsEnabled,
    open,
    refreshNotifications,
    refreshUnreadCount,
  ]);

  flushOnUnmountRef.current = flushPendingReads;

  useEffect(() => {
    return () => {
      flushOnUnmountRef.current();
    };
  }, []);

  const closePanel = useCallback(async () => {
    setOpen(false);
    await flushPendingReads();
  }, [flushPendingReads]);

  const handleToggle = useCallback(async () => {
    if (!notificationsEnabled) return;
    if (open) {
      await closePanel();
      return;
    }
    setOpen(true);
    await openPanel();
  }, [closePanel, notificationsEnabled, open, openPanel]);

  const handleOpenItem = useCallback(
    (item) => {
      if (!item?.read) {
        queueReadOnClose(item.id);
      }

      const target = String(item?.actionUrl || "").trim();
      if (!target) return;

      if (target.startsWith("http://") || target.startsWith("https://")) {
        window.location.assign(target);
        return;
      }

      navigate(target.startsWith("/") ? target : `/${target}`);
    },
    [navigate, queueReadOnClose],
  );

  const handleMarkRead = useCallback(
    async (item) => {
      await markAsRead(item?.id);
    },
    [markAsRead],
  );

  const handleDelete = useCallback(
    async (item) => {
      await dismissNotification(item?.id);
    },
    [dismissNotification],
  );

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      const root = containerRef.current;
      if (!root) return;
      if (!root.contains(event.target)) {
        closePanel();
      }
    };

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        closePanel();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [closePanel, open]);

  const unreadBadgeLabel = useMemo(() => {
    if (!unreadCount) return "";
    return unreadCount > 99 ? "99+" : String(unreadCount);
  }, [unreadCount]);

  if (!notificationsEnabled) {
    return null;
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className="relative h-10 w-10 grid place-items-center rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
        aria-label="Mở thông báo"
        onClick={handleToggle}
      >
        <span className="material-symbols-outlined text-[22px]">
          notifications
        </span>
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] px-1 items-center justify-center rounded-full bg-rose-500 text-[11px] font-extrabold text-white ring-2 ring-white dark:ring-slate-950">
            {unreadBadgeLabel}
          </span>
        ) : null}
      </button>

      {open ? (
        <NotificationPanel
          notifications={notifications}
          loading={loading}
          error={error}
          onOpenItem={handleOpenItem}
          onMarkRead={handleMarkRead}
          onDelete={handleDelete}
          onRefresh={refreshNotifications}
        />
      ) : null}
    </div>
  );
};

export default NotificationBell;
