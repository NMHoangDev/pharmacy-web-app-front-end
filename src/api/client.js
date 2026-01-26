import apiClient, { setAccessToken } from "./apiClient";

// helper: build headers for JSON + optional explicit token override
function jsonHeaders(token) {
  const h = { "Content-Type": "application/json" };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function handleAxios(promise) {
  try {
    const res = await promise;
    return res.data === undefined ? {} : res.data;
  } catch (err) {
    const message =
      err?.response?.data?.message || err.message || "Request failed";
    const e = new Error(`${message}`);
    e.status = err?.response?.status;
    e.body = err?.response?.data;
    // attach full response text when available for easier debugging
    try {
      if (!e.body && err?.response) {
        e.body = err.response;
      }
    } catch (ignore) {}
    throw e;
  }
}

// UUID validation (v1/v4 general pattern)
export function isUuid(value) {
  if (!value || typeof value !== "string") return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

export async function getCart(userId /*, token - no longer required */) {
  return handleAxios(apiClient.get(`/api/cart/${userId}`));
}

export async function upsertCartItem(
  userId /*, token - no longer required */,
  item,
) {
  // Determine raw id from possible shapes
  const rawId = item?.productId ?? item?.id ?? item?._id;
  const productId = rawId == null ? "" : String(rawId);

  if (!productId || !isUuid(productId)) {
    // Log item for debugging (avoid logging tokens or secrets)
    // eslint-disable-next-line no-console
    console.error("[Cart] Missing/Invalid productId. item=", item);
    throw new Error("Missing/Invalid productId");
  }

  // quantity must be integer >= 1
  const qnum = Number(item?.quantity);
  const quantity = Number.isFinite(qnum) ? Math.max(1, Math.floor(qnum)) : 1;

  const body = {
    productId,
    quantity,
  };

  // Dev logging: do not print token
  if (process.env.NODE_ENV !== "production") {
    try {
      // eslint-disable-next-line no-console
      console.debug(
        `[api] POST /api/cart/${userId}/items productId:${productId ? "present" : "missing"}`,
      );
    } catch (e) {}
  }

  return handleAxios(apiClient.post(`/api/cart/${userId}/items`, body));
}

export async function removeCartItem(
  userId /*, token - no longer required */,
  productId,
) {
  return handleAxios(
    apiClient.delete(`/api/cart/${userId}/items/${productId}`),
  );
}

export async function checkout(payload /*, token - no longer required */) {
  return handleAxios(apiClient.post(`/api/cart/checkout`, payload));
}

export async function pay(payload /*, token - no longer required */) {
  return handleAxios(apiClient.post(`/api/cart/pay`, payload));
}

export async function listOrdersByUser(
  userId /*, token - no longer required */,
) {
  return handleAxios(apiClient.get(`/api/orders/user/${userId}`));
}

export async function getOrder(orderId /*, token - no longer required */) {
  return handleAxios(apiClient.get(`/api/orders/${orderId}`));
}

export async function getUser(userId /*, token - no longer required */) {
  return handleAxios(apiClient.get(`/api/users/${userId}`));
}

export async function updateUser(
  userId /*, token - no longer required */,
  payload,
) {
  return handleAxios(apiClient.put(`/api/users/${userId}`, payload));
}

export default {
  getCart,
  upsertCartItem,
  removeCartItem,
  checkout,
  pay,
  listOrdersByUser,
  getOrder,
  getUser,
  updateUser,
};
