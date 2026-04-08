import { authApi } from "../../../shared/api/httpClients";

/*
  Notes:
  - Endpoints through gateway http://localhost:8087 with prefix /api/cart
  - Protected calls use centralized interceptor in apiClient.js
*/

function ensureUserId(userId) {
  if (!userId) throw new Error("Missing userId");
}

function assertCartPath(url) {
  if (process.env.NODE_ENV !== "production") {
    if (!url || !String(url).includes("/api/cart")) {
      // eslint-disable-next-line no-console
      console.warn("[cartApi] URL does not contain /api/cart:", url);
    }
  }
}

export async function pingCart() {
  const url = "/api/cart/ping";
  assertCartPath(url);
 
  const res = await authApi.get(url);
  return res?.data ?? {};
}

export async function getCart(userId) {
  ensureUserId(userId);
 
  const url = `/api/cart/${userId}`;
  assertCartPath(url);
 
  const res = await authApi.get(url);
  // debug: log raw response from backend for getCart
  // eslint-disable-next-line no-console
  console.log("cartApi.getCart -> url:", url, "data:", res?.data);
  return res?.data ?? {};
}
 
export async function upsertCartItem(userId, { productId, quantity } = {}) {
  ensureUserId(userId);
  if (!productId) throw new Error("Missing productId");
 
  const url = `/api/cart/${userId}/items`;
  assertCartPath(url);
 
  const body = { productId, quantity };
  const res = await authApi.post(url, body);
  return res?.data ?? {};
}
 
export async function removeCartItem(userId, productId) {
  ensureUserId(userId);
  if (!productId) throw new Error("Missing productId");
 
  const url = `/api/cart/${userId}/items/${productId}`;
  assertCartPath(url);
 
  const res = await authApi.delete(url);
  return res?.data ?? {};
}
 
export async function checkout(payload) {
  const url = "/api/cart/checkout";
  assertCartPath(url);
 
  const res = await authApi.post(url, payload);
  return res?.data ?? {};
}
 
export async function pay(payload) {
  const url = "/api/cart/pay";
  assertCartPath(url);
 
  const res = await authApi.post(url, payload);
  return res?.data ?? {};
}
