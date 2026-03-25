import React from "react";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = ({ activeKey = "dashboard", children }) => {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 overflow-x-hidden">
      <div className="flex min-w-0">
        <AdminSidebar activeKey={activeKey} />
        <main className="flex-1 min-h-screen min-w-0">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
