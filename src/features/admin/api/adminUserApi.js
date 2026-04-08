import { authApi } from "../../../shared/api/httpClients";

export const getUserStats = async (params = {}) => {
  const res = await authApi.get("/api/admin/users/stats", { params });
  const cacheStatus = String(res?.headers?.["x-cache"] || "UNKNOWN");

  console.log("[admin users stats] cache:", cacheStatus, "params:", params);

  const data = res?.data ?? {};
  if (data && typeof data === "object") {
    return { ...data, __cacheStatus: cacheStatus };
  }
  return data;
};

export const getAdminUserIdentityList = async () => {
  const res = await authApi.get("/api/auth/admin/users/identity");
  return Array.isArray(res?.data) ? res.data : [];
};

export const assignAdminUserRole = async (userId, role) => {
  const res = await authApi.put(`/api/auth/admin/users/${userId}/role`, {
    role,
  });
  return res?.data ?? null;
};

const adminUserApi = {
  getUserStats,
  getAdminUserIdentityList,
  assignAdminUserRole,
};

export default adminUserApi;
