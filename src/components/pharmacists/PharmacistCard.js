import React from "react";

const PharmacistCard = ({ pharmacist, onNavigate }) => {
  const { image, name, status, rating, badge, experience, reviews, tag } =
    pharmacist;

  const isOnline = String(status).toLowerCase() === "online";
  const open = () => onNavigate?.(pharmacist);

  return (
    <article className="storefront-card flex h-full flex-col rounded-[26px] p-4 transition-all hover:-translate-y-1 hover:border-sky-200">
      <div className="flex items-start gap-3">
        <img
          src={image}
          alt={name}
          className="h-14 w-14 rounded-2xl border border-slate-200 object-cover"
          loading="lazy"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900">
                {name}
              </h3>
              <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                {tag}
              </p>
            </div>

            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
              <span className="material-symbols-outlined text-[14px] text-amber-500">
                star
              </span>
              {(rating || 0).toFixed(1)}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <span
                className={[
                  "h-2 w-2 rounded-full",
                  isOnline ? "bg-emerald-500" : "bg-slate-400",
                ].join(" ")}
              />
              {isOnline ? "Online" : "Offline"}
            </span>
            {experience ? <span>• {experience}</span> : null}
            {typeof reviews === "number" && reviews > 0 ? (
              <span>• {reviews} đánh giá</span>
            ) : null}
          </div>

          {badge ? (
            <span className="mt-2 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
              {badge}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={open}
          className="h-10 rounded-2xl border border-slate-300 bg-white text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          Xem hồ sơ
        </button>
        <button
          type="button"
          onClick={open}
          className="h-10 rounded-2xl bg-slate-900 text-sm font-semibold text-white transition-colors hover:bg-primary"
        >
          Tư vấn ngay
        </button>
      </div>
    </article>
  );
};

export default PharmacistCard;
