import React from "react";

const statusDot = (status) => (
  <span
    className={`absolute bottom-0 right-0 size-4 rounded-full border-2 border-white dark:border-slate-900 ${
      status === "online" ? "bg-green-500" : "bg-slate-400"
    }`}
  />
);

const specialtyLabel = {
  clinical: "Dược lâm sàng",
  retail: "Dược bán lẻ",
  hospital: "Dược bệnh viện",
  research: "Nghiên cứu phát triển",
  online: "Tư vấn trực tuyến",
};

const AdminPharmacistGrid = ({
  pharmacists,
  onToggleStatus,
  onToggleVerify,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {pharmacists.map((p) => (
        <div
          key={p.id}
          className="group relative bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300"
        >
          <button
            type="button"
            onClick={() => onToggleVerify(p.id)}
            className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-white"
            title="Đổi trạng thái xác thực"
          >
            <span className="material-symbols-outlined text-[20px]">
              verified
            </span>
          </button>
          <div className="flex items-start gap-4">
            <div className="relative">
              <div
                className="size-16 rounded-full bg-cover bg-center border-2 border-white dark:border-slate-800 shadow-sm"
                style={{ backgroundImage: `url(${p.avatar})` }}
                aria-label={p.name}
              />
              {statusDot(p.status)}
            </div>
            <div className="flex flex-col pt-1">
              <h3 className="text-slate-900 dark:text-white font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                {p.name}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                {specialtyLabel[p.specialty] || p.specialty}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium border border-slate-100 dark:border-slate-700">
              <span className="material-symbols-outlined text-[14px]">
                work_history
              </span>
              {p.experience} năm KN
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                p.verified
                  ? "bg-blue-50 dark:bg-blue-900/20 text-primary border-blue-100 dark:border-blue-900/50"
                  : "bg-orange-50 dark:bg-orange-900/20 text-orange-600 border-orange-100 dark:border-orange-900/50"
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">
                {p.verified ? "verified" : "pending"}
              </span>
              {p.verified ? "Đã xác thực" : "Chờ xác thực"}
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
            <span>ID: {p.id}</span>
            <span
              className={`flex items-center gap-1 font-medium ${
                p.status === "online"
                  ? "text-green-600 dark:text-green-400"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <span className="size-1.5 rounded-full animate-pulse bg-current" />
              {p.status === "online" ? p.availability : "Offline"}
            </span>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => onToggleStatus(p.id)}
              className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium py-2 hover:border-primary hover:text-primary dark:hover:text-primary transition-colors"
            >
              Chuyển {p.status === "online" ? "offline" : "online"}
            </button>
            <button
              type="button"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-primary/90"
            >
              Giao ca
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminPharmacistGrid;
