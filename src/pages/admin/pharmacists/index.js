import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import AdminPharmacistFilters from "../../../components/admin/pharmacists/AdminPharmacistFilters";
import AdminPharmacistGrid from "../../../components/admin/pharmacists/AdminPharmacistGrid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Badge } from "../../../components/ui/badge";

const WEEK_DAYS = [
  { value: "mon", label: "T2", full: "Thứ 2" },
  { value: "tue", label: "T3", full: "Thứ 3" },
  { value: "wed", label: "T4", full: "Thứ 4" },
  { value: "thu", label: "T5", full: "Thứ 5" },
  { value: "fri", label: "T6", full: "Thứ 6" },
  { value: "sat", label: "T7", full: "Thứ 7" },
  { value: "sun", label: "CN", full: "Chủ nhật" },
];

const AdminPharmacistsPage = () => {
  const [pharmacists, setPharmacists] = useState([]);
  const [filters, setFilters] = useState({
    query: "",
    specialty: "all",
    status: "all",
    verification: "all",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingId, setEditingId] = useState(null);
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    phone: "",
    licenseNumber: "",
    specialty: "clinical",
    experienceYears: 0,
    status: "OFFLINE",
    verified: false,
    avatarUrl: "",
    education: "",
    bio: "",
    languagesText: "",
    workingDays: ["mon", "tue", "wed", "thu", "fri"],
    workingHoursStart: "08:00",
    workingHoursEnd: "17:00",
  });
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState({
    open: false,
    title: "",
    message: "",
    tone: "success",
  });
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [detailData, setDetailData] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (filters.query.trim()) {
          params.append("query", filters.query.trim());
        }
        if (filters.specialty !== "all") {
          params.append("specialty", filters.specialty);
        }
        if (filters.status !== "all") {
          params.append("status", filters.status.toUpperCase());
        }
        if (filters.verification !== "all") {
          params.append("verification", filters.verification);
        }

        const response = await fetch(
          `/api/admin/pharmacists?${params.toString()}`,
          {
            signal: controller.signal,
          },
        );
        if (!response.ok) {
          throw new Error("Không thể tải danh sách dược sĩ");
        }
        const payload = await response.json();
        setPharmacists(payload.content ?? []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Không thể tải danh sách dược sĩ");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    load();
    return () => controller.abort();
  }, [filters]);

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return pharmacists.filter((p) => {
      const matchesQuery = q
        ? p.name.toLowerCase().includes(q) ||
          String(p.id).toLowerCase().includes(q)
        : true;
      const matchesSpec =
        filters.specialty === "all" || p.specialty === filters.specialty;
      const matchesStatus =
        filters.status === "all" || p.status === filters.status.toUpperCase();
      const matchesVerify =
        filters.verification === "all" ||
        (filters.verification === "verified" ? p.verified : !p.verified);
      return matchesQuery && matchesSpec && matchesStatus && matchesVerify;
    });
  }, [pharmacists, filters]);

  const gridItems = useMemo(
    () =>
      filtered.map((p) => ({
        id: p.id,
        name: p.name,
        specialty: p.specialty,
        experience: p.experienceYears ?? 0,
        status: (p.status || "OFFLINE").toLowerCase(),
        verified: !!p.verified,
        availability: p.availability || "",
        avatar:
          p.avatarUrl ||
          "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=200&q=80",
      })),
    [filtered],
  );

  const toggleStatus = async (id) => {
    const target = pharmacists.find((p) => p.id === id);
    if (!target) return;
    const nextStatus = target.status === "ONLINE" ? "OFFLINE" : "ONLINE";
    try {
      const response = await fetch(`/api/admin/pharmacists/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          availability: target.availability,
        }),
      });
      if (!response.ok) {
        throw new Error("Không thể cập nhật trạng thái");
      }
      const payload = await response.json();
      setPharmacists((prev) => prev.map((p) => (p.id === id ? payload : p)));
    } catch (err) {
      setError(err.message || "Không thể cập nhật trạng thái");
    }
  };

  const toggleVerify = async (id) => {
    const target = pharmacists.find((p) => p.id === id);
    if (!target) return;
    try {
      const response = await fetch(`/api/admin/pharmacists/${id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified: !target.verified }),
      });
      if (!response.ok) {
        throw new Error("Không thể cập nhật xác thực");
      }
      const payload = await response.json();
      setPharmacists((prev) => prev.map((p) => (p.id === id ? payload : p)));
    } catch (err) {
      setError(err.message || "Không thể cập nhật xác thực");
    }
  };

  const openNotice = (title, message, tone = "success") => {
    setNotice({ open: true, title, message, tone });
  };

  const openCreateDialog = () => {
    setFormMode("create");
    setEditingId(null);
    setFormValues({
      name: "",
      email: "",
      phone: "",
      licenseNumber: "",
      specialty: "clinical",
      experienceYears: 0,
      status: "OFFLINE",
      verified: false,
      avatarUrl: "",
      education: "",
      bio: "",
      languagesText: "",
      workingDays: ["mon", "tue", "wed", "thu", "fri"],
      workingHoursStart: "08:00",
      workingHoursEnd: "17:00",
    });
    setFormError("");
    setFormOpen(true);
  };

  const mapResponseToForm = (payload) => {
    const workingHours = payload?.workingHours || "";
    const [startRaw, endRaw] = workingHours
      .split("-")
      .map((item) => item.trim());
    return {
      name: payload?.name || "",
      email: payload?.email || "",
      phone: payload?.phone || "",
      licenseNumber: payload?.licenseNumber || "",
      specialty: payload?.specialty || "clinical",
      experienceYears: payload?.experienceYears ?? 0,
      status: payload?.status || "OFFLINE",
      verified: !!payload?.verified,
      avatarUrl: payload?.avatarUrl || "",
      education: payload?.education || "",
      bio: payload?.bio || "",
      languagesText: (payload?.languages || []).join(", "),
      workingDays:
        payload?.workingDays && payload.workingDays.length
          ? payload.workingDays
          : ["mon", "tue", "wed", "thu", "fri"],
      workingHoursStart: startRaw || "08:00",
      workingHoursEnd: endRaw || "17:00",
    };
  };

  const loadDetail = async (id) => {
    setDetailLoading(true);
    setDetailError("");
    try {
      const response = await fetch(`/api/admin/pharmacists/${id}`);
      if (!response.ok) {
        throw new Error("Không thể tải chi tiết dược sĩ");
      }
      const payload = await response.json();
      setDetailData(payload);
      return payload;
    } catch (err) {
      setDetailError(err.message || "Không thể tải chi tiết dược sĩ");
      throw err;
    } finally {
      setDetailLoading(false);
    }
  };

  const openDetailDialog = async (id) => {
    setDetailOpen(true);
    setDetailData(null);
    try {
      await loadDetail(id);
    } catch (err) {
      // handled by state
    }
  };

  const openEditDialog = async (id) => {
    setFormMode("edit");
    setEditingId(id);
    try {
      const payload = await loadDetail(id);
      setFormValues(mapResponseToForm(payload));
      setFormError("");
      setFormOpen(true);
    } catch (err) {
      openNotice(
        "Không thể tải hồ sơ",
        err.message || "Không thể tải dữ liệu",
        "error",
      );
    }
  };

  const openDeleteDialog = (id) => {
    setDeleteTarget(id);
    setDeleteOpen(true);
  };

  const toggleWorkingDay = (value) => {
    setFormValues((prev) => {
      const exists = prev.workingDays.includes(value);
      const nextDays = exists
        ? prev.workingDays.filter((day) => day !== value)
        : [...prev.workingDays, value];
      return { ...prev, workingDays: nextDays };
    });
  };

  const buildAvailability = (days, start, end) => {
    const dayLabels = WEEK_DAYS.filter((day) => days.includes(day.value)).map(
      (day) => day.full,
    );
    const hours = start && end ? `${start} - ${end}` : "";
    if (!dayLabels.length && !hours) return "";
    if (!dayLabels.length) return `Ca trực ${hours}`.trim();
    if (!hours) return dayLabels.join(", ");
    return `${dayLabels.join(", ")} • ${hours}`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formValues.name.trim()) {
      setFormError("Vui lòng nhập tên dược sĩ.");
      return;
    }

    setFormSaving(true);
    setFormError("");
    try {
      const workingDays = formValues.workingDays || [];
      const workingHours =
        formValues.workingHoursStart && formValues.workingHoursEnd
          ? `${formValues.workingHoursStart} - ${formValues.workingHoursEnd}`
          : "";
      const availability = buildAvailability(
        workingDays,
        formValues.workingHoursStart,
        formValues.workingHoursEnd,
      );
      const languages = formValues.languagesText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const payload = {
        name: formValues.name.trim(),
        email: formValues.email.trim() || null,
        phone: formValues.phone.trim() || null,
        specialty: formValues.specialty,
        experienceYears: Number(formValues.experienceYears || 0),
        status: formValues.status,
        verified: !!formValues.verified,
        availability,
        avatarUrl: formValues.avatarUrl.trim(),
        licenseNumber: formValues.licenseNumber.trim() || null,
        education: formValues.education.trim() || null,
        bio: formValues.bio.trim() || null,
        languages,
        workingDays,
        workingHours,
      };

      const response = await fetch(
        formMode === "edit" && editingId
          ? `/api/admin/pharmacists/${editingId}`
          : "/api/admin/pharmacists",
        {
          method: formMode === "edit" ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) {
        throw new Error(
          formMode === "edit"
            ? "Không thể cập nhật dược sĩ"
            : "Không thể tạo dược sĩ",
        );
      }
      const saved = await response.json();
      setPharmacists((prev) =>
        formMode === "edit"
          ? prev.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...prev],
      );
      setFormOpen(false);
      openNotice(
        formMode === "edit" ? "Cập nhật thành công" : "Tạo hồ sơ thành công",
        formMode === "edit"
          ? "Đã cập nhật hồ sơ dược sĩ."
          : "Đã thêm dược sĩ vào hệ thống.",
      );
    } catch (err) {
      const message =
        err.message ||
        (formMode === "edit"
          ? "Không thể cập nhật dược sĩ"
          : "Không thể tạo dược sĩ");
      setFormError(message);
      openNotice(
        formMode === "edit" ? "Không thể cập nhật" : "Không thể tạo dược sĩ",
        message,
        "error",
      );
    } finally {
      setFormSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const response = await fetch(`/api/admin/pharmacists/${deleteTarget}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Không thể xóa dược sĩ");
      }
      setPharmacists((prev) => prev.filter((item) => item.id !== deleteTarget));
      setDeleteOpen(false);
      setDeleteTarget(null);
      openNotice("Đã xóa dược sĩ", "Hồ sơ đã được xóa khỏi hệ thống.");
    } catch (err) {
      openNotice(
        "Không thể xóa",
        err.message || "Không thể xóa dược sĩ",
        "error",
      );
    }
  };

  return (
    <AdminLayout activeKey="pharmacists">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light dark:bg-background-dark">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">
                Quản lý dược sĩ
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                Theo dõi trạng thái, chuyên môn và xác thực của đội ngũ dược sĩ.
              </p>
            </div>
            <Button
              type="button"
              onClick={openCreateDialog}
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span className="text-sm font-bold">Thêm dược sĩ</span>
            </Button>
          </div>

          <AdminPharmacistFilters
            filters={filters}
            onChange={setFilters}
            onReset={() =>
              setFilters({
                query: "",
                specialty: "all",
                status: "all",
                verification: "all",
              })
            }
          />

          <AdminPharmacistGrid
            pharmacists={gridItems}
            onToggleStatus={toggleStatus}
            onToggleVerify={toggleVerify}
            onView={openDetailDialog}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
          />
          {loading ? (
            <div className="text-sm text-slate-500">Đang tải dược sĩ...</div>
          ) : null}
          {error ? (
            <div className="rounded-lg bg-red-50 text-red-600 text-sm px-4 py-3">
              {error}
            </div>
          ) : null}
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {formMode === "edit" ? "Chỉnh sửa dược sĩ" : "Thêm dược sĩ mới"}
            </DialogTitle>
            <DialogDescription>
              {formMode === "edit"
                ? "Cập nhật thông tin hồ sơ dược sĩ."
                : "Hoàn tất thông tin để tạo hồ sơ dược sĩ trong hệ thống."}
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-5">
              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        Thông tin dược sĩ
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Điền thông tin định danh và chuyên môn.
                      </p>
                    </div>
                    <Badge variant="secondary">Hồ sơ mới</Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-900 dark:text-white">
                        Họ và tên
                      </label>
                      <Input
                        value={formValues.name}
                        onChange={(event) =>
                          setFormValues((prev) => ({
                            ...prev,
                            name: event.target.value,
                          }))
                        }
                        placeholder="Nguyễn Thị Lan"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-900 dark:text-white">
                        Chuyên môn
                      </label>
                      <select
                        value={formValues.specialty}
                        onChange={(event) =>
                          setFormValues((prev) => ({
                            ...prev,
                            specialty: event.target.value,
                          }))
                        }
                        className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-slate-100"
                      >
                        <option value="clinical">Clinical</option>
                        <option value="pediatric">Pediatric</option>
                        <option value="supplement">Supplement</option>
                        <option value="cosmetic">Cosmetic</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-900 dark:text-white">
                        Email
                      </label>
                      <Input
                        type="email"
                        value={formValues.email}
                        onChange={(event) =>
                          setFormValues((prev) => ({
                            ...prev,
                            email: event.target.value,
                          }))
                        }
                        placeholder="lan.nguyen@pharmacy.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-900 dark:text-white">
                        Số điện thoại
                      </label>
                      <Input
                        value={formValues.phone}
                        onChange={(event) =>
                          setFormValues((prev) => ({
                            ...prev,
                            phone: event.target.value,
                          }))
                        }
                        placeholder="0909 000 888"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-900 dark:text-white">
                        Mã chứng chỉ
                      </label>
                      <Input
                        value={formValues.licenseNumber}
                        onChange={(event) =>
                          setFormValues((prev) => ({
                            ...prev,
                            licenseNumber: event.target.value,
                          }))
                        }
                        placeholder="VN-PS-2026"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-900 dark:text-white">
                        Kinh nghiệm (năm)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={formValues.experienceYears}
                        onChange={(event) =>
                          setFormValues((prev) => ({
                            ...prev,
                            experienceYears: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-900 dark:text-white">
                        Ngôn ngữ
                      </label>
                      <Input
                        value={formValues.languagesText}
                        onChange={(event) =>
                          setFormValues((prev) => ({
                            ...prev,
                            languagesText: event.target.value,
                          }))
                        }
                        placeholder="Việt, Anh"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        Lịch trực
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Chọn ngày và giờ ca trực tiêu chuẩn.
                      </p>
                    </div>
                    <Badge variant="outline">
                      {buildAvailability(
                        formValues.workingDays,
                        formValues.workingHoursStart,
                        formValues.workingHoursEnd,
                      ) || "Chưa chọn"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {WEEK_DAYS.map((day) => {
                      const active = formValues.workingDays.includes(day.value);
                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleWorkingDay(day.value)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                            active
                              ? "bg-slate-900 text-white border-slate-900"
                              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-900 dark:text-white">
                        Bắt đầu
                      </label>
                      <Input
                        type="time"
                        value={formValues.workingHoursStart}
                        onChange={(event) =>
                          setFormValues((prev) => ({
                            ...prev,
                            workingHoursStart: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-900 dark:text-white">
                        Kết thúc
                      </label>
                      <Input
                        type="time"
                        value={formValues.workingHoursEnd}
                        onChange={(event) =>
                          setFormValues((prev) => ({
                            ...prev,
                            workingHoursEnd: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-4 shadow-sm space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Trạng thái & hồ sơ
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Thiết lập trạng thái hiển thị của dược sĩ.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900 dark:text-white">
                      Trạng thái
                    </label>
                    <select
                      value={formValues.status}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          status: event.target.value,
                        }))
                      }
                      className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-slate-100"
                    >
                      <option value="ONLINE">Online</option>
                      <option value="OFFLINE">Offline</option>
                    </select>
                    <Badge
                      variant={
                        formValues.status === "ONLINE" ? "success" : "secondary"
                      }
                    >
                      {formValues.status === "ONLINE"
                        ? "Sẵn sàng"
                        : "Ngoại tuyến"}
                    </Badge>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={formValues.verified}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          verified: event.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    Đã xác minh hồ sơ
                  </label>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900 dark:text-white">
                      Ảnh đại diện (URL)
                    </label>
                    <Input
                      value={formValues.avatarUrl}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          avatarUrl: event.target.value,
                        }))
                      }
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-4 shadow-sm space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Thông tin bổ sung
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Bổ sung mô tả, học vấn hoặc ghi chú nội bộ.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900 dark:text-white">
                      Học vấn
                    </label>
                    <Input
                      value={formValues.education}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          education: event.target.value,
                        }))
                      }
                      placeholder="Đại học Dược Hà Nội"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900 dark:text-white">
                      Giới thiệu
                    </label>
                    <Textarea
                      value={formValues.bio}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          bio: event.target.value,
                        }))
                      }
                      placeholder="Kinh nghiệm tư vấn lâm sàng 7 năm..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {formError ? (
              <div className="rounded-lg bg-rose-50 text-rose-700 text-sm px-4 py-3">
                {formError}
              </div>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={formSaving}>
                {formSaving
                  ? "Đang lưu..."
                  : formMode === "edit"
                    ? "Lưu thay đổi"
                    : "Tạo hồ sơ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết dược sĩ</DialogTitle>
            <DialogDescription>
              Xem nhanh thông tin hồ sơ và lịch trực.
            </DialogDescription>
          </DialogHeader>
          {detailLoading ? (
            <div className="text-sm text-slate-500">Đang tải dữ liệu...</div>
          ) : null}
          {detailError ? (
            <div className="rounded-lg bg-rose-50 text-rose-700 text-sm px-4 py-3">
              {detailError}
            </div>
          ) : null}
          {detailData ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div
                  className="size-16 rounded-full bg-cover bg-center border border-slate-200"
                  style={{
                    backgroundImage: `url(${detailData.avatarUrl || "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=200&q=80"})`,
                  }}
                />
                <div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {detailData.name}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {detailData.specialty} • {detailData.experienceYears} năm
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-300">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Liên hệ
                  </p>
                  <p>Email: {detailData.email || "—"}</p>
                  <p>Điện thoại: {detailData.phone || "—"}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Chứng chỉ
                  </p>
                  <p>Mã: {detailData.licenseNumber || "—"}</p>
                  <p>Học vấn: {detailData.education || "—"}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Lịch trực
                  </p>
                  <p>
                    {buildAvailability(
                      detailData.workingDays || [],
                      detailData.workingHours?.split("-")[0]?.trim(),
                      detailData.workingHours?.split("-")[1]?.trim(),
                    ) ||
                      detailData.availability ||
                      "—"}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Trạng thái
                  </p>
                  <p>{detailData.status}</p>
                  <p>{detailData.verified ? "Đã xác thực" : "Chưa xác thực"}</p>
                </div>
              </div>
              {detailData.bio ? (
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Giới thiệu
                  </p>
                  <p>{detailData.bio}</p>
                </div>
              ) : null}
            </div>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDetailOpen(false)}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Thao tác này sẽ xóa vĩnh viễn hồ sơ dược sĩ.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
            >
              Hủy
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={notice.open}
        onOpenChange={(open) => setNotice((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{notice.title}</DialogTitle>
            <DialogDescription>{notice.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant={notice.tone === "error" ? "destructive" : "default"}
              onClick={() => setNotice((prev) => ({ ...prev, open: false }))}
            >
              Đã hiểu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminPharmacistsPage;
