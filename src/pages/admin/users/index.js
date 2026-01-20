import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import AdminHeaderBar from "../../../components/admin/user-management/AdminHeaderBar";
import AdminStats from "../../../components/admin/user-management/AdminStats";
import AdminFilters from "../../../components/admin/user-management/AdminFilters";
import UserTable from "../../../components/admin/user-management/UserTable";
import UserDrawer from "../../../components/admin/user-management/UserDrawer";

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson
    ? await response.json().catch(() => null)
    : await response.text().catch(() => "");

  if (!response.ok) {
    const details =
      typeof payload === "string"
        ? payload.slice(0, 300)
        : JSON.stringify(payload || {}).slice(0, 300);
    throw new Error(
      `HTTP ${response.status} ${response.statusText}. ${details}`
    );
  }

  return payload;
};

const normalizeUser = (user) => ({
  id: user.id,
  name: user.fullName || user.email || "Chưa có tên",
  email: user.email,
  phone: user.phone,
  fullName: user.fullName,
  role: "customer",
  status: "active",
  orders: 0,
  lastActive: "",
  lastActiveValue: Date.now(),
  joined: "",
  joinedValue: Date.now(),
  tags: [],
  attention: false,
  avatar: undefined,
  notes: "",
});

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    query: "",
    role: "all",
    status: "all",
    sort: "recent",
    attentionOnly: false,
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [drawerUser, setDrawerUser] = useState(null);
  const [drawerMode, setDrawerMode] = useState("view"); // view | create | edit
  const [drawerSaving, setDrawerSaving] = useState(false);
  const [drawerDeleting, setDrawerDeleting] = useState(false);
  const [drawerActionError, setDrawerActionError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await requestJson("/api/admin/users", {
          signal: controller.signal,
        });
        setUsers((Array.isArray(data) ? data : []).map(normalizeUser));
      } catch (err) {
        if (err && err.name === "AbortError") {
          // Fetch was aborted due to unmount/cleanup — ignore silently
          console.debug("Admin users fetch aborted");
          return;
        }
        console.error("Failed to fetch admin users", err);
        const msg =
          (err && err.message) || "Không tải được danh sách người dùng.";
        if (msg.includes("HTTP 401")) {
          setError(
            "API trả về 401 (Unauthorized). Nếu bạn đang gọi qua gateway, hãy kiểm tra cấu hình security của gateway/admin-bff hoặc token đăng nhập."
          );
        } else if (msg.includes("<!DOCTYPE") || msg.includes("text/html")) {
          setError(
            "Máy chủ trả về HTML (không phải JSON). Thường do gọi nhầm host/port hoặc React dev server trả index.html. Hãy chắc `proxy` trỏ về gateway và gateway/admin-bff đang chạy."
          );
        } else {
          setError("Không tải được danh sách người dùng. Vui lòng thử lại.");
        }
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

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "active").length;
    const pending = users.filter((u) => u.status === "pending").length;
    const suspended = users.filter((u) => u.status === "suspended").length;
    return [
      {
        label: "Tổng người dùng",
        value: total,
        icon: "group",
        tint: "bg-primary",
        caption: "Tính cả khách hàng, dược sĩ và quản trị",
      },
      {
        label: "Đang hoạt động",
        value: active,
        icon: "verified",
        tint: "bg-emerald-500",
        delta: "+8.4% so với tuần trước",
      },
      {
        label: "Đang xét duyệt",
        value: pending,
        icon: "hourglass",
        tint: "bg-amber-500",
        caption: "Cần kiểm tra giấy tờ và xác minh thông tin",
      },
      {
        label: "Tạm khóa",
        value: suspended,
        icon: "block",
        tint: "bg-rose-500",
        caption: "Theo dõi và xử lý sớm các trường hợp vi phạm",
      },
    ];
  }, [users]);

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = (checked) => {
    setSelectedIds(checked ? filteredUsers.map((user) => user.id) : []);
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
          : user
      )
    );
    setDrawerUser((prev) =>
      prev && ids.includes(prev.id) ? { ...prev, status } : prev
    );
  };

  const persistStatus = async (ids, status) => {
    // Call admin-bff status endpoint (currently a placeholder) so UI actions hit the correct API.
    await Promise.all(
      ids.map((id) =>
        requestJson(
          `/api/admin/users/${id}/status?status=${encodeURIComponent(status)}`,
          { method: "POST" }
        )
      )
    );
    updateStatus(ids, status);
  };

  const handleBulkAction = (status) => {
    if (!selectedIds.length) return;
    persistStatus(selectedIds, status).catch((err) => {
      console.error("Bulk status update failed", err);
      setError("Không thể cập nhật trạng thái hàng loạt. Vui lòng thử lại.");
    });
    setSelectedIds([]);
  };

  const handleRowStatusChange = (id, status) => {
    persistStatus([id], status).catch((err) => {
      console.error("Row status update failed", err);
      setError("Không thể cập nhật trạng thái người dùng. Vui lòng thử lại.");
    });
  };

  const openCreateDrawer = () => {
    setDrawerActionError("");
    setDrawerMode("create");
    setDrawerUser(
      normalizeUser({ id: null, email: "", phone: "", fullName: "" })
    );
  };

  const openEditDrawer = (user) => {
    setDrawerActionError("");
    setDrawerMode("edit");
    setDrawerUser(user);
  };

  const reloadUsers = async () => {
    const data = await requestJson("/api/admin/users");
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
    } catch (err) {
      console.error("Save user failed", err);
      setDrawerActionError(
        (err && err.message) || "Không thể lưu người dùng. Vui lòng thử lại."
      );
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
    } catch (err) {
      console.error("Delete user failed", err);
      setDrawerActionError(
        (err && err.message) || "Không thể xóa người dùng. Vui lòng thử lại."
      );
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
  };

  return (
    <AdminLayout activeKey="users">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-5">
        <AdminHeaderBar
          search={filters.query}
          onSearchChange={(value) => setFilters({ ...filters, query: value })}
          onAddUser={openCreateDrawer}
          onInvite={() =>
            alert("Đã gửi hướng dẫn kích hoạt đến người dùng được chọn.")
          }
        />

        <AdminStats stats={stats} />

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
          <div className="bg-rose-50 text-rose-700 border border-rose-200 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        ) : null}

        <UserTable
          users={filteredUsers}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onRowClick={openEditDrawer}
          onStatusChange={handleRowStatusChange}
          loading={loading}
        />
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
                  "Không thể cập nhật trạng thái. Vui lòng thử lại."
                );
              })
            : null
        }
      />
    </AdminLayout>
  );
};

export default AdminUsersPage;
