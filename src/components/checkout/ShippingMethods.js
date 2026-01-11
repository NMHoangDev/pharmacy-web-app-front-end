import React from "react";

const ShippingMethods = ({ options, selectedId, onSelect }) => {
  return (
    <div className="bg-white dark:bg-[#1A2633] rounded-xl p-6 shadow-sm border border-[#e7edf3] dark:border-gray-700">
      <h2 className="text-xl font-bold text-[#0d141b] dark:text-white mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">schedule</span>
        Hình thức vận chuyển
      </h2>

      <div className="space-y-3">
        {options.map((opt) => {
          const isActive = opt.id === selectedId;
          return (
            <label
              key={opt.id}
              className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors border ${
                isActive
                  ? "border-primary bg-primary/5"
                  : "border-[#e7edf3] dark:border-gray-700 hover:border-primary/50 dark:hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-4">
                <input
                  type="radio"
                  name="shipping"
                  checked={isActive}
                  onChange={() => onSelect(opt.id)}
                  className="form-radio text-primary h-5 w-5 border-gray-300 focus:ring-primary"
                />
                <div>
                  <p className="font-bold text-[#0d141b] dark:text-white">
                    {opt.name}
                  </p>
                  <p className="text-sm text-[#4c739a] dark:text-gray-400">
                    {opt.desc}
                  </p>
                </div>
              </div>
              <span className="font-semibold text-[#0d141b] dark:text-white">
                {opt.feeLabel}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default ShippingMethods;
