import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import BranchToolbar from "../../components/branches/BranchToolbar";
import BranchTable from "../../components/branches/BranchTable";
import BranchFormDialog from "../../components/branches/BranchFormDialog";
import BranchDetailModal from "../../components/branches/BranchDetailModal";
import AdminPageContainer from "../../../../shared/components/common/AdminPageContainer";
import AdminTableWrapper from "../../../../shared/components/common/AdminTableWrapper";
import {
  addBranchHoliday,
  assignBranchStaff,
  createBranch,
  deleteBranchHoliday,
  getBranchHours,
  getBranchSettings,
  listAdminBranches,
  listBranchAudit,
  listBranchHolidays,
  listBranchStaff,
  removeBranchStaff,
  updateBranch,
  updateBranchStatus,
  upsertBranchHours,
  upsertBranchSettings,
} from "../../api/adminBranchApi";

const ACTOR = "admin-ui";

const emptyCreateForm = {
  code: "",
  name: "",
  status: "ACTIVE",
  addressLine: "",
  ward: "",
  district: "",
  city: "",
  province: "",
  country: "VN",
  latitude: "",
  longitude: "",
  phone: "",
  email: "",
  timezone: "Asia/Ho_Chi_Minh",
  notes: "",
  coverImageUrl: "",
};

const mapBranchToUpdatePayload = (form) => ({
  name: form.name,
  status: form.status,
  addressLine: form.addressLine,
  ward: form.ward,
  district: form.district,
  city: form.city,
  province: form.province,
  country: form.country,
  latitude: form.latitude === "" ? null : Number(form.latitude),
  longitude: form.longitude === "" ? null : Number(form.longitude),
  phone: form.phone,
  email: form.email,
  timezone: form.timezone,
  notes: form.notes,
  coverImageUrl: form.coverImageUrl,
});

const mapBranchToCreatePayload = (form) => ({
  code: String(form.code || "").trim(),
  ...mapBranchToUpdatePayload(form),
});

const normalizeBranch = (b) => ({
  id: b?.id,
  code: b?.code || "",
  name: b?.name || "",
  status: (b?.status || "ACTIVE").toUpperCase(),
  addressLine: b?.addressLine || "",
  ward: b?.ward || "",
  district: b?.district || "",
  city: b?.city || "",
  province: b?.province || "",
  country: b?.country || "VN",
  phone: b?.phone || "",
  email: b?.email || "",
  timezone: b?.timezone || "Asia/Ho_Chi_Minh",
});

const pagerBtn =
  "rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

