import React, { useState } from "react";
import { Link } from "react-router-dom";

const LoginForm = ({ onSubmit }) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      alert("Vui lòng nhập đầy đủ thông tin đăng nhập.");
      return;
    }
    onSubmit?.({ identifier, password, remember });
    alert(`Đăng nhập với ${identifier}`);
  };

  return (
    <form className="flex flex-col gap-5 mt-4" onSubmit={handleSubmit}>
      <label className="flex flex-col w-full">
        <span className="text-slate-900 dark:text-white text-sm font-medium pb-2">
          Email hoặc Số điện thoại
        </span>
        <input
          className="form-input w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white h-12 px-4 placeholder:text-slate-400 focus:border-primary focus:ring-primary focus:ring-1"
          placeholder="Nhập email hoặc số điện thoại"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          type="text"
        />
      </label>

      <label className="flex flex-col w-full">
        <div className="flex justify-between items-center pb-2">
          <span className="text-slate-900 dark:text-white text-sm font-medium">
            Mật khẩu
          </span>
        </div>
        <div className="relative flex w-full items-center rounded-lg">
          <input
            className="form-input w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white h-12 px-4 pr-12 placeholder:text-slate-400 focus:border-primary focus:ring-primary focus:ring-1"
            placeholder="Nhập mật khẩu"
            required
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label="Toggle password visibility"
          >
            <span className="material-symbols-outlined">visibility</span>
          </button>
        </div>
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            className="h-4 w-4 rounded border-slate-300 bg-white text-primary focus:ring-primary/20 transition-all"
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <span className="text-slate-700 dark:text-slate-300 text-sm font-medium select-none">
            Ghi nhớ đăng nhập
          </span>
        </label>
        <Link
          className="text-primary hover:text-primary-hover text-sm font-bold hover:underline"
          to="/forgot-password"
        >
          Quên mật khẩu?
        </Link>
      </div>

      <button
        className="group flex w-full items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover active:bg-primary-hover text-white h-12 px-6 text-sm font-bold tracking-wide transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        type="submit"
      >
        <span>Đăng nhập</span>
        <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">
          arrow_forward
        </span>
      </button>

      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-slate-200 dark:border-slate-700" />
        <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-medium uppercase tracking-wider">
          Hoặc tiếp tục với
        </span>
        <div className="flex-grow border-t border-slate-200 dark:border-slate-700" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          className="flex items-center justify-center gap-2 h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          type="button"
          onClick={() => alert("Đăng nhập bằng Google")}
        >
          <img
            alt="Google"
            className="w-5 h-5"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGMCi3DBFwXEqBPOjbaS-qeDWcmyN1ETB64Qp7N6bpVJgtxHWsKKKKPU27WqOb_eCGwIsWVrZPWRAmtX9fQ3IDepRtGMByGMLJ8_g_GVnJYyihD5gArfEz-2HoP5YH6DJziWqLBcJiBAGLXm9bSJBgugjl9hLINtqFjSfw8BiO45Vty0_HGxotDfAXeXQTKzNt72ORlkBGn5sRLjl-uKPJ4BhZG9yYCRKcLgJKN56rB57Y4e7zpzdiSub0pMLD55vT89x1dD_z_9wF"
          />
          <span className="text-slate-700 dark:text-slate-200 text-sm font-semibold">
            Google
          </span>
        </button>
        <button
          className="flex items-center justify-center gap-2 h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          type="button"
          onClick={() => alert("Đăng nhập bằng Facebook")}
        >
          <img
            alt="Facebook"
            className="w-5 h-5"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBX96PyHlQ5eQRnMuY0bFOjvYtj43vz8bCf9Qhtzh6kYLXqLxa_ADampRJZDk62ksQOs9XT-uSvz4bpwWZncPbVy7lEoRvR5__AKquulbL5jq6vjb-3No_PeLZJjSe8nc8zTvuYVTt1t3yVOEKdXziKHxJgacZABlKs6KgZJS5yFbMF9QDUzPmwnRYD1fuw8b5o3eC30GLoiEqFQvmzYVPthJuVzTqvk37LTud-lQaGXpT1YEFtwgkx9OuehfuF_UIt93-0y2pr1Cdk"
          />
          <span className="text-slate-700 dark:text-slate-200 text-sm font-semibold">
            Facebook
          </span>
        </button>
      </div>

      <div className="text-center mt-2">
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Chưa có tài khoản?
          <Link
            className="text-primary hover:text-primary-hover font-bold hover:underline ml-1"
            to="/signup"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;
