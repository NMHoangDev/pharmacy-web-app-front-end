import { authApi, publicApi } from "./httpClients";
import { getAccessToken, hasAnyRole, isTokenExpired } from "../utils/auth";

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

export function getPosts(params = {}) {
  return handleFetch(publicApi.get("/api/content/posts", { params }));
}

export function getAdminPosts(params = {}) {
  return handleFetch(authApi.get("/api/content/posts", { params }));
}

export function getPostBySlug(slug) {
  const token = getAccessToken();
  const isAdminViewer =
    token &&
    !isTokenExpired(token) &&
    hasAnyRole(token, ["ADMIN", "MOD", "EDITOR"]);
  const client = isAdminViewer ? authApi : publicApi;
  return handleFetch(client.get(`/api/content/posts/${slug}`));
}

export function incrementPostView(id) {
  return handleFetch(publicApi.post(`/api/content/posts/${id}/view`));
}

export function getQuestions(params = {}) {
  const token = getAccessToken();
  const client = token && !isTokenExpired(token) ? authApi : publicApi;
  return handleFetch(client.get("/api/content/questions", { params }));
}

export function getAdminQuestions(params = {}) {
  return handleFetch(authApi.get("/api/content/questions", { params }));
}

export function getUserQuestions(userId, params = {}) {
  if (!userId) return Promise.resolve({ items: [], pagination: null });
  return getQuestions({ ...params, askerId: userId });
}

export function getQuestionBySlug(slug, params = {}) {
  const token = getAccessToken();
  const client = token && !isTokenExpired(token) ? authApi : publicApi;
  return handleFetch(client.get(`/api/content/questions/${slug}`, { params }));
}

export function createQuestion(payload) {
  return handleFetch(authApi.post("/api/content/questions", payload));
}

export function createPost(payload) {
  return handleFetch(authApi.post("/api/content/posts", payload));
}

export function updatePost(id, payload) {
  return handleFetch(authApi.put(`/api/content/posts/${id}`, payload));
}

export function publishPost(id) {
  return handleFetch(authApi.post(`/api/content/posts/${id}/publish`));
}

export function unpublishPost(id) {
  return handleFetch(authApi.post(`/api/content/posts/${id}/unpublish`));
}

export function deletePost(id) {
  return handleFetch(authApi.post(`/api/content/posts/${id}/delete`));
}

export function createAnswer(threadId, payload) {
  return handleFetch(
    authApi.post(`/api/content/questions/${threadId}/answers`, payload),
  );
}

export function voteAnswer(answerId, value) {
  return handleFetch(
    authApi.post(`/api/content/answers/${answerId}/vote`, { value }),
  );
}

export function getTags(params = {}) {
  return handleFetch(publicApi.get("/api/content/tags", { params }));
}

export function moderationQueue() {
  return handleFetch(authApi.get("/api/content/moderation/queue"));
}

export function approveModeration(targetType, id) {
  return handleFetch(
    authApi.post(`/api/content/moderation/${targetType}/${id}/approve`),
  );
}

export function rejectModeration(targetType, id, reason) {
  return handleFetch(
    authApi.post(`/api/content/moderation/${targetType}/${id}/reject`, {
      reason,
    }),
  );
}

export function hideModeration(targetType, id, reason) {
  return handleFetch(
    authApi.post(`/api/content/moderation/${targetType}/${id}/hide`, {
      reason,
    }),
  );
}

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
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
}

export async function uploadMediaImage(file, albumId) {
  if (!file) throw new Error("Vui lòng chọn ảnh.");
  const base64 = await fileToBase64(file);
  if (!base64) throw new Error("Không thể đọc dữ liệu ảnh.");
  const payload = {
    albumId: albumId || undefined,
    images: [
      {
        base64,
        filename: file.name,
        contentType: file.type || "application/octet-stream",
      },
    ],
  };
  const data = await handleFetch(
    authApi.post("/api/media/drugs/base64", payload),
  );
  const item = data?.items?.[0];
  return {
    albumId: data?.albumId,
    url: item?.presignedUrl || item?.url || "",
    key: item?.key,
    bucket: item?.bucket,
  };
}

export default {
  getPosts,
  getAdminPosts,
  getPostBySlug,
  incrementPostView,
  getQuestions,
  getAdminQuestions,
  getUserQuestions,
  getQuestionBySlug,
  createQuestion,
  createPost,
  updatePost,
  publishPost,
  unpublishPost,
  deletePost,
  createAnswer,
  voteAnswer,
  getTags,
  moderationQueue,
  approveModeration,
  rejectModeration,
  hideModeration,
  uploadMediaImage,
};
