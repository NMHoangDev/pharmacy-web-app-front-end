import React, { useMemo, useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import PaymentStats from "../../../components/admin/payments/PaymentStats";
import PaymentToolbar from "../../../components/admin/payments/PaymentToolbar";
import PaymentTable from "../../../components/admin/payments/PaymentTable";

const seedTransactions = [
  {
    id: "TRX-9982",
    orderId: "ORD-2023-881",
    time: "10:42 SA, Hôm nay",
    method: "Thẻ tín dụng",
    methodLabel: "V",
    amount: "1.250.000 ₫",
    status: "failed",
    label: "Thất bại",
  },
  {
    id: "TRX-9981",
    orderId: "ORD-2023-880",
    time: "09:15 SA, Hôm nay",
    method: "Momo QR",
    methodLabel: "QR",
    amount: "450.000 ₫",
    status: "success",
    label: "Thành công",
  },
  {
    id: "TRX-9980",
    orderId: "ORD-2023-879",
    time: "08:30 SA, Hôm nay",
    method: "COD",
    methodLabel: "COD",
    amount: "890.000 ₫",
    status: "pending",
    label: "Đang xử lý",
  },
  {
    id: "TRX-9979",
    orderId: "ORD-2023-878",
    time: "16:20 CH, Hôm qua",
    method: "Chuyển khoản",
    methodLabel: "B",
    amount: "2.100.000 ₫",
    status: "success",
    label: "Thành công",
  },
  {
    id: "TRX-9978",
    orderId: "ORD-2023-875",
    time: "14:10 CH, Hôm qua",
    method: "Thẻ tín dụng",
    methodLabel: "V",
    amount: "550.000 ₫",
    status: "refunded",
    label: "Hoàn tiền",
  },
  {
    id: "TRX-9977",
    orderId: "ORD-2023-874",
    time: "11:05 SA, Hôm qua",
    method: "ZaloPay",
    methodLabel: "Z",
    amount: "320.000 ₫",
    status: "failed",
    label: "Thất bại",
  },
];

const AdminPaymentsPage = () => {
  const [transactions, setTransactions] = useState(seedTransactions);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter(
      (t) =>
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.orderId.toLowerCase().includes(q) ||
        t.method.toLowerCase().includes(q)
    );
  }, [transactions, search]);

  const stats = useMemo(
    () => ({ revenue: "24.500.000 ₫", failed: 3, pending: 12 }),
    []
  );

  return (
    <AdminLayout activeKey="payments">
      <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth bg-background-light dark:bg-background-dark">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                Giao dịch
              </h3>
              <p className="text-slate-500 text-sm mt-1">
                Quản lý và đối soát các giao dịch thanh toán trong hệ thống.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                onClick={() => alert("Xuất báo cáo (mock)")}
              >
                <span className="material-symbols-outlined text-[20px]">
                  cloud_download
                </span>
                <span>Xuất báo cáo</span>
              </button>
            </div>
          </div>

          <PaymentStats stats={stats} />

          <PaymentToolbar
            search={search}
            onSearch={setSearch}
            onRangeClick={() => alert("Chọn khoảng thời gian (mock)")}
            onStatusClick={() => alert("Chọn trạng thái (mock)")}
            onMethodClick={() => alert("Chọn phương thức (mock)")}
          />

          <PaymentTable transactions={filtered} />
        </div>
      </main>
    </AdminLayout>
  );
};

export default AdminPaymentsPage;
