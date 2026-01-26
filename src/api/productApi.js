import apiClient from "./apiClient";

async function handleFetch(promise) {
  try {
    const res = await promise;
    return res.data === undefined ? {} : res.data;
  } catch (err) {
    const message =
      err?.response?.data?.message || err.message || "Request failed";
    const e = new Error(message);
    e.status = err?.response?.status;
    throw e;
  }
}

export async function getProductById(id) {
  return handleFetch(apiClient.get(`/api/catalog/public/products/${id}`));
}

export default { getProductById };
