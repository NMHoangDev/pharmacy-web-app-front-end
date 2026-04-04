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

export const getMedicineStats = async (params = {}) =>
  handleFetch(authApi.get("/api/admin/medicines/stats", { params }));

const adminMedicineApi = {
  getMedicineStats,
};

export default adminMedicineApi;
