import { authApi } from "../../../shared/api/httpClients";

const DEFAULT_LIMIT = 20;

export async function getMyNotifications(limit = DEFAULT_LIMIT) {
  const safeLimit = Math.min(Math.max(Number(limit) || DEFAULT_LIMIT, 1), 100);
  const res = await authApi.get("/api/notifications", {
    params: { limit: safeLimit },
  });
  return res?.data ?? { items: [], unreadCount: 0 };
}

export async function getUnreadNotificationCount() {
  const res = await authApi.get("/api/notifications/unread-count");
  return Number(res?.data?.unreadCount || 0);
}

export async function markNotificationAsRead(notificationId) {
  if (!notificationId) throw new Error("Missing notificationId");
  const res = await authApi.patch(`/api/notifications/${notificationId}/read`);
  return res?.data ?? { id: notificationId, read: true };
}

export async function markAllNotificationsAsRead() {
  const res = await authApi.patch("/api/notifications/read-all");
  return res?.data ?? { updated: 0 };
}

export async function deleteNotification(notificationId) {
  if (!notificationId) throw new Error("Missing notificationId");
  await authApi.delete(`/api/notifications/${notificationId}`);
  return true;
}

export async function createMyNotification(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Missing notification payload");
  }
  const res = await authApi.post("/api/notifications/me", payload);
  return res?.data ?? {};
}

const notificationApi = {
  getMyNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createMyNotification,
};

export default notificationApi;
