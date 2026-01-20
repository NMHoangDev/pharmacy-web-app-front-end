import React from "react";
import { Link } from "react-router-dom";

const AuthLayout = ({ children, hero, brand = "Pharmacy Plus" }) => {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen flex flex-col">
      <main className="flex flex-1 flex-col lg:grid lg:grid-cols-12 h-full">
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center px-4 sm:px-12 md:px-20 py-12 bg-surface-light dark:bg-surface-dark">
          <div className="w-full max-w-[520px] mx-auto flex flex-col gap-6">
            {children}
          </div>
        </div>
        {hero && (
          <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 relative overflow-hidden bg-slate-100 dark:bg-slate-900">
            {hero}
          </div>
        )}
      </main>
    </div>
  );
};

export default AuthLayout;
