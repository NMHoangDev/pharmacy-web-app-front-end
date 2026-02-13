import React from "react";
import { useNavigate } from "react-router-dom";

const PharmacistsGrid = ({ pharmacists = [] }) => {
  const navigate = useNavigate();

  const handleNavigateBooking = (pharmacist) => {
    navigate("/booking", { state: { pharmacist } });
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pharmacists.map((pharmacist) => (
        <article
          key={pharmacist.id}
          className={[
            "group relative overflow-hidden rounded-2xl",
            "border border-slate-200/70 dark:border-slate-700/60",
            "bg-white/80 dark:bg-slate-900/60 backdrop-blur",
            "shadow-sm hover:shadow-xl hover:shadow-slate-200/40 dark:hover:shadow-black/30",
            "transition-all duration-300 hover:-translate-y-1",
            "focus-within:ring-4 focus-within:ring-primary/20",
          ].join(" ")}
        >
          {/* gradient glow on hover */}
          <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.18),transparent_60%)]" />

          {/* top subtle strip */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/60 via-sky-400/40 to-emerald-400/40 opacity-70" />

          <div className="p-5">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="relative">
                  <div className="size-20 rounded-2xl overflow-hidden ring-1 ring-slate-200/70 dark:ring-slate-700/70 bg-slate-100 dark:bg-slate-800">
                    <img
                      src={pharmacist.image}
                      alt={pharmacist.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                      loading="lazy"
                    />
                  </div>

                  {/* online dot */}
                  <div
                    className={[
                      "absolute -bottom-1 -right-1 size-4 rounded-full",
                      "ring-4 ring-white dark:ring-slate-900",
                      pharmacist.status === "online"
                        ? "bg-emerald-500"
                        : "bg-slate-400",
                    ].join(" ")}
                    aria-label={
                      pharmacist.status === "online" ? "Online" : "Offline"
                    }
                  />
                </div>
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="truncate text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                    {pharmacist.name}
                  </h3>

                  {/* rating */}
                  <div
                    className="shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold
                                  bg-slate-100/80 dark:bg-slate-800/60 ring-1 ring-slate-200/70 dark:ring-slate-700/70"
                  >
                    <span className="material-symbols-outlined text-[16px] text-yellow-500">
                      star
                    </span>
                    <span className="text-slate-900 dark:text-white">
                      {(pharmacist.rating ?? 0).toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* tags */}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {pharmacist.tag ? (
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold
                                     bg-blue-50 text-blue-700 ring-1 ring-blue-200/70 dark:bg-blue-500/10 dark:text-blue-200 dark:ring-blue-500/20"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        local_pharmacy
                      </span>
                      {pharmacist.tag}
                    </span>
                  ) : null}

                  {pharmacist.experience ? (
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold
                                     bg-slate-50 text-slate-700 ring-1 ring-slate-200/70 dark:bg-slate-800/50 dark:text-slate-200 dark:ring-slate-700/70"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        workspace_premium
                      </span>
                      {pharmacist.experience}
                    </span>
                  ) : null}

                  {typeof pharmacist.reviews !== "undefined" ? (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      ({pharmacist.reviews} đánh giá)
                    </span>
                  ) : null}
                </div>

                {/* badge */}
                {pharmacist.badge ? (
                  <div
                    className="mt-3 inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-semibold
                                  bg-emerald-50/70 text-emerald-700 ring-1 ring-emerald-200/70
                                  dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/20"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      verified
                    </span>
                    {pharmacist.badge}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="px-5 pb-5 pt-0">
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleNavigateBooking(pharmacist)}
                className={[
                  "col-span-1 h-11 rounded-xl",
                  "bg-white/70 dark:bg-slate-900/30",
                  "ring-1 ring-slate-200/70 dark:ring-slate-700/70",
                  "text-slate-900 dark:text-white text-sm font-semibold",
                  "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition",
                  "active:scale-[0.98] active:translate-y-[1px]",
                  "focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
                ].join(" ")}
              >
                Xem hồ sơ
              </button>

              <button
                type="button"
                onClick={() => handleNavigateBooking(pharmacist)}
                className={[
                  "col-span-1 h-11 rounded-xl",
                  "bg-primary text-white text-sm font-semibold",
                  "shadow-sm hover:shadow-md hover:bg-primary/90 transition",
                  "active:scale-[0.98] active:translate-y-[1px]",
                  "focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30",
                ].join(" ")}
              >
                Chọn tư vấn
              </button>
            </div>
          </div>

          {/* hover ring */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover:ring-primary/15 transition" />
        </article>
      ))}
    </section>
  );
};

export default PharmacistsGrid;
