import React from "react";
import { NavLink } from "react-router-dom";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-surface-light dark:bg-surface-dark border-b border-[#e7edf3] dark:border-slate-700 shadow-sm">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-8">
          <div className="flex items-center gap-3 shrink-0">
            <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-3xl">
                local_pharmacy
              </span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white hidden sm:block">
              PharmaCare
            </span>
          </div>

          <div className="flex-1 max-w-2xl hidden md:block">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-slate-400">
                  search
                </span>
              </div>
              <input
                type="text"
                placeholder="Tìm tên thuốc, bệnh lý, thực phẩm chức năng..."
                className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg leading-5 bg-[#e7edf3] dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-slate-800 transition-all duration-200 sm:text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <button className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">search</span>
            </button>
            <button className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors group">
              <span className="material-symbols-outlined">shopping_cart</span>
              <span className="absolute top-1 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white group-hover:scale-110 transition-transform">
                2
              </span>
            </button>
            <button className="p-2 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">account_circle</span>
            </button>
          </div>
        </div>

        <nav className="hidden md:flex gap-8 pb-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              [
                "text-sm pb-1 transition-colors",
                isActive
                  ? "font-semibold text-primary border-b-2 border-primary"
                  : "font-medium text-slate-600 dark:text-slate-300 hover:text-primary",
              ].join(" ")
            }
          >
            Trang chủ
          </NavLink>
          <NavLink
            to="/medicines"
            className={({ isActive }) =>
              [
                "text-sm pb-1 transition-colors",
                isActive
                  ? "font-semibold text-primary border-b-2 border-primary"
                  : "font-medium text-slate-600 dark:text-slate-300 hover:text-primary",
              ].join(" ")
            }
          >
            Thuốc / Sản phẩm
          </NavLink>
          <NavLink
            to="/pharmacists"
            className={({ isActive }) =>
              [
                "text-sm pb-1 transition-colors",
                isActive
                  ? "font-semibold text-primary border-b-2 border-primary"
                  : "font-medium text-slate-600 dark:text-slate-300 hover:text-primary",
              ].join(" ")
            }
          >
            Dược sĩ
          </NavLink>
          <NavLink
            to="/introduction"
            className={({ isActive }) =>
              [
                "text-sm pb-1 transition-colors",
                isActive
                  ? "font-semibold text-primary border-b-2 border-primary"
                  : "font-medium text-slate-600 dark:text-slate-300 hover:text-primary",
              ].join(" ")
            }
          >
            Về chúng tôi
          </NavLink>
          <a
            href="#"
            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors pb-1"
          >
            Liên hệ
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
