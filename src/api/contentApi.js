import { authApi, publicApi } from "./httpClients";

function logContentApiError(scope, err) {
  if (process.env.NODE_ENV === "production") return;
  const status = err?.response?.status || err?.status || "NO_STATUS";
  const method = String(err?.config?.method || "GET").toUpperCase();
  const url = err?.config?.url || "UNKNOWN_URL";
  console.error(
    `[contentApi] ${scope} failed: ${method} ${url} -> ${status}`,
    err?.response?.data || err?.message || err,
  );
}

async function handleFetch(scope, promise) {
  try {
    const res = await promise;
    return res.data === undefined ? {} : res.data;
  } catch (err) {
    logContentApiError(scope, err);
    const message =
      err?.response?.data?.message || err.message || "Request failed";
    const e = new Error(message);
    e.status = err?.response?.status;
    throw e;
  }
}

// ── Public (không cần token) ──────────────────────────────────────────────────

export function getPosts(params = {}) {
  return handleFetch(
    "getPosts",
    publicApi.get("/api/content/public/posts", { params }),
  );
}

export function getPostBySlug(slug) {
  return handleFetch(
    "getPostBySlug",
    publicApi.get(`/api/content/public/posts/${slug}`),
  );
}

export function incrementPostView(id) {
  return handleFetch(
    "incrementPostView",
    publicApi.post(`/api/content/posts/${id}/view`),
  );
}

export function getQuestions(params = {}) {
  return handleFetch(
    "getQuestions",
    publicApi.get("/api/content/questions", { params }),
  );
}

export function getQuestionBySlug(slug, params = {}) {
  return handleFetch(
    "getQuestionBySlug",
    publicApi.get(`/api/content/questions/${slug}`, { params }),
  );
}

export function getTags(params = {}) {
  return handleFetch("getTags", publicApi.get("/api/content/tags", { params }));
}

export function getUserQuestions(userId, params = {}) {
  if (!userId) return Promise.resolve({ items: [], pagination: null });
  return getQuestions({ ...params, askerId: userId });
}

// ── Authenticated (cần token) ─────────────────────────────────────────────────

export function getAdminPosts(params = {}) {
  return handleFetch(
    "getAdminPosts",
    authApi.get("/api/content/admin/posts", { params }),
  );
}

export function getAdminPostBySlug(slug) {
  return handleFetch(
    "getAdminPostBySlug",
    authApi.get(`/api/content/admin/posts/${slug}`),
  );
}

export function getAdminQuestions(params = {}) {
  return handleFetch(
    "getAdminQuestions",
    authApi.get("/api/content/admin/questions", { params }),
  );
}

export function createQuestion(payload) {
  return handleFetch(
    "createQuestion",
    authApi.post("/api/content/questions", payload),
  );
}

export function createPost(payload) {
  return handleFetch("createPost", authApi.post("/api/content/posts", payload));
}

export function updatePost(id, payload) {
  return handleFetch(
    "updatePost",
    authApi.put(`/api/content/posts/${id}`, payload),
  );
}

export function publishPost(id) {
  return handleFetch(
    "publishPost",
    authApi.post(`/api/content/posts/${id}/publish`),
  );
}

export function unpublishPost(id) {
  return handleFetch(
    "unpublishPost",
    authApi.post(`/api/content/posts/${id}/unpublish`),
  );
}

export function deletePost(id) {
  return handleFetch(
    "deletePost",
    authApi.post(`/api/content/posts/${id}/delete`),
  );
}

export function createAnswer(threadId, payload) {
  return handleFetch(
    "createAnswer",
    authApi.post(`/api/content/questions/${threadId}/answers`, payload),
  );
}

export function voteAnswer(answerId, value) {
  return handleFetch(
    "voteAnswer",
    authApi.post(`/api/content/answers/${answerId}/vote`, { value }),
  );
}

export function createTag(payload) {
  return handleFetch("createTag", authApi.post("/api/content/tags", payload));
}

export function moderationQueue() {
  return handleFetch(
    "moderationQueue",
    authApi.get("/api/content/moderation/queue"),
  );
}

export function approveModeration(targetType, id) {
  return handleFetch(
    "approveModeration",
    authApi.post(`/api/content/moderation/${targetType}/${id}/approve`),
  );
}

export function rejectModeration(targetType, id, reason) {
  return handleFetch(
    "rejectModeration",
    authApi.post(`/api/content/moderation/${targetType}/${id}/reject`, {
      reason,
    }),
  );
}

export function hideModeration(targetType, id, reason) {
  return handleFetch(
    "hideModeration",
    authApi.post(`/api/content/moderation/${targetType}/${id}/hide`, {
      reason,
    }),
  );
}

export function generateProductPrDraft(payload) {
  return handleFetch(
    "generateProductPrDraft",
    authApi.post("/api/chat/admin/product-pr", payload),
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
    "uploadMediaImage",
    authApi.post("/api/media/drugs/base64", payload),
  );
  const item = data?.items?.[0];
  return {
    albumId: data?.albumId,
    url: item?.url || item?.presignedUrl || "",
    key: item?.key,
    bucket: item?.bucket,
  };
}

const contentApi = {
  getPosts,
  getAdminPosts,
  getPostBySlug,
  getAdminPostBySlug,
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
  createTag,
  moderationQueue,
  approveModeration,
  rejectModeration,
  hideModeration,
  generateProductPrDraft,
  uploadMediaImage,
};

export default contentApi;
