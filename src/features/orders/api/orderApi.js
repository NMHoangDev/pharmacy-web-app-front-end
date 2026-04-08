import { authApi } from "../../../shared/api/httpClients";

/**
 * Places a formal order with snapshot data.
 * @param {Object} payload CheckoutRequest DTO
 */
export async function placeOrder(payload) {
  const url = "/api/orders";
  const res = await authApi.post(url, payload);
  return res?.data ?? {};
}

/**
 * Computes the order quote without persistence.
 * @param {Object} payload CheckoutRequest DTO
 */
export async function getQuote(payload) {
  const url = "/api/checkout/quote";
  const res = await authApi.post(url, payload);
  return res?.data ?? {};
}

/**
 * Gets order detail by ID.
 */
export async function getOrderDetail(orderId) {
  if (!orderId) throw new Error("Missing orderId");
  const url = `/api/orders/${orderId}`;
  const res = await authApi.get(url);
  return res?.data ?? {};
}

/**
 * Backward compatible alias.
 */
export async function getOrderDetails(orderId) {
  return getOrderDetail(orderId);
}

/**
 * Lists orders for a specific user.
 */
export async function listOrders(userId) {
  if (!userId) throw new Error("Missing userId");
  const url = `/api/orders/user/${userId}`;
  const res = await authApi.get(url);
  return res?.data ?? [];
}

/**
 * Gets the current cart for a user.
 */
export async function getCart(userId) {
  if (!userId) throw new Error("Missing userId");
  const url = `/api/orders/cart/${userId}`;
  const res = await authApi.get(url);
  return res?.data ?? { items: [] };
}

/**
 * Adds or updates an item in the cart.
 */
export async function upsertCartItem(userId, request) {
  if (!userId) throw new Error("Missing userId");
  const url = `/api/orders/cart/${userId}/items`;
  const res = await authApi.post(url, request);
  return res?.data ?? { items: [] };
}

/**
 * Removes an item from the cart.
 */
export async function removeCartItem(userId, productId) {
  if (!userId || !productId) throw new Error("Missing userId or productId");
  const url = `/api/orders/cart/${userId}/items/${productId}`;
  const res = await authApi.delete(url);
  return res?.data ?? { items: [] };
}

/**
 * Gets available shipping methods from the backend.
 */
export async function getShippingMethods() {
  const url = "/api/checkout/shipping-methods";
  const res = await authApi.get(url);
  return res?.data ?? [];
}
