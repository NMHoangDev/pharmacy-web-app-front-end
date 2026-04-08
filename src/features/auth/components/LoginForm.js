import React, { useState } from "react";
import { Link } from "react-router-dom";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C17 3.3 14.7 2.3 12 2.3a9.7 9.7 0 0 0 0 19.4c5.6 0 9.3-3.9 9.3-9.4 0-.6-.1-1.1-.2-1.6H12z"
    />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <path
      fill="#1877F2"
      d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.6 4.5-4.6 1.3 0 2.7.2 2.7.2V8h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.6 3.5h-2.8v8.4A12 12 0 0 0 24 12z"
    />
  </svg>
);

const LoginForm = ({ onSubmit, onGoogleLogin, loading, oauthLoading, error }) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    identifier: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const nextErrors = {
      identifier: identifier.trim()
        ? ""
        : "Vui lòng nhập email hoặc số điện thoại.",
      password: password.trim() ? "" : "Vui lòng nhập mật khẩu.",
    };

    setFieldErrors(nextErrors);

    if (nextErrors.identifier || nextErrors.password) {
      return;
    }

    onSubmit?.({ identifier, password, remember });
  };

  const inputClassName =
    "w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-sky-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(14,165,233,0.10)]";

  return (
    <form
      className="mt-2 flex flex-col gap-6"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="flex flex-col gap-4">
        <label className="flex flex-col w-full">
          <span className="pb-2 text-[13px] font-medium text-[#111827]">
            Email hoặc Số điện thoại
          </span>
          <input
            className={`${inputClassName} ${fieldErrors.identifier ? "border-red-300 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]" : ""}`}
            placeholder="Nhập email hoặc số điện thoại"
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              if (fieldErrors.identifier) {
                setFieldErrors((prev) => ({ ...prev, identifier: "" }));
              }
            }}
            type="text"
            aria-invalid={Boolean(fieldErrors.identifier)}
          />
          {fieldErrors.identifier && (
            <span className="mt-1 text-xs text-red-600">
              {fieldErrors.identifier}
            </span>
          )}
        </label>

        <label className="flex flex-col w-full">
          <div className="flex justify-between items-center pb-2">
            <span className="text-[13px] font-medium text-[#111827]">
              Mật khẩu
            </span>
          </div>
          <div className="relative flex w-full items-center rounded-lg">
            <input
              className={`${inputClassName} pr-10 ${fieldErrors.password || error ? "border-red-300 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]" : ""}`}
              placeholder="Nhập mật khẩu"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: "" }));
                }
              }}
              aria-invalid={Boolean(fieldErrors.password || error)}
            />
            <button
              className="absolute right-0 top-0 bottom-0 px-4 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label="Toggle password visibility"
            >
              <span className="material-symbols-outlined text-[18px]">
                visibility
              </span>
            </button>
          </div>
          {(fieldErrors.password || error) && (
            <span className="mt-1 text-xs text-red-600">
              {fieldErrors.password || error}
            </span>
          )}
        </label>
      </div>

      <div className="flex items-center justify-between gap-3 text-xs">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            className="h-4 w-4 rounded border-slate-300 bg-white text-sky-600 focus:ring-sky-200"
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <span className="text-[#6B7280] select-none">Ghi nhớ đăng nhập</span>
        </label>
        <Link
          className="font-medium text-sky-700 hover:text-sky-800"
          to="/forgot-password"
        >
          Quên mật khẩu?
        </Link>
      </div>

      <button
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#1d4ed8,#38bdf8)] px-6 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(37,99,235,0.24)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_20px_36px_rgba(37,99,235,0.28)] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
        type="submit"
        disabled={loading}
      >
        {loading && (
          <span className="h-4 w-4 rounded-full border-2 border-white/70 border-t-transparent animate-spin" />
        )}
        <span>{loading ? "Đang đăng nhập..." : "Đăng nhập"}</span>
      </button>

      <div className="relative flex items-center py-1">
        <div className="flex-grow border-t border-[#E5E7EB]" />
        <span className="mx-3 text-[11px] uppercase tracking-wide text-[#9CA3AF]">
          Hoặc tiếp tục với
        </span>
        <div className="flex-grow border-t border-[#E5E7EB]" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 transition-all duration-200 hover:border-sky-200 hover:bg-sky-50/60 hover:shadow-[0_10px_20px_rgba(15,23,42,0.05)]"
          type="button"
          onClick={() => onGoogleLogin?.()}
          disabled={loading || oauthLoading}
        >
          <GoogleIcon />
          <span className="text-[#111827] text-sm font-medium">
            {oauthLoading ? "Đang chuyển sang Google..." : "Google"}
          </span>
        </button>
        <button
          className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 transition-all duration-200 hover:border-sky-200 hover:bg-sky-50/60 hover:shadow-[0_10px_20px_rgba(15,23,42,0.05)]"
          type="button"
          disabled
        >
          <FacebookIcon />
          <span className="text-[#111827] text-sm font-medium opacity-60">
            Facebook
          </span>
        </button>
      </div>

      <div className="text-center text-sm text-[#6B7280]">
        Chưa có tài khoản?
        <Link
          className="ml-1 font-medium text-sky-700 hover:text-sky-800"
          to="/signup"
        >
          Đăng ký ngay
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;
