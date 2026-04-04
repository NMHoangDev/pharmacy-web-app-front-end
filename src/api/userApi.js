import { authApi } from "./httpClients";

export async function getUser(userId) {
  if (!userId) throw new Error("Missing userId");
  const res = await authApi.get(`/api/users/${userId}`);
  return res?.data ?? {};
}

export async function listAddresses(userId) {
  if (!userId) throw new Error("Missing userId");
  const res = await authApi.get(`/api/users/${userId}/addresses`);
  return res?.data ?? [];
}

export async function addAddress(userId, payload, context = {}) {
  if (!userId) throw new Error("Missing userId");
  try {
    if (process.env.NODE_ENV !== "production") {
      console.debug("[userApi.addAddress] request", {
        userId,
        selectedAddressId: context?.selectedAddressId || "",
        payload,
      });
    }
    const res = await authApi.post(`/api/users/${userId}/addresses`, payload);
    if (process.env.NODE_ENV !== "production") {
      console.debug("[userApi.addAddress] response", {
        userId,
        selectedAddressId: context?.selectedAddressId || "",
        data: res?.data,
      });
    }
    return res?.data ?? {};
  } catch (error) {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const message = data?.message || error?.message || "Failed to save address";

    console.error("[userApi.addAddress] failed", {
      status,
      message,
      userId,
      selectedAddressId: context?.selectedAddressId || "",
      response: data,
      payload,
    });

    const wrapped = new Error(message);
    wrapped.status = status;
    wrapped.response = data;
    throw wrapped;
  }
}

const userApi = {
  getUser,
  listAddresses,
  addAddress,
};

export default userApi;
