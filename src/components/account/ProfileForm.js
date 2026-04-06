import React from "react";

const ProfileForm = ({
  form,
  onChange,
  onSubmit,
  onCancel,
  onAvatarChange,
}) => {
  const handleChange = (field) => (e) => onChange(field, e.target.value);

  return (
    <div className="flex min-h-[600px] flex-col rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="border-b border-slate-100 p-6 dark:border-slate-700">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Thông tin cá nhân
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Quản lý thông tin hồ sơ của bạn để bảo mật tài khoản và hỗ trợ giao
            hàng.
          </p>
        </div>
      </div>

      <div className="flex-1 p-6 sm:p-8">
        <form className="max-w-3xl space-y-6" onSubmit={onSubmit}>
          <div className="mb-8 flex items-center gap-6">
            <div className="group relative">
              <div
                className="size-24 rounded-full bg-slate-100 bg-cover bg-center ring-4 ring-slate-50 dark:bg-slate-700 dark:ring-slate-800"
                style={{ backgroundImage: `url(${form.avatarUrl})` }}
                aria-label="Ảnh đại diện hiện tại"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 cursor-pointer rounded-full border-2 border-white bg-primary p-1.5 text-white shadow-lg transition-colors hover:bg-blue-600 dark:border-slate-800"
              >
                <span className="material-symbols-outlined text-[18px]">
                  edit
                </span>
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="avatar-upload"
                className="w-fit cursor-pointer rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20 hover:text-blue-700"
              >
                Thay đổi ảnh đại diện
              </label>
              <p className="text-xs text-slate-400">
                Dung lượng tối đa 1MB. Định dạng: JPEG, PNG.
              </p>
              <input
                id="avatar-upload"
                type="file"
                accept="image/png, image/jpeg"
                className="hidden"
                onChange={onAvatarChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Họ và tên
              </span>
              <input
                type="text"
                value={form.fullName}
                onChange={handleChange("fullName")}
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
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
                  className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  placeholder="Nhập số điện thoại"
                />
                <div
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"
                  title="Đã xác thực"
                >
                  <span className="material-symbols-outlined fill text-[20px]">
                    check_circle
                  </span>
                </div>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Email
              </span>
              <input
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
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
                  className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                  expand_more
                </span>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Ngày sinh
              </span>
              <input
                type="date"
                value={form.dob}
                onChange={handleChange("dob")}
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </label>
          </div>

          <div className="border-t border-slate-100 pt-4 dark:border-slate-700">
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
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
                  className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  placeholder="Số nhà, tên đường, phường/xã..."
                />
              </div>
            </label>
          </div>

          <div className="flex items-center justify-end gap-4 border-t border-slate-100 pt-6 dark:border-slate-700">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-300 px-6 py-2.5 font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-medium text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-600"
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
