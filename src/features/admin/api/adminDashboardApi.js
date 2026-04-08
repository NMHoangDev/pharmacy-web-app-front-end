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

export const getDashboardAnalytics = async ({
  range,
  branchId,
  signal,
} = {}) => {
  const params = {};
  if (range) params.range = range;
  if (branchId) params.branchId = branchId;
  return handleFetch(
    authApi.get("/api/admin/dashboard/analytics", { params, signal }),
  );
};

const adminDashboardApi = {
  getDashboardAnalytics,
};

export default adminDashboardApi;
