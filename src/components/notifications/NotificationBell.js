import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import NotificationPanel from "./NotificationPanel";
import { useCampaign } from "../../hooks/useCampaign";
import { useNotificationsQuery } from "../../hooks/queries/useNotifications";
import { useUnreadCount } from "../../hooks/queries/useUnreadCount";
import { useMarkNotificationRead } from "../../hooks/mutations/useMarkNotificationRead";
import { useDeleteNotification } from "../../hooks/mutations/useDeleteNotification";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../hooks/queries/queryKeys";

const NotificationBell = () => {
  const navigate = useNavigate();
  const { isAuthenticated, accessToken } = useAppContext();
  const notificationsEnabled = Boolean(isAuthenticated && accessToken);
  const containerRef = useRef(null);
  const flushOnUnmountRef = useRef(() => Promise.resolve());
  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();
  const [pendingReadIds, setPendingReadIds] = useState(() => new Set());

  const unreadQuery = useUnreadCount({
    enabled: notificationsEnabled,
  });

  const notificationsQuery = useNotificationsQuery(20, {
    enabled: notificationsEnabled && open,
  });

  const markReadMutation = useMarkNotificationRead();
  const deleteMutation = useDeleteNotification();

  const notifications = useMemo(
    () => notificationsQuery.data?.items || [],
    [notificationsQuery.data?.items],
  );
  const unreadCount = Number(unreadQuery.data || 0);
  const loading = notificationsQuery.isLoading || notificationsQuery.isFetching;
  const error = notificationsQuery.error?.message || "";
  const refreshNotifications = useCallback(
    () => notificationsQuery.refetch(),
    [notificationsQuery],
  );

  const { activeCampaign } = useCampaign({ refreshIntervalMs: 180000 });

  const campaignNotification = useMemo(() => {
    if (!activeCampaign) return null;

    const now = new Date().toISOString();
    const title = activeCampaign?.name
      ? `Ưu đãi: ${activeCampaign.name}`
      : "Ưu đãi đang diễn ra";

    return {
      id: `campaign-${activeCampaign?.id || "active"}`,
      read: false,
      category: "DISCOUNT",
      title,
      message: activeCampaign?.displayText || "Có mã giảm giá đang áp dụng.",
      actionUrl: "/checkout",
      createdAt: now,
      synthetic: true,
    };
  }, [activeCampaign]);

  const panelNotifications = useMemo(() => {
    const list = Array.isArray(notifications) ? notifications : [];
    return campaignNotification ? [campaignNotification, ...list] : list;
  }, [campaignNotification, notifications]);

  const queueReadOnClose = useCallback(
    (notificationId) => {
      if (!notificationId) return;

      setPendingReadIds((prev) => {
        const next = new Set(prev);
        next.add(notificationId);
        return next;
      });

      // Optimistically update UI: mark read + decrement unread.
      queryClient.setQueryData(queryKeys.unreadCount(), (prev) =>
        Math.max(0, Number(prev || 0) - 1),
      );
      queryClient.setQueriesData({ queryKey: ["notifications"] }, (prev) => {
        if (!prev) return prev;
        const items = Array.isArray(prev?.items) ? prev.items : [];
        let changed = false;
        const nextItems = items.map((it) => {
          if (it?.id !== notificationId || it?.read) return it;
          changed = true;
          return { ...it, read: true };
        });
        if (!changed) return prev;
        return {
          ...prev,
          items: nextItems,
          unreadCount: Math.max(0, Number(prev?.unreadCount || 0) - 1),
        };
      });
    },
    [queryClient],
  );

  const flushPendingReads = useCallback(async () => {
    const ids = Array.from(pendingReadIds);
    if (!ids.length) return;

    setPendingReadIds(new Set());
    await Promise.allSettled(ids.map((id) => markReadMutation.mutateAsync(id)));
    await unreadQuery.refetch();
  }, [markReadMutation, pendingReadIds, unreadQuery]);

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
    await refreshNotifications();
  }, [closePanel, notificationsEnabled, open, refreshNotifications]);

  const handleOpenItem = useCallback(
    (item) => {
      if (item?.synthetic) {
        const target = String(item?.actionUrl || "").trim();
        if (!target) return;
        navigate(target.startsWith("/") ? target : `/${target}`);
        return;
      }

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
      if (item?.synthetic) return;
      await markReadMutation.mutateAsync(item?.id);
    },
    [markReadMutation],
  );

  const handleDelete = useCallback(
    async (item) => {
      if (item?.synthetic) return;
      await deleteMutation.mutateAsync(item?.id);
    },
    [deleteMutation],
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
          notifications={panelNotifications}
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
