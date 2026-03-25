import { authApi, publicApi } from "./httpClients";

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

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        const base64 = result.split(",")[1] || "";
        resolve(base64);
        return;
      }
      resolve("");
    };
    reader.onerror = () => reject(new Error("Không thể đọc tệp ảnh."));
    reader.readAsDataURL(file);
  });

export const uploadReviewImages = async (files = [], albumId) => {
  if (!files.length) return { albumId: albumId || undefined, items: [] };
  const images = await Promise.all(
    files.map(async (file) => {
      const base64 = await fileToBase64(file);
      return {
        base64,
        filename: file.name,
        contentType: file.type || "application/octet-stream",
      };
    }),
  );

  const payload = {
    albumId: albumId || undefined,
    images,
  };
  const data = await handleFetch(
    authApi.post("/api/media/drugs/base64", payload),
  );
  return {
    albumId: data?.albumId,
    items: data?.items || [],
  };
};

export const listProductReviews = async (productId, params = {}) =>
  handleFetch(publicApi.get(`/api/reviews/product/${productId}`, { params }));

export const getProductReviewSummary = async (productId) =>
  handleFetch(publicApi.get(`/api/reviews/product/${productId}/summary`));

export const createReview = async (payload) =>
  handleFetch(authApi.post("/api/reviews", payload));

export default {
  listProductReviews,
  getProductReviewSummary,
  uploadReviewImages,
  createReview,
};
