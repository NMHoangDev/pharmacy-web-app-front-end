export const ORDER_STATUS_KEYS = {
  pending: "pending",
  processing: "processing",
  shipped: "shipped",
  completed: "completed",
  cancelled: "cancelled",
};

export const PAYMENT_STATUS_KEYS = {
  paid: "paid",
  unpaid: "unpaid",
};

export const toUiOrderStatus = (status) => {
  const normalized = String(status || "").trim().toUpperCase();
  if (normalized === "CONFIRMED") return ORDER_STATUS_KEYS.processing;
  if (normalized === "SHIPPING") return ORDER_STATUS_KEYS.shipped;
  if (normalized === "COMPLETED") return ORDER_STATUS_KEYS.completed;
  if (normalized === "CANCELED") return ORDER_STATUS_KEYS.cancelled;
  return ORDER_STATUS_KEYS.pending;
};

export const toApiOrderStatus = (status) => {
  const normalized = String(status || "").trim().toLowerCase();
  if (normalized === ORDER_STATUS_KEYS.processing) return "CONFIRMED";
  if (normalized === ORDER_STATUS_KEYS.shipped) return "SHIPPING";
  if (normalized === ORDER_STATUS_KEYS.completed) return "COMPLETED";
  if (normalized === ORDER_STATUS_KEYS.cancelled) return "CANCELED";
  return "PLACED";
};

export const toOrderStatusLabel = (status) => {
  const normalized =
    status && String(status).trim().toLowerCase() in ORDER_STATUS_KEYS
      ? String(status).trim().toLowerCase()
      : toUiOrderStatus(status);

  if (normalized === ORDER_STATUS_KEYS.processing) return "Đang xử lý";
  if (normalized === ORDER_STATUS_KEYS.shipped) return "Đang giao";
  if (normalized === ORDER_STATUS_KEYS.completed) return "Đã hoàn thành";
  if (normalized === ORDER_STATUS_KEYS.cancelled) return "Đã hủy";
  return "Chờ xác nhận";
};

export const toUiPaymentStatus = (status) => {
  const normalized = String(status || "").trim().toUpperCase();
  if (normalized === "PAID") return PAYMENT_STATUS_KEYS.paid;
  return PAYMENT_STATUS_KEYS.unpaid;
};

export const toPaymentStatusLabel = (status) => {
  const normalized =
    status && String(status).trim().toLowerCase() in PAYMENT_STATUS_KEYS
      ? String(status).trim().toLowerCase()
      : toUiPaymentStatus(status);

  return normalized === PAYMENT_STATUS_KEYS.paid
    ? "Đã thanh toán"
    : "Chưa thanh toán";
};

export const getOrderStatusBadgeClasses = (status) => {
  const normalized =
    status && String(status).trim().toLowerCase() in ORDER_STATUS_KEYS
      ? String(status).trim().toLowerCase()
      : toUiOrderStatus(status);

  if (normalized === ORDER_STATUS_KEYS.processing) {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }
  if (normalized === ORDER_STATUS_KEYS.shipped) {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }
  if (normalized === ORDER_STATUS_KEYS.completed) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (normalized === ORDER_STATUS_KEYS.cancelled) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }
  return "border-amber-200 bg-amber-50 text-amber-700";
};

export const getPaymentStatusBadgeClasses = (status) => {
  const normalized =
    status && String(status).trim().toLowerCase() in PAYMENT_STATUS_KEYS
      ? String(status).trim().toLowerCase()
      : toUiPaymentStatus(status);

  return normalized === PAYMENT_STATUS_KEYS.paid
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-slate-200 bg-slate-50 text-slate-700";
};
