import React from "react";
import { useNavigate } from "react-router-dom";

const OnlineNowSection = ({ pharmacists = [] }) => {
  const navigate = useNavigate();

  const handleNavigateBooking = (pharmacist) => {
    navigate("/booking", { state: { pharmacist } });
  };

  return (
    <section className="rounded-xl bg-blue-50/50 border border-blue-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
          </span>
          <h3 className="text-slate-900 text-lg font-bold">
            Dược sĩ đang Online ngay
          </h3>
        </div>
        <button className="text-sm font-semibold text-primary hover:underline">
          Xem tất cả
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {pharmacists.map((pharmacist) => (
          <article
            key={pharmacist.id}
            className="flex flex-col items-center bg-white dark:bg-slate-900 p-3 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="relative mb-2">
              <div
                className="w-16 h-16 rounded-full bg-cover bg-center"
                style={{ backgroundImage: `url('${pharmacist.image}')` }}
              />
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {pharmacist.name}
            </p>
            <p className="text-xs text-slate-500">{pharmacist.specialty}</p>
            <button
              type="button"
              onClick={() => handleNavigateBooking(pharmacist)}
              className="mt-2 w-full text-xs font-bold text-primary bg-blue-50 py-1.5 rounded hover:bg-blue-100 transition-colors"
            >
              Tư vấn ngay
            </button>
          </article>
        ))}
      </div>
    </section>
  );
};

export default OnlineNowSection;
