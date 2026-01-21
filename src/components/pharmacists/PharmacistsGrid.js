import React from "react";
import { useNavigate } from "react-router-dom";

const PharmacistsGrid = ({ pharmacists = [] }) => {
  const navigate = useNavigate();

  const handleNavigateBooking = (pharmacist) => {
    navigate("/booking", { state: { pharmacist } });
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {pharmacists.map((pharmacist) => (
        <article
          key={pharmacist.id}
          className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300"
        >
          <div className="p-5 flex flex-col items-center text-center gap-3">
            <div className="relative">
              <div
                className="w-24 h-24 rounded-full bg-cover bg-center border-4 border-white shadow-sm"
                style={{ backgroundImage: `url('${pharmacist.image}')` }}
              />
              <div
                className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-[3px] border-white ${
                  pharmacist.status === "online"
                    ? "bg-green-500"
                    : "bg-gray-400"
                }`}
              />
            </div>
            <div>
              <h3 className="text-slate-900 dark:text-white text-lg font-bold group-hover:text-primary transition-colors">
                {pharmacist.name}
              </h3>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {pharmacist.tag}
                </span>
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {pharmacist.experience}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <div className="flex items-center text-yellow-400">
                <span className="material-symbols-outlined text-[18px]">
                  star
                </span>
                <span className="text-slate-900 dark:text-white font-bold ml-1 text-base">
                  {(pharmacist.rating ?? 0).toFixed(1)}
                </span>
              </div>
              <span>({pharmacist.reviews} đánh giá)</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
              <span className="material-symbols-outlined text-[14px]">
                verified
              </span>
              {pharmacist.badge}
            </div>
          </div>
          <div className="p-4 pt-0 mt-auto grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleNavigateBooking(pharmacist)}
              className="col-span-1 py-2 px-3 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Xem hồ sơ
            </button>
            <button
              type="button"
              onClick={() => handleNavigateBooking(pharmacist)}
              className="col-span-1 py-2 px-3 rounded-lg bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary-dark transition-colors"
            >
              Chọn tư vấn
            </button>
          </div>
        </article>
      ))}
    </section>
  );
};

export default PharmacistsGrid;
