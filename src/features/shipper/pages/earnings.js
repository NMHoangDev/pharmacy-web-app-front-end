import React, { useState } from "react";

const PERIOD_TABS = ["Ngày", "Tuần", "Tháng"];

const ORDERS = [
  {
    id: "#ORD-9921",
    fee: "$12.50",
    cod: "$45.00",
    commission: "$3.75",
    status: "COMPLETED",
  },
  {
    id: "#ORD-9918",
    fee: "$15.00",
    cod: "$120.00",
    commission: "$4.50",
    status: "COMPLETED",
  },
  {
    id: "#ORD-9915",
    fee: "$10.00",
    cod: "$0.00",
    commission: "$3.00",
    status: "RETURNED",
  },
  {
    id: "#ORD-9912",
    fee: "$18.50",
    cod: "$85.00",
    commission: "$5.55",
    status: "IN TRANSIT",
  },
  {
    id: "#ORD-9909",
    fee: "$12.50",
    cod: "$32.00",
    commission: "$3.75",
    status: "COMPLETED",
  },
];

const PAYMENT_HISTORY = [
  {
    label: "Chuyển khoản ngân hàng",
    date: "24 Th10, 2023 • 14:30",
    amount: "+$1,200.00",
    type: "done",
  },
  {
    label: "Chuyển khoản ngân hàng",
    date: "17 Th10, 2023 • 09:15",
    amount: "+$1,050.00",
    type: "done",
  },
  {
    label: "Đang xử lý rút tiền",
    date: "10 Th10, 2023 • 18:45",
    amount: "+$980.50",
    type: "pending",
  },
  {
    label: "Chuyển khoản ngân hàng",
    date: "03 Th10, 2023 • 11:20",
    amount: "+$1,020.00",
    type: "done",
  },
];

const STATUS_STYLES = {
  COMPLETED: "bg-green-100 text-green-700",
  RETURNED: "bg-slate-100 text-slate-600",
  "IN TRANSIT": "bg-blue-100 text-blue-700",
};

const STATUS_LABELS = {
  COMPLETED: "HOÀN THÀNH",
  RETURNED: "ĐÃ TRẢ",
  "IN TRANSIT": "ĐANG GIAO",
};

