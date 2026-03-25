import { authApi as apiClient } from "./httpClients";
import { isUuid } from "./client";

const ensureId = (id, name = "id") => {
  if (!id) throw new Error(`Missing ${name}`);
};

const toLocalDateTimeString = (value) => {
  if (!value) return null;
  if (typeof value === "string") {
    if (value.length === 16) return `${value}:00`;
    return value;
  }
  const pad = (n) => String(n).padStart(2, "0");
  const year = value.getFullYear();
  const month = pad(value.getMonth() + 1);
  const day = pad(value.getDate());
  const hours = pad(value.getHours());
  const minutes = pad(value.getMinutes());
  const seconds = pad(value.getSeconds());
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

export async function listAppointmentsByUser(userId, page = 0, size = 10) {
  ensureId(userId, "userId");
  const url = `/api/appointments/user/${userId}?page=${page}&size=${size}`;
  const res = await apiClient.get(url);
  return res?.data ?? {};
}

export async function listAppointmentsByDate(date, branchId) {
  if (!date) throw new Error("Missing date");
  const params = new URLSearchParams({ date: String(date) });
  if (isUuid(branchId)) params.set("branchId", branchId);
  const url = `/api/admin/appointments?${params.toString()}`;
  const res = await apiClient.get(url);
  return res?.data ?? [];
}

export async function listAppointmentsByPharmacist(
  pharmacistId,
  page = 0,
  size = 10,
) {
  ensureId(pharmacistId, "pharmacistId");
  const url = `/api/appointments/pharmacist/${pharmacistId}?page=${page}&size=${size}`;
  const res = await apiClient.get(url);
  return res?.data ?? {};
}

export async function getAppointment(id) {
  ensureId(id);
  const res = await apiClient.get(`/api/appointments/${id}`);
  return res?.data ?? {};
}

export async function updateAppointmentStatus(id, status, reason) {
  ensureId(id);
  const res = await apiClient.post(`/api/admin/appointments/${id}/status`, {
    status,
    reason,
  });
  return res?.data ?? {};
}

export async function assignAppointment(id, pharmacistId, reason) {
  ensureId(id);
  ensureId(pharmacistId, "pharmacistId");
  const res = await apiClient.post(`/api/admin/appointments/${id}/assign`, {
    pharmacistId,
    reason,
  });
  return res?.data ?? {};
}

export async function autoAssignAppointment(id, strategy = "least_loaded") {
  ensureId(id);
  const res = await apiClient.post(
    `/api/admin/appointments/${id}/auto-assign?strategy=${encodeURIComponent(
      strategy,
    )}`,
  );
  return res?.data ?? {};
}

export async function rescheduleAppointment(id, startAt, endAt, reason) {
  ensureId(id);
  const res = await apiClient.post(`/api/admin/appointments/${id}/reschedule`, {
    startAt: toLocalDateTimeString(startAt),
    endAt: toLocalDateTimeString(endAt),
    reason,
  });
  return res?.data ?? {};
}

export async function markNoShow(id, reason) {
  ensureId(id);
  const res = await apiClient.post(`/api/admin/appointments/${id}/no-show`, {
    reason,
  });
  return res?.data ?? {};
}

export async function refundAppointment(id, reason) {
  ensureId(id);
  const res = await apiClient.post(`/api/admin/appointments/${id}/refund`, {
    reason,
  });
  return res?.data ?? {};
}

export async function getAppointmentAuditLogs(id) {
  ensureId(id);
  const res = await apiClient.get(`/api/admin/appointments/${id}/audit`);
  return res?.data ?? [];
}

export async function upsertRoster({
  pharmacistId,
  dayOfWeek,
  startTime,
  endTime,
}) {
  ensureId(pharmacistId, "pharmacistId");
  const res = await apiClient.post(`/api/admin/appointments/roster`, {
    pharmacistId,
    dayOfWeek,
    startTime,
    endTime,
  });
  return res?.data ?? {};
}

export async function deleteRoster(id) {
  ensureId(id);
  const res = await apiClient.delete(`/api/admin/appointments/roster/${id}`);
  return res?.data ?? {};
}

export async function addTimeOff({ pharmacistId, startAt, endAt, reason }) {
  ensureId(pharmacistId, "pharmacistId");
  const res = await apiClient.post(`/api/admin/appointments/timeoff`, {
    pharmacistId,
    startAt: toLocalDateTimeString(startAt),
    endAt: toLocalDateTimeString(endAt),
    reason,
  });
  return res?.data ?? {};
}

export async function deleteTimeOff(id) {
  ensureId(id);
  const res = await apiClient.delete(`/api/admin/appointments/timeoff/${id}`);
  return res?.data ?? {};
}

const adminAppointmentApi = {
  listAppointmentsByUser,
  listAppointmentsByDate,
  listAppointmentsByPharmacist,
  getAppointment,
  updateAppointmentStatus,
  assignAppointment,
  autoAssignAppointment,
  rescheduleAppointment,
  markNoShow,
  refundAppointment,
  getAppointmentAuditLogs,
  upsertRoster,
  deleteRoster,
  addTimeOff,
  deleteTimeOff,
};

export default adminAppointmentApi;
