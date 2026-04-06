import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C17 3.3 14.7 2.3 12 2.3a9.7 9.7 0 0 0 0 19.4c5.6 0 9.3-3.9 9.3-9.4 0-.6-.1-1.1-.2-1.6H12z"
    />
  </svg>
);

const SignupForm = ({ onSubmit, onGoogleLogin, loading, oauthLoading }) => {
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
  const [fieldErrors, setFieldErrors] = useState({
    fullName: "",
    password: "",
    confirm: "",
    terms: "",
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nextErrors = {
      fullName: form.fullName.trim() ? "" : "Vui lòng nhập họ và tên.",
      password: form.password
        ? form.password.length >= 8
          ? ""
          : "Mật khẩu cần ít nhất 8 ký tự."
        : "Vui lòng nhập mật khẩu.",
      confirm: form.confirm
        ? form.password === form.confirm
          ? ""
          : "Mật khẩu nhập lại không khớp."
        : "Vui lòng nhập lại mật khẩu.",
      terms: form.terms ? "" : "Bạn cần đồng ý điều khoản để tiếp tục.",
    };

    setFieldErrors(nextErrors);

    if (
      nextErrors.fullName ||
      nextErrors.password ||
      nextErrors.confirm ||
      nextErrors.terms
    ) {
      return;
    }

    onSubmit?.(form);
  };

  const inputClassName =
    "w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-sky-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(14,165,233,0.10)]";
  const errorClassName = "mt-1 text-[12px] text-red-600";
  const successClassName = "mt-1 text-[12px] text-emerald-600";

  return (
    <motion.form
      className="space-y-6"
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      noValidate
    >
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => onGoogleLogin?.()}
          disabled={loading || oauthLoading}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition-all duration-200 hover:border-sky-200 hover:bg-sky-50/60 hover:shadow-[0_10px_20px_rgba(15,23,42,0.05)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <GoogleIcon />
          <span>
            {oauthLoading ? "Đang chuyển sang Google..." : "Tiếp tục với Google"}
          </span>
        </button>
        <div className="relative flex items-center">
          <div className="flex-grow border-t border-slate-200" />
          <span className="mx-3 text-[11px] uppercase tracking-wide text-slate-400">
            hoặc tạo tài khoản bằng email
          </span>
          <div className="flex-grow border-t border-slate-200" />
        </div>
      </div>

      <div className="space-y-5">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-[#374151]">
            Họ và tên
          </span>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-[18px]">
              person
            </span>
            <input
              className={`${inputClassName} pl-10 ${fieldErrors.fullName ? "border-red-300 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]" : ""}`}
              placeholder="Nguyễn Văn A"
              required
              type="text"
              value={form.fullName}
              onChange={(e) => {
                handleChange("fullName", e.target.value);
                if (fieldErrors.fullName) {
                  setFieldErrors((prev) => ({ ...prev, fullName: "" }));
                }
              }}
            />
          </div>
          {fieldErrors.fullName && (
            <p className={errorClassName}>{fieldErrors.fullName}</p>
          )}
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#374151]">
              Số điện thoại
            </span>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-[18px]">
                call
              </span>
              <input
                className={`${inputClassName} pl-10`}
                placeholder="+84"
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#374151]">
              Email
            </span>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-[18px]">
                mail
              </span>
              <input
                className={`${inputClassName} pl-10`}
                placeholder="example@email.com"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#374151]">
              Mật khẩu
            </span>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-[18px]">
                lock
              </span>
              <input
                className={`${inputClassName} pl-10 pr-10 ${fieldErrors.password ? "border-red-300 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]" : ""}`}
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => {
                  handleChange("password", e.target.value);
                  if (fieldErrors.password || fieldErrors.confirm) {
                    setFieldErrors((prev) => ({
                      ...prev,
                      password: "",
                      confirm: "",
                    }));
                  }
                }}
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]/75 hover:text-[#6B7280] transition-colors duration-200"
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label="Toggle password visibility"
              >
                <span className="material-symbols-outlined text-[18px]">
                  visibility
                </span>
              </button>
            </div>
            {fieldErrors.password ? (
              <p className={errorClassName}>{fieldErrors.password}</p>
            ) : form.password.length >= 8 ? (
              <p className={successClassName}>Mật khẩu hợp lệ.</p>
            ) : null}
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#374151]">
              Nhập lại mật khẩu
            </span>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-[18px]">
                lock_reset
              </span>
              <input
                className={`${inputClassName} pl-10 pr-10 ${fieldErrors.confirm ? "border-red-300 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]" : ""}`}
                placeholder="••••••••"
                type={showConfirm ? "text" : "password"}
                value={form.confirm}
                onChange={(e) => {
                  handleChange("confirm", e.target.value);
                  if (fieldErrors.confirm) {
                    setFieldErrors((prev) => ({ ...prev, confirm: "" }));
                  }
                }}
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]/75 hover:text-[#6B7280] transition-colors duration-200"
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                aria-label="Toggle confirm password visibility"
              >
                <span className="material-symbols-outlined text-[18px]">
                  visibility
                </span>
              </button>
            </div>
            {fieldErrors.confirm ? (
              <p className={errorClassName}>{fieldErrors.confirm}</p>
            ) : form.confirm && form.password === form.confirm ? (
              <p className={successClassName}>Mật khẩu khớp.</p>
            ) : null}
          </label>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-slate-500 px-1">
          <div className="flex items-center gap-1 text-emerald-600">
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
        className="group rounded-[24px] border border-slate-200 bg-slate-50/65 open:bg-white transition-all duration-300"
        open={showOptional}
        onToggle={(e) => setShowOptional(e.target.open)}
      >
        <summary className="flex cursor-pointer items-center justify-between gap-4 p-4 text-slate-900 font-medium select-none">
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#9CA3AF]">
              tune
            </span>
            Thông tin bổ sung (Tùy chọn)
          </span>
          <span className="material-symbols-outlined text-[#9CA3AF] transition-transform duration-300 group-open:-rotate-180">
            expand_more
          </span>
        </summary>
        <div className="mt-2 space-y-4 border-t border-slate-200 p-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-[#374151]">
                Ngày sinh
              </span>
              <input
                className={`${inputClassName} px-4`}
                type="date"
                value={form.birthday}
                onChange={(e) => handleChange("birthday", e.target.value)}
              />
            </label>
            <div>
              <span className="mb-2 block text-[13px] font-medium text-[#374151]">
                Giới tính
              </span>
              <div className="flex gap-4 mt-2">
                {["Nam", "Nữ", "Khác"].map((label) => (
                  <label
                    key={label}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      className="text-primary focus:ring-primary bg-slate-100 border-slate-300"
                      name="gender"
                      type="radio"
                      checked={form.gender === label}
                      onChange={() => handleChange("gender", label)}
                    />
                    <span className="text-sm text-slate-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#374151]">
              Địa chỉ
            </span>
            <input
              className={`${inputClassName} px-4`}
              placeholder="Số nhà, Tên đường, Phường/Xã..."
              type="text"
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
            />
          </label>
        </div>
      </details>

      <div className="flex items-start gap-2.5 pt-1">
        <div className="flex h-5 items-center">
          <input
            className="size-4 rounded border-slate-300 bg-white text-primary focus:ring-primary"
            id="terms"
            name="terms"
            type="checkbox"
            checked={form.terms}
            onChange={(e) => {
              handleChange("terms", e.target.checked);
              if (fieldErrors.terms) {
                setFieldErrors((prev) => ({ ...prev, terms: "" }));
              }
            }}
          />
        </div>
        <label className="text-sm leading-6 text-slate-600" htmlFor="terms">
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
      {fieldErrors.terms && (
        <p className={errorClassName}>{fieldErrors.terms}</p>
      )}

      <div className="pt-1">
        <button
          className="flex h-12 w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1d4ed8,#38bdf8)] px-3 text-sm font-semibold leading-6 text-white shadow-[0_16px_30px_rgba(37,99,235,0.24)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_20px_36px_rgba(37,99,235,0.28)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={loading}
        >
          {loading ? "Đang tạo tài khoản..." : "Đăng ký tài khoản"}
        </button>
      </div>

      <div className="text-center">
        <p className="text-sm text-slate-500">
          Đã có tài khoản?
          <Link
            className="font-semibold text-primary hover:text-blue-500 ml-1"
            to="/login"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </motion.form>
  );
};

export default SignupForm;
