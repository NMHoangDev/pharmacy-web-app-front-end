import React, { useMemo, useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import DashboardHeader from "../../../components/admin/dashboard/DashboardHeader";
import StatsGrid from "../../../components/admin/dashboard/StatsGrid";
import RevenueChartCard from "../../../components/admin/dashboard/RevenueChartCard";
import TopProductsCard from "../../../components/admin/dashboard/TopProductsCard";
import RecentOrdersTable from "../../../components/admin/dashboard/RecentOrdersTable";
import LowStockAlerts from "../../../components/admin/dashboard/LowStockAlerts";

const AdminDashboardPage = () => {
  const [range, setRange] = useState("today");

  const stats = useMemo(
    () => [
      {
        key: "revenue",
        title: "Doanh thu",
        value: "150.0M",
        suffix: "đ",
        change: "12%",
        changeType: "up",
        note: "so với tuần trước",
        icon: "payments",
      },
      {
        key: "orders",
        title: "Tổng đơn hàng",
        value: "120",
        change: "2%",
        changeType: "down",
        note: "so với tuần trước",
        icon: "shopping_cart",
      },
      {
        key: "stock",
        title: "Tồn kho thấp",
        value: "5",
        suffix: "sản phẩm",
        note: "Cần nhập hàng ngay",
        icon: "warning",
      },
      {
        key: "consulting",
        title: "Lịch tư vấn",
        value: "8",
        suffix: "ca",
        change: "2 quá tải",
        changeType: "up",
        note: "cần điều phối",
        icon: "support_agent",
      },
    ],
    []
  );

  const bars = useMemo(
    () => [
      { label: "T2", height: 40, value: "12tr" },
      { label: "T3", height: 55, value: "15tr" },
      { label: "T4", height: 35, value: "10tr" },
      { label: "T5", height: 70, value: "20tr" },
      { label: "T6", height: 60, value: "17tr" },
      { label: "T7", height: 85, value: "24tr" },
      { label: "CN", height: 75, value: "25tr" },
    ],
    []
  );

  const products = useMemo(
    () => [
      { name: "Panadol Extra", count: 450, unit: "hộp", progress: 85 },
      { name: "Vitamin C 500mg", count: 320, unit: "hộp", progress: 65 },
      { name: "Berberin", count: 210, unit: "lọ", progress: 45 },
      { name: "Khẩu trang y tế", count: 180, unit: "hộp", progress: 35 },
    ],
    []
  );

  const orders = useMemo(
    () => [
      {
        code: "#ORD-00123",
        customer: "Nguyễn Văn A",
        total: "540.000đ",
        status: "completed",
        statusLabel: "Hoàn thành",
      },
      {
        code: "#ORD-00124",
        customer: "Trần Thị B",
        total: "1.250.000đ",
        status: "processing",
        statusLabel: "Đang xử lý",
      },
      {
        code: "#ORD-00125",
        customer: "Lê Văn C",
        total: "89.000đ",
        status: "shipping",
        statusLabel: "Đang giao",
      },
      {
        code: "#ORD-00126",
        customer: "Phạm Thị D",
        total: "215.000đ",
        status: "processing",
        statusLabel: "Đang xử lý",
      },
    ],
    []
  );

  const alerts = useMemo(
    () => [
      {
        name: "Paracetamol 500mg",
        detail: "Còn lại: 10 hộp",
        tone: "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20",
        detailClass: "text-red-600 dark:text-red-400",
        action: "Nhập thêm",
        actionClass: "text-white bg-primary hover:bg-blue-600",
      },
      {
        name: "Siro Ho Prospan",
        detail: "Còn lại: 5 chai",
        tone: "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20",
        detailClass: "text-red-600 dark:text-red-400",
        action: "Nhập thêm",
        actionClass: "text-white bg-primary hover:bg-blue-600",
      },
      {
        name: "Bông y tế 1kg",
        detail: "Sắp hết hạn sử dụng",
        tone: "bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/20",
        detailClass: "text-orange-600 dark:text-orange-400",
        action: "Kiểm tra",
        actionClass:
          "text-slate-600 bg-white border border-slate-200 hover:bg-slate-50",
      },
    ],
    []
  );

  return (
    <AdminLayout activeKey="dashboard">
      <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-background-light dark:bg-background-dark">
        <div className="max-w-[1200px] mx-auto space-y-8">
          <DashboardHeader activeRange={range} onRangeChange={setRange} />

          <StatsGrid stats={stats} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RevenueChartCard bars={bars} />
            <TopProductsCard products={products} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RecentOrdersTable orders={orders} />
            <LowStockAlerts alerts={alerts} />
          </div>
        </div>
      </main>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
