import React from "react";
import { Link } from "react-router-dom";

/**
 * AccountSidebar Component - Redesigned
 * Modern sidebar with improved visual hierarchy, hover states, and active indication
 * Features: Better avatar presentation, cleaner menu, premium appearance
 */
const AccountSidebarImproved = ({ profile, navItems, activeKey }) => {
  return (
    <aside className="lg:col-span-3">
      <div className="sticky top-24 bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* User Profile Header */}
        <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-slate-800 p-6 sm:p-8">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200 dark:bg-blue-900 opacity-20 rounded-full blur-3xl -mr-12 -mt-12"></div>

          <div className="relative flex flex-col items-center text-center space-y-3">
            {/* Avatar */}
            <div className="relative">
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-cover bg-center ring-4 ring-white dark:ring-slate-800 shadow-lg"
                style={{ backgroundImage: `url(${profile.avatarUrl})` }}
                aria-label="Avatar người dùng"
              />
              <div className="absolute bottom-0 right-0 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full ring-2 ring-white dark:ring-slate-800 shadow-md"></div>
            </div>

            {/* User info */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight">
                {profile.name}
              </h2>

              {profile.membership && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-800/20 rounded-full border border-amber-200 dark:border-amber-800/50 shadow-sm">
                  <span className="material-symbols-outlined text-amber-600 dark:text-amber-500 text-base">
                    military_tech
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-400">
                    {profile.membership}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col p-3 gap-1.5 border-t border-slate-200 dark:border-slate-700">
          {navItems.map((item) => {
            // Handle divider
            if (item.type === "divider") {
              return (
                <div
                  key={item.key}
                  className="h-px bg-slate-200 dark:bg-slate-700 my-1.5 mx-1"
                />
              );
            }

            const isActive = item.key === activeKey;

            // Base classes
            const baseClasses =
              "flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 relative group";

            // Active state
            const activeClasses =
              "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 shadow-sm";

            // Inactive state
            const inactiveClasses =
              "text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200";

            // Render content
            const content = (
              <>
                <span
                  className={`material-symbols-outlined flex-shrink-0 text-lg transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? "text-blue-600 dark:text-blue-400" : ""
                  }`}
                >
                  {item.icon}
                </span>
                <span className="flex-1 min-w-0 truncate">{item.label}</span>

                {/* Badge */}
                {item.badge && (
                  <span className="flex-shrink-0 ml-2 inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold shadow-md">
                    {item.badge}
                  </span>
                )}

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 w-1 h-6 -translate-y-1/2 bg-blue-500 rounded-r-lg shadow-lg"></div>
                )}
              </>
            );

            // Render link or button
            if (item.to) {
              return (
                <Link
                  key={item.key}
                  to={item.to}
                  className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={item.key}
                type="button"
                onClick={item.onClick}
                className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} text-left`}
              >
                {content}
              </button>
            );
          })}
        </nav>

        {/* Footer info - optional membership/contact info */}
        <div className="hidden sm:block px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center leading-relaxed">
            ✓ Bảo mật dữ liệu
            <br />✓ Hỗ trợ 24/7
          </p>
        </div>
      </div>
    </aside>
  );
};

export default AccountSidebarImproved;
