import React, { useMemo, useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import AdminHeaderBar from "../../../components/admin/user-management/AdminHeaderBar";
import AdminStats from "../../../components/admin/user-management/AdminStats";
import AdminFilters from "../../../components/admin/user-management/AdminFilters";
import UserTable from "../../../components/admin/user-management/UserTable";
import UserDrawer from "../../../components/admin/user-management/UserDrawer";

const initialUsers = [
  {
    id: "u1",
    name: "Lê Hoàng Anh",
    email: "anh.le@pharmacy.vn",
    phone: "0902 345 678",
    role: "pharmacist",
    status: "pending",
    orders: 48,
    lastActive: "2 giờ trước",
    lastActiveValue: Date.now() - 2 * 60 * 60 * 1000,
    joined: "12/03/2024",
    joinedValue: new Date("2024-03-12").getTime(),
    tags: ["KYC", "Dược sĩ"],
    attention: true,
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
    notes:
      "Đang chờ bổ sung giấy phép hành nghề. Đã liên hệ qua email ngày 12/3.",
  },
  {
    id: "u2",
    name: "Nguyễn Thị Mai",
    email: "mai.nguyen@example.com",
    phone: "0913 876 543",
    role: "customer",
    status: "active",
    orders: 126,
    lastActive: "Hôm nay",
    lastActiveValue: Date.now(),
    joined: "20/11/2023",
    joinedValue: new Date("2023-11-20").getTime(),
    tags: ["VIP", "Tái mua"],
    attention: false,
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80",
    notes: "Khách hàng thân thiết, thường mua nhóm sản phẩm xương khớp.",
  },
  {
    id: "u3",
    name: "Phạm Quốc Bảo",
    email: "bao.pham@example.com",
    phone: "0938 111 222",
    role: "admin",
    status: "active",
    orders: 12,
    lastActive: "5 phút trước",
    lastActiveValue: Date.now() - 5 * 60 * 1000,
    joined: "01/02/2024",
    joinedValue: new Date("2024-02-01").getTime(),
    tags: ["Quản trị", "Bảo mật"],
    attention: false,
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb0f9ae6d5d?auto=format&fit=crop&w=200&q=80",
    notes: "Quản trị chính, đang triển khai mô-đun kiểm soát truy cập.",
  },
  {
    id: "u4",
    name: "Trần Thu Hà",
    email: "ha.tran@example.com",
    phone: "0901 222 333",
    role: "customer",
    status: "active",
    orders: 68,
    lastActive: "Hôm qua",
    lastActiveValue: Date.now() - 24 * 60 * 60 * 1000,
    joined: "05/01/2024",
    joinedValue: new Date("2024-01-05").getTime(),
    tags: ["Đánh giá cao"],
    attention: false,
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
    notes: "Yêu cầu nhắc lịch mua lại hàng tháng.",
  },
  {
    id: "u5",
    name: "Vũ Thành Trung",
    email: "trung.vu@example.com",
    phone: "0988 456 789",
    role: "pharmacist",
    status: "suspended",
    orders: 15,
    lastActive: "7 ngày trước",
    lastActiveValue: Date.now() - 7 * 24 * 60 * 60 * 1000,
    joined: "18/12/2023",
    joinedValue: new Date("2023-12-18").getTime(),
    tags: ["Giấy tờ", "Cảnh báo"],
    attention: true,
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
    notes: "Tạm khóa do thông tin giấy phép hết hạn, cần cập nhật trước 30/4.",
  },
  {
    id: "u6",
    name: "Đinh Khánh Linh",
    email: "linh.dinh@example.com",
    phone: "0909 333 222",
    role: "customer",
    status: "pending",
    orders: 5,
    lastActive: "3 giờ trước",
    lastActiveValue: Date.now() - 3 * 60 * 60 * 1000,
    joined: "25/03/2024",
    joinedValue: new Date("2024-03-25").getTime(),
    tags: ["Mới", "Chưa mua"],
    attention: false,
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
    notes: "Đăng ký mới qua chiến dịch quảng cáo, chưa hoàn tất KYC.",
  },
  {
    id: "u7",
    name: "Hồ Gia Huy",
    email: "huy.ho@example.com",
    phone: "0977 123 456",
    role: "customer",
    status: "active",
    orders: 34,
    lastActive: "4 giờ trước",
    lastActiveValue: Date.now() - 4 * 60 * 60 * 1000,
    joined: "11/02/2024",
    joinedValue: new Date("2024-02-11").getTime(),
    tags: ["Tái mua", "Đề xuất"],
    attention: false,
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
    notes: "Quan tâm sản phẩm hô hấp, có phản hồi tốt về chatbot.",
  },
];

const AdminUsersPage = () => {
  const [users, setUsers] = useState(initialUsers);
  const [filters, setFilters] = useState({
    query: "",
    role: "all",
    status: "all",
    sort: "recent",
    attentionOnly: false,
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [drawerUser, setDrawerUser] = useState(null);

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

  const handleBulkAction = (status) => {
    if (!selectedIds.length) return;
    updateStatus(selectedIds, status);
    setSelectedIds([]);
  };

  const handleRowStatusChange = (id, status) => {
    updateStatus([id], status);
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
          onAddUser={() => alert("Tính năng thêm người dùng sẽ được bổ sung.")}
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
                Đã lọc {filteredUsers.length} / {users.length} hồ sơ
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

        <UserTable
          users={filteredUsers}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onRowClick={setDrawerUser}
          onStatusChange={handleRowStatusChange}
        />
      </div>

      <UserDrawer
        user={drawerUser}
        onClose={() => setDrawerUser(null)}
        onChangeStatus={(status) =>
          drawerUser && updateStatus([drawerUser.id], status)
        }
      />
    </AdminLayout>
  );
};

export default AdminUsersPage;