const AdminBranchesPage = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [cityFilter, setCityFilter] = useState("ALL");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [reloadIndex, setReloadIndex] = useState(0);

  const [selectedBranchId, setSelectedBranchId] = useState("");
  const selectedBranch = useMemo(
    () => branches.find((b) => b.id === selectedBranchId) || null,
    [branches, selectedBranchId],
  );

  const [tab, setTab] = useState("info");
  const [detailOpen, setDetailOpen] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [formValues, setFormValues] = useState(emptyCreateForm);

  const [settingsState, setSettingsState] = useState({
    loading: false,
    error: "",
    data: null,
    saving: false,
    saveError: "",
  });
  const [hoursState, setHoursState] = useState({
    loading: false,
    error: "",
    data: null,
    saving: false,
    saveError: "",
  });
  const [holidaysState, setHolidaysState] = useState({
    loading: false,
    error: "",
    items: [],
    saving: false,
    saveError: "",
  });
  const [staffState, setStaffState] = useState({
    loading: false,
    error: "",
    items: [],
    saving: false,
    saveError: "",
  });
  const [auditState, setAuditState] = useState({
    loading: false,
    error: "",
    items: [],
  });

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const params = {};
        if (statusFilter && statusFilter !== "ALL") {
          params.status = statusFilter;
        }
        const payload = await listAdminBranches(params, {
          signal: controller.signal,
        });
        const list = Array.isArray(payload) ? payload : payload?.content || [];
        const normalized = list.map(normalizeBranch);
        setBranches(normalized);
        if (!controller.signal.aborted) {
          setSelectedBranchId((prev) => {
            if (prev && normalized.some((b) => b.id === prev)) return prev;
            return normalized[0]?.id || "";
          });
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Không thể tải danh sách chi nhánh");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    load();
    return () => controller.abort();
  }, [statusFilter, reloadIndex]);

  const filteredBranches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return branches.filter((b) => {
      const code = String(b.code || "").toLowerCase();
      const name = String(b.name || "").toLowerCase();
      const city = String(b.city || "").toLowerCase();
      const matchesQuery =
        !q || code.includes(q) || name.includes(q) || city.includes(q);
      const matchesCity = cityFilter === "ALL" || (b.city || "") === cityFilter;
      return matchesQuery && matchesCity;
    });
  }, [branches, query, cityFilter]);

  const cityOptions = useMemo(() => {
    return Array.from(
      new Set(
        branches
          .map((branch) => String(branch.city || "").trim())
          .filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b, "vi"));
  }, [branches]);

  const pagedBranches = useMemo(() => {
    const start = page * pageSize;
    return filteredBranches.slice(start, start + pageSize);
  }, [filteredBranches, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredBranches.length / pageSize));

  useEffect(() => {
    setPage(0);
  }, [query, statusFilter, cityFilter, pageSize]);

  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  const openCreate = () => {
    setFormMode("create");
    setFormValues(emptyCreateForm);
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (branch) => {
    const b = normalizeBranch(branch);
    setFormMode("edit");
    setFormValues({
      ...emptyCreateForm,
      ...b,
      code: b.code || "",
      notes: branch?.notes || "",
      coverImageUrl: branch?.coverImageUrl || "",
      latitude: branch?.latitude ?? "",
      longitude: branch?.longitude ?? "",
    });
    setFormError("");
    setFormOpen(true);
  };

  const openDetail = (branchId) => {
    setSelectedBranchId(branchId);
    setTab("info");
    setDetailOpen(true);
  };

  const submitForm = async () => {
    setFormSaving(true);
    setFormError("");
    try {
      if (formMode === "create") {
        const payload = mapBranchToCreatePayload(formValues);
        const created = await createBranch(payload, ACTOR);
        setBranches((prev) => [normalizeBranch(created), ...prev]);
        setSelectedBranchId(created?.id || "");
        setTab("info");
        setFormOpen(false);
      } else {
        if (!selectedBranchId) throw new Error("Chưa chọn chi nhánh");
        const payload = mapBranchToUpdatePayload(formValues);
        const updated = await updateBranch(selectedBranchId, payload, ACTOR);
        setBranches((prev) =>
          prev.map((b) =>
            b.id === selectedBranchId ? normalizeBranch(updated) : b,
          ),
        );
        setFormOpen(false);
      }
    } catch (err) {
      setFormError(err.message || "Không thể lưu chi nhánh");
    } finally {
      setFormSaving(false);
    }
  };

  const toggleStatus = async (branch) => {
    const next = branch.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const updated = await updateBranchStatus(branch.id, next, ACTOR);
      setBranches((prev) =>
        prev.map((b) => (b.id === branch.id ? normalizeBranch(updated) : b)),
      );
    } catch (err) {
      setError(err.message || "Không thể cập nhật trạng thái");
    }
  };

  const loadSettings = async (branchId, signal) => {
    setSettingsState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const data = await getBranchSettings(branchId, { signal });
      setSettingsState((s) => ({ ...s, data, loading: false }));
    } catch (err) {
      if (err.name !== "AbortError") {
        setSettingsState((s) => ({
          ...s,
          error: err.message || "Không thể tải cấu hình",
          loading: false,
        }));
      }
    }
  };

  const loadHours = async (branchId, signal) => {
    setHoursState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const data = await getBranchHours(branchId, { signal });
      setHoursState((s) => ({ ...s, data, loading: false }));
    } catch (err) {
      if (err.name !== "AbortError") {
        setHoursState((s) => ({
          ...s,
          error: err.message || "Không thể tải giờ làm",
          loading: false,
        }));
      }
    }
  };

  const loadHolidays = async (branchId, signal) => {
    setHolidaysState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const data = await listBranchHolidays(branchId, { signal });
      const items = Array.isArray(data) ? data : data?.content || [];
      setHolidaysState((s) => ({ ...s, items, loading: false }));
    } catch (err) {
      if (err.name !== "AbortError") {
        setHolidaysState((s) => ({
          ...s,
          error: err.message || "Không thể tải ngày nghỉ",
          loading: false,
        }));
      }
    }
  };

  const loadStaff = async (branchId, signal) => {
    setStaffState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const data = await listBranchStaff(branchId, { signal });
      const items = Array.isArray(data) ? data : data?.content || [];
      setStaffState((s) => ({ ...s, items, loading: false }));
    } catch (err) {
      if (err.name !== "AbortError") {
        setStaffState((s) => ({
          ...s,
          error: err.message || "Không thể tải nhân sự",
          loading: false,
        }));
      }
    }
  };

  const loadAudit = async (branchId, signal) => {
    setAuditState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const data = await listBranchAudit(branchId, { signal });
      const items = Array.isArray(data) ? data : data?.content || [];
      setAuditState((s) => ({ ...s, items, loading: false }));
    } catch (err) {
      if (err.name !== "AbortError") {
        setAuditState((s) => ({
          ...s,
          error: err.message || "Không thể tải audit",
          loading: false,
        }));
      }
    }
  };

  useEffect(() => {
    if (!selectedBranchId) return;

    const controller = new AbortController();
    loadSettings(selectedBranchId, controller.signal);
    loadHours(selectedBranchId, controller.signal);
    loadHolidays(selectedBranchId, controller.signal);
    loadStaff(selectedBranchId, controller.signal);
    loadAudit(selectedBranchId, controller.signal);

    return () => controller.abort();
  }, [selectedBranchId]);

  const saveSettings = async (payload) => {
    if (!selectedBranchId) return;
    setSettingsState((s) => ({ ...s, saving: true, saveError: "" }));
    try {
      const data = await upsertBranchSettings(selectedBranchId, payload, ACTOR);
      setSettingsState((s) => ({ ...s, data, saving: false }));
    } catch (err) {
      setSettingsState((s) => ({
        ...s,
        saving: false,
        saveError: err.message || "Không thể lưu cấu hình",
      }));
    }
  };

  const saveHours = async (payload) => {
    if (!selectedBranchId) return;
    setHoursState((s) => ({ ...s, saving: true, saveError: "" }));
    try {
      const data = await upsertBranchHours(selectedBranchId, payload, ACTOR);
      setHoursState((s) => ({ ...s, data, saving: false }));
    } catch (err) {
      setHoursState((s) => ({
        ...s,
        saving: false,
        saveError: err.message || "Không thể lưu giờ làm",
      }));
    }
  };

  const createHoliday = async (payload) => {
    if (!selectedBranchId) return;
    setHolidaysState((s) => ({ ...s, saving: true, saveError: "" }));
    try {
      const item = await addBranchHoliday(selectedBranchId, payload, ACTOR);
      setHolidaysState((s) => ({
        ...s,
        items: [item, ...(s.items || [])],
        saving: false,
      }));
      return item;
    } catch (err) {
      setHolidaysState((s) => ({
        ...s,
        saving: false,
        saveError: err.message || "Không thể thêm ngày nghỉ",
      }));
      throw err;
    }
  };

  const removeHoliday = async (holidayId) => {
    if (!selectedBranchId) return;
    setHolidaysState((s) => ({ ...s, saving: true, saveError: "" }));
    try {
      await deleteBranchHoliday(selectedBranchId, holidayId, ACTOR);
      setHolidaysState((s) => ({
        ...s,
        items: (s.items || []).filter((h) => h.id !== holidayId),
        saving: false,
      }));
      return true;
    } catch (err) {
      setHolidaysState((s) => ({
        ...s,
        saving: false,
        saveError: err.message || "Không thể xóa ngày nghỉ",
      }));
      throw err;
    }
  };

  const addStaff = async (payload) => {
    if (!selectedBranchId) return;
    setStaffState((s) => ({ ...s, saving: true, saveError: "" }));
    try {
      const item = await assignBranchStaff(selectedBranchId, payload, ACTOR);
      setStaffState((s) => ({
        ...s,
        items: [
          item,
          ...(s.items || []).filter((p) => p.userId !== item.userId),
        ],
        saving: false,
      }));
    } catch (err) {
      setStaffState((s) => ({
        ...s,
        saving: false,
        saveError: err.message || "Không thể gán nhân sự",
      }));
    }
  };

  const deleteStaff = async (userId) => {
    if (!selectedBranchId) return;
    setStaffState((s) => ({ ...s, saving: true, saveError: "" }));
    try {
      await removeBranchStaff(selectedBranchId, userId, ACTOR);
      setStaffState((s) => ({
        ...s,
        items: (s.items || []).filter((p) => p.userId !== userId),
        saving: false,
      }));
    } catch (err) {
      setStaffState((s) => ({
        ...s,
        saving: false,
        saveError: err.message || "Không thể gỡ nhân sự",
      }));
    }
  };

  const tabs = [
    { key: "info", label: "Thông tin" },
    { key: "settings", label: "Cài đặt" },
    { key: "hours", label: "Giờ làm" },
    { key: "holidays", label: "Ngày nghỉ" },
    { key: "staff", label: "Nhân sự" },
    { key: "audit", label: "Audit" },
  ];

  return (
    <AdminLayout activeKey="branches">
      <AdminPageContainer>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              Quản lý chi nhánh
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Tạo/sửa chi nhánh, cấu hình giờ làm và phân quyền nhân sự
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              type="button"
              onClick={openCreate}
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              + Tạo chi nhánh
            </button>
            <button
              type="button"
              onClick={() => setReloadIndex((x) => x + 1)}
              disabled={loading}
              className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[18px]">
                refresh
              </span>
              Tải lại
            </button>
          </div>
        </div>

        <BranchToolbar
          query={query}
          onQueryChange={setQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          cityFilter={cityFilter}
          onCityFilterChange={setCityFilter}
          cityOptions={cityOptions}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          onReset={() => {
            setQuery("");
            setStatusFilter("ALL");
            setCityFilter("ALL");
            setPageSize(10);
            setPage(0);
          }}
        />

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        <BranchTable
          items={pagedBranches}
          loading={loading}
          selectedId={selectedBranchId}
          onView={openDetail}
          onEdit={openEdit}
          onToggleStatus={toggleStatus}
        />

        <AdminTableWrapper className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-slate-500">
              Tổng {filteredBranches.length.toLocaleString("vi-VN")} chi nhánh
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

        <BranchFormDialog
          open={formOpen}
          mode={formMode}
          values={formValues}
          onChange={setFormValues}
          onOpenChange={setFormOpen}
          onSubmit={submitForm}
          saving={formSaving}
          error={formError}
        />

        <BranchDetailModal
          open={detailOpen}
          onOpenChange={setDetailOpen}
          branch={selectedBranch}
          tab={tab}
          tabs={tabs}
          onTabChange={setTab}
          onEdit={() => selectedBranch && openEdit(selectedBranch)}
          settingsState={settingsState}
          hoursState={hoursState}
          holidaysState={holidaysState}
          staffState={staffState}
          auditState={auditState}
          onSaveSettings={saveSettings}
          onSaveHours={saveHours}
          onCreateHoliday={createHoliday}
          onDeleteHoliday={removeHoliday}
          onAssignStaff={addStaff}
          onRemoveStaff={deleteStaff}
        />
      </AdminPageContainer>
    </AdminLayout>
  );
};

export default AdminBranchesPage;
