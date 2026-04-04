import React, { memo, useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { getUserId } from "../../utils/auth";

const formatPrice = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")} đ`;

const parseMoneyNumber = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
  const raw = String(value ?? "");
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return NaN;
  const num = Number(digits);
  return Number.isFinite(num) ? num : NaN;
};

const hasValidDiscount = (price, originalPrice) => {
  const cur = parseMoneyNumber(price);
  const orig = parseMoneyNumber(originalPrice);
  return Number.isFinite(cur) && Number.isFinite(orig) && orig > cur;
};

const parseAttributes = (value) => {
  if (!value) return {};
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

const optimizeImageUrl = (url, targetWidth = 300) => {
  const src = String(url || "").trim();
  if (!src) return src;

  // Only safely optimize known CDNs (avoid breaking internal image endpoints).
  if (!src.includes("images.unsplash.com")) return src;

  const hasQuery = src.includes("?");
  const glue = hasQuery ? "&" : "?";
  // Keep modest quality and cap width to reduce bandwidth.
  return `${src}${glue}auto=format&fit=crop&w=${targetWidth}&q=70`;
};

const ProductCard = ({ product, priorityImage = false }) => {
  const navigate = useNavigate();
  const { upsertItem } = useCart();
  const [adding, setAdding] = useState(false);

  const id = product?.id;
  const slug = product?.slug;
  const name = product?.name || product?.title || "Sản phẩm";

  const attributes = useMemo(
    () => parseAttributes(product?.attributes),
    [product?.attributes],
  );

  const isRx = Boolean(
    product?.prescriptionRequired ?? attributes?.prescriptionRequired,
  );

  const tagLabel = useMemo(() => {
    const explicit =
      product?.tag || product?.badge || attributes?.tag || attributes?.badge;
    if (explicit) return String(explicit).toUpperCase();
    return isRx ? "RX" : "OTC";
  }, [attributes?.badge, attributes?.tag, isRx, product?.badge, product?.tag]);
  const priceValue = Number(product?.price ?? product?.salePrice ?? 0);
  const originalCandidate =
    product?.oldPrice ??
    product?.originalPrice ??
    product?.attributes?.oldPrice;

  const originalValue = parseMoneyNumber(originalCandidate);

  const hasDiscount = useMemo(() => {
    return hasValidDiscount(priceValue, originalValue);
  }, [originalValue, priceValue]);

  const imageUrl =
    product?.imageUrl ||
    product?.image ||
    product?.imageUrls?.[0] ||
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=300&q=80";

  const optimizedImageUrl = useMemo(
    () => optimizeImageUrl(imageUrl, 300),
    [imageUrl],
  );

  const displayPrice = useMemo(() => formatPrice(priceValue), [priceValue]);
  const displayOldPrice = useMemo(() => {
    return hasDiscount ? formatPrice(originalValue) : "";
  }, [hasDiscount, originalValue]);

  const handleAdd = useCallback(
    async (event) => {
      event.preventDefault();
      event.stopPropagation();

      const userId = getUserId();
      if (!userId) {
        navigate(`/login?redirect=${encodeURIComponent("/")}`);
        return;
      }

      if (!id) return;

      try {
        setAdding(true);
        await upsertItem(id, 1);
      } catch (e) {
        // keep silent on homepage
      } finally {
        setAdding(false);
      }
    },
    [id, navigate, upsertItem],
  );

  const handleWishlist = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    // Intentionally lightweight: wishlist can be wired later without changing UI.
  }, []);

  return (
    <Link
      to={`/medicines/${slug || id}`}
      className="group block rounded-lg border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-surface-dark overflow-hidden transition hover:border-slate-300 dark:hover:border-slate-700"
    >
      <div className="relative aspect-square bg-slate-50 dark:bg-slate-900/30">
        <img
          src={optimizedImageUrl}
          alt={name}
          loading={priorityImage ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priorityImage ? "high" : "auto"}
          sizes="(max-width: 768px) 45vw, 220px"
          className="h-full w-full object-contain"
        />

        {/* Subtle tag (keep OTC/Rx) */}
        {tagLabel ? (
          <div className="absolute top-2 left-2 rounded-md border border-slate-200/70 dark:border-slate-700 bg-white/80 dark:bg-slate-950/40 backdrop-blur px-2 py-0.5">
            <span className="text-[10px] font-bold tracking-wide text-slate-700 dark:text-slate-200">
              {tagLabel}
            </span>
          </div>
        ) : null}

        {hasDiscount ? (
          <div className="absolute top-2 right-2 rounded-md bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.5">
            Giảm
          </div>
        ) : null}
      </div>

      <div className="p-2">
        <div className="text-[13px] font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 min-h-[2.25rem]">
          {name}
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="min-w-0">
            {displayOldPrice ? (
              <div className="text-[11px] text-slate-400 line-through tabular-nums">
                {displayOldPrice}
              </div>
            ) : null}
            <div className="text-[15px] font-extrabold text-primary tabular-nums leading-none whitespace-nowrap">
              {displayPrice}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleWishlist}
              aria-label="Yêu thích"
              className="size-8 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/30 text-slate-500 dark:text-slate-300 grid place-items-center transition hover:border-slate-300 dark:hover:border-slate-700 hover:text-rose-500 active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">
                favorite
              </span>
            </button>

            <button
              type="button"
              onClick={handleAdd}
              disabled={adding}
              aria-label="Thêm vào giỏ"
              className={[
                "size-8 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/30 text-primary grid place-items-center transition focus:outline-none focus:ring-2 focus:ring-primary/20",
                adding
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:border-slate-300 dark:hover:border-slate-700 active:scale-95",
              ].join(" ")}
            >
              <span className="material-symbols-outlined text-[16px]">
                add_shopping_cart
              </span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default memo(ProductCard);
