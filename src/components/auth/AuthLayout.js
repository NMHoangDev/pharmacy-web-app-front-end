import React from "react";
import { Link } from "react-router-dom";

const AuthLayout = ({
  children,
  hero,
  brand = "Pharmacy Plus",
  formMaxWidth = "max-w-[520px]",
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111827]">
      <main className="flex flex-1 flex-col lg:grid lg:grid-cols-12 h-full">
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center px-6 sm:px-10 md:px-16 py-10 bg-white">
          <div className={`w-full ${formMaxWidth} mx-auto flex flex-col gap-6`}>
            {children}
          </div>
        </div>
        {hero && (
          <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 relative overflow-hidden bg-[#F8FAFC] border-l border-[#E5E7EB]">
            {hero}
          </div>
        )}
      </main>
    </div>
  );
};

export default AuthLayout;
