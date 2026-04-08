import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi as api } from "../../../../shared/api/httpClients";
import AdminLayout from "../../components/AdminLayout";
import FilterBar from "../../components/pharmacists/FilterBar";
import PharmacistTable from "../../components/pharmacists/PharmacistTable";
import PharmacistDrawer from "../../components/pharmacists/PharmacistDrawer";
import AdminPageContainer from "../../../../shared/components/common/AdminPageContainer";
import AdminTableWrapper from "../../../../shared/components/common/AdminTableWrapper";
import { useAdminBranchSelection } from "../../../../shared/hooks/useAdminBranchSelection";
import { useBranches } from "../../../../shared/hooks/useBranches";

const DEBOUNCE_MS = 300;
const pagerBtn =
  "rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

const useDebouncedValue = (value, delay = DEBOUNCE_MS) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

const normalizeRows = (items = []) =>
  items.map((item) => ({
    id: item.id,
    name: item.name || "-",
    email: item.email || "",
    phone: item.phone || "",
    specialty: item.specialty || "-",
    experienceYears: Number(item.experienceYears || 0),
    branchName: item.branchName || item.branch?.name || "-",
    status: item.status || "PENDING",
    verified: Boolean(item.verified),
    availability: item.availability || item.workingHours || "-",
    avatarUrl: item.avatarUrl || "",
    createdAt: item.createdAt || item.createdDate || null,
    updatedAt: item.updatedAt || null,
    licenseNumber: item.licenseNumber || "",
    education: item.education || "",
    languages: item.languages || [],
    workingDays: item.workingDays || [],
    workingHours: item.workingHours || "",
    consultationModes: item.consultationModes || [],
    branchId: item.branchId || item.branch?.id || "",
    certifications: item.certifications || "",
    lastActivity: item.lastActivity || "",
    bio: item.bio || "",
    code: item.code || "",
    rating: item.rating ?? 0,
    reviewCount: item.reviewCount ?? 0,
  }));

