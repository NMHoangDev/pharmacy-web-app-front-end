import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import "./admin-shell.css";

const AdminLayout = ({ activeKey = "dashboard", children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <AdminSidebar
        activeKey={activeKey}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="fixed left-4 top-4 z-30 inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/96 p-3 text-slate-700 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.65)] backdrop-blur transition hover:text-primary dark:border-slate-700 dark:bg-slate-800/96 dark:text-slate-100 md:left-6 md:top-5"
        aria-label="Mo dieu huong admin"
      >
        <span className="material-symbols-outlined text-[22px]">menu</span>
      </button>

      <main className="admin-shell min-h-screen min-w-0 pt-16 md:pt-20">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
