import { publicApi } from "./httpClients";

const handleFetch = async (promise) => {
  try {
    const res = await promise;
    return res?.data;
  } catch (err) {
    const message =
      err?.response?.data?.message || err.message || "Request failed";
    const e = new Error(message);
    e.status = err?.response?.status;
    throw e;
  }
};

export const listActiveBranches = async (options = {}) => {
  const { signal } = options;
  const data = await handleFetch(publicApi.get("/api/branches", { signal }));

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

const branchApi = {
  listActiveBranches,
};

export default branchApi;