const AdminPharmacistsPage = () => {
  const navigate = useNavigate();
  const { branches } = useBranches();
  const { branchId, setBranchId } = useAdminBranchSelection({
    storageKey: "admin.branchId",
    urlParam: "branchId",
    persistToUrl: true,
  });

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);

  const [specialty, setSpecialty] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedRowIds, setSelectedRowIds] = useState([]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerError, setDrawerError] = useState("");
  const [drawerData, setDrawerData] = useState(null);

  const requestParams = useMemo(() => {
    const params = {
      page,
      pageSize,
      size: pageSize,
      sortBy,
      sortDir,
      sort: `${sortBy},${sortDir}`,
    };
    if (branchId) params.branchId = branchId;
    if (debouncedQuery.trim()) params.query = debouncedQuery.trim();
    if (specialty !== "all") params.specialty = specialty;
    if (status === "VERIFIED") {
      params.verification = "verified";
    } else if (status === "PENDING") {
      params.verification = "pending";
    } else if (status !== "all") {
      params.status = status;
    }
    return params;
  }, [
    page,
    pageSize,
    sortBy,
    sortDir,
    branchId,
    debouncedQuery,
    specialty,
    status,
  ]);

  const fetchList = useCallback(
    async (signal) => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/api/admin/pharmacists", {
          params: requestParams,
          signal,
        });
        const payload = response.data || {};
        const content = payload.content || payload.items || [];
        setRows(normalizeRows(content));
        setTotal(
          Number(payload.totalElements ?? payload.total ?? content.length ?? 0),
        );
        setSelectedRowIds([]);
      } catch (err) {
        if (err?.name !== "AbortError") {
          setError(err?.message || "Unable to load pharmacists");
        }
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [requestParams],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchList(controller.signal);
    return () => controller.abort();
  }, [fetchList]);

  useEffect(() => {
    setPage(0);
  }, [debouncedQuery, specialty, status, branchId, pageSize]);

  const openDrawer = useCallback(async (row) => {
    if (!row?.id) return;
    setDrawerOpen(true);
    setDrawerLoading(true);
    setDrawerError("");
    setDrawerData(row);

    try {
      const response = await api.get(`/api/admin/pharmacists/${row.id}`);
      setDrawerData((prev) => ({
        ...(prev || {}),
        ...normalizeRows([response.data])[0],
      }));
    } catch (err) {
      setDrawerError(err?.message || "Unable to load details");
    } finally {
      setDrawerLoading(false);
    }
  }, []);

  const onSelectRow = useCallback((id, checked) => {
    setSelectedRowIds((prev) =>
      checked
        ? [...new Set([...prev, id])]
        : prev.filter((itemId) => itemId !== id),
    );
  }, []);

  const onSelectAll = useCallback(
    (checked) => {
      if (!checked) {
        setSelectedRowIds([]);
        return;
      }
      setSelectedRowIds(rows.map((row) => row.id));
    },
    [rows],
  );

  const patchStatus = useCallback(async (row, nextIsActive) => {
    const current = String(row?.status || "").toUpperCase();
    const nextStatus =
      current === "SUSPENDED" || current === "ACTIVE" || current === "INACTIVE"
        ? nextIsActive
          ? "ACTIVE"
          : "SUSPENDED"
        : nextIsActive
          ? "ONLINE"
          : "OFFLINE";

    const response = await api.patch(
      `/api/admin/pharmacists/${row.id}/status`,
      {
        status: nextStatus,
        availability: row.availability,
      },
    );
    return normalizeRows([response.data])[0];
  }, []);

  const onToggleStatus = useCallback(
    async (row) => {
      try {
        const isActive = String(row.status || "").toUpperCase() !== "SUSPENDED";
        const updated = await patchStatus(row, !isActive);
        setRows((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item)),
        );
        if (drawerData?.id === updated.id) {
          setDrawerData((prev) => ({ ...(prev || {}), ...updated }));
        }
      } catch (err) {
        setError(err?.message || "Unable to change status");
      }
    },
    [patchStatus, drawerData?.id],
  );

  const onDelete = useCallback(
    async (row) => {
      if (!row?.id) return;
      try {
        await api.delete(`/api/admin/pharmacists/${row.id}`);
        setRows((prev) => prev.filter((item) => item.id !== row.id));
        setTotal((prev) => Math.max(0, prev - 1));
        setSelectedRowIds((prev) => prev.filter((id) => id !== row.id));
        if (drawerData?.id === row.id) {
          setDrawerOpen(false);
        }
      } catch (err) {
        setError(err?.message || "Unable to delete pharmacist");
      }
    },
    [drawerData?.id],
  );

  const runBulkDelete = useCallback(async () => {
    if (!selectedRowIds.length) return;

    try {
      await Promise.all(
        selectedRowIds.map((id) => api.delete(`/api/admin/pharmacists/${id}`)),
      );
      setRows((prev) =>
        prev.filter((item) => !selectedRowIds.includes(item.id)),
      );
      setTotal((prev) => Math.max(0, prev - selectedRowIds.length));
      setSelectedRowIds([]);
    } catch (err) {
      setError(err?.message || "Bulk delete failed");
    }
  }, [selectedRowIds]);

  const runBulkStatus = useCallback(
    async (active) => {
      if (!selectedRowIds.length) return;

      try {
        const updates = await Promise.all(
          selectedRowIds.map(async (id) => {
            const row = rows.find((item) => item.id === id);
            if (!row) return null;
            return patchStatus(row, active);
          }),
        );
        const byId = new Map(
          updates.filter(Boolean).map((item) => [item.id, item]),
        );
        setRows((prev) => prev.map((item) => byId.get(item.id) || item));
        setSelectedRowIds([]);
      } catch (err) {
        setError(err?.message || "Bulk status update failed");
      }
    },
    [selectedRowIds, rows, patchStatus],
  );

  return (
    <AdminLayout activeKey="pharmacists">
      <AdminPageContainer>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              Quản lý dược sĩ
            </h1>
            <p className="text-sm text-slate-400">
              Quản lý danh sách, trạng thái hoạt động và hồ sơ dược sĩ.
            </p>
          </div>
          <div className="text-xs text-slate-500">
            Tổng {total.toLocaleString("vi-VN")} dược sĩ
          </div>
        </div>

        <FilterBar
          query={query}
          onQueryChange={setQuery}
          branchId={branchId}
          branches={branches}
          onBranchChange={setBranchId}
          specialty={specialty}
          onSpecialtyChange={setSpecialty}
          status={status}
          onStatusChange={setStatus}
          sortBy={sortBy}
          sortDir={sortDir}
          onSortChange={(nextSortBy, nextSortDir) => {
            setSortBy(nextSortBy);
            setSortDir(nextSortDir || "asc");
          }}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          onClearAll={() => {
            setQuery("");
            setBranchId("");
            setSpecialty("all");
            setStatus("all");
            setSortBy("createdAt");
            setSortDir("desc");
            setPageSize(10);
          }}
        />

        <AdminTableWrapper className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              disabled={!selectedRowIds.length}
              onClick={runBulkDelete}
            >
              Xóa đã chọn
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              disabled={!selectedRowIds.length}
              onClick={() => runBulkStatus(true)}
            >
              Kích hoạt đã chọn
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              disabled={!selectedRowIds.length}
              onClick={() => runBulkStatus(false)}
            >
              Vô hiệu hóa đã chọn
            </button>
            <span className="ml-auto text-xs text-slate-500">
              {selectedRowIds.length
                ? `${selectedRowIds.length} mục đã chọn`
                : "Chưa chọn mục nào"}
            </span>
          </div>
        </AdminTableWrapper>

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {!loading && rows.length === 0 ? (
          <AdminTableWrapper className="p-8 text-center">
            <p className="text-sm font-medium text-slate-700">
              Không tìm thấy dược sĩ
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Thử thay đổi bộ lọc hoặc từ khóa để tiếp tục.
            </p>
          </AdminTableWrapper>
        ) : (
          <PharmacistTable
            rows={rows}
            loading={loading}
            selectedRowIds={selectedRowIds}
            onSelectRow={onSelectRow}
            onSelectAll={onSelectAll}
            onOpenDrawer={openDrawer}
            onEdit={(row) => navigate(`/admin/pharmacists/${row.id}`)}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
          />
        )}

        <AdminTableWrapper className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-slate-500">
              Tổng {total.toLocaleString("vi-VN")} dược sĩ
            </div>
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
                Trang {Math.max(1, page + 1)} /{" "}
                {Math.max(1, Math.ceil(total / pageSize) || 1)}
              </span>
              <button
                type="button"
                className={pagerBtn}
                disabled={page >= Math.max(0, Math.ceil(total / pageSize) - 1)}
                onClick={() =>
                  setPage((prev) =>
                    Math.min(
                      Math.max(0, Math.ceil(total / pageSize) - 1),
                      prev + 1,
                    ),
                  )
                }
              >
                Sau
              </button>
            </div>
          </div>
        </AdminTableWrapper>
      </AdminPageContainer>

      <PharmacistDrawer
        open={drawerOpen}
        pharmacist={drawerData}
        loading={drawerLoading}
        error={drawerError}
        onClose={() => setDrawerOpen(false)}
      />
    </AdminLayout>
  );
};

export default AdminPharmacistsPage;
