export function toNotificationViewModel(raw) {
  return {
    id: String(raw?.id || ""),
    category: String(raw?.category || "SYSTEM"),
    title: String(raw?.title || "Thông báo"),
    message: String(raw?.message || ""),
    sourceType: raw?.sourceType || null,
    sourceId: raw?.sourceId || null,
    sourceEventType: raw?.sourceEventType || null,
    actionUrl: raw?.actionUrl || null,
    createdAt: raw?.createdAt || null,
    read: Boolean(raw?.read),
  };
}

export function formatNotificationTime(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const now = Date.now();
  const diffMs = now - date.getTime();
  const abs = Math.abs(diffMs);

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  const rtf = new Intl.RelativeTimeFormat("vi", { numeric: "auto" });

  if (abs < minute) return "vừa xong";
  if (abs < hour) return rtf.format(-Math.round(diffMs / minute), "minute");
  if (abs < day) return rtf.format(-Math.round(diffMs / hour), "hour");
  if (abs < day * 7) return rtf.format(-Math.round(diffMs / day), "day");

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
