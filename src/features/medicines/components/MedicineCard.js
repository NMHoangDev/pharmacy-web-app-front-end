import React, { memo, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  formatCurrency,
  getCampaignPresentation,
  getDiscountPercent,
  hasValidDiscount,
  parseMoneyNumber,
} from "../../../shared/utils/discountUi";

const parseAttributes = (value) => {
  if (!value) return {};
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

const formatMoneyLoose = (value) => {
  if (typeof value === "number") {
    return `${Number(value).toLocaleString("vi-VN")} đ`;
  }
  return String(value ?? "").trim();
};

const optimizeImageUrl = (url, targetWidth = 200) => {
  const src = String(url || "").trim();
  if (!src) return src;

  if (!src.includes("images.unsplash.com")) return src;

  const hasQuery = src.includes("?");
  const glue = hasQuery ? "&" : "?";
  return `${src}${glue}auto=format&fit=crop&w=${targetWidth}&q=70`;
};

const IconCart = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M6 6h15l-1.5 9h-13z" />
    <path d="M6 6l-2-3H1" />
    <path d="M9 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
    <path d="M18 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
  </svg>
);

const IconChat = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
  </svg>
);

export const PriceDisplay = ({
  price,
  originalPrice,
  unitLabel,
  size = "card",
  showSavings = false,
}) => {
  const current = String(price ?? "");
  const original = String(originalPrice ?? "");

  const hasDiscount = hasValidDiscount(current, original);

  const curNum = parseMoneyNumber(current);
  const origNum = parseMoneyNumber(original);
  const savingsNum =
    Number.isFinite(curNum) && Number.isFinite(origNum) && origNum > curNum
      ? origNum - curNum
      : 0;
  const percentOff = getDiscountPercent(current, original);

  const priceClass =
    size === "detail"
      ? "text-2xl font-bold text-red-500"
      : "text-lg text-red-500 font-bold";
  const originalClass =
    size === "detail"
      ? "text-sm text-gray-400 line-through"
      : "text-xs text-gray-400 line-through";

  if (!hasDiscount) {
    const base = size === "detail" ? "text-2xl font-bold" : "text-lg font-bold";
    return (
      <div className="transition-all duration-200">
        <div className={`${base} text-slate-900 dark:text-white tabular-nums`}>
          {current}
          {unitLabel ? (
            <span className="text-sm font-normal text-slate-500">{` / ${unitLabel}`}</span>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 transition-all duration-200">
      <div className="flex flex-wrap items-center gap-2">
        <div className={`${originalClass} dark:text-slate-500 tabular-nums`}>
          {original}
        </div>
        {percentOff > 0 ? (
          <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-600 ring-1 ring-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20">
            -{percentOff}%
          </span>
        ) : null}
      </div>
      <div className={`${priceClass} tabular-nums`}>
        {current}
        {unitLabel ? (
          <span className="ml-1 text-sm font-normal text-slate-500">{` / ${unitLabel}`}</span>
        ) : null}
      </div>
      {showSavings && savingsNum > 0 ? (
        <div className="text-sm font-medium text-emerald-600">
          Bạn tiết kiệm {formatCurrency(savingsNum)}
        </div>
      ) : null}
    </div>
  );
};

const MedicineCard = ({ product, onAddToCart, onConsult }) => {
  const {
    id,
    slug,
    name,
    title,
    price,
    imageUrl,
    image,
    attributes,
    rating,
    prescriptionRequired,
    consult,
    oldPrice,
    originalPrice,
    campaign,
    campaignHeadline,
    campaignDetail,
  } = product || {};

  const displayTitle = name || title || "Sản phẩm";
  const displayImage = imageUrl || image || "";

  const safeAttributes = useMemo(() => parseAttributes(attributes), [attributes]);

  const isRx = Boolean(
    prescriptionRequired ?? safeAttributes?.prescriptionRequired,
  );
  const tagLabel = useMemo(() => {
    const explicit = safeAttributes?.tag || safeAttributes?.badge;
    if (explicit) return String(explicit).toUpperCase();
    return isRx ? "RX" : "OTC";
  }, [isRx, safeAttributes?.badge, safeAttributes?.tag]);

  const dosageText = useMemo(() => {
    const raw =
      safeAttributes?.dosage ??
      safeAttributes?.strength ??
      safeAttributes?.dose ??
      safeAttributes?.concentration ??
      safeAttributes?.content;
    const txt = String(raw ?? "").trim();
    return txt || "";
  }, [
    safeAttributes?.concentration,
    safeAttributes?.content,
    safeAttributes?.dosage,
    safeAttributes?.dose,
    safeAttributes?.strength,
  ]);

  const ratingValue = Number(
    rating ?? safeAttributes?.rating ?? safeAttributes?.avgRating ?? 0,
  );

  const priceText = useMemo(() => formatMoneyLoose(price), [price]);
  const originalPriceText = useMemo(
    () => formatMoneyLoose(originalPrice ?? oldPrice ?? ""),
    [oldPrice, originalPrice],
  );
  const hasPriceDiscount = hasValidDiscount(priceText, originalPriceText);
  const priceDiscountPercent = getDiscountPercent(priceText, originalPriceText);

  const campaignMeta = useMemo(
    () =>
      campaignHeadline || campaignDetail || campaign
        ? {
            ...getCampaignPresentation(campaign),
            headline:
              campaignHeadline || getCampaignPresentation(campaign)?.headline,
            detail: campaignDetail || getCampaignPresentation(campaign)?.detail,
          }
        : null,
    [campaign, campaignDetail, campaignHeadline],
  );

  const optimizedImageUrl = useMemo(
    () => optimizeImageUrl(displayImage, 200),
    [displayImage],
  );

  const handleAdd = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      onAddToCart?.(product);
    },
    [onAddToCart, product],
  );

  const handleConsult = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      onConsult?.(product);
    },
    [onConsult, product],
  );

  return (
    <Link
      to={`/medicines/${slug || id}`}
      className="group storefront-card flex h-full flex-col overflow-hidden rounded-[26px] transition-all duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_28px_70px_-50px_rgba(37,99,235,0.35)]"
    >
      <div className="p-3">
        <div className="relative grid aspect-square w-full place-items-center overflow-hidden rounded-[24px] border border-slate-100 bg-gradient-to-br from-white via-sky-50/70 to-cyan-50/90">
          {hasPriceDiscount && priceDiscountPercent > 0 ? (
            <div className="absolute left-3 top-3 z-10 rounded-full bg-rose-500 px-2.5 py-1 text-[11px] font-extrabold text-white shadow-sm">
              -{priceDiscountPercent}%
            </div>
          ) : null}

          {!hasPriceDiscount && campaignMeta?.badge ? (
            <div className="absolute left-3 top-3 z-10 rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
              {campaignMeta.badge}
            </div>
          ) : null}

          <div className="absolute right-3 top-3 z-10">
            {tagLabel ? (
              <span className="inline-flex items-center rounded-full border border-white/80 bg-white/95 px-2 py-1 text-[10px] font-semibold tracking-wide text-slate-700 shadow-sm backdrop-blur">
                {tagLabel}
              </span>
            ) : null}
          </div>

          <img
            src={optimizedImageUrl || displayImage}
            alt={displayTitle}
            loading="lazy"
            decoding="async"
            width={200}
            height={200}
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 28vw, 200px"
            className="h-full w-full object-contain p-5 transition-transform duration-500 group-hover:scale-[1.06]"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-4 pb-4">
        <div className="flex min-h-[1.25rem] items-center justify-between gap-2">
          <div className="min-h-[1rem] text-[11px] font-medium text-slate-500">
            {dosageText}
          </div>

          {Number.isFinite(ratingValue) && ratingValue > 0 ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 tabular-nums">
              <span className="text-amber-500" aria-hidden="true">
                ★
              </span>
              <span className="font-semibold">{ratingValue.toFixed(1)}</span>
            </span>
          ) : null}
        </div>

        <h3 className="min-h-[2.5rem] text-sm font-semibold leading-snug text-slate-900 line-clamp-2">
          {displayTitle}
        </h3>

        {campaignMeta?.headline ? (
          <div className="rounded-2xl border border-sky-100 bg-sky-50/90 px-3 py-2 text-xs shadow-sm">
            <div className="font-semibold text-sky-800">
              {campaignMeta.headline}
            </div>
            {campaignMeta.detail ? (
              <div className="mt-1 line-clamp-2 text-[11px] text-sky-700/80">
                {campaignMeta.detail}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-auto space-y-3">
          <PriceDisplay
            price={priceText}
            originalPrice={originalPriceText}
            size="card"
          />

          <div className="flex items-center justify-between gap-2">
            <div className="text-[11px] font-medium text-emerald-600">
              {hasPriceDiscount
                ? "Đang áp dụng giá ưu đãi"
                : campaignMeta?.headline
                  ? "Có mã giảm giá cho đơn hàng"
                  : "Sẵn sàng giao nhanh"}
            </div>

            <div className="flex items-center gap-2">
              {consult && typeof onConsult === "function" ? (
                <button
                  type="button"
                  onClick={handleConsult}
                  aria-label="Tư vấn"
                  className="grid size-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 active:scale-95"
                >
                  <IconChat className="h-4 w-4" />
                </button>
              ) : null}

              {typeof onAddToCart === "function" ? (
                <button
                  type="button"
                  onClick={handleAdd}
                  aria-label="Thêm vào giỏ"
                  className="grid size-10 place-items-center rounded-2xl bg-slate-900 text-white transition-all hover:-translate-y-0.5 hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary/20 active:scale-95"
                >
                  <IconCart className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default memo(MedicineCard);
