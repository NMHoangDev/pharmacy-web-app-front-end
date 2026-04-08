import notificationApi from "../../features/notifications/api/notificationApi";

const EVENT_BY_CATEGORY = {
  CART: "CART_ITEM_ADDED",
  ORDER: "ORDER_CREATED",
  APPOINTMENT: "APPOINTMENT_CREATED",
};

const ACTION_URL_BY_CATEGORY = {
  CART: "/cart",
  ORDER: "/account",
  APPOINTMENT: "/appointments",
};

const normalizeCategory = (payload) => {
  const category = payload?.category || payload?.type || "SYSTEM";
  return String(category).trim().toUpperCase();
};

const buildActionPayload = (payload = {}) => {
  const category = normalizeCategory(payload);

  return {
    category,
    title: String(payload?.title || "Thông báo"),
    message: String(payload?.message || ""),
    sourceType: String(payload?.sourceType || category),
    sourceId:
      (payload?.sourceId ?? payload?.relatedEntityId)
        ? String(payload?.sourceId ?? payload?.relatedEntityId)
        : null,
    sourceEventType: String(
      payload?.sourceEventType || EVENT_BY_CATEGORY[category] || "SYSTEM_EVENT",
    ),
    actionUrl:
      payload?.actionUrl === undefined
        ? ACTION_URL_BY_CATEGORY[category] || null
        : payload?.actionUrl,
  };
};

export async function createNotification(payload) {
  return notificationApi.createMyNotification(
    buildActionPayload(payload || {}),
  );
}

export async function notifyAfterSuccess({
  action,
  notificationPayload,
  refreshNotifications,
  refreshUnreadCount,
  onNotificationError,
}) {
  if (typeof action !== "function") {
    throw new Error("notifyAfterSuccess requires an action function");
  }

  const result = await action();
  const resolvedPayload =
    typeof notificationPayload === "function"
      ? notificationPayload(result)
      : notificationPayload;

  try {
    await createNotification(resolvedPayload || {});

    if (typeof refreshNotifications === "function") {
      await refreshNotifications();
    }

    if (typeof refreshUnreadCount === "function") {
      await refreshUnreadCount();
    }
  } catch (error) {
    if (typeof onNotificationError === "function") {
      onNotificationError(error);
    } else {
      console.error(
        "Failed to create notification after successful action:",
        error,
      );
    }
  }

  return result;
}

const notificationService = {
  notifyAfterSuccess,
  createNotification,
};

export default notificationService;
