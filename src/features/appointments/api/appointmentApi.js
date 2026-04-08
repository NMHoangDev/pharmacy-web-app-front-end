import { authApi as apiClient } from "../../../shared/api/httpClients";

function ensureUserId(userId) {
  if (!userId) throw new Error("Missing userId");
}

function assertAppointmentsPath(url) {
  if (process.env.NODE_ENV !== "production") {
    if (!url || !String(url).includes("/api/appointments")) {
      // eslint-disable-next-line no-console
      console.warn(
        "[appointmentApi] URL does not contain /api/appointments:",
        url,
      );
    }
  }
}

export async function pingAppointments() {
  const url = "/api/appointments/ping";
  assertAppointmentsPath(url);
  const res = await apiClient.get(url);
  return res?.data ?? {};
}

function toLocalDateTimeString(input) {
  // input có thể là Date hoặc string
  if (!input) return input;

  if (input instanceof Date) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${input.getFullYear()}-${pad(input.getMonth() + 1)}-${pad(input.getDate())}T${pad(input.getHours())}:${pad(input.getMinutes())}:${pad(input.getSeconds())}`;
  }

  // string: bỏ ".sssZ" hoặc "+07:00"
  const s = String(input).trim();
  return s
    .replace(/Z$/, "")
    .replace(/\.\d+$/, "")
    .replace(/[+-]\d{2}:\d{2}$/, "");
}

export async function createAppointment(payload) {
  if (!payload) throw new Error("Missing payload");
  const { userId, pharmacistId, startAt, endAt } = payload;
  if (!userId) throw new Error("Missing userId");
  if (!pharmacistId) throw new Error("Missing pharmacistId");
  if (!startAt) throw new Error("Missing startAt");
  if (!endAt) throw new Error("Missing endAt");

  const body = {
    ...payload,
    startAt: toLocalDateTimeString(payload.startAt),
    endAt: toLocalDateTimeString(payload.endAt),
  };

  const url = "/api/appointments";
  assertAppointmentsPath(url);

  const res = await apiClient.post(url, body);
  return res?.data ?? {};
}

export async function listAppointmentsByUser(userId, page = 0, size = 10) {
  ensureUserId(userId);
  const url = `/api/appointments/user/${userId}?page=${page}&size=${size}`;
  assertAppointmentsPath(url);
  const res = await apiClient.get(url);
  return res?.data ?? {};
}

export async function listAppointmentsByPharmacist(
  pharmacistId,
  page = 0,
  size = 10,
) {
  if (!pharmacistId) throw new Error("Missing pharmacistId");
  const url = `/api/appointments/pharmacist/${pharmacistId}?page=${page}&size=${size}`;
  assertAppointmentsPath(url);
  const res = await apiClient.get(url);
  return res?.data ?? {};
}

export async function listAppointmentsByCurrentPharmacist(page = 0, size = 10) {
  const url = `/api/appointments/pharmacist/me?page=${page}&size=${size}`;
  assertAppointmentsPath(url);
  const res = await apiClient.get(url);
  return res?.data ?? {};
}

export async function getAppointment(id) {
  if (!id) throw new Error("Missing appointment id");
  const url = `/api/appointments/${id}`;
  assertAppointmentsPath(url);
  const res = await apiClient.get(url);
  return res?.data ?? {};
}

export async function confirmAppointment(id) {
  if (!id) throw new Error("Missing appointment id");
  const url = `/api/appointments/${id}/confirm`;
  assertAppointmentsPath(url);
  const res = await apiClient.post(url);
  return res?.data ?? {};
}

export async function cancelAppointment(id, reason) {
  if (!id) throw new Error("Missing appointment id");
  const url = `/api/appointments/${id}/cancel`;
  assertAppointmentsPath(url);
  const payload = {
    reason:
      String(reason || "").trim() ||
      "Dược sĩ từ chối lịch hẹn trong thời điểm hiện tại.",
  };
  const res = await apiClient.post(url, payload);
  return res?.data ?? {};
}

export async function getOrCreateSession(appointmentId, type = "VIDEO") {
  if (!appointmentId) throw new Error("Missing appointmentId");
  const url = `/api/appointments/${appointmentId}/session`;
  const res = await apiClient.post(url, { type });
  return res?.data ?? {};
}

export async function joinSession(roomId) {
  if (!roomId) throw new Error("Missing roomId");
  const url = `/api/consultations/${roomId}/join`;
  const res = await apiClient.post(url);
  return res?.data ?? {};
}

export async function leaveSession(roomId) {
  if (!roomId) throw new Error("Missing roomId");
  const url = `/api/consultations/${roomId}/leave`;
  const res = await apiClient.post(url);
  return res?.data ?? {};
}

export async function endSession(roomId, messageIds = []) {
  if (!roomId) throw new Error("Missing roomId");
  const url = `/api/consultations/${roomId}/end`;
  const payload = { messageIds: Array.isArray(messageIds) ? messageIds : [] };
  const res = await apiClient.post(url, payload);
  return res?.data ?? {};
}

export async function updateConsultationNotes(appointmentId, notes) {
  if (!appointmentId) throw new Error("Missing appointmentId");
  const url = `/api/consultations/${appointmentId}/notes`;
  const res = await apiClient.put(url, { notes });
  return res?.data ?? {};
}

export async function getChatHistory(appointmentId, limit = 50) {
  if (!appointmentId) throw new Error("Missing appointmentId");
  const url = `/api/appointments/${appointmentId}/messages?limit=${limit}`;
  const res = await apiClient.get(url);
  return res?.data ?? [];
}

export async function sendChatMessage(appointmentId, content, note = null) {
  if (!appointmentId) throw new Error("Missing appointmentId");
  const body = { content, note };
  const url = `/api/appointments/${appointmentId}/messages`;
  const res = await apiClient.post(url, body);
  return res?.data ?? null;
}

export async function searchConsultationPrescriptionProducts(
  appointmentId,
  params = {},
) {
  if (!appointmentId) throw new Error("Missing appointmentId");
  const url = `/api/consultations/${appointmentId}/prescription/products`;
  const res = await apiClient.get(url, { params });
  return res?.data ?? {};
}

export async function createConsultationPrescriptionOrder(
  appointmentId,
  payload,
) {
  if (!appointmentId) throw new Error("Missing appointmentId");
  const url = `/api/consultations/${appointmentId}/prescription/orders`;
  const res = await apiClient.post(url, payload || {});
  return res?.data ?? {};
}

const appointmentApi = {
  pingAppointments,
  createAppointment,
  listAppointmentsByUser,
  listAppointmentsByPharmacist,
  listAppointmentsByCurrentPharmacist,
  getAppointment,
  confirmAppointment,
  cancelAppointment,
  getOrCreateSession,
  joinSession,
  leaveSession,
  endSession,
  updateConsultationNotes,
  getChatHistory,
  sendChatMessage,
  searchConsultationPrescriptionProducts,
  createConsultationPrescriptionOrder,
};

export default appointmentApi;
