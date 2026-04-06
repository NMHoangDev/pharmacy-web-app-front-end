import { authApi } from "./httpClients";
import { isUuid } from "./client";

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

export const listCatalogProducts = async (params = {}) =>
  handleFetch(authApi.get("/api/catalog/internal/products", { params }));

export const listCatalogCategories = async () =>
  handleFetch(authApi.get("/api/catalog/internal/categories"));

export const createCatalogProduct = async (payload) =>
  handleFetch(authApi.post("/api/catalog/internal/products", payload));

export const updateCatalogProduct = async (productId, payload) =>
  handleFetch(
    authApi.put(`/api/catalog/internal/products/${productId}`, payload),
  );

export const upsertCatalogBranchSetting = async (productId, payload) =>
  handleFetch(
    authApi.put(
      `/api/catalog/internal/products/${productId}/branch-settings`,
      payload,
    ),
  );

export const deleteCatalogBranchSetting = async (productId, branchId) => {
  const config = isUuid(branchId) ? { params: { branchId } } : undefined;
  return handleFetch(
    authApi.delete(
      `/api/catalog/internal/products/${productId}/branch-settings`,
      config,
    ),
  );
};

export const deleteCatalogProduct = async (productId) =>
  handleFetch(authApi.delete(`/api/catalog/internal/products/${productId}`));

export const getInventoryAvailability = async (productIds = [], branchId) => {
  if (!productIds.length) return { items: [] };
  const params = { productIds: productIds.join(",") };
  if (isUuid(branchId)) params.branchId = branchId;
  return handleFetch(
    authApi.get("/api/inventory/internal/inventory/availability", { params }),
  );
};

export const getInventoryAvailabilityBatch = async (
  productIds = [],
  branchIds = [],
) => {
  if (!productIds.length) return { items: [] };
  const validBranchIds = (branchIds || []).filter((id) => isUuid(id));
  return handleFetch(
    authApi.post("/api/inventory/internal/inventory/availability/batch", {
      branchIds: validBranchIds,
      items: productIds.map((productId) => ({
        productId,
        qty: 1,
      })),
    }),
  );
};

export const adjustInventory = async (productId, delta, reason, branchId) =>
  handleFetch(
    authApi.post("/api/inventory/internal/inventory/adjust", {
      productId,
      delta,
      reason,
      ...(isUuid(branchId) ? { branchId } : {}),
    }),
  );

export const deleteInventoryItem = async (productId, branchId) => {
  const config = isUuid(branchId) ? { params: { branchId } } : undefined;
  return handleFetch(
    authApi.delete(`/api/inventory/internal/inventory/${productId}`, config),
  );
};

export const listInventoryActivities = async (params = {}) => {
  const { branchId, ...rest } = params || {};
  const finalParams = { ...rest };
  if (isUuid(branchId)) finalParams.branchId = branchId;
  return handleFetch(
    authApi.get("/api/inventory/internal/inventory/activities", {
      params: finalParams,
    }),
  );
};

export const createStockDocument = async (payload) =>
  handleFetch(authApi.post("/api/inventory/admin/stock-documents", payload));

export const submitStockDocument = async (docId, actor) =>
  handleFetch(
    authApi.post(`/api/inventory/admin/stock-documents/${docId}/submit`, {
      actor,
    }),
  );

export const approveStockDocument = async (docId, actor) =>
  handleFetch(
    authApi.post(`/api/inventory/admin/stock-documents/${docId}/approve`, {
      actor,
    }),
  );

export const exportStockReport = async (params = {}) => {
  const response = await authApi.get(
    "/api/inventory/admin/reports/stock/export",
    {
      params,
      responseType: "blob",
    },
  );
  return response;
};

const adminInventoryApi = {
  listCatalogProducts,
  listCatalogCategories,
  createCatalogProduct,
  updateCatalogProduct,
  upsertCatalogBranchSetting,
  deleteCatalogBranchSetting,
  deleteCatalogProduct,
  getInventoryAvailability,
  getInventoryAvailabilityBatch,
  adjustInventory,
  deleteInventoryItem,
  listInventoryActivities,
  createStockDocument,
  submitStockDocument,
  approveStockDocument,
  exportStockReport,
};

export default adminInventoryApi;
