import { authApi } from "../../../shared/api/httpClients";

const handleFetch = async (promise) => {
  try {
    const res = await promise;
    return res?.data ?? {};
  } catch (err) {
    const message =
      err?.response?.data?.message || err.message || "Request failed";
    const e = new Error(message);
    e.status = err?.response?.status;
    throw e;
  }
};

export const searchPosProducts = async (params = {}) =>
  handleFetch(authApi.get("/api/pharmacists/pos/products/search", { params }));

export const createOfflinePosOrder = async (payload) =>
  handleFetch(authApi.post("/api/pharmacists/pos/orders", payload));

export const listOfflinePosOrders = async (params = {}) =>
  handleFetch(authApi.get("/api/pharmacists/pos/orders", { params }));

export const getOfflinePosOrder = async (orderId) =>
  handleFetch(authApi.get(`/api/pharmacists/pos/orders/${orderId}`));

export const confirmOfflinePosPayment = async (orderId, payload) =>
  handleFetch(
    authApi.post(`/api/pharmacists/pos/orders/${orderId}/pay`, payload),
  );

export const cancelOfflinePosOrder = async (orderId, payload) =>
  handleFetch(
    authApi.post(`/api/pharmacists/pos/orders/${orderId}/cancel`, payload),
  );

export const refundOfflinePosOrder = async (orderId, payload) =>
  handleFetch(
    authApi.post(`/api/pharmacists/pos/orders/${orderId}/refund`, payload),
  );

export const getOfflinePosReceipt = async (orderId) =>
  handleFetch(authApi.get(`/api/pharmacists/pos/orders/${orderId}/receipt`));

const pharmacistPosApi = {
  searchPosProducts,
  createOfflinePosOrder,
  listOfflinePosOrders,
  getOfflinePosOrder,
  confirmOfflinePosPayment,
  cancelOfflinePosOrder,
  refundOfflinePosOrder,
  getOfflinePosReceipt,
};

export default pharmacistPosApi;
