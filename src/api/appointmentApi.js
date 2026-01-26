import apiClient from "./apiClient";

function ensureUserId(userId) {
  if (!userId) throw new Error("Missing userId");
}

function getAuthToken() {
  const token = sessionStorage.getItem("authToken");
  if (!token || String(token).trim().length === 0) {
    throw new Error("Missing auth token. Please login.");
  }
  const authToken = `Bearer ${token}`;
  console.log(authToken);
  return String(authToken).trim();
}

function authHeaders() {
  const raw = getAuthToken();
  const normalized = raw.toLowerCase().startsWith("bearer ")
    ? raw
    : `Bearer ${raw}`;
  return { Authorization: normalized };
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
  console.log(payload);
  const url = "/api/appointments";
  assertAppointmentsPath(url);

  const res = await apiClient.post(url, body, { headers: authHeaders() });
  console.log(payload);
  return res?.data ?? {};
}

export async function listAppointmentsByUser(userId, page = 0, size = 10) {
  ensureUserId(userId);
  const url = `/api/appointments/user/${userId}?page=${page}&size=${size}`;
  assertAppointmentsPath(url);
  const res = await apiClient.get(url, { headers: authHeaders() });
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
  const res = await apiClient.get(url, { headers: authHeaders() });
  return res?.data ?? {};
}

export async function getAppointment(id) {
  if (!id) throw new Error("Missing appointment id");
  const url = `/api/appointments/${id}`;
  assertAppointmentsPath(url);
  const res = await apiClient.get(url, { headers: authHeaders() });
  return res?.data ?? {};
}

export async function confirmAppointment(id) {
  if (!id) throw new Error("Missing appointment id");
  const url = `/api/appointments/${id}/confirm`;
  assertAppointmentsPath(url);
  const res = await apiClient.post(url, null, { headers: authHeaders() });
  return res?.data ?? {};
}

export async function cancelAppointment(id) {
  if (!id) throw new Error("Missing appointment id");
  const url = `/api/appointments/${id}/cancel`;
  assertAppointmentsPath(url);
  const res = await apiClient.post(url, null, { headers: authHeaders() });
  return res?.data ?? {};
}

export default {
  pingAppointments,
  createAppointment,
  listAppointmentsByUser,
  listAppointmentsByPharmacist,
  getAppointment,
  confirmAppointment,
  cancelAppointment,
};
