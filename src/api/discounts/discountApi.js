import { authApi as api } from "../httpClients";

export const discountApi = {
  async list() {
    const res = await api.get("/admin/discounts/list");
    return Array.isArray(res.data) ? res.data : [];
  },

  async create(payload) {
    const res = await api.post("/admin/discounts/create", payload);
    return res.data;
  },

  async update(id, payload) {
    const res = await api.put(`/admin/discounts/update/${id}`, payload);
    return res.data;
  },

  async remove(id) {
    await api.delete(`/admin/discounts/${id}`);
    return true;
  },

  async toggleStatus(id, status) {
    const res = await api.patch("/admin/discounts/toggle-status", {
      id,
      status,
    });
    return res.data;
  },
};
