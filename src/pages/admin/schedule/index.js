import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../../components/admin/AdminLayout";
import ScheduleList from "../../../components/admin/schedule/ScheduleList";
import AdminPageContainer from "../../../components/common/AdminPageContainer";
import AdminTableWrapper from "../../../components/common/AdminTableWrapper";
import FilterBar from "../../../components/common/FilterBar";

import {
  addTimeOff,
  assignAppointment,
  autoAssignAppointment,
  deleteRoster,
  deleteTimeOff,
  getAppointmentAuditLogs,
  listAppointmentsByDate,
  markNoShow,
  refundAppointment,
  rescheduleAppointment,
  updateAppointmentStatus,
  upsertRoster,
} from "../../../api/adminAppointmentApi";

const EMPTY_AVATAR =
  "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80";

const pagerBtn =
  "rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

const normalizeStatus = (status) => {
  if (!status) return "pending";
  return String(status).trim().toLowerCase().replace(/\s+/g, "_");
};

const normalizeText = (value) => {
  if (!value) return "";
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

const formatTime = (value) => {
  if (!value) return { date: "", time: "", period: "" };
  const [date, timePart = ""] = String(value).split("T");
  const time = timePart.slice(0, 5);
  const hour = Number(timePart.slice(0, 2));
  return {
    date,
    time,
    period: Number.isNaN(hour) ? "" : hour >= 12 ? "PM" : "AM",
  };
};

const statusConfig = (status) => {
  const key = normalizeStatus(status);
  const map = {
    requested: { label: "Requested", color: "bg-orange-100 text-orange-700" },
    pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
    confirmed: { label: "Confirmed", color: "bg-green-100 text-green-700" },
    in_progress: { label: "In progress", color: "bg-blue-100 text-blue-700" },
    completed: { label: "Completed", color: "bg-slate-100 text-slate-700" },
    cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700" },
    no_show: { label: "No show", color: "bg-rose-100 text-rose-700" },
    rescheduled: {
      label: "Rescheduled",
      color: "bg-indigo-100 text-indigo-700",
    },
    refunded: { label: "Refunded", color: "bg-emerald-100 text-emerald-700" },
  };
  return map[key] || map.pending;
};

const statusBucket = (status) => {
  const normalized = normalizeStatus(status);
  if (
    normalized === "cancelled" ||
    normalized === "refunded" ||
    normalized === "no_show"
  ) {
    return "cancelled";
  }
  if (
    normalized === "confirmed" ||
    normalized === "in_progress" ||
    normalized === "completed"
  ) {
    return "confirmed";
  }
  return "pending";
};

const SearchableSelect = ({
  label,
  placeholder,
  value,
  onChange,
  options,
  error,
}) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const selected = options.find((opt) => opt.id === value);
  const filtered = options.filter((opt) =>
    normalizeText(opt.label).includes(normalizeText(query.trim())),
  );

  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [open]);

  return (
    <div className="flex min-w-0 flex-col gap-1">
      {label && (
        <span className="text-xs font-semibold text-slate-500">{label}</span>
      )}
      <div
        className="relative"
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
      >
        <input
          className="h-10 w-full rounded-lg border border-slate-200 bg-transparent px-3 text-sm"
          placeholder={placeholder}
          value={open ? query : selected?.label || query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setOpen(true)}
        />
        {open && (
          <div className="absolute z-20 mt-2 max-h-48 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-xs text-slate-500">
                Không có dữ liệu
              </div>
            )}
            {filtered.map((opt) => (
              <button
                type="button"
                key={opt.id}
                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100"
                onClick={() => {
                  onChange(opt.id);
                  setQuery(opt.label);
                  setOpen(false);
                }}
              >
                <div className="font-semibold text-slate-800">{opt.label}</div>
                <div className="text-xs text-slate-500">{opt.subtitle}</div>
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

const mapAppointment = (item) => {
  const { date, time, period } = formatTime(item.startAt);
  return {
    id: item.id,
    date,
    time,
    period,
    customer:
      item.fullName ||
      (item.userId ? `User ${String(item.userId).slice(0, 8)}` : "User"),
    customerAvatar: EMPTY_AVATAR,
    customerId: item.userId,
    pharmacist:
      item.pharmacist?.name ||
      (item.pharmacistId
        ? `Pharmacist ${String(item.pharmacistId).slice(0, 8)}`
        : ""),
    pharmacistId: item.pharmacistId,
    pharmacistMeta: item.pharmacist || null,
    topic: item.channel || "Consultation",
    status: normalizeStatus(item.status),
    raw: item,
  };
};

const AdminSchedulePage = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [userNameFilter, setUserNameFilter] = useState("");
  const [pharmacistNameFilter, setPharmacistNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pharmacistFilter, setPharmacistFilter] = useState("all");

  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);

  const [detailOpen, setDetailOpen] = useState(false);
  const [actionOpen, setActionOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  const [statusForm, setStatusForm] = useState({
    status: "CONFIRMED",
    reason: "",
  });
  const [assignMode, setAssignMode] = useState("manual");
  const [assignForm, setAssignForm] = useState({
    pharmacistId: "",
    reason: "",
  });
  const [autoAssignStrategy, setAutoAssignStrategy] = useState("least_loaded");
  const [rescheduleForm, setRescheduleForm] = useState({
    startAt: "",
    endAt: "",
    reason: "",
  });
  const [noShowReason, setNoShowReason] = useState("");
  const [refundReason, setRefundReason] = useState("");

  const [submitAttempt, setSubmitAttempt] = useState({
    assign: false,
    reschedule: false,
    roster: false,
    timeOff: false,
  });
  const [rosterForm, setRosterForm] = useState({
    pharmacistId: "",
    dayOfWeek: "1",
    startTime: "09:00",
    endTime: "17:00",
  });
  const [rosterId, setRosterId] = useState("");
  const [timeOffForm, setTimeOffForm] = useState({
    pharmacistId: "",
    startAt: "",
    endAt: "",
    reason: "",
  });
  const [timeOffId, setTimeOffId] = useState("");

  const selectedId = selectedAppointment?.id;

  const today = useMemo(() => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }, []);
  const [selectedDate, setSelectedDate] = useState(today);

  const workloadMap = useMemo(() => {
    const map = new Map();
    appointments.forEach((item) => {
      if (item.date !== selectedDate) return;
      if (!item.pharmacistId) return;
      map.set(item.pharmacistId, (map.get(item.pharmacistId) || 0) + 1);
    });
    return map;
  }, [appointments, selectedDate]);

  const pharmacistOptions = useMemo(() => {
    const map = new Map();
    appointments.forEach((item) => {
      if (!item.pharmacistId) return;
      if (map.has(item.pharmacistId)) return;
      const label = item.pharmacist || "Dược sĩ";
      const branch = item.pharmacistMeta?.specialty || "Chi nhánh chính";
      const workload = workloadMap.get(item.pharmacistId) || 0;
      map.set(item.pharmacistId, {
        id: item.pharmacistId,
        label,
        subtitle: `${branch} · ${workload} lịch`,
      });
    });
    return Array.from(map.values());
  }, [appointments, workloadMap]);

  const loadAppointments = useCallback(
    async (dateValue) => {
      try {
        setError("");
        setLoading(true);
        const dateParam = dateValue || selectedDate;
        const data = await listAppointmentsByDate(dateParam);
        const items = Array.isArray(data) ? data : data?.items || [];
        const mapped = items.map(mapAppointment);
        setAppointments(mapped);
        setSelectedAppointment((prev) => {
          if (!prev) return mapped[0] || null;
          return (
            mapped.find((item) => item.id === prev.id) || mapped[0] || null
          );
        });
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Không thể tải lịch hẹn",
        );
      } finally {
        setLoading(false);
      }
    },
    [selectedDate],
  );

  useEffect(() => {
    if (selectedDate) {
      loadAppointments(selectedDate);
    }
  }, [selectedDate, loadAppointments]);

  const filteredAppointments = useMemo(() => {
    const userFilter = normalizeText(userNameFilter.trim());
    const pharmacistFilterText = normalizeText(pharmacistNameFilter.trim());
    return appointments.filter((item) => {
      if (item.date !== selectedDate) return false;
      if (
        userFilter &&
        !normalizeText(item.customer || "").includes(userFilter)
      ) {
        return false;
      }
      if (
        pharmacistFilterText &&
        !normalizeText(item.pharmacist || "").includes(pharmacistFilterText)
      ) {
        return false;
      }
      if (
        statusFilter !== "all" &&
        statusBucket(item.status) !== statusFilter
      ) {
        return false;
      }
      if (
        pharmacistFilter !== "all" &&
        item.pharmacistId !== pharmacistFilter
      ) {
        return false;
      }
      return true;
    });
  }, [
    appointments,
    selectedDate,
    userNameFilter,
    pharmacistNameFilter,
    statusFilter,
    pharmacistFilter,
  ]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredAppointments.length / pageSize)),
    [filteredAppointments.length, pageSize],
  );

  const pagedAppointments = useMemo(() => {
    const start = page * pageSize;
    return filteredAppointments.slice(start, start + pageSize);
  }, [filteredAppointments, page, pageSize]);

  useEffect(() => {
    setPage(0);
  }, [
    userNameFilter,
    pharmacistNameFilter,
    selectedDate,
    statusFilter,
    pharmacistFilter,
    pageSize,
  ]);

  const handleSelectAppointment = (item) => {
    setSelectedAppointment(item);
    setDetailOpen(true);
  };

  const openActionModal = (item) => {
    setSelectedAppointment(item);
    setActionOpen(true);
  };

  const handleEnterRoom = (id) => {
    navigate(`/consultation/${id}`);
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      setError("");
      const reason = window.prompt("Lý do (tuỳ chọn):", "") || "";
      const updated = await updateAppointmentStatus(
        id,
        status,
        reason || undefined,
      );
      const mapped = mapAppointment(updated);
      setAppointments((prev) => prev.map((a) => (a.id === id ? mapped : a)));
      if (selectedAppointment?.id === id) {
        setSelectedAppointment(mapped);
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Không thể cập nhật trạng thái",
      );
    }
  };

  const handleStatusSubmit = async () => {
    if (!selectedId) return;
    try {
      setError("");
      const updated = await updateAppointmentStatus(
        selectedId,
        statusForm.status,
        statusForm.reason || undefined,
      );
      const mapped = mapAppointment(updated);
      setAppointments((prev) =>
        prev.map((a) => (a.id === selectedId ? mapped : a)),
      );
      setSelectedAppointment(mapped);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Không thể cập nhật trạng thái",
      );
    }
  };

  const handleAssign = async () => {
    if (!selectedId) return;
    setSubmitAttempt((prev) => ({ ...prev, assign: true }));
    if (assignMode === "manual" && !assignForm.pharmacistId) {
      return;
    }
    try {
      setError("");
      const updated = await assignAppointment(
        selectedId,
        assignForm.pharmacistId,
        assignForm.reason || undefined,
      );
      const mapped = mapAppointment(updated);
      setAppointments((prev) =>
        prev.map((a) => (a.id === selectedId ? mapped : a)),
      );
      setSelectedAppointment(mapped);
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Không thể gán dược sĩ",
      );
    }
  };

  const handleAutoAssign = async () => {
    if (!selectedId) return;
    try {
      setError("");
      const updated = await autoAssignAppointment(
        selectedId,
        autoAssignStrategy,
      );
      const mapped = mapAppointment(updated);
      setAppointments((prev) =>
        prev.map((a) => (a.id === selectedId ? mapped : a)),
      );
      setSelectedAppointment(mapped);
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Không thể auto-assign",
      );
    }
  };

  const handleReschedule = async () => {
    if (!selectedId) return;
    setSubmitAttempt((prev) => ({ ...prev, reschedule: true }));
    if (!rescheduleForm.startAt || !rescheduleForm.endAt) {
      return;
    }
    try {
      setError("");
      const updated = await rescheduleAppointment(
        selectedId,
        rescheduleForm.startAt,
        rescheduleForm.endAt,
        rescheduleForm.reason || undefined,
      );
      const mapped = mapAppointment(updated);
      setAppointments((prev) =>
        prev.map((a) => (a.id === selectedId ? mapped : a)),
      );
      setSelectedAppointment(mapped);
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Không thể dời lịch",
      );
    }
  };

  const handleNoShow = async () => {
    if (!selectedId) return;
    try {
      setError("");
      const updated = await markNoShow(selectedId, noShowReason || undefined);
      const mapped = mapAppointment(updated);
      setAppointments((prev) =>
        prev.map((a) => (a.id === selectedId ? mapped : a)),
      );
      setSelectedAppointment(mapped);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Không thể đánh dấu no-show",
      );
    }
  };

  const handleRefund = async () => {
    if (!selectedId) return;
    try {
      setError("");
      const updated = await refundAppointment(
        selectedId,
        refundReason || undefined,
      );
      const mapped = mapAppointment(updated);
      setAppointments((prev) =>
        prev.map((a) => (a.id === selectedId ? mapped : a)),
      );
      setSelectedAppointment(mapped);
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Không thể hoàn tiền",
      );
    }
  };

  const handleAudit = async (idOverride) => {
    const targetId = idOverride || selectedId;
    if (!targetId) return;
    try {
      setError("");
      const logs = await getAppointmentAuditLogs(targetId);
      setAuditLogs(Array.isArray(logs) ? logs : []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Không thể tải audit logs",
      );
    }
  };

  const openAuditModal = async (item) => {
    setSelectedAppointment(item);
    setAuditOpen(true);
    await handleAudit(item?.id);
  };

  const handleRosterUpsert = async () => {
    setSubmitAttempt((prev) => ({ ...prev, roster: true }));
    if (
      !rosterForm.pharmacistId ||
      !rosterForm.startTime ||
      !rosterForm.endTime
    ) {
      return;
    }
    try {
      setError("");
      await upsertRoster({
        pharmacistId: rosterForm.pharmacistId,
        dayOfWeek: Number(rosterForm.dayOfWeek),
        startTime: rosterForm.startTime,
        endTime: rosterForm.endTime,
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Không thể cập nhật roster",
      );
    }
  };

  const handleRosterDelete = async () => {
    try {
      setError("");
      await deleteRoster(rosterId);
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Không thể xoá roster",
      );
    }
  };

  const handleTimeOffAdd = async () => {
    setSubmitAttempt((prev) => ({ ...prev, timeOff: true }));
    if (
      !timeOffForm.pharmacistId ||
      !timeOffForm.startAt ||
      !timeOffForm.endAt
    ) {
      return;
    }
    try {
      setError("");
      await addTimeOff({
        pharmacistId: timeOffForm.pharmacistId,
        startAt: timeOffForm.startAt,
        endAt: timeOffForm.endAt,
        reason: timeOffForm.reason || undefined,
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Không thể thêm time-off",
      );
    }
  };

  const handleTimeOffDelete = async () => {
    try {
      setError("");
      await deleteTimeOff(timeOffId);
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Không thể xoá time-off",
      );
    }
  };

  const filterControls = (
    <>
      <div className="relative min-w-[220px] flex-1">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          search
        </span>
        <input
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-xs sm:h-10 sm:text-sm"
          placeholder="Tìm theo khách hàng..."
          value={userNameFilter}
          onChange={(event) => setUserNameFilter(event.target.value)}
        />
      </div>

      <div className="relative min-w-[220px] flex-1">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          search
        </span>
        <input
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-xs sm:h-10 sm:text-sm"
          placeholder="Tìm theo dược sĩ..."
          value={pharmacistNameFilter}
          onChange={(event) => setPharmacistNameFilter(event.target.value)}
        />
      </div>

      <input
        type="date"
        className="h-9 min-w-[140px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs sm:h-10 sm:text-sm"
        value={selectedDate}
        onChange={(event) => setSelectedDate(event.target.value)}
      />

      <select
        className="h-9 min-w-[140px] max-w-[260px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs sm:h-10 sm:text-sm"
        value={pharmacistFilter}
        onChange={(event) => setPharmacistFilter(event.target.value)}
      >
        <option value="all">Tất cả dược sĩ</option>
        {pharmacistOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </>
  );

  const filterTrailing = (
    <>
      <select
        className="h-9 min-w-[140px] max-w-[220px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs sm:h-10 sm:text-sm"
        value={pageSize}
        onChange={(event) => setPageSize(Number(event.target.value))}
      >
        <option value={10}>10 / trang</option>
        <option value={20}>20 / trang</option>
        <option value={50}>50 / trang</option>
      </select>
      <button
        type="button"
        onClick={() => setToolsOpen(true)}
        className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-xs font-medium text-slate-600 hover:bg-slate-50 sm:h-10 sm:text-sm"
      >
        Công cụ
      </button>
      <button
        type="button"
        onClick={() => {
          setUserNameFilter("");
          setPharmacistNameFilter("");
          setStatusFilter("all");
          setPharmacistFilter("all");
          setPageSize(10);
        }}
        className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-xs font-medium text-slate-600 hover:bg-slate-50 sm:h-10 sm:text-sm"
      >
        Đặt lại
      </button>
    </>
  );

  const tabItems = [
    { key: "all", label: "Tất cả" },
    { key: "confirmed", label: "Đã xác nhận" },
    { key: "pending", label: "Đang chờ" },
    { key: "cancelled", label: "Đã huỷ" },
  ];

  const filterFooter = (
    <div className="flex flex-wrap items-center gap-2">
      {tabItems.map((tab) => {
        const active = statusFilter === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusFilter(tab.key)}
            className={
              active
                ? "whitespace-nowrap rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm"
                : "whitespace-nowrap rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-200"
            }
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <AdminLayout activeKey="schedule">
      <AdminPageContainer>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              Quản lý lịch hẹn
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Quản lý lịch hẹn, dược sĩ và khách hàng tư vấn
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white shadow-sm hover:bg-primary/90"
              onClick={() =>
                window.alert("Chức năng tạo lịch hẹn sẽ được bổ sung")
              }
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              + Tạo lịch hẹn
            </button>
            <button
              type="button"
              className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              onClick={() => window.print()}
            >
              <span className="material-symbols-outlined text-[20px]">
                file_download
              </span>
              Xuất dữ liệu
            </button>
          </div>
        </div>

        <FilterBar
          controls={filterControls}
          trailing={filterTrailing}
          footer={filterFooter}
        />

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading && (
          <AdminTableWrapper className="px-4 py-3 text-sm text-slate-600">
            Đang tải dữ liệu lịch hẹn...
          </AdminTableWrapper>
        )}

        <ScheduleList
          appointments={pagedAppointments}
          selectedId={selectedId}
          onSelectAppointment={handleSelectAppointment}
          onUpdateStatus={handleUpdateStatus}
          onEnterRoom={handleEnterRoom}
          onOpenActions={openActionModal}
          onOpenAudit={openAuditModal}
        />

        <AdminTableWrapper className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-slate-500">
              Đang hiển thị {pagedAppointments.length} /{" "}
              {filteredAppointments.length} lịch hẹn
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={pagerBtn}
                disabled={page <= 0}
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              >
                Trước
              </button>
              <span className="text-sm text-slate-600">
                Trang {Math.max(1, page + 1)} / {Math.max(1, totalPages)}
              </span>
              <button
                type="button"
                className={pagerBtn}
                disabled={page >= Math.max(0, totalPages - 1)}
                onClick={() =>
                  setPage((prev) =>
                    Math.min(Math.max(0, totalPages - 1), prev + 1),
                  )
                }
              >
                Sau
              </button>
            </div>
          </div>
        </AdminTableWrapper>
      </AdminPageContainer>

      {detailOpen && selectedAppointment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
          onClick={() => setDetailOpen(false)}
        >
          <div
            className="w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-900">
                Chi tiết lịch hẹn
              </h4>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                onClick={() => setDetailOpen(false)}
              >
                <span className="material-symbols-outlined text-[18px]">
                  close
                </span>
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 text-sm text-slate-600 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase text-slate-400">
                  Appointment ID
                </p>
                <p className="font-semibold text-slate-900">
                  {selectedAppointment.id}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Status</p>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig(selectedAppointment.status).color}`}
                >
                  {statusConfig(selectedAppointment.status).label}
                </span>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Khách hàng</p>
                <p className="font-semibold text-slate-900">
                  {selectedAppointment.customer}
                </p>
                <p>{selectedAppointment.raw?.userId || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Dược sĩ</p>
                <p className="font-semibold text-slate-900">
                  {selectedAppointment.pharmacist || "-"}
                </p>
                <p>{selectedAppointment.raw?.pharmacistId || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Thời gian</p>
                <p className="font-semibold text-slate-900">
                  {selectedAppointment.raw?.startAt} -{" "}
                  {selectedAppointment.raw?.endAt}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Kênh tư vấn</p>
                <p className="font-semibold text-slate-900">
                  {selectedAppointment.raw?.channel || "-"}
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => {
                  setDetailOpen(false);
                  setActionOpen(true);
                }}
              >
                Chỉnh sửa
              </button>
              <button
                type="button"
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 hover:bg-slate-50"
                onClick={async () => {
                  await handleAudit(selectedAppointment.id);
                  setAuditOpen(true);
                }}
              >
                Audit logs
              </button>
            </div>
          </div>
        </div>
      )}

      {actionOpen && selectedAppointment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
          onClick={() => setActionOpen(false)}
        >
          <div
            className="max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-900">
                Chỉnh sửa lịch hẹn {selectedAppointment.id}
              </h4>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                onClick={() => setActionOpen(false)}
              >
                <span className="material-symbols-outlined text-[18px]">
                  close
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4">
                <h5 className="mb-3 text-sm font-semibold text-slate-900">
                  Update status
                </h5>
                <div className="space-y-3">
                  <select
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                    value={statusForm.status}
                    onChange={(event) =>
                      setStatusForm((prev) => ({
                        ...prev,
                        status: event.target.value,
                      }))
                    }
                  >
                    <option value="REQUESTED">REQUESTED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="NO_SHOW">NO_SHOW</option>
                    <option value="RESCHEDULED">RESCHEDULED</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                  <textarea
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Reason (optional)"
                    value={statusForm.reason}
                    onChange={(event) =>
                      setStatusForm((prev) => ({
                        ...prev,
                        reason: event.target.value,
                      }))
                    }
                  />
                  <button
                    type="button"
                    className="h-10 w-full rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary/90"
                    onClick={handleStatusSubmit}
                    disabled={!selectedId}
                  >
                    Update
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <h5 className="mb-3 text-sm font-semibold text-slate-900">
                  Assign pharmacist
                </h5>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className={`rounded-full border px-3 py-1 text-sm ${
                        assignMode === "manual"
                          ? "bg-slate-900 text-white"
                          : "border-slate-200 text-slate-700"
                      }`}
                      onClick={() => setAssignMode("manual")}
                    >
                      Manual
                    </button>
                    <button
                      type="button"
                      className={`rounded-full border px-3 py-1 text-sm ${
                        assignMode === "auto"
                          ? "bg-slate-900 text-white"
                          : "border-slate-200 text-slate-700"
                      }`}
                      onClick={() => setAssignMode("auto")}
                    >
                      Auto assign
                    </button>
                  </div>

                  {assignMode === "manual" ? (
                    <>
                      <SearchableSelect
                        label="Pharmacist"
                        placeholder="Chọn dược sĩ"
                        value={assignForm.pharmacistId}
                        onChange={(value) =>
                          setAssignForm((prev) => ({
                            ...prev,
                            pharmacistId: value,
                          }))
                        }
                        options={pharmacistOptions}
                        error={
                          submitAttempt.assign && !assignForm.pharmacistId
                            ? "Cần chọn dược sĩ"
                            : ""
                        }
                      />
                      <textarea
                        rows={3}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        placeholder="Reason (optional)"
                        value={assignForm.reason}
                        onChange={(event) =>
                          setAssignForm((prev) => ({
                            ...prev,
                            reason: event.target.value,
                          }))
                        }
                      />
                      <button
                        type="button"
                        className="h-10 w-full rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary/90"
                        onClick={handleAssign}
                        disabled={!selectedId}
                      >
                        Assign
                      </button>
                    </>
                  ) : (
                    <>
                      <select
                        className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                        value={autoAssignStrategy}
                        onChange={(event) =>
                          setAutoAssignStrategy(event.target.value)
                        }
                      >
                        <option value="least_loaded">Least loaded</option>
                        <option value="earliest_available">
                          Earliest available
                        </option>
                      </select>
                      <button
                        type="button"
                        className="h-10 w-full rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary/90"
                        onClick={handleAutoAssign}
                        disabled={!selectedId}
                      >
                        Auto assign
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <h5 className="mb-3 text-sm font-semibold text-slate-900">
                  Reschedule
                </h5>
                <div className="space-y-3">
                  <input
                    type="datetime-local"
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                    value={rescheduleForm.startAt}
                    onChange={(event) =>
                      setRescheduleForm((prev) => ({
                        ...prev,
                        startAt: event.target.value,
                      }))
                    }
                  />
                  {submitAttempt.reschedule && !rescheduleForm.startAt && (
                    <span className="text-xs text-red-500">
                      Cần chọn thời gian bắt đầu
                    </span>
                  )}
                  <input
                    type="datetime-local"
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                    value={rescheduleForm.endAt}
                    onChange={(event) =>
                      setRescheduleForm((prev) => ({
                        ...prev,
                        endAt: event.target.value,
                      }))
                    }
                  />
                  {submitAttempt.reschedule && !rescheduleForm.endAt && (
                    <span className="text-xs text-red-500">
                      Cần chọn thời gian kết thúc
                    </span>
                  )}
                  <textarea
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Reason (optional)"
                    value={rescheduleForm.reason}
                    onChange={(event) =>
                      setRescheduleForm((prev) => ({
                        ...prev,
                        reason: event.target.value,
                      }))
                    }
                  />
                  <button
                    type="button"
                    className="h-10 w-full rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary/90"
                    onClick={handleReschedule}
                    disabled={!selectedId}
                  >
                    Reschedule
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <h5 className="mb-3 text-sm font-semibold text-slate-900">
                  More actions
                </h5>
                <div className="space-y-3">
                  <textarea
                    rows={2}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="No-show reason (optional)"
                    value={noShowReason}
                    onChange={(event) => setNoShowReason(event.target.value)}
                  />
                  <button
                    type="button"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
                    onClick={handleNoShow}
                    disabled={!selectedId}
                  >
                    Mark no-show
                  </button>

                  <textarea
                    rows={2}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Refund reason (optional)"
                    value={refundReason}
                    onChange={(event) => setRefundReason(event.target.value)}
                  />
                  <button
                    type="button"
                    className="h-10 w-full rounded-lg bg-red-600 text-sm font-semibold text-white hover:bg-red-700"
                    onClick={handleRefund}
                    disabled={!selectedId}
                  >
                    Refund
                  </button>

                  <button
                    type="button"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
                    onClick={async () => {
                      await handleAudit(selectedId);
                      setAuditOpen(true);
                    }}
                    disabled={!selectedId}
                  >
                    Audit logs
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {auditOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
          onClick={() => setAuditOpen(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-900">
                Audit logs{" "}
                {selectedAppointment?.id ? `- ${selectedAppointment.id}` : ""}
              </h4>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                onClick={() => setAuditOpen(false)}
              >
                <span className="material-symbols-outlined text-[18px]">
                  close
                </span>
              </button>
            </div>
            {auditLogs.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có dữ liệu audit.</p>
            ) : (
              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                  >
                    <p className="font-semibold text-slate-800">
                      {log.action || log.eventType}
                    </p>
                    <p className="text-slate-600">{log.reason || "-"}</p>
                    <p className="text-xs text-slate-500">{log.createdAt}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {toolsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
          onClick={() => setToolsOpen(false)}
        >
          <div
            className="max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-900">
                Tools & Resources
              </h4>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                onClick={() => setToolsOpen(false)}
              >
                <span className="material-symbols-outlined text-[18px]">
                  close
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4">
                <h5 className="mb-3 text-sm font-semibold text-slate-900">
                  Roster management
                </h5>
                <div className="space-y-3">
                  <SearchableSelect
                    label="Pharmacist"
                    placeholder="Chọn dược sĩ"
                    value={rosterForm.pharmacistId}
                    onChange={(value) =>
                      setRosterForm((prev) => ({
                        ...prev,
                        pharmacistId: value,
                      }))
                    }
                    options={pharmacistOptions}
                    error={
                      submitAttempt.roster && !rosterForm.pharmacistId
                        ? "Cần chọn dược sĩ"
                        : ""
                    }
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      min="1"
                      max="7"
                      className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
                      value={rosterForm.dayOfWeek}
                      onChange={(event) =>
                        setRosterForm((prev) => ({
                          ...prev,
                          dayOfWeek: event.target.value,
                        }))
                      }
                    />
                    <input
                      type="time"
                      className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
                      value={rosterForm.startTime}
                      onChange={(event) =>
                        setRosterForm((prev) => ({
                          ...prev,
                          startTime: event.target.value,
                        }))
                      }
                    />
                    <input
                      type="time"
                      className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
                      value={rosterForm.endTime}
                      onChange={(event) =>
                        setRosterForm((prev) => ({
                          ...prev,
                          endTime: event.target.value,
                        }))
                      }
                    />
                  </div>
                  {submitAttempt.roster &&
                    (!rosterForm.startTime || !rosterForm.endTime) && (
                      <span className="text-xs text-red-500">
                        Cần chọn giờ làm
                      </span>
                    )}
                  <button
                    type="button"
                    className="h-10 w-full rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary/90"
                    onClick={handleRosterUpsert}
                  >
                    Lưu roster
                  </button>
                  <div className="flex gap-2">
                    <input
                      className="h-10 flex-1 rounded-lg border border-slate-200 px-3 text-sm"
                      placeholder="Roster ID"
                      value={rosterId}
                      onChange={(event) => setRosterId(event.target.value)}
                    />
                    <button
                      type="button"
                      className="h-10 rounded-lg border border-red-200 px-3 text-sm text-red-600"
                      onClick={handleRosterDelete}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <h5 className="mb-3 text-sm font-semibold text-slate-900">
                  Time off
                </h5>
                <div className="space-y-3">
                  <SearchableSelect
                    label="Pharmacist"
                    placeholder="Chọn dược sĩ"
                    value={timeOffForm.pharmacistId}
                    onChange={(value) =>
                      setTimeOffForm((prev) => ({
                        ...prev,
                        pharmacistId: value,
                      }))
                    }
                    options={pharmacistOptions}
                    error={
                      submitAttempt.timeOff && !timeOffForm.pharmacistId
                        ? "Cần chọn dược sĩ"
                        : ""
                    }
                  />
                  <input
                    type="datetime-local"
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                    value={timeOffForm.startAt}
                    onChange={(event) =>
                      setTimeOffForm((prev) => ({
                        ...prev,
                        startAt: event.target.value,
                      }))
                    }
                  />
                  {submitAttempt.timeOff && !timeOffForm.startAt && (
                    <span className="text-xs text-red-500">
                      Cần chọn thời gian bắt đầu
                    </span>
                  )}
                  <input
                    type="datetime-local"
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                    value={timeOffForm.endAt}
                    onChange={(event) =>
                      setTimeOffForm((prev) => ({
                        ...prev,
                        endAt: event.target.value,
                      }))
                    }
                  />
                  {submitAttempt.timeOff && !timeOffForm.endAt && (
                    <span className="text-xs text-red-500">
                      Cần chọn thời gian kết thúc
                    </span>
                  )}
                  <textarea
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Reason (optional)"
                    value={timeOffForm.reason}
                    onChange={(event) =>
                      setTimeOffForm((prev) => ({
                        ...prev,
                        reason: event.target.value,
                      }))
                    }
                  />
                  <button
                    type="button"
                    className="h-10 w-full rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary/90"
                    onClick={handleTimeOffAdd}
                  >
                    Add time-off
                  </button>
                  <div className="flex gap-2">
                    <input
                      className="h-10 flex-1 rounded-lg border border-slate-200 px-3 text-sm"
                      placeholder="Time-off ID"
                      value={timeOffId}
                      onChange={(event) => setTimeOffId(event.target.value)}
                    />
                    <button
                      type="button"
                      className="h-10 rounded-lg border border-red-200 px-3 text-sm text-red-600"
                      onClick={handleTimeOffDelete}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminSchedulePage;
