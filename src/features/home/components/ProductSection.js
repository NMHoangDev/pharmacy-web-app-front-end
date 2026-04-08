import React, { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "../../../shared/api/httpClients";
import ProductCard from "./ProductCard";
import "../../../app/styles/storefront-premium.css";

const parseAttributes = (value) => {
  if (!value) return {};
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const normalizeStatus = (status) =>
  typeof status === "string" ? status.trim().toUpperCase() : "";

const isExplicitlyInactive = (status) => normalizeStatus(status) === "INACTIVE";

const getBestSellerScore = (item, attrs) => {
  return Math.max(
    toNumber(item?.soldCount),
    toNumber(item?.totalSold),
    toNumber(item?.purchaseCount),
    toNumber(item?.orderCount),
    toNumber(item?.salesCount),
    toNumber(attrs?.soldCount),
    toNumber(attrs?.totalSold),
    toNumber(attrs?.purchaseCount),
    toNumber(attrs?.orderCount),
    toNumber(attrs?.salesCount),
  );
};

const fetchFeaturedProducts = async () => {
  const res = await publicApi.get("/api/catalog/public/products", {
    params: {
      size: 20,
      sort: "name,asc",
    },
  });

  const payload = res?.data;
  const items =
    payload?.content ??
    payload?.data ??
    (Array.isArray(payload) ? payload : []);

  return (Array.isArray(items) ? items : [])
    .map((item) => {
      const attrs = parseAttributes(item.attributes);
      return {
        ...item,
        attributes: attrs,
        bestSellerScore: getBestSellerScore(item, attrs),
        imageUrl:
          item.imageUrl ||
          item.image ||
          attrs.imageUrl ||
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=300&q=80",
      };
    })
    .filter((item) => {
      // Defensive guard: only exclude products explicitly marked INACTIVE.
      const inactiveByStatus = isExplicitlyInactive(item.status);
      const inactiveByAttributes =
        item.attributes?.isActive === false ||
        isExplicitlyInactive(item.attributes?.status) ||
        isExplicitlyInactive(item.attributes?.effectiveStatus);
      return !(inactiveByStatus || inactiveByAttributes);
    })
    .sort((a, b) => b.bestSellerScore - a.bestSellerScore)
    .slice(0, 4);
};

const SkeletonCard = () => (
  <div className="storefront-soft-card overflow-hidden rounded-[28px]">
    <div className="aspect-square animate-pulse bg-slate-100" />
    <div className="space-y-2 p-4">
      <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />
      <div className="h-3 w-2/5 animate-pulse rounded bg-slate-100" />
      <div className="h-10 w-full animate-pulse rounded-2xl bg-slate-100" />
    </div>
  </div>
);

const ProductSection = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["home", "featuredProducts"],
    queryFn: fetchFeaturedProducts,
    staleTime: 5 * 60 * 1000,
  });

  const products = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  return (
    <section className="py-6 sm:py-8">
      <div className="storefront-container mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="storefront-card rounded-[32px] p-5 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[0.34fr_0.66fr]">
            <div className="storefront-hero rounded-[28px] border border-white/80 p-5 sm:p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">
                Gợi ý nổi bật
              </div>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900">
                Sản phẩm dễ tiếp cận hơn cho người dùng mới
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Chúng mình ưu tiên cách hiển thị rõ giá, tình trạng và ưu đãi để
                người dùng có thể quyết định nhanh mà vẫn đủ thông tin.
              </p>
              <Link
                to="/medicines"
                className="storefront-interactive mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-sky-600 px-5 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                Xem tất cả sản phẩm
              </Link>
            </div>

            <div>
              {isError ? (
                <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                  Không tải được sản phẩm nổi bật. Bạn có thể mở trang danh sách
                  để tiếp tục mua sắm ngay.
                </div>
              ) : null}

              <div className="md:hidden -mx-1 overflow-x-auto px-1">
                <div className="flex gap-3 pb-1">
                  {(isLoading ? Array.from({ length: 4 }) : products).map(
                    (product, index) => (
                      <div
                        key={
                          isLoading
                            ? index
                            : `${product.id ?? "unknown"}-${index}`
                        }
                        className="w-[76%] min-w-[240px] shrink-0"
                      >
                        {isLoading ? (
                          <SkeletonCard />
                        ) : (
                          <ProductCard
                            product={product}
                            priorityImage={index < 2}
                          />
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="hidden grid-cols-2 gap-4 md:grid xl:grid-cols-4">
                {(isLoading ? Array.from({ length: 4 }) : products).map(
                  (product, index) => (
                    <div
                      key={
                        isLoading
                          ? index
                          : `${product.id ?? "unknown"}-${index}`
                      }
                    >
                      {isLoading ? (
                        <SkeletonCard />
                      ) : (
                        <ProductCard
                          product={product}
                          priorityImage={index < 2}
                        />
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(ProductSection);
