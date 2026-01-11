import React from "react";
import { Link } from "react-router-dom";

const AccountSidebar = ({ profile, navItems, activeKey }) => {
  return (
    <aside className="lg:col-span-3 lg:min-h-[600px]">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden sticky top-24">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col items-center text-center">
          <div
            className="size-20 rounded-full bg-cover bg-center mb-3 ring-4 ring-slate-50 dark:ring-slate-700"
            style={{ backgroundImage: `url(${profile.avatarUrl})` }}
            aria-label="Avatar người dùng"
          />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {profile.name}
          </h2>
          {profile.membership && (
            <div className="flex items-center gap-1 mt-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
              <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-500 text-[16px] fill">
                military_tech
              </span>
              <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-500">
                {profile.membership}
              </span>
            </div>
          )}
        </div>

        <nav className="flex flex-col p-2 gap-1">
          {navItems.map((item) => {
            const isActive = item.key === activeKey;
            const baseClasses =
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors";
            const activeClasses = "bg-primary/10 text-primary font-medium";
            const defaultClasses =
              "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white";

            if (item.type === "divider") {
              return (
                <div
                  key={item.key}
                  className="h-px bg-slate-100 dark:bg-slate-700 my-1 mx-2"
                />
              );
            }

            const content = (
              <>
                <span className="material-symbols-outlined group-hover:text-primary transition-colors">
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </>
            );

            return item.to ? (
              <Link
                key={item.key}
                to={item.to}
                className={`${baseClasses} ${
                  isActive ? activeClasses : defaultClasses
                } group`}
              >
                {content}
              </Link>
            ) : (
              <button
                key={item.key}
                type="button"
                className={`${baseClasses} ${
                  isActive ? activeClasses : defaultClasses
                } group text-left`}
                onClick={item.onClick}
              >
                {content}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default AccountSidebar;