const ShipperEarningsPage = () => {
  const [activePeriod, setActivePeriod] = useState(1); // default "Tuần"

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f7f8] font-[Inter] text-slate-900">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#137fec]/10 bg-white/80 backdrop-blur-md px-6 md:px-10 py-4 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-[#137fec] rounded-lg text-white">
            <span className="material-symbols-outlined block">
              local_pharmacy
            </span>
          </div>
          <div>
            <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight">
              MediDeliver
            </h2>
            <p className="text-[#137fec] text-xs font-medium uppercase tracking-wider">
              Cổng thông tin giao hàng
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-[#137fec]/10 text-[#137fec] hover:bg-[#137fec]/20 transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="h-8 w-px bg-slate-200 mx-1" />
          <button className="flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full bg-slate-100 border border-slate-200">
            <div className="h-7 w-7 rounded-full bg-[#137fec] flex items-center justify-center text-white text-xs font-bold">
              JD
            </div>
            <span className="text-sm font-semibold hidden md:inline">
              John Doe
            </span>
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8">
        {/* Title + Period tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Thu nhập &amp; Lương
            </h1>
            <p className="text-slate-500 mt-1">
              Theo dõi hiệu suất giao hàng và các khoản thanh toán.
            </p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
            {PERIOD_TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActivePeriod(i)}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  activePeriod === i
                    ? "bg-white text-[#137fec] shadow-sm"
                    : "text-slate-500 hover:text-[#137fec]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Received */}
          <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-[#137fec]/10 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[60px] text-[#137fec]">
                payments
              </span>
            </div>
            <p className="text-slate-500 text-sm font-semibold uppercase tracking-wide">
              Đã nhận
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold">$4,250.00</p>
              <span className="text-green-500 text-xs font-bold bg-green-500/10 px-2 py-0.5 rounded-full">
                +12.5%
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-2 italic">
              Phản ánh các khoản thanh toán đã xử lý vào ví
            </p>
          </div>

          {/* Pending */}
          <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-[#137fec]/10 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[60px] text-[#137fec]">
                pending_actions
              </span>
            </div>
            <p className="text-slate-500 text-sm font-semibold uppercase tracking-wide">
              Chờ thanh toán
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold">$840.50</p>
              <span className="text-[#137fec] text-xs font-bold bg-[#137fec]/10 px-2 py-0.5 rounded-full">
                Đang xét duyệt
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-2 italic">
              Dự kiến thanh toán cho kỳ hiện tại
            </p>
          </div>

          {/* Total */}
          <div className="flex flex-col gap-2 rounded-xl p-6 bg-[#137fec] text-white shadow-lg shadow-[#137fec]/20 relative overflow-hidden group">
            <div className="absolute -bottom-4 -right-4 p-4 opacity-20 rotate-12 group-hover:rotate-0 transition-transform">
              <span className="material-symbols-outlined text-[80px]">
                account_balance_wallet
              </span>
            </div>
            <p className="text-white/80 text-sm font-semibold uppercase tracking-wide">
              Tổng thu nhập
            </p>
            <p className="text-4xl font-black tracking-tight">$5,090.50</p>
            <button className="mt-4 bg-white text-[#137fec] text-xs font-bold py-2 px-4 rounded-lg w-fit hover:bg-slate-100 transition-colors">
              Rút tiền
            </button>
          </div>
        </div>

        {/* Orders + Payment history */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Orders table */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[#137fec]">
                  receipt_long
                </span>
                Đơn giao hàng gần đây
              </h3>
              <button className="text-[#137fec] text-sm font-bold hover:underline">
                Xem tất cả
              </button>
            </div>
            <div className="bg-white rounded-xl border border-[#137fec]/10 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Mã đơn
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Phí ship
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Thu hộ (COD)
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Hoa hồng
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ORDERS.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-[#137fec]/5 transition-colors"
                      >
                        <td className="px-6 py-4 font-mono text-sm font-medium">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 text-sm">{order.fee}</td>
                        <td className="px-6 py-4 text-sm">{order.cod}</td>
                        <td className="px-6 py-4 text-sm font-bold text-[#137fec]">
                          {order.commission}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded text-[10px] font-bold ${STATUS_STYLES[order.status]}`}
                          >
                            {STATUS_LABELS[order.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Payment history */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[#137fec]">
                history
              </span>
              Lịch sử thanh toán
            </h3>
            <div className="bg-white rounded-xl border border-[#137fec]/10 p-4 shadow-sm space-y-4">
              {PAYMENT_HISTORY.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-50 hover:border-[#137fec]/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        item.type === "done"
                          ? "bg-green-500/10 text-green-600"
                          : "bg-[#137fec]/10 text-[#137fec]"
                      }`}
                    >
                      <span className="material-symbols-outlined">
                        {item.type === "done" ? "check_circle" : "schedule"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold">{item.label}</p>
                      <p className="text-xs text-slate-500 uppercase tracking-tighter">
                        {item.date}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-black">{item.amount}</p>
                </div>
              ))}
              <button className="w-full py-3 mt-2 rounded-lg border-2 border-dashed border-[#137fec]/20 text-[#137fec] text-xs font-bold hover:bg-[#137fec] hover:text-white transition-all uppercase tracking-widest">
                Tải báo cáo đầy đủ
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Map Section */}
      <section className="max-w-7xl mx-auto w-full px-4 md:px-8 pb-12">
        <div className="bg-white rounded-2xl border border-[#137fec]/10 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[#137fec]">
                map
              </span>
              Hiệu suất khu vực giao hàng
            </h3>
          </div>
          <div className="h-64 bg-slate-200 relative">
            <img
              alt="Bản đồ vùng phủ sóng giao hàng"
              className="w-full h-full object-cover opacity-60 mix-blend-multiply"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDulVp5p6Ro5PejNwT3WhyFf7VWzl-az4B9xchRfCw18UQU04kzGmjKNd0lvnfvbkrbSMCZ4bCB91y1dHanF-bUIr4DEXdQTY7tm2Pr24yGL3HvGQ2LAshLBBCF0jx8d9FnpSESx3DsnEN3yTKHdK5zaIC_i3gQh8HyEGgllMWMAQO5w9gisPuZ3XxrIq2N7YKQbS_B3QZwzDyTs_0MXc47b2GrPufXhDfn_kwhsh3txJz9nKCBxuC0CviqlUV48VdZ_MBlGPLdeSGZ"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-white/80 to-transparent">
              <div className="text-center">
                <p className="text-slate-900 font-bold">
                  Khu vực phục vụ chính: Trung tâm
                </p>
                <p className="text-[#137fec] text-sm font-medium">
                  Tỷ lệ thành công 98% tuần này
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#137fec]/10 bg-white py-8 px-10 text-center">
        <p className="text-slate-500 text-sm">
          © 2024 MediDeliver Logistics. Được bảo mật bởi Pharmacy-Grade
          Encryption.
        </p>
      </footer>
    </div>
  );
};

export default ShipperEarningsPage;
