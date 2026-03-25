import React from "react";

const AdminPageContainer = ({ children, className = "" }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#f5f7fa] p-3 sm:p-4 lg:p-5">
      <div
        className={`mx-auto flex w-full max-w-[1360px] flex-col gap-3 sm:gap-4 ${className}`.trim()}
      >
        {children}
      </div>
    </div>
  );
};

export default AdminPageContainer;
