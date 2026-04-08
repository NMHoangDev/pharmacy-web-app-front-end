import { authApi, publicApi } from "../../../shared/api/httpClients";

const toError = (err) => {
  const message =
    err?.response?.data?.message || err?.message || "Request failed";
  const next = new Error(message);
  next.status = err?.response?.status || err?.status;
  next.body = err?.response?.data;
  return next;
};

const unwrap = async (promise) => {
  try {
    const response = await promise;
    return response?.data ?? {};
  } catch (err) {
    throw toError(err);
  }
};

export const listPublicPharmacists = (params = {}) =>
  unwrap(publicApi.get("/api/pharmacists", { params }));

export const listOnlinePharmacists = (params = {}) =>
  unwrap(publicApi.get("/api/pharmacists/online", { params }));

export const getPublicPharmacist = (id) =>
  unwrap(publicApi.get(`/api/pharmacists/${id}`));

export const getMyPharmacistProfile = () =>
  unwrap(authApi.get("/api/pharmacists/me"));

export const updateMyPharmacistProfile = (payload) =>
  unwrap(authApi.put("/api/pharmacists/me", payload));

export const getAdminPharmacist = (id) =>
  unwrap(authApi.get(`/api/admin/pharmacists/${id}`));

export const updateAdminPharmacist = (id, payload) =>
  unwrap(authApi.put(`/api/admin/pharmacists/${id}`, payload));

const pharmacistApi = {
  listPublicPharmacists,
  listOnlinePharmacists,
  getPublicPharmacist,
  getMyPharmacistProfile,
  updateMyPharmacistProfile,
  getAdminPharmacist,
  updateAdminPharmacist,
};

export default pharmacistApi;
