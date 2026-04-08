import { authApi, publicApi } from "../../../shared/api/httpClients";

/**
 * Initiates a payment transaction.
 * @param {Object} payload PaymentInitiateRequest DTO
 * @returns {Promise<Object>} PaymentInitiateResponse containing paymentUrl
 */
export async function initiatePayment(payload) {
  const url = "/api/payments/initiate";
  const res = await authApi.post(url, payload);
  return res?.data ?? {};
}

export async function createVnpayPayment(payload) {
  const url = "/api/payments/vnpay/create";
  const orderId = payload?.orderId;
  const amount = payload?.amount;
  const requestBody = {
    orderId,
    amount,
    orderInfo:
      payload?.orderInfo ||
      (orderId ? `Thanh toan don hang: ${orderId}` : "Thanh toan don hang"),
    orderType: payload?.orderType || "other",
    bankCode: payload?.bankCode || "",
    locale: payload?.locale || "vn",
  };

  const res = await authApi.post(url, requestBody);
  const data = res?.data ?? {};

  // Frontend VNPay debug:
  // - HASH DATA must be RAW values (decoded, NO url-encoding)
  // - QUERY is url-encoded values
  try {
    const paymentUrl = String(data?.data || "");
    if (paymentUrl) {
      const u = new URL(paymentUrl);
      const sp = new URLSearchParams(u.search);
      const secureHash = sp.get("vnp_SecureHash") || "";

      const raw = u.search && u.search.startsWith("?") ? u.search.slice(1) : "";
      const query = raw
        .split("&")
        .filter(Boolean)
        .filter(
          (p) =>
            !p.startsWith("vnp_SecureHash=") &&
            !p.startsWith("vnp_SecureHashType="),
        )
        .join("&");

      const decodeValue = (v) => {
        try {
          return decodeURIComponent(String(v || "").replace(/\+/g, " "));
        } catch (e) {
          return String(v || "");
        }
      };

      const hashData = query
        .split("&")
        .filter(Boolean)
        .map((pair) => {
          const idx = pair.indexOf("=");
          if (idx < 0) return pair;
          const k = pair.slice(0, idx);
          const v = pair.slice(idx + 1);
          return `${k}=${decodeValue(v)}`;
        })
        .join("&");

      console.log("==== VNPAY DEBUG ====");
      console.log("HASH DATA: " + query);
      console.log("HASH DATA RAW: " + hashData);
      console.log("QUERY: " + query);
      console.log("SECURE HASH: " + secureHash);
      console.log("=====================");
    }
  } catch (e) {
    // ignore
  }

  return data;
}

/**
 * Verifies and processes VNPay return params via backend (checksum validation + finalize).
 * Accepts a query string (including leading '?') to preserve the original VNPay param names.
 */
export async function verifyVnpayReturn(queryString) {
  const qs = typeof queryString === "string" ? queryString.trim() : "";
  const normalized = qs && !qs.startsWith("?") ? `?${qs}` : qs;
  const url = `/api/payments/vnpay/return${normalized}`;
  try {
    const res = await authApi.get(url);
    return res?.data ?? "";
  } catch (err) {
    const status = Number(err?.status || err?.response?.status || 0);
    const message = String(err?.message || "").toLowerCase();
    const authFailed =
      status === 401 || message.includes("authentication required");
    if (!authFailed) throw err;

    const res = await publicApi.get(url);
    return res?.data ?? "";
  }
}

/**
 * Gets available payment methods from the backend.
 */
export async function getPaymentMethods() {
  const url = "/api/payments/methods";
  const res = await authApi.get(url);
  return res?.data ?? [];
}
