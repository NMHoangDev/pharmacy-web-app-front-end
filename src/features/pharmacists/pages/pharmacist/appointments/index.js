import React, { useCallback, useEffect, useMemo, useState } from "react";
import PharmacistSidebar from "../../../components/pharmacist-pos/PharmacistSidebar";
import {
  cancelAppointment,
  confirmAppointment,
  listAppointmentsByCurrentPharmacist,
} from "../../../../appointments/api/appointmentApi";
import { useNavigate } from "react-router-dom";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const STATUS_LABELS = {
  REQUESTED: "Đang chờ",
  PENDING: "Đang chờ",
  RESCHEDULED: "Dời lịch",
  CONFIRMED: "Đã xác nhận",
  IN_PROGRESS: "Đang tư vấn",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
  NO_SHOW: "Không đến",
  REFUNDED: "Đã hoàn tiền",
  DONE: "Hoàn tất",
};

const statusClass = (status) => {
  if (["REQUESTED", "PENDING", "RESCHEDULED"].includes(status)) {
    return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20";
  }
  if (["CONFIRMED", "IN_PROGRESS"].includes(status)) {
    return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20";
  }
  if (["COMPLETED", "DONE"].includes(status)) {
    return "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20";
  }
  return "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20";
};

const canConfirm = (status) =>
  ["REQUESTED", "PENDING", "RESCHEDULED"].includes(status);

const canReject = (status) =>
  ["REQUESTED", "PENDING", "RESCHEDULED", "CONFIRMED"].includes(status);

const canEnterRoom = (status) => ["CONFIRMED", "IN_PROGRESS"].includes(status);

