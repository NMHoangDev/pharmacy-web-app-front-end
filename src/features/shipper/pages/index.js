import React, { useState } from "react";
import PageTransition from "../../../shared/components/ui/PageTransition";

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_ORDERS = {
  ready: [
    {
      id: "PH-8829",
      urgency: "Urgent",
      time: "Hôm nay, 10:30 SA",
      customer: "Nguyễn Văn An",
      amount: 450000,
      payment: "Đã thanh toán",
      address: "123 Đường Y tế, Khu vực Tây, Quận 4",
      phone: "(028) 3812-3456",
      items: "3 Thuốc kê đơn",
      itemIcon: "medical_services",
      map: "https://lh3.googleusercontent.com/aida-public/AB6AXuBQkuPCubvPZGFUtV14UorKQJPjqwbk__dmpyCRTk4j4QAqgcLoMHpz1mJcaFt6-UnwgvRlR5fihDtLzQQ2CCNgRGqHDqCmQ8CedFbslHVQFQQWYgi2IIghrOxNdWIuOjNNltCce3fF8p9z94HdfadmbRVYdqFRd3BzGg3EFCJpcQQaAN4fz7-bOR3zKoXpDtXRRTpLiD05nivOxWNgz3_9PNn7TumFot0r3mJXnnpxmALE9sgjSzKXYUb_HkFnswBkwUBgnU1o3BeZ",
    },
    {
      id: "PH-8901",
      urgency: null,
      time: "Hôm nay, 11:15 SA",
      customer: "Trần Thị Bích",
      amount: 220000,
      payment: "Thanh toán khi nhận",
      address: "456 Chung cư Ven Sông, Quận Bình Thạnh",
      phone: "(028) 9876-5432",
      items: "1 Thuốc OTC, 2 Vệ sinh cá nhân",
      itemIcon: "pill",
      map: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8JIUgkaxYmMwiTGfX1BP7ezSghOBYaNMuTOu0Bm5npM3WdyjS-a5qGo8cBybkwH7Cu1b2Yi-n-fjpuDpfzcEsjLqXctb-t3mwXVi_RHbHtc3v_Y_s84XV37BX0SEdolUtQO0OfL7u8aFj7kNMBEhRsXUNdHfapCK4y-qlbz4TAQCaPMj67r4ImqBlIpTDVL-VyXsyzpK2ShEWSz54j-FYIpLLwjaGn7OkPFdPOjOhFyASx4hDeQeefmSA0SAl15UUkK2cusPjDJDF",
    },
    {
      id: "PH-9012",
      urgency: null,
      time: "Hôm nay, 11:45 SA",
      customer: "Lê Minh Tuấn",
      amount: 1180000,
      payment: "Đã thanh toán",
      address: "789 Tòa nhà Skyline, Tầng 24, Trung tâm",
      phone: "(028) 2345-6789",
      items: "Insulin & Vật tư tiêm (Bảo quản lạnh)",
      itemIcon: "vaccines",
      map: "https://lh3.googleusercontent.com/aida-public/AB6AXuAdclaAgpDBiKnoXwQvbz5LG5cKeOZyYvPnP2kwoYWhhF8xQL1UiuMxqUAUmTPnudcnCk7LzbpcLSR44SFu9_Dbnt1fBgeJyqJ082X6K1wa9skJIig19i3FCXXpokWw5J6W4l1-ItqcoXacLAQUYY8OXzCPsKU5aw5XNuLlfRAvqmQnky4oICOtZZRK7lnivRcY5c43U77bZ-sOkE2G_GPaK5IJF9JQUGym0f2KcWn0zscHN3h-jyLPuiOjvhWENdGFYEPTdpdUAw7-",
    },
  ],
  inProgress: [],
  completed: [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatVND = (amount) =>
  amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

// ─── Order Card ───────────────────────────────────────────────────────────────
const OrderCard = ({ order, onAccept }) => (
  <div className="flex flex-col md:flex-row items-stretch overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
    {/* Map thumbnail */}
    <div className="w-full md:w-64 h-48 md:h-auto relative flex-shrink-0">
      <div
        className="absolute inset-0 bg-slate-200 dark:bg-slate-800 bg-center bg-no-repeat bg-cover"
        style={{ backgroundImage: `url('${order.map}')` }}
      />
      {order.urgency && (
        <div className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
          {order.urgency}
        </div>
      )}
    </div>

    {/* Detail */}
    <div className="flex flex-1 flex-col p-5 gap-4">
      {/* Header row */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-primary text-sm font-bold">Đơn #{order.id}</p>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {order.time}
            </p>
          </div>
          <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight">
            {order.customer}
          </h3>
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {formatVND(order.amount)}
          </p>
          <p className="text-xs text-slate-500 uppercase tracking-wide">
            {order.payment}
          </p>
        </div>
      </div>

      {/* Address + Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex items-start gap-2">
          <span className="material-symbols-outlined text-slate-400 text-[20px] mt-0.5">
            location_on
          </span>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            {order.address}
          </p>
        </div>
        <div className="flex items-start gap-2">
          <span className="material-symbols-outlined text-slate-400 text-[20px] mt-0.5">
            call
          </span>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            {order.phone}
          </p>
        </div>
      </div>

      {/* Footer: items + action */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-primary text-[18px]">
            {order.itemIcon}
          </span>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {order.items}
          </span>
        </div>
        <button
          onClick={() => onAccept(order)}
          className="flex items-center justify-center rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary/90 active:scale-95 transition-all"
        >
          Nhận đơn
        </button>
      </div>
    </div>
  </div>
);

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
    <span className="material-symbols-outlined text-6xl mb-4">inbox</span>
    <p className="text-sm font-medium">{message}</p>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const ShipperDashboardPage = () => {
  const [activeTab, setActiveTab] = useState("ready");
  const [orders, setOrders] = useState(MOCK_ORDERS);

  const handleAccept = (order) => {
    setOrders((prev) => ({
      ready: prev.ready.filter((o) => o.id !== order.id),
      inProgress: [
        { ...order, acceptedAt: new Date().toLocaleTimeString("vi-VN") },
        ...prev.inProgress,
      ],
      completed: prev.completed,
    }));
    setActiveTab("inProgress");
  };

  const handleComplete = (order) => {
    setOrders((prev) => ({
      ready: prev.ready,
      inProgress: prev.inProgress.filter((o) => o.id !== order.id),
      completed: [
        { ...order, completedAt: new Date().toLocaleTimeString("vi-VN") },
        ...prev.completed,
      ],
    }));
    setActiveTab("completed");
  };

  const tabs = [
    { key: "ready", label: "Chờ giao hàng", count: orders.ready.length },
    { key: "inProgress", label: "Đang giao", count: orders.inProgress.length },
    {
      key: "completed",
      label: "Đã hoàn thành",
      count: orders.completed.length,
    },
  ];

  const currentOrders = orders[activeTab];

  return (
    <PageTransition className="bg-background-light dark:bg-background-dark min-h-screen font-display text-slate-900 dark:text-slate-100">
      {/* ── Top Navigation Bar ── */}
      <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark px-6 md:px-10 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-3 text-primary">
          <div className="size-8 flex items-center justify-center bg-primary/10 rounded-lg">
            <span className="material-symbols-outlined text-primary">
              prescriptions
            </span>
          </div>
          <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold tracking-tight">
            MedExpress
          </h2>
        </div>

        <div className="flex flex-1 justify-end gap-4 md:gap-6 items-center">
          {/* Search */}
          <label className="hidden md:flex flex-col min-w-40 h-10 max-w-64">
            <div className="flex w-full items-stretch rounded-lg h-full bg-slate-100 dark:bg-slate-800">
              <div className="text-slate-500 flex items-center justify-center pl-3">
                <span className="material-symbols-outlined text-[20px]">
                  search
                </span>
              </div>
              <input
                className="flex w-full min-w-0 flex-1 border-none bg-transparent focus:outline-none focus:ring-0 h-full placeholder:text-slate-500 px-3 text-sm"
                placeholder="Tìm đơn hàng..."
              />
            </div>
          </label>

          {/* Icon buttons */}
          <div className="flex gap-2">
            <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <span className="material-symbols-outlined text-[20px]">
                notifications
              </span>
            </button>
            <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <span className="material-symbols-outlined text-[20px]">
                account_circle
              </span>
            </button>
          </div>

          {/* Avatar */}
          <div className="size-10 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
            S
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full p-4 md:p-6 gap-6 pb-20 md:pb-6">
        {/* Shipper Status Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex gap-4 items-center">
            <div className="bg-primary/10 p-3 rounded-full">
              <span className="material-symbols-outlined text-primary text-3xl">
                local_shipping
              </span>
            </div>
            <div>
              <h1 className="text-slate-900 dark:text-slate-100 text-xl font-bold">
                Bảng điều khiển Shipper
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex h-2 w-2 rounded-full bg-green-500" />
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  Trạng thái: Trực tuyến &amp; Sẵn sàng
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0">
            {[
              { label: "Thu nhập", value: "250.000₫" },
              { label: "Giao hàng", value: orders.completed.length + 12 },
              { label: "Đánh giá", value: "4.9" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg min-w-[90px]"
              >
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                  {stat.label}
                </span>
                <span className="text-lg font-bold text-primary">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-800">
          <nav className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 pb-4 px-1 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700"
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      activeTab === tab.key
                        ? "bg-primary/10 text-primary"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Filters (chỉ hiện khi tab Ready) */}
        {activeTab === "ready" && (
          <div className="flex flex-wrap gap-3 items-center">
            {["Mã đơn", "Khu vực", "Thời gian"].map((f) => (
              <button
                key={f}
                className="flex h-10 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 transition-colors text-sm font-medium"
              >
                {f}
                <span className="material-symbols-outlined text-[18px]">
                  expand_more
                </span>
              </button>
            ))}
            <div className="flex-1" />
            <p className="text-sm text-slate-500 font-medium">
              {orders.ready.length} đơn chờ giao
            </p>
          </div>
        )}

        {/* Orders List */}
        <div className="flex flex-col gap-4">
          {currentOrders.length === 0 ? (
            <EmptyState
              message={
                activeTab === "ready"
                  ? "Không có đơn hàng nào đang chờ giao."
                  : activeTab === "inProgress"
                    ? "Bạn chưa nhận đơn nào."
                    : "Chưa có đơn hàng hoàn thành."
              }
            />
          ) : (
            currentOrders.map((order) => (
              <div key={order.id} className="relative">
                <OrderCard order={order} onAccept={handleAccept} />
                {/* Nếu đang giao: hiện nút hoàn thành */}
                {activeTab === "inProgress" && (
                  <div className="absolute bottom-[18px] right-5">
                    <button
                      onClick={() => handleComplete(order)}
                      className="flex items-center justify-center rounded-lg h-10 px-6 bg-green-600 text-white text-sm font-bold shadow-sm hover:bg-green-700 active:scale-95 transition-all"
                    >
                      Đã giao
                    </button>
                  </div>
                )}
                {/* Badge hoàn thành */}
                {activeTab === "completed" && (
                  <div className="absolute top-3 right-3 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
                    ✓ Hoàn thành {order.completedAt}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Load More (chỉ hiện khi còn đơn) */}
        {currentOrders.length > 0 && activeTab === "ready" && (
          <div className="flex justify-center py-4">
            <button className="text-primary font-bold text-sm py-2 px-6 rounded-lg border-2 border-primary/20 hover:bg-primary/5 transition-colors">
              Tải thêm đơn hàng
            </button>
          </div>
        )}
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 flex justify-around p-3 md:hidden z-50">
        {[
          { icon: "inventory_2", label: "Đơn hàng", tab: "ready" },
          { icon: "map", label: "Bản đồ", tab: null },
          { icon: "payments", label: "Thu nhập", tab: null },
          { icon: "person", label: "Tôi", tab: null },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => item.tab && setActiveTab(item.tab)}
            className={`flex flex-col items-center gap-1 ${
              item.tab === activeTab ||
              (item.icon === "inventory_2" &&
                ["ready", "inProgress", "completed"].includes(activeTab))
                ? "text-primary"
                : "text-slate-400"
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        ))}
      </div>
    </PageTransition>
  );
};

export default ShipperDashboardPage;
