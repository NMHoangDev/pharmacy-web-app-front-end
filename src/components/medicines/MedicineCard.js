import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import AnimatedCard from "../ui/motion/AnimatedCard";

const parseMoneyNumber = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
  const raw = String(value ?? "");
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return NaN;
  const num = Number(digits);
  return Number.isFinite(num) ? num : NaN;
};

const getDiscountLabel = (price, originalPrice) => {
  const cur = parseMoneyNumber(price);
  const orig = parseMoneyNumber(originalPrice);
  if (!Number.isFinite(cur) || !Number.isFinite(orig) || orig <= cur) {
    return "Giảm";
  }
  const pct = Math.round(((orig - cur) / orig) * 100);
  if (!Number.isFinite(pct) || pct <= 0) return "Giảm";
  return `-${pct}%`;
};

export const DiscountBadge = ({ children }) => {
  if (!children) return null;
  return (
    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
      {children}
    </div>
  );
};

export const PriceDisplay = ({
  price,
  originalPrice,
  unitLabel,
  size = "card",
  showSavings = false,
}) => {
  const hasDiscount = Boolean(originalPrice);
  const current = String(price ?? "");
  const original = String(originalPrice ?? "");

  const curNum = parseMoneyNumber(current);
  const origNum = parseMoneyNumber(original);
  const savingsNum =
    Number.isFinite(curNum) && Number.isFinite(origNum) && origNum > curNum
      ? origNum - curNum
      : 0;

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
      <div className={`${originalClass} dark:text-slate-500 tabular-nums`}>
        {original}
      </div>
      <div className={`${priceClass} tabular-nums`}>
        {current}
        {unitLabel ? (
          <span className="ml-1 text-sm font-normal text-slate-500">{` / ${unitLabel}`}</span>
        ) : null}
      </div>
      {showSavings && savingsNum > 0 ? (
        <div className="text-sm text-green-600">
          Bạn tiết kiệm {savingsNum.toLocaleString("vi-VN")}đ
        </div>
      ) : null}
    </div>
  );
};

const MedicineCard = ({ product, onAddToCart, onConsult }) => {
  const {
    id,
    slug,
    name, // or title logic
    title,
    price,
    oldPrice,
    imageUrl,
    image,
    attributes = {},
    rating = 4.8,
    prescriptionRequired,
    consult,
    reviews,
  } = product;

  // Standardization
  const displayTitle = name || title;
  const displayImage = imageUrl || image;

  // Parse attributes if they come as string (legacy check)
  const safeAttributes = useMemo(() => {
    if (typeof attributes === "string") {
      try {
        return JSON.parse(attributes);
      } catch {
        return {};
      }
    }
    return attributes;
  }, [attributes]);

  const brand = safeAttributes.brand || safeAttributes.manufacturer || "N/A";
  const form = safeAttributes.form || safeAttributes.dosageForm || "Tablet";
  const dosage = safeAttributes.dosage || "500mg";

  const isRx = prescriptionRequired || safeAttributes.prescriptionRequired;
  const hasDiscount = Boolean(oldPrice);
  const discountLabel = useMemo(
    () => (hasDiscount ? getDiscountLabel(price, oldPrice) : ""),
    [hasDiscount, price, oldPrice],
  );

  return (
    <AnimatedCard>
      <Link
        to={`/medicines/${slug || id}`}
        className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
      >
        {/* Header/Image Section */}
        <div className="relative p-4 pb-0">
          <div className="relative w-full aspect-square bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-700">
            {/* Product Image */}
            <div
              className="w-full h-full bg-center bg-no-repeat bg-contain transition-transform duration-500 group-hover:scale-105 p-4"
              style={{
                backgroundImage: `url("${displayImage}")`,
              }}
            />

            {/* Discount badge (Top-Right) */}
            {hasDiscount ? (
              <DiscountBadge>{discountLabel}</DiscountBadge>
            ) : null}

            {/* OTC/Rx Badge (Bottom-Left) */}
            <div
              className={`absolute bottom-3 left-3 px-2 py-1 rounded-lg backdrop-blur-sm border ${
                isRx
                  ? "bg-blue-50/90 dark:bg-blue-900/40 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                  : "bg-primary/10 dark:bg-primary/20 border-primary/20 text-primary"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {isRx ? "Rx Only" : "OTC"}
              </span>
            </div>
          </div>
        </div>

        {/* Body Section */}
        <div className="flex flex-col p-4 pt-4 gap-1 flex-grow">
          <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight line-clamp-2 min-h-[3rem]">
            {displayTitle}
          </h3>

          <div className="mt-1 flex flex-col gap-0.5">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-normal line-clamp-1">
              Brand:{" "}
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {brand}
              </span>{" "}
              • Form:{" "}
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {form}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-normal">
                Dosage:{" "}
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {dosage}
                </span>
              </p>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div className="flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px] text-amber-400 fill-[1]">
                  star
                </span>
                <span className="text-slate-700 dark:text-slate-300 text-xs font-semibold">
                  {rating}
                </span>
                <span className="text-slate-400 text-[10px] font-normal">
                  ({reviews || 0})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="mt-auto p-4 border-t border-slate-50 dark:border-slate-800 flex flex-col gap-4 bg-slate-50/30 dark:bg-slate-800/20">
          {/* Price block (Bottom) */}
          <div className="min-h-[3.5rem]">
            <PriceDisplay price={price} originalPrice={oldPrice} size="card" />
          </div>

          <div className="flex items-center gap-2">
            {consult ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onConsult?.(product);
                }}
                className="flex-1 flex h-10 items-center justify-center gap-2 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors duration-200 shadow-sm shadow-amber-200 dark:shadow-none"
              >
                <span className="material-symbols-outlined text-[18px]">
                  medical_services
                </span>
                <span className="text-sm font-bold truncate">Tư vấn</span>
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onAddToCart?.(product);
                }}
                className="flex-1 flex h-10 items-center justify-center gap-2 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors duration-200 shadow-sm shadow-primary/25 dark:shadow-none"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add_shopping_cart
                </span>
                <span className="text-sm font-bold truncate">Thêm vào giỏ</span>
              </button>
            )}

            <button
              onClick={(e) => {
                e.preventDefault();
                // Add to wishlist logic
              }}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
            >
              <span className="material-symbols-outlined text-[20px]">
                favorite
              </span>
            </button>
          </div>
        </div>
      </Link>
    </AnimatedCard>
  );
};

export default MedicineCard;
