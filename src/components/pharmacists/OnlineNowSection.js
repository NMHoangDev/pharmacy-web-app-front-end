import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";

const OnlineNowSection = ({ pharmacists = [], onViewAll }) => {
  const navigate = useNavigate();

  const onlineList = useMemo(() => pharmacists, [pharmacists]);

  const handleNavigateBooking = (pharmacist) => {
    navigate("/booking", { state: { pharmacist } });
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900">
              Dược sĩ đang online
            </h3>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
              {onlineList.length}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Danh sách dược sĩ sẵn sàng tư vấn ngay.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onViewAll) return onViewAll();
            navigate("/pharmacists");
          }}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          Xem tất cả
        </button>
      </div>

      {onlineList.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
          Hiện chưa có dược sĩ online.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {onlineList.map((pharmacist) => (
            <article
              key={pharmacist.id}
              className="rounded-lg border border-slate-200 bg-white p-3"
            >
              <div className="flex items-start gap-3">
                <img
                  src={pharmacist.image}
                  alt={pharmacist.name}
                  className="h-10 w-10 rounded-lg object-cover border border-slate-200"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900">
                    {pharmacist.name}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                    {pharmacist.specialty}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Online
                </span>
                <button
                  type="button"
                  onClick={() => handleNavigateBooking(pharmacist)}
                  className="h-8 rounded-md border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  Tư vấn ngay
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default OnlineNowSection;
