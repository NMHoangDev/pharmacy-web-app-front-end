import React from "react";

const TopProductsCard = ({ products }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col">
    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
      Top thuốc bán chạy
    </h3>
    <div className="flex-1 flex flex-col justify-center gap-5">
      {products.map((item) => (
        <div key={item.name} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {item.name}
            </span>
            <span className="text-slate-500">
              {item.count} {item.unit}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full"
              style={{ width: `${item.progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default TopProductsCard;
