import React, { useState } from "react";
import { Link } from "react-router-dom";

const SignupForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirm: "",
    terms: false,
    birthday: "",
    gender: "",
    address: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showOptional, setShowOptional] = useState(false);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.password || !form.confirm) {
      alert("Vui lòng nhập đủ thông tin bắt buộc.");
      return;
    }
    if (form.password !== form.confirm) {
      alert("Mật khẩu nhập lại không khớp.");
      return;
    }
    if (!form.terms) {
      alert("Vui lòng đồng ý điều khoản sử dụng.");
      return;
    }
    onSubmit?.(form);
    alert(`Tạo tài khoản cho ${form.fullName}`);
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
            Họ và tên
          </span>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
              person
            </span>
            <input
              className="w-full rounded-lg border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white pl-10 pr-4 py-3 focus:border-primary focus:ring-primary sm:text-sm shadow-sm"
              placeholder="Nguyễn Văn A"
              required
              type="text"
              value={form.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
            />
          </div>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
              Số điện thoại
            </span>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                call
              </span>
              <input
                className="w-full rounded-lg border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white pl-10 pr-4 py-3 focus:border-primary focus:ring-primary sm:text-sm shadow-sm"
                placeholder="+84"
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
              Email
            </span>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                mail
              </span>
              <input
                className="w-full rounded-lg border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white pl-10 pr-4 py-3 focus:border-primary focus:ring-primary sm:text-sm shadow-sm"
                placeholder="example@email.com"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
              Mật khẩu
            </span>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                lock
              </span>
              <input
                className="w-full rounded-lg border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white pl-10 pr-10 py-3 focus:border-primary focus:ring-primary sm:text-sm shadow-sm"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label="Toggle password visibility"
              >
                <span className="material-symbols-outlined text-[20px]">
                  visibility
                </span>
              </button>
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
              Nhập lại mật khẩu
            </span>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                lock_reset
              </span>
              <input
                className="w-full rounded-lg border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white pl-10 pr-10 py-3 focus:border-primary focus:ring-primary sm:text-sm shadow-sm"
                placeholder="••••••••"
                type={showConfirm ? "text" : "password"}
                value={form.confirm}
                onChange={(e) => handleChange("confirm", e.target.value)}
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                aria-label="Toggle confirm password visibility"
              >
                <span className="material-symbols-outlined text-[20px]">
                  visibility
                </span>
              </button>
            </div>
          </label>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400 px-1">
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <span className="material-symbols-outlined text-[14px]">
              check_circle
            </span>
            <span>Ít nhất 8 ký tự</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">
              radio_button_unchecked
            </span>
            <span>Chữ hoa & thường</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">
              radio_button_unchecked
            </span>
            <span>Ký tự số</span>
          </div>
        </div>
      </div>

      <details
        className="group rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 open:bg-white dark:open:bg-slate-800 transition-all duration-300"
        open={showOptional}
        onToggle={(e) => setShowOptional(e.target.open)}
      >
        <summary className="flex cursor-pointer items-center justify-between gap-4 p-4 text-slate-900 dark:text-white font-medium select-none">
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400">
              tune
            </span>
            Thông tin bổ sung (Tùy chọn)
          </span>
          <span className="material-symbols-outlined text-slate-400 transition-transform duration-300 group-open:-rotate-180">
            expand_more
          </span>
        </summary>
        <div className="p-4 pt-0 space-y-4 border-t border-slate-100 dark:border-slate-700/50 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Ngày sinh
              </span>
              <input
                className="w-full rounded-lg border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2.5 focus:border-primary focus:ring-primary sm:text-sm shadow-sm"
                type="date"
                value={form.birthday}
                onChange={(e) => handleChange("birthday", e.target.value)}
              />
            </label>
            <div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Giới tính
              </span>
              <div className="flex gap-4 mt-2">
                {["Nam", "Nữ", "Khác"].map((label) => (
                  <label
                    key={label}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      className="text-primary focus:ring-primary bg-slate-100 border-slate-300 dark:bg-slate-700 dark:border-slate-600"
                      name="gender"
                      type="radio"
                      checked={form.gender === label}
                      onChange={() => handleChange("gender", label)}
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
              Địa chỉ
            </span>
            <input
              className="w-full rounded-lg border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2.5 focus:border-primary focus:ring-primary sm:text-sm shadow-sm"
              placeholder="Số nhà, Tên đường, Phường/Xã..."
              type="text"
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
            />
          </label>
        </div>
      </details>

      <div className="flex items-start gap-3 pt-2">
        <div className="flex h-6 items-center">
          <input
            className="size-4 rounded border-slate-300 bg-slate-100 text-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-700"
            id="terms"
            name="terms"
            type="checkbox"
            checked={form.terms}
            onChange={(e) => handleChange("terms", e.target.checked)}
          />
        </div>
        <label
          className="text-sm leading-6 text-slate-600 dark:text-slate-400"
          htmlFor="terms"
        >
          Tôi đồng ý với{" "}
          <span className="font-semibold text-primary hover:text-blue-500">
            Điều khoản sử dụng
          </span>{" "}
          và
          <span className="font-semibold text-primary hover:text-blue-500">
            {" "}
            Chính sách bảo mật
          </span>{" "}
          của Pharmacy App.
        </label>
      </div>

      <div className="pt-2">
        <button
          className="flex w-full justify-center rounded-lg bg-primary px-3 py-4 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
          type="submit"
        >
          Đăng ký tài khoản
        </button>
      </div>

      <div className="text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Đã có tài khoản?
          <Link
            className="font-semibold text-primary hover:text-blue-500 ml-1"
            to="/login"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </form>
  );
};

export default SignupForm;
