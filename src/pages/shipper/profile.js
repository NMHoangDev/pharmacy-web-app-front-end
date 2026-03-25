import React, { useState } from "react";

const PROFILE_DATA = {
  name: "Johnathan Smith",
  title: "Pharmacy Logistics Specialist",
  status: "Active Duty",
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC4AsHcER3oUFaFFihlJXj1PJKCaJfXB2mR3ON5As1p4qnDygk__D-OGUCYyGrzPBQnznPdS218fNblPL0T4VgYm31hiFGG2-OaQJLjLhvblnbQN8DsrjwjiZNeU19PNkgPKdxop7SNh6QsgOwS1lN7NL8ER7p8xV9YXzHYhGuOgWkgR9H4VhMEPcbI8C_LM5tuNOyx1cYhj981wK5AKxErlUlcY4cGSR9GY1_4XsMv_epzyLsJmN7J8MzAKSAbz6tgMBjCThsLDIX_",
  phone: "+1 (555) 123-4567",
  email: "j.smith.delivery@pharmacy-hub.com",
  address: "742 Evergreen Terrace, Suite 100\nSpringfield, IL 62704",
  totalDelivered: "1,284",
  rating: "4.92",
  paymentMethod: "Bank Transfer •••• 8920",
  contractRenewed: "Oct 12, 2023",
};

const InfoField = ({ icon, label, value, colSpan }) => (
  <div className={`flex flex-col gap-1.5${colSpan ? " md:col-span-2" : ""}`}>
    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
      {label}
    </label>
    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <span className="material-symbols-outlined text-slate-400 mt-0.5">
        {icon}
      </span>
      <p className="font-medium whitespace-pre-line">{value}</p>
    </div>
  </div>
);

const ShipperProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: PROFILE_DATA.name,
    phone: PROFILE_DATA.phone,
    email: PROFILE_DATA.email,
    address: PROFILE_DATA.address,
  });

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f7f8] font-[Inter] text-slate-900">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200 bg-white px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="size-8 bg-[#137fec] rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[20px]">
              medical_services
            </span>
          </div>
          <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight">
            Shipper Hub
          </h2>
        </div>
        <div className="flex gap-2">
          <button className="flex size-10 cursor-pointer items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="flex size-10 cursor-pointer items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-[1200px] mx-auto w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col items-center">
            <div className="relative">
              <div
                className="size-32 rounded-full border-4 border-[#137fec]/10 bg-center bg-no-repeat bg-cover mb-4"
                style={{ backgroundImage: `url(${PROFILE_DATA.avatar})` }}
              />
              <div className="absolute bottom-4 right-0 size-8 bg-[#137fec] text-white rounded-full flex items-center justify-center border-4 border-white">
                <span className="material-symbols-outlined text-sm">
                  verified
                </span>
              </div>
            </div>
            <h1 className="text-xl font-bold">{PROFILE_DATA.name}</h1>
            <p className="text-slate-500 text-sm">{PROFILE_DATA.title}</p>
            <div className="mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold uppercase tracking-wider">
              <span className="size-2 rounded-full bg-emerald-500" />
              {PROFILE_DATA.status}
            </div>
            <div className="w-full mt-8 flex flex-col gap-2">
              <button
                onClick={() => setIsEditing((v) => !v)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#137fec] py-3 text-white font-semibold hover:bg-[#1069c8] transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  edit
                </span>
                {isEditing ? "Hủy chỉnh sửa" : "Cập nhật thông tin"}
              </button>
              <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 py-3 text-slate-700 font-semibold border border-slate-200 hover:bg-slate-200 transition-colors">
                <span className="material-symbols-outlined text-[20px]">
                  lock_reset
                </span>
                Đổi mật khẩu
              </button>
            </div>
          </div>

          {/* Performance Overview */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
              Tổng quan hiệu suất
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-[#137fec]/5 border border-[#137fec]/10">
                <div>
                  <p className="text-slate-500 text-xs">Tổng đơn đã giao</p>
                  <p className="text-2xl font-bold text-[#137fec]">
                    {PROFILE_DATA.totalDelivered}
                  </p>
                </div>
                <span className="material-symbols-outlined text-[#137fec] text-3xl opacity-50">
                  package_2
                </span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <p className="text-slate-500 text-xs">
                    Đánh giá từ khách hàng
                  </p>
                  <p className="text-2xl font-bold">{PROFILE_DATA.rating}</p>
                </div>
                <span className="material-symbols-outlined text-amber-500 text-3xl opacity-50">
                  star
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#137fec]">
                person
              </span>
              Thông tin cá nhân
            </h3>

            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Họ và tên
                  </label>
                  <input
                    className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/30 focus:border-[#137fec]"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Số điện thoại
                  </label>
                  <input
                    className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/30 focus:border-[#137fec]"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, phone: e.target.value }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/30 focus:border-[#137fec]"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, email: e.target.value }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Địa chỉ
                  </label>
                  <textarea
                    rows={3}
                    className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/30 focus:border-[#137fec] resize-none"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, address: e.target.value }))
                    }
                  />
                </div>
                <div className="md:col-span-2 flex justify-end gap-3">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-5 py-2.5 rounded-lg bg-[#137fec] text-white text-sm font-semibold hover:bg-[#1069c8] transition-colors"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InfoField
                  icon="badge"
                  label="Họ và tên"
                  value={formData.name}
                />
                <InfoField
                  icon="call"
                  label="Số điện thoại"
                  value={formData.phone}
                />
                <InfoField
                  icon="mail"
                  label="Email"
                  value={formData.email}
                  colSpan
                />
                <InfoField
                  icon="location_on"
                  label="Địa chỉ thường trú"
                  value={formData.address}
                  colSpan
                />
              </div>
            )}
          </div>

          {/* Payment & Account */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#137fec]">
                account_balance_wallet
              </span>
              Thanh toán &amp; Tài khoản
            </h3>
            <div className="flex flex-col gap-4">
              {/* Payment method */}
              <div className="flex items-center justify-between py-4 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded bg-slate-100 flex items-center justify-center">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                  <div>
                    <p className="font-semibold">
                      Phương thức thanh toán mặc định
                    </p>
                    <p className="text-sm text-slate-500">
                      Chuyển khoản ngân hàng •••• 8920
                    </p>
                  </div>
                </div>
                <button className="text-[#137fec] text-sm font-bold hover:underline">
                  Chỉnh sửa
                </button>
              </div>

              {/* Contract status */}
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded bg-slate-100 flex items-center justify-center">
                    <span className="material-symbols-outlined">
                      description
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">Trạng thái hợp đồng</p>
                    <p className="text-sm text-slate-500">
                      Gia hạn vào {PROFILE_DATA.contractRenewed}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-[#137fec]/10 text-[#137fec] text-[10px] font-bold rounded uppercase">
                  Hiệu lực
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 p-6 text-center text-slate-500 text-sm">
        <p>© 2024 PharmaDirect Delivery Systems. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ShipperProfilePage;
