import { authApi } from "./httpClients";

const handleFetch = async (promise) => {
  try {
    const res = await promise;
    return res?.data ?? {};
  } catch (err) {
    const message =
      err?.response?.data?.message || err.message || "Request failed";
    const error = new Error(message);
    error.status = err?.response?.status;
    throw error;
  }
};

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

const adminUserApi = {
  getUserStats,
};

export default adminUserApi;
