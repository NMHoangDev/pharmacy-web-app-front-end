import React from "react";

const ProfileForm = ({ form, onChange, onSubmit, onCancel }) => {
  const handleChange = (field) => (e) => onChange(field, e.target.value);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[600px] flex flex-col">
      <div className="p-6 border-b border-slate-100 dark:border-slate-700">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Thông tin cá nhân
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Quản lý thông tin hồ sơ của bạn để bảo mật tài khoản và hỗ trợ giao
            hàng.
          </p>
        </div>
      </div>

      <div className="p-6 sm:p-8 flex-1">
        <form className="space-y-6 max-w-3xl" onSubmit={onSubmit}>
          <div className="flex items-center gap-6 mb-8">
            <div className="relative group">
              <div
                className="size-24 rounded-full bg-slate-100 dark:bg-slate-700 bg-cover bg-center ring-4 ring-slate-50 dark:ring-slate-800"
                style={{ backgroundImage: `url(${form.avatarUrl})` }}
                aria-label="Ảnh đại diện hiện tại"
              />
              <button
                type="button"
                className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors border-2 border-white dark:border-slate-800"
              >
                <span className="material-symbols-outlined text-[18px]">
                  edit
                </span>
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="text-sm font-medium text-primary hover:text-blue-700 px-4 py-2 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors w-fit"
              >
                Thay đổi ảnh đại diện
              </button>
              <p className="text-xs text-slate-400">
                Dung lượng tối đa 1MB. Định dạng: JPEG, PNG.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Họ và tên
              </span>
              <input
                type="text"
                value={form.fullName}
                onChange={handleChange("fullName")}
                className="w-full h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                placeholder="Nhập họ tên của bạn"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Số điện thoại
              </span>
              <div className="relative">
                <input
                  type="tel"
                  value={form.phone}
                  onChange={handleChange("phone")}
                  className="w-full h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  placeholder="Nhập số điện thoại"
                />
                <div
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"
                  title="Đã xác thực"
                >
                  <span className="material-symbols-outlined text-[20px] fill">
                    check_circle
                  </span>
                </div>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Email
              </span>
              <input
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                className="w-full h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                placeholder="Nhập địa chỉ email"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Giới tính
              </span>
              <div className="relative">
                <select
                  value={form.gender}
                  onChange={handleChange("gender")}
                  className="w-full h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none cursor-pointer"
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                  expand_more
                </span>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Ngày sinh
              </span>
              <input
                type="date"
                value={form.dob}
                onChange={handleChange("dob")}
                className="w-full h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
              />
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Địa chỉ giao hàng mặc định
            </h3>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Địa chỉ chi tiết
              </span>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400">
                  home_pin
                </span>
                <textarea
                  rows={2}
                  value={form.address}
                  onChange={handleChange("address")}
                  className="w-full py-2 pl-10 pr-4 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
                  placeholder="Số nhà, tên đường, phường/xã..."
                />
              </div>
            </label>
          </div>

          <div className="pt-6 flex items-center justify-end gap-4 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-blue-600 shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">
                save
              </span>
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
