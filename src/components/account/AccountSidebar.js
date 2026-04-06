import React from "react";
import { Link } from "react-router-dom";

const AccountSidebar = ({ profile, navItems, activeKey }) => {
  return (
    <aside className="lg:col-span-3 lg:min-h-[600px]">
      <div className="sticky top-24 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-col items-center border-b border-slate-100 p-6 text-center dark:border-slate-700">
          <div
            className="mb-3 size-20 rounded-full bg-cover bg-center ring-4 ring-slate-50 dark:ring-slate-700"
            style={{ backgroundImage: `url(${profile.avatarUrl})` }}
            aria-label="Avatar người dùng"
          />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {profile.name}
          </h2>
          {profile.membership ? (
            <div className="mt-1 flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 dark:bg-yellow-900/30">
              <span className="material-symbols-outlined fill text-[16px] text-yellow-600 dark:text-yellow-500">
                military_tech
              </span>
              <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-500">
                {profile.membership}
              </span>
            </div>
          ) : null}
        </div>

        <nav className="flex flex-col gap-1 p-2">
          {navItems.map((item) => {
            const isActive = item.key === activeKey;
            const baseClasses =
              "group flex items-center gap-3 rounded-lg px-4 py-3 transition-colors";
            const activeClasses = "bg-primary/10 font-medium text-primary";
            const defaultClasses =
              "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white";

            if (item.type === "divider") {
              return (
                <div
                  key={item.key}
                  className="mx-2 my-1 h-px bg-slate-100 dark:bg-slate-700"
                />
              );
            }

            const content = (
              <>
                <span className="material-symbols-outlined transition-colors group-hover:text-primary">
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.badge ? (
                  <span className="ml-auto rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </>
            );

            return item.to ? (
              <Link
                key={item.key}
                to={item.to}
                className={`${baseClasses} ${isActive ? activeClasses : defaultClasses}`}
              >
                {content}
              </Link>
            ) : (
              <button
                key={item.key}
                type="button"
                className={`${baseClasses} ${isActive ? activeClasses : defaultClasses} text-left`}
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
