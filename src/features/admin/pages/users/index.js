import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import AdminPageHeader from "../../components/shared/AdminPageHeader";
import StatsSection from "../../components/shared/StatsSection";
import AdminFilters from "../../components/user-management/AdminFilters";
import UserTable from "../../components/user-management/UserTable";
import UserDrawer from "../../components/user-management/UserDrawer";
import useUserStats from "../../../../shared/hooks/queries/useUserStats";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../shared/components/ui/dialog";
import { Button } from "../../../../shared/components/ui/button";
import { authApi } from "../../../../shared/api/httpClients";

const PAGE_SIZE = 10;

const requestJson = async (url, options = {}) => {
  const method = String(options?.method || "GET").toLowerCase();
  let requestData = options?.body;
  if (typeof requestData === "string") {
    try {
      requestData = JSON.parse(requestData);
    } catch {
      // Ignore invalid JSON body and send raw payload.
    }
  }

  try {
    const response = await authApi.request({
      url,
      method,
      data: requestData,
      signal: options?.signal,
      headers: options?.headers,
    });
    return response?.data ?? null;
  } catch (err) {
    const status = Number(err?.response?.status || err?.status || 0);
    const statusText = String(err?.response?.statusText || err?.message || "");
    const payload = err?.response?.data;
    const details =
      typeof payload === "string"
        ? payload.slice(0, 300)
        : JSON.stringify(payload || {}).slice(0, 300);
    const message = status
      ? `HTTP ${status} ${statusText}. ${details}`
      : statusText || "Request failed";

    const wrapped = new Error(message);
    wrapped.name = err?.name || "Error";
    wrapped.status = status;
    throw wrapped;
  }
};

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const normalizeAvatar = (value) => {
  if (!value) return "";
  return String(value).startsWith("data:")
    ? value
    : `data:image/png;base64,${value}`;
};

