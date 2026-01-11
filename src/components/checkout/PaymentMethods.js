import React from "react";

const PaymentMethods = ({ options, selectedId, onSelect }) => {
  return (
    <div className="bg-white dark:bg-[#1A2633] rounded-xl p-6 shadow-sm border border-[#e7edf3] dark:border-gray-700">
      <h2 className="text-xl font-bold text-[#0d141b] dark:text-white mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">payments</span>
        Phương thức thanh toán
      </h2>

      <div className="space-y-3">
        {options.map((opt) => {
          const isActive = opt.id === selectedId;
          return (
            <label
              key={opt.id}
              className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                isActive
                  ? "border-primary bg-primary/5"
                  : "border-[#e7edf3] dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <input
                type="radio"
                name="payment"
                checked={isActive}
                onChange={() => onSelect(opt.id)}
                className="form-radio text-primary h-5 w-5 border-gray-300 focus:ring-primary"
              />
              <span className="material-symbols-outlined text-gray-500">
                {opt.icon}
              </span>
              <span className="font-medium text-[#0d141b] dark:text-white">
                {opt.label}
              </span>
              {opt.badge && (
                <span className="ml-auto text-xs font-semibold text-primary">
                  {opt.badge}
                </span>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentMethods;
