import { authApi } from "./httpClients";

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

export const listAdminReviews = async (params = {}) =>
  handleFetch(authApi.get("/api/reviews/internal", { params }));

export const getAdminReviewStats = async () =>
  handleFetch(authApi.get("/api/reviews/internal/stats"));

export const updateReviewStatus = async (id, status) =>
  handleFetch(authApi.put(`/api/reviews/internal/${id}/status`, { status }));

export const replyReview = async (id, content) =>
  handleFetch(authApi.post(`/api/reviews/internal/${id}/reply`, { content }));

export const deleteReview = async (id) =>
  handleFetch(authApi.delete(`/api/reviews/${id}`));

export const exportReviews = async (params = {}) =>
  authApi.get("/api/reviews/internal/export", {
    params,
    responseType: "blob",
  });

export default {
  listAdminReviews,
  getAdminReviewStats,
  updateReviewStatus,
  replyReview,
  deleteReview,
  exportReviews,
};