const PharmacistAppointmentsPage = () => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [acceptTarget, setAcceptTarget] = useState(null);
  const [acceptNote, setAcceptNote] = useState("");
  const [acceptLoading, setAcceptLoading] = useState(false);

  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  const sortedAppointments = useMemo(
    () =>
      [...appointments].sort(
        (a, b) => new Date(b?.startAt || 0) - new Date(a?.startAt || 0),
      ),
    [appointments],
  );

  const fetchCurrentAppointments = useCallback(async () => {
    try {
      return await listAppointmentsByCurrentPharmacist(page, size);
    } catch (err) {
      if (err?.status === 503) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        return listAppointmentsByCurrentPharmacist(page, size);
      }
      throw err;
    }
  }, [page, size]);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchCurrentAppointments();
      const content = Array.isArray(res?.content) ? res.content : [];
      console.log("[PharmacistAppointments] list response", res);

      setAppointments(content);
      setTotalElements(Number(res?.totalElements || 0));
      setTotalPages(Number(res?.totalPages || 0));
    } catch (err) {
      setAppointments([]);
      setTotalElements(0);
      setTotalPages(0);
      if (err?.status === 403) {
        setError("Bạn không có quyền truy cập hồ sơ dược sĩ hiện tại.");
      } else {
        setError(err.message || "Không thể tải lịch hẹn.");
      }
    } finally {
      setLoading(false);
    }
  }, [fetchCurrentAppointments]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const confirmSelected = async () => {
    if (!acceptTarget?.id) return;
    setAcceptLoading(true);
    setError("");
    try {
      const updated = await confirmAppointment(acceptTarget.id);
      if (updated?.id) {
        setAppointments((prev) =>
          prev.map((item) =>
            item.id === updated.id ? { ...item, ...updated } : item,
          ),
        );
      }
      setAcceptTarget(null);
      setAcceptNote("");
      await loadAppointments();
    } catch (err) {
      setError(err.message || "Không thể xác nhận lịch hẹn.");
    } finally {
      setAcceptLoading(false);
    }
  };

  const rejectSelected = async () => {
    if (!rejectTarget?.id) return;
    setRejectLoading(true);
    setError("");
    try {
      const updated = await cancelAppointment(
        rejectTarget.id,
        rejectReason.trim() ||
          "Dược sĩ từ chối lịch hẹn trong thời điểm hiện tại.",
      );
      if (updated?.id) {
        setAppointments((prev) =>
          prev.map((item) =>
            item.id === updated.id ? { ...item, ...updated } : item,
          ),
        );
      }
      setRejectTarget(null);
      setRejectReason("");
      await loadAppointments();
    } catch (err) {
      setError(err.message || "Không thể từ chối lịch hẹn.");
    } finally {
      setRejectLoading(false);
    }
  };

  const start = totalElements === 0 ? 0 : page * size + 1;
  const end = Math.min((page + 1) * size, totalElements);

  const handleEnterRoom = useCallback(
    (item) => {
      if (!item?.id) return;
      if (!canEnterRoom(item.status)) {
        setError(
          "Chỉ có thể vào phòng khi lịch hẹn đã được xác nhận hoặc đang tư vấn.",
        );
        return;
      }
      navigate(`/consultation/${item.id}`);
    },
    [navigate],
  );

  return (
    <div className="min-h-screen bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <PharmacistSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800 md:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
            aria-label="Mở điều hướng"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <span className="material-symbols-outlined">calendar_month</span>
          </div>
          <div>
            <h1 className="text-lg font-bold md:text-xl">Lịch hẹn dược sĩ</h1>
            <p className="text-xs text-slate-500">
              Quản lý lịch hẹn bệnh nhân đã đặt với bạn
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1500px] space-y-5 p-4 md:p-8">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-700/40">
                  <th className="px-4 py-3 text-left">Khách hàng</th>
                  <th className="px-4 py-3 text-left">Liên hệ</th>
                  <th className="px-4 py-3 text-left">Bắt đầu</th>
                  <th className="px-4 py-3 text-left">Kết thúc</th>
                  <th className="px-4 py-3 text-left">Kênh</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-slate-500"
                    >
                      Đang tải lịch hẹn...
                    </td>
                  </tr>
                ) : sortedAppointments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-slate-500"
                    >
                      Chưa có lịch hẹn nào.
                    </td>
                  </tr>
                ) : (
                  sortedAppointments.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 dark:border-slate-700"
                    >
                      <td className="px-4 py-3 font-medium">
                        {item.fullName || "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {item.contact || "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {formatDateTime(item.startAt)}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {formatDateTime(item.endAt)}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {item.channel || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass(
                            item.status,
                          )}`}
                        >
                          {STATUS_LABELS[item.status] || item.status || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {canConfirm(item.status) && (
                            <button
                              type="button"
                              onClick={() => {
                                setAcceptTarget(item);
                                setAcceptNote("");
                              }}
                              className="h-8 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700"
                            >
                              Chấp nhận
                            </button>
                          )}

                          {canReject(item.status) && (
                            <button
                              type="button"
                              onClick={() => {
                                setRejectTarget(item);
                                setRejectReason("");
                              }}
                              className="h-8 rounded-lg bg-rose-600 px-3 text-xs font-semibold text-white hover:bg-rose-700"
                            >
                              Từ chối
                            </button>
                          )}

                          {canEnterRoom(item.status) && (
                            <button
                              type="button"
                              onClick={() => handleEnterRoom(item)}
                              className="h-8 rounded-lg bg-primary px-3 text-xs font-semibold text-white hover:brightness-110"
                            >
                              Vào phòng
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm dark:border-slate-700">
            <span className="text-slate-500">
              Hiển thị {start}-{end} / {totalElements} lịch hẹn
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="h-8 rounded border border-slate-300 px-3 disabled:opacity-50 dark:border-slate-600"
                disabled={page <= 0}
                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              >
                Trước
              </button>
              <span className="min-w-[72px] text-center text-slate-500">
                {Math.min(page + 1, Math.max(totalPages, 1))}/
                {Math.max(totalPages, 1)}
              </span>
              <button
                type="button"
                className="h-8 rounded border border-slate-300 px-3 disabled:opacity-50 dark:border-slate-600"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      </main>

      {acceptTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
              <h3 className="text-lg font-bold">
                Chấp nhận lịch hẹn {acceptTarget.fullName || ""}
              </h3>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600"
                onClick={() => setAcceptTarget(null)}
                disabled={acceptLoading}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 p-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Bạn có chắc muốn chấp nhận lịch hẹn này không?
              </p>
              <label className="block text-sm font-medium">
                Ghi chú (tuỳ chọn)
              </label>
              <textarea
                rows={4}
                className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary dark:border-slate-600 dark:bg-slate-800"
                placeholder="Ví dụ: Vui lòng đến sớm 10 phút..."
                value={acceptNote}
                onChange={(e) => setAcceptNote(e.target.value)}
                disabled={acceptLoading}
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 p-4 dark:border-slate-700">
              <button
                type="button"
                className="h-10 rounded-lg border border-slate-300 px-4 dark:border-slate-600"
                onClick={() => setAcceptTarget(null)}
                disabled={acceptLoading}
              >
                Đóng
              </button>
              <button
                type="button"
                className="h-10 rounded-lg bg-emerald-600 px-4 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                onClick={confirmSelected}
                disabled={acceptLoading}
              >
                {acceptLoading ? "Đang xử lý..." : "Xác nhận lịch hẹn"}
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
              <h3 className="text-lg font-bold">
                Từ chối lịch hẹn {rejectTarget.fullName || ""}
              </h3>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600"
                onClick={() => setRejectTarget(null)}
                disabled={rejectLoading}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 p-4">
              <label className="block text-sm font-medium">
                Lý do từ chối (tuỳ chọn)
              </label>
              <textarea
                rows={4}
                className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary dark:border-slate-600 dark:bg-slate-800"
                placeholder="Ví dụ: Khung giờ này đã kín, vui lòng đặt lại lịch khác..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                disabled={rejectLoading}
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 p-4 dark:border-slate-700">
              <button
                type="button"
                className="h-10 rounded-lg border border-slate-300 px-4 dark:border-slate-600"
                onClick={() => setRejectTarget(null)}
                disabled={rejectLoading}
              >
                Đóng
              </button>
              <button
                type="button"
                className="h-10 rounded-lg bg-rose-600 px-4 font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                onClick={rejectSelected}
                disabled={rejectLoading}
              >
                {rejectLoading ? "Đang xử lý..." : "Xác nhận từ chối"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacistAppointmentsPage;
