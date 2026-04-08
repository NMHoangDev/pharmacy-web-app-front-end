import { authApi, publicApi } from "../../../shared/api/httpClients";
import { isUuid } from "../../../shared/api/client";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const handleFetch = async (promiseFactory, attempt = 0) => {
  try {
    const res = await promiseFactory();
    return res?.data;
  } catch (err) {
    const status = err?.response?.status;
    if ((status === 504 || status === 503) && attempt < 1) {
      await sleep(400);
      return handleFetch(promiseFactory, attempt + 1);
    }
    const message =
      err?.response?.data?.message || err.message || "Request failed";
    const e = new Error(message);
    e.status = status;
    e.body = err?.response?.data;
    throw e;
  }
};

export const listPublicBranches = async (options = {}) => {
  const { signal } = options;
  const data = await handleFetch(() =>
    publicApi.get("/api/branches", { signal }),
  );
  if (Array.isArray(data)) return data;
  return data?.content || data?.items || [];
};

export const getPublicBranchDetail = async (branchId, options = {}) => {
  const { signal } = options;
  if (!isUuid(String(branchId))) throw new Error("Invalid branchId");
  return handleFetch(() =>
    publicApi.get(`/api/branches/${branchId}`, { signal }),
  );
};

export const listAdminBranches = async (params = {}, options = {}) => {
  const { signal } = options;
  return handleFetch(() =>
    authApi.get("/api/admin/branches", { params, signal }),
  );
};

export const getAdminBranch = async (branchId, options = {}) => {
  const { signal } = options;
  if (!isUuid(String(branchId))) throw new Error("Invalid branchId");
  return handleFetch(() =>
    authApi.get(`/api/admin/branches/${branchId}`, { signal }),
  );
};

export const createBranch = async (payload, actor) =>
  handleFetch(() =>
    authApi.post("/api/admin/branches", payload, {
      params: actor ? { actor } : undefined,
    }),
  );

export const updateBranch = async (branchId, payload, actor) => {
  if (!isUuid(String(branchId))) throw new Error("Invalid branchId");
  return handleFetch(() =>
    authApi.put(`/api/admin/branches/${branchId}`, payload, {
      params: actor ? { actor } : undefined,
    }),
  );
};

export const updateBranchStatus = async (branchId, status, actor) => {
  if (!isUuid(String(branchId))) throw new Error("Invalid branchId");
  return handleFetch(() =>
    authApi.patch(
      `/api/admin/branches/${branchId}/status`,
      { status },
      { params: actor ? { actor } : undefined },
    ),
  );
};

export const upsertBranchSettings = async (branchId, payload, actor) => {
  if (!isUuid(String(branchId))) throw new Error("Invalid branchId");
  return handleFetch(() =>
    authApi.put(`/api/admin/branches/${branchId}/settings`, payload, {
      params: actor ? { actor } : undefined,
    }),
  );
};

export const getBranchSettings = async (branchId, options = {}) => {
  const { signal } = options;
  if (!isUuid(String(branchId))) throw new Error("Invalid branchId");
  return handleFetch(() =>
    authApi.get(`/api/admin/branches/${branchId}/settings`, { signal }),
  );
};

export const upsertBranchHours = async (branchId, payload, actor) => {
  if (!isUuid(String(branchId))) throw new Error("Invalid branchId");
  return handleFetch(() =>
    authApi.put(`/api/admin/branches/${branchId}/hours`, payload, {
      params: actor ? { actor } : undefined,
    }),
  );
};

export const getBranchHours = async (branchId, options = {}) => {
  const { signal } = options;
  if (!isUuid(String(branchId))) throw new Error("Invalid branchId");
  return handleFetch(() =>
    authApi.get(`/api/admin/branches/${branchId}/hours`, { signal }),
  );
};

export const listBranchHolidays = async (branchId, options = {}) => {
  const { signal } = options;
  if (!isUuid(String(branchId))) throw new Error("Invalid branchId");
  return handleFetch(() =>
    authApi.get(`/api/admin/branches/${branchId}/holidays`, { signal }),
  );
};

export const addBranchHoliday = async (branchId, payload, actor) => {
  if (!isUuid(String(branchId))) throw new Error("Invalid branchId");
  return handleFetch(() =>
    authApi.post(`/api/admin/branches/${branchId}/holidays`, payload, {
      params: actor ? { actor } : undefined,
    }),
  );
};

export const deleteBranchHoliday = async (branchId, holidayId, actor) => {
  if (!isUuid(String(branchId))) throw new Error("Invalid branchId");
  if (!isUuid(String(holidayId))) throw new Error("Invalid holidayId");
  return handleFetch(() =>
    authApi.delete(`/api/admin/branches/${branchId}/holidays/${holidayId}`, {
      params: actor ? { actor } : undefined,
    }),
  );
};

export const listBranchStaff = async (branchId, options = {}) => {
  const { signal } = options;
  if (!isUuid(String(branchId))) throw new Error("Invalid branchId");
  return handleFetch(() =>
    authApi.get(`/api/admin/branches/${branchId}/staff`, { signal }),
  );
};

export const assignBranchStaff = async (branchId, payload, actor) => {
  if (!isUuid(String(branchId))) throw new Error("Invalid branchId");
  return handleFetch(() =>
    authApi.post(`/api/admin/branches/${branchId}/staff`, payload, {
      params: actor ? { actor } : undefined,
    }),
  );
};

export const removeBranchStaff = async (branchId, userId, actor) => {
  if (!isUuid(String(branchId))) throw new Error("Invalid branchId");
  if (!isUuid(String(userId))) throw new Error("Invalid userId");
  return handleFetch(() =>
    authApi.delete(`/api/admin/branches/${branchId}/staff/${userId}`, {
      params: actor ? { actor } : undefined,
    }),
  );
};

export const listBranchAudit = async (branchId, options = {}) => {
  const { signal } = options;
  if (!isUuid(String(branchId))) throw new Error("Invalid branchId");
  return handleFetch(() =>
    authApi.get(`/api/admin/branches/${branchId}/audit`, { signal }),
  );
};

const adminBranchApi = {
  listPublicBranches,
  getPublicBranchDetail,
  listAdminBranches,
  getAdminBranch,
  createBranch,
  updateBranch,
  updateBranchStatus,
  getBranchSettings,
  upsertBranchSettings,
  getBranchHours,
  upsertBranchHours,
  listBranchHolidays,
  addBranchHoliday,
  deleteBranchHoliday,
  listBranchStaff,
  assignBranchStaff,
  removeBranchStaff,
  listBranchAudit,
};

export default adminBranchApi;