const normalizeUser = (user) => {
  const createdAt = user?.createdAt ? new Date(user.createdAt) : null;
  const createdAtValue =
    createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt.getTime() : 0;

  return {
    id: user?.id,
    name: user?.fullName || user?.email || "Chưa có tên",
    email: user?.email || "",
    phone: user?.phone || "",
    fullName: user?.fullName || "",
    role: "customer",
    status: "active",
    orders: Number(user?.orderCount || 0),
    lastActive: formatDate(user?.createdAt),
    lastActiveValue: createdAtValue,
    joined: formatDate(user?.createdAt),
    joinedValue: createdAtValue,
    tags: [],
    attention: false,
    avatar: normalizeAvatar(user?.avatarBase64),
    notes: "",
  };
};

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    query: "",
    role: "all",
    status: "all",
    sort: "recent",
    attentionOnly: false,
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [drawerUser, setDrawerUser] = useState(null);
  const [drawerMode, setDrawerMode] = useState("view");
  const [drawerSaving, setDrawerSaving] = useState(false);
  const [drawerDeleting, setDrawerDeleting] = useState(false);
  const [drawerActionError, setDrawerActionError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionDialog, setActionDialog] = useState({
    open: false,
    title: "",
    message: "",
    tone: "success",
  });
  const { data: userStatsData, isLoading: userStatsLoading } = useUserStats({
    range: "7d",
  });

  useEffect(() => {
    const controller = new AbortController();
    

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await requestJson("/api/admin/users", {
          signal: controller.signal,
        });
        console.log("[admin users] raw response:", data);
        setUsers((Array.isArray(data) ? data : []).map(normalizeUser));
      } catch (err) {
        if (err?.name === "AbortError") {
          return;
        }
        console.error("Failed to fetch admin users", err);
        setError("Không tải được danh sách người dùng. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    const list = users.filter((user) => {
      const matchesQuery = query
        ? `${user.name} ${user.email} ${user.phone}`
            .toLowerCase()
            .includes(query)
        : true;
      const matchesRole = filters.role === "all" || user.role === filters.role;
      const matchesStatus =
        filters.status === "all" || user.status === filters.status;
      const matchesAttention = filters.attentionOnly ? user.attention : true;
      return matchesQuery && matchesRole && matchesStatus && matchesAttention;
    });

    return list.sort((a, b) => {
      if (filters.sort === "orders") return b.orders - a.orders;
      if (filters.sort === "name") return a.name.localeCompare(b.name);
      if (filters.sort === "activity")
        return b.lastActiveValue - a.lastActiveValue;
      return b.joinedValue - a.joinedValue;
    });
  }, [users, filters]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE)),
    [filteredUsers.length],
  );

  const pagedUsers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, page]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const fallbackStats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "active").length;
    const pending = users.filter((u) => u.status === "pending").length;
    const suspended = users.filter((u) => u.status === "suspended").length;
    return {
      total,
      active,
      pending,
      suspended,
      newLast7d: 0,
    };
  }, [users]);

  const userMetrics = useMemo(
    () => userStatsData?.metrics || userStatsData || {},
    [userStatsData],
  );

  const stats = useMemo(
    () => [
      {
        key: "total",
        label: "Tổng người dùng",
        value: (userMetrics.totalUsers ?? fallbackStats.total).toLocaleString(
          "vi-VN",
        ),
        description: "Bao gồm khách hàng, dược sĩ và quản trị",
        icon: "group",
      },
      {
        key: "active",
        label: "Đang hoạt động",
        value: (userMetrics.activeUsers ?? fallbackStats.active).toLocaleString(
          "vi-VN",
        ),
        description: "Tài khoản đủ điều kiện giao dịch",
        icon: "verified",
      },
      {
        key: "pending",
        label: "Đang chờ duyệt",
        value: (
          userMetrics.pendingApprovalUsers ?? fallbackStats.pending
        ).toLocaleString("vi-VN"),
        description: "Cần xác minh thông tin bổ sung",
        icon: "hourglass_top",
      },
      {
        key: "blocked",
        label: "Đã khóa",
        value: (
          userMetrics.blockedUsers ?? fallbackStats.suspended
        ).toLocaleString("vi-VN"),
        description: "Theo dõi các trường hợp cần xử lý",
        icon: "block",
      },
      {
        key: "new7d",
        label: "Mới trong 7 ngày",
        value: (
          userMetrics.newUsersLast7Days ?? fallbackStats.newLast7d
        ).toLocaleString("vi-VN"),
        description: "Tài khoản mới tạo trong tuần gần nhất",
        icon: "person_add",
      },
    ],
    [fallbackStats, userMetrics],
  );

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleToggleSelectAll = (checked) => {
    setSelectedIds(checked ? pagedUsers.map((user) => user.id) : []);
  };

  const updateStatus = (ids, status) => {
    setUsers((prev) =>
      prev.map((user) =>
        ids.includes(user.id)
          ? {
              ...user,
              status,
              attention: status !== "active" ? true : user.attention,
            }
          : user,
      ),
    );
    setDrawerUser((prev) =>
      prev && ids.includes(prev.id) ? { ...prev, status } : prev,
    );
  };

  const persistStatus = async (ids, status) => {
    await Promise.all(
      ids.map((id) =>
        requestJson(
          `/api/admin/users/${id}/status?status=${encodeURIComponent(status)}`,
          { method: "POST" },
        ),
      ),
    );
    updateStatus(ids, status);
  };

  const handleBulkAction = (status) => {
    if (!selectedIds.length) return;
    persistStatus(selectedIds, status).catch((err) => {
      console.error("Bulk status update failed", err);
      setError("Không thể cập nhật trạng thái hàng loạt.");
    });
    setSelectedIds([]);
  };

  const handleRowStatusChange = (id, status) => {
    persistStatus([id], status).catch((err) => {
      console.error("Row status update failed", err);
      setError("Không thể cập nhật trạng thái người dùng.");
    });
  };

  const openCreateDrawer = () => {
    setDrawerActionError("");
    setDrawerMode("create");
    setDrawerUser(
      normalizeUser({ id: null, email: "", phone: "", fullName: "" }),
    );
  };

  const openEditDrawer = (user) => {
    setDrawerActionError("");
    setDrawerMode("edit");
    setDrawerUser(user);
  };

  const reloadUsers = async () => {
    const data = await requestJson("/api/admin/users");
    console.log("[admin users] reload response:", data);
    setUsers((Array.isArray(data) ? data : []).map(normalizeUser));
  };

  const handleSaveUser = async (payload) => {
    try {
      setDrawerSaving(true);
      setDrawerActionError("");

      if (drawerMode === "create") {
        await requestJson("/api/admin/users", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } else if (drawerUser?.id) {
        await requestJson(`/api/admin/users/${drawerUser.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      }

      await reloadUsers();
      setDrawerUser(null);
      setActionDialog({
        open: true,
        title: "Lưu thành công",
        message:
          drawerMode === "create"
            ? "Đã tạo người dùng mới."
            : "Đã cập nhật thông tin người dùng.",
        tone: "success",
      });
    } catch (err) {
      console.error("Save user failed", err);
      setDrawerActionError(
        err?.message || "Không thể lưu người dùng. Vui lòng thử lại.",
      );
      setActionDialog({
        open: true,
        title: "Không thể lưu",
        message: err?.message || "Không thể lưu người dùng. Vui lòng thử lại.",
        tone: "error",
      });
    } finally {
      setDrawerSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!drawerUser?.id) return;
    try {
      setDrawerDeleting(true);
      setDrawerActionError("");
      await requestJson(`/api/admin/users/${drawerUser.id}`, {
        method: "DELETE",
      });
      await reloadUsers();
      setDrawerUser(null);
      setActionDialog({
        open: true,
        title: "Đã xóa người dùng",
        message: "Người dùng đã được xóa khỏi hệ thống.",
        tone: "success",
      });
    } catch (err) {
      console.error("Delete user failed", err);
      setDrawerActionError(
        err?.message || "Không thể xóa người dùng. Vui lòng thử lại.",
      );
      setActionDialog({
        open: true,
        title: "Không thể xóa",
        message: err?.message || "Không thể xóa người dùng. Vui lòng thử lại.",
        tone: "error",
      });
    } finally {
      setDrawerDeleting(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      query: "",
      role: "all",
      status: "all",
      sort: "recent",
      attentionOnly: false,
    });
    setSelectedIds([]);
    setPage(1);
  };

  return (
    <AdminLayout activeKey="users">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-5">
        <AdminPageHeader
          title="Quản lý người dùng"
          subtitle="Theo dõi trạng thái tài khoản và chất lượng vận hành"
          actions={
            <>
              <button
                type="button"
                className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => alert("Đã gửi hướng dẫn kích hoạt.")}
              >
                <span className="material-symbols-outlined text-[18px]">
                  outgoing_mail
                </span>
                Gửi lời mời
              </button>
              <button
                type="button"
                className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90"
                onClick={openCreateDrawer}
              >
                <span className="material-symbols-outlined text-[18px]">
                  add
                </span>
                Thêm người dùng
              </button>
            </>
          }
        />

        <StatsSection
          items={stats}
          loading={userStatsLoading && !users.length}
          emptyText="Chưa có dữ liệu tổng quan người dùng"
        />

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm flex flex-col gap-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Danh sách người dùng
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {loading
                  ? "Đang tải danh sách..."
                  : `Đã lọc ${filteredUsers.length} / ${users.length} hồ sơ`}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Đã chọn {selectedIds.length}
              </span>
              <button
                type="button"
                disabled={!selectedIds.length}
                onClick={() => handleBulkAction("active")}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-100 text-emerald-700 disabled:opacity-50"
              >
                Kích hoạt
              </button>
              <button
                type="button"
                disabled={!selectedIds.length}
                onClick={() => handleBulkAction("suspended")}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-rose-100 text-rose-700 disabled:opacity-50"
              >
                Tạm khóa
              </button>
            </div>
          </div>

          <AdminFilters
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
          />
        </div>

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <UserTable
          users={pagedUsers}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onRowClick={openEditDrawer}
          onStatusChange={handleRowStatusChange}
          loading={loading}
        />

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 shadow-sm flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Hiển thị {(page - 1) * PAGE_SIZE + (pagedUsers.length ? 1 : 0)}-
            {(page - 1) * PAGE_SIZE + pagedUsers.length} /{" "}
            {filteredUsers.length} người dùng
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 disabled:opacity-50"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
            >
              Trước
            </button>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Trang {page}/{totalPages}
            </span>
            <button
              type="button"
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 disabled:opacity-50"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages}
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      <UserDrawer
        user={drawerUser}
        mode={drawerMode}
        saving={drawerSaving}
        deleting={drawerDeleting}
        error={drawerActionError}
        onClose={() => setDrawerUser(null)}
        onSave={handleSaveUser}
        onDelete={handleDeleteUser}
        onChangeStatus={(status) =>
          drawerUser?.id
            ? persistStatus([drawerUser.id], status).catch((err) => {
                console.error("Drawer status update failed", err);
                setDrawerActionError(
                  "Không thể cập nhật trạng thái. Vui lòng thử lại.",
                );
              })
            : null
        }
      />

      <Dialog
        open={actionDialog.open}
        onOpenChange={(open) => setActionDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{actionDialog.title}</DialogTitle>
            <DialogDescription>{actionDialog.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant={
                actionDialog.tone === "error" ? "destructive" : "default"
              }
              onClick={() =>
                setActionDialog((prev) => ({ ...prev, open: false }))
              }
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminUsersPage;
