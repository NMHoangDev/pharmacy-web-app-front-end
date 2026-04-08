import React from "react";
import { Link } from "react-router-dom";

const AuthLayout = ({
  children,
  hero,
  brand = "Pharmacy Plus",
  formMaxWidth = "max-w-[520px]",
}) => {
  return (
    <div className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f7fbff_0%,#eff7ff_52%,#f8fcff_100%)] text-slate-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8%] top-[-4%] h-64 w-64 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute bottom-[-8%] right-[-6%] h-80 w-80 rounded-full bg-cyan-100/60 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_65%)]" />
      </div>

      <main className="relative flex min-h-screen flex-1 flex-col lg:grid lg:grid-cols-12">
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center px-5 py-8 sm:px-8 md:px-12 lg:px-14">
          <div className={`relative z-10 mx-auto flex w-full ${formMaxWidth} flex-col gap-6`}>
            <div className="flex items-center justify-between gap-4">
              <Link
                to="/"
                className="inline-flex items-center gap-3 rounded-full border border-sky-100 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-800 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1d4ed8,#38bdf8)] text-white shadow-[0_12px_24px_rgba(37,99,235,0.24)]">
                  <span className="material-symbols-outlined text-[20px]">
                    local_pharmacy
                  </span>
                </span>
                <span className="flex flex-col leading-tight">
                  <span>{brand}</span>
                  <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400">
                    Chăm sóc sức khỏe số
                  </span>
                </span>
              </Link>
            </div>

            <div className="rounded-[30px] border border-white/70 bg-white/82 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-7">
              {children}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm text-slate-600 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/70 bg-white/72 px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Hỗ trợ
                </p>
                <p className="mt-1 font-medium text-slate-800">Tư vấn nhanh</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/72 px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Bảo mật
                </p>
                <p className="mt-1 font-medium text-slate-800">Đăng nhập an toàn</p>
              </div>
              <div className="col-span-2 rounded-2xl border border-white/70 bg-white/72 px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:col-span-1">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Trải nghiệm
                </p>
                <p className="mt-1 font-medium text-slate-800">Đồng bộ với toàn site</p>
              </div>
            </div>
          </div>
        </div>
        {hero && (
          <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 px-6 py-6 xl:px-8">
            <div className="relative w-full overflow-hidden rounded-[36px] border border-white/70 bg-white/55 shadow-[0_30px_90px_rgba(15,23,42,0.10)] backdrop-blur-xl">
              {hero}
            </div>
          </div>
        )}
        {!hero && (
          <div className="hidden lg:block lg:col-span-6 xl:col-span-7" />
        )}
      </main>
    </div>
  );
};

export default AuthLayout;
