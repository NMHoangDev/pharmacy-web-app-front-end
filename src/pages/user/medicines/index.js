import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import MedicinesBreadcrumbs from "../../../components/medicines/MedicinesBreadcrumbs";
import MedicinesFilters from "../../../components/medicines/MedicinesFilters";
import MedicinesFiltersDrawer from "../../../components/medicines/MedicinesFiltersDrawer";
import MedicinesHeaderBar from "../../../components/medicines/MedicinesHeaderBar";
import MedicinesGrid from "../../../components/medicines/MedicinesGrid";
import MedicineSkeleton from "../../../components/medicines/MedicineSkeleton";
import MedicinesPagination from "../../../components/medicines/MedicinesPagination";
import medicinesProducts, { parsePrice } from "../../../data/medicinesProducts";
import EmptyState from "../../../components/EmptyState";
import PageTransition from "../../../components/ui/PageTransition";
import { publicApi } from "../../../api/httpClients";
import { useCart } from "../../../contexts/CartContext";
import useNotificationAction from "../../../hooks/useNotificationAction";
import { useCampaign } from "../../../hooks/useCampaign";
import { getCampaignPresentation } from "../../../utils/discountUi";
import "../../../styles/storefront-premium.css";

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

const resolvePriceValue = (...candidates) => {
  for (const candidate of candidates) {
    const parsed = parseMoneyNumber(candidate);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
};

const parseAttributes = (value) => {
  if (!value) return {};
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

const resolveBadge = (attrs, createdAt) => {
  if (attrs?.badge) {
    return { label: attrs.badge, color: attrs.badgeColor || "amber" };
  }
  if (createdAt) {
    const created = new Date(createdAt).getTime();
    if (!Number.isNaN(created)) {
      const days = (Date.now() - created) / (1000 * 60 * 60 * 24);
      if (days <= 30) return { label: "New", color: "green" };
    }
  }
  return null;
};

const isSellingProduct = (item) => {
  const effective = String(item?.effectiveStatus || "")
    .trim()
    .toUpperCase();
  if (effective) return effective === "ACTIVE";

  const global = String(item?.status || item?.globalStatus || "")
    .trim()
    .toUpperCase();
  if (global) return global === "ACTIVE";

  const branch = String(item?.branchStatus || "")
    .trim()
    .toUpperCase();
  if (branch) return branch === "ACTIVE";

  return false;
};

const fallbackPrices = medicinesProducts.map((product) =>
  parsePrice(product.price),
);
const fallbackMin = Math.min(...fallbackPrices);
const fallbackMax = Math.max(...fallbackPrices);

const MedicinesPage = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState(() => searchParams.get("q") || "");
  const [sort, setSort] = useState("best");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedAudiences, setSelectedAudiences] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [priceRange, setPriceRange] = useState({
    min: fallbackMin,
    max: fallbackMax,
  });
  const [hasTouchedPriceRange, setHasTouchedPriceRange] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [draftPriceRange, setDraftPriceRange] = useState({
    min: fallbackMin,
    max: fallbackMax,
  });
  const [draftCategoryIds, setDraftCategoryIds] = useState([]);
  const [draftBrands, setDraftBrands] = useState([]);
  const [draftAudiences, setDraftAudiences] = useState([]);

  const { upsertItem } = useCart();
  const { notifyAfterSuccess } = useNotificationAction();
  const { activeCampaign } = useCampaign({ refreshIntervalMs: 180000 });

  const campaignPresentation = useMemo(
    () => getCampaignPresentation(activeCampaign),
    [activeCampaign],
  );

  const handleAddToCart = useCallback(
    async (product) => {
      try {
        await notifyAfterSuccess({
          action: () => upsertItem(product.id, 1),
          notificationPayload: {
            category: "CART",
            title: "Thêm vào giỏ hàng thành công",
            message: `Bạn đã thêm ${product.title || product.name} vào giỏ hàng`,
            sourceType: "PRODUCT",
            sourceId: String(product.id),
            sourceEventType: "CART_ITEM_ADDED",
            actionUrl: "/cart",
          },
          options: {
            silent: false,
            errorMessage: "Failed to create notification after add to cart:",
          },
        });
      } catch (err) {
        console.error("Failed to add to cart:", err);
      }
    },
    [notifyAfterSuccess, upsertItem],
  );

  const overallMinPrice = useMemo(() => {
    if (!products.length) return fallbackMin;
    return Math.min(...products.map((item) => item.priceValue));
  }, [products]);

  const overallMaxPrice = useMemo(() => {
    if (!products.length) return fallbackMax;
    return Math.max(...products.map((item) => item.priceValue));
  }, [products]);

  const handlePriceRangeChange = (nextRange) => {
    setHasTouchedPriceRange(true);
    let { min, max } = nextRange;
    if (min > max) [min, max] = [max, min];
    min = Math.max(overallMinPrice, min);
    max = Math.min(overallMaxPrice, max);
    setPriceRange({ min, max });
  };

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    setPage(0);
  }, [searchParams]);

  useEffect(() => {
    setPriceRange((prev) => {
      if (!hasTouchedPriceRange) {
        return { min: overallMinPrice, max: overallMaxPrice };
      }
      return {
        min: Math.max(overallMinPrice, prev.min),
        max: Math.min(overallMaxPrice, prev.max),
      };
    });
  }, [hasTouchedPriceRange, overallMinPrice, overallMaxPrice]);

  useEffect(() => {
    setPriceRange((prev) => {
      const minBound = Math.min(overallMinPrice, overallMaxPrice);
      const maxBound = Math.max(overallMinPrice, overallMaxPrice);
      if (prev.min > maxBound || prev.max < minBound || prev.min > prev.max) {
        return { min: minBound, max: maxBound };
      }
      return prev;
    });
  }, [overallMinPrice, overallMaxPrice]);

  const [reloadKey, setReloadKey] = useState(0);

  const loadProducts = useCallback(
    async (signal) => {
      setLoading(true);
      setError("");

      try {
        const categoryResponse = await publicApi.get(
          "/api/catalog/public/categories",
          { signal },
        );
        setCategories(categoryResponse.data || []);

        const response = await publicApi.get("/api/catalog/public/products", {
          params: {
            size: 200,
            sort: "name,asc",
          },
          signal,
        });

        const payload = response.data;
        const items =
          payload?.content ??
          payload?.data ??
          (Array.isArray(payload) ? payload : []);
        console.log(items);

        const sellingItems = items.filter(isSellingProduct);

        const mapped = sellingItems.map((item) => {
          const attrs = parseAttributes(item.attributes);
          const badge = resolveBadge(attrs, item.createdAt);
          const priceValue = resolvePriceValue(
            item.price,
            item.salePrice,
            item.baseSalePrice,
            attrs.price,
            attrs.salePrice,
            attrs.baseSalePrice,
            0,
          );

          const originalCandidate =
            item.oldPrice ?? item.originalPrice ?? attrs.oldPrice;
          const originalValue = parseMoneyNumber(originalCandidate);
          const oldPriceLabel =
            Number.isFinite(originalValue) && originalValue > priceValue
              ? formatPrice(originalValue)
              : "";

          return {
            id: item.id,
            slug: item.slug,
            title: item.name || item.title || "No Name",
            description: item.description || attrs.shortDescription || "",
            price: formatPrice(priceValue),
            priceValue,
            oldPrice: oldPriceLabel,
            image:
              item.imageUrl ||
              item.image ||
              "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=300&q=80",
            rx: !!item.prescriptionRequired,
            consult: !!attrs.consultationRequired,
            badge: badge?.label,
            badgeColor: badge?.color,
            originalPrice: oldPriceLabel,
            categoryId: item.categoryId,
            brand: attrs.brand || attrs.manufacturer || "",
            audience: attrs.audience || attrs.target || "",
            createdAt: item.createdAt,
            campaign: activeCampaign || null,
            campaignHeadline: campaignPresentation?.headline || "",
            campaignDetail: campaignPresentation?.detail || "",
          };
        });
        setProducts(mapped);
      } catch (err) {
        const isCancel =
          err.name === "AbortError" ||
          err.code === "ERR_CANCELED" ||
          err?.message?.toLowerCase().includes("canceled");
        if (!isCancel) {
          console.error("loadProducts -> error:", err);
          setError(err.message || "Khong the tai danh sach san pham");
          setProducts([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [
      activeCampaign,
      campaignPresentation?.detail,
      campaignPresentation?.headline,
    ],
  );

  useEffect(() => {
    const controller = new AbortController();
    loadProducts(controller.signal);
    return () => controller.abort();
  }, [loadProducts, reloadKey]);

  const handleReload = useCallback(
    () => setReloadKey((value) => value + 1),
    [],
  );

  const activeFiltersCount =
    selectedCategoryIds.length +
    selectedBrands.length +
    selectedAudiences.length;

  const openMobileFilters = useCallback(() => {
    setDraftPriceRange(priceRange);
    setDraftCategoryIds(selectedCategoryIds);
    setDraftBrands(selectedBrands);
    setDraftAudiences(selectedAudiences);
    setMobileFiltersOpen(true);
  }, [priceRange, selectedAudiences, selectedBrands, selectedCategoryIds]);

  const closeMobileFilters = useCallback(() => setMobileFiltersOpen(false), []);

  const applyMobileFilters = useCallback(() => {
    setHasTouchedPriceRange(true);
    setPriceRange(draftPriceRange);
    setSelectedCategoryIds(draftCategoryIds);
    setSelectedBrands(draftBrands);
    setSelectedAudiences(draftAudiences);
    setPage(0);
    setMobileFiltersOpen(false);
  }, [draftAudiences, draftBrands, draftCategoryIds, draftPriceRange]);

  const resetMobileDraftFilters = useCallback(() => {
    setDraftCategoryIds([]);
    setDraftBrands([]);
    setDraftAudiences([]);
    setDraftPriceRange({ min: overallMinPrice, max: overallMaxPrice });
  }, [overallMaxPrice, overallMinPrice]);

  const availableBrands = useMemo(() => {
    const set = new Set();
    products.forEach((item) => {
      if (item.brand) set.add(item.brand);
    });
    return Array.from(set).sort();
  }, [products]);

  const availableAudiences = useMemo(() => {
    const set = new Set();
    products.forEach((item) => {
      if (item.audience) set.add(item.audience);
    });
    return Array.from(set).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = products.filter((product) => {
      const matchesQuery = normalizedQuery
        ? `${product.title} ${product.description}`
            .toLowerCase()
            .includes(normalizedQuery)
        : true;
      const matchesCategory = selectedCategoryIds.length
        ? selectedCategoryIds.includes(product.categoryId)
        : true;
      const matchesBrand = selectedBrands.length
        ? selectedBrands.includes(product.brand)
        : true;
      const matchesAudience = selectedAudiences.length
        ? selectedAudiences.includes(product.audience)
        : true;
      const matchesPrice =
        product.priceValue >= priceRange.min &&
        product.priceValue <= priceRange.max;
      return (
        matchesQuery &&
        matchesCategory &&
        matchesBrand &&
        matchesAudience &&
        matchesPrice
      );
    });

    const sorted = [...filtered];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.priceValue - b.priceValue);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.priceValue - a.priceValue);
        break;
      case "newest":
        sorted.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime(),
        );
        break;
      case "name-asc":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return sorted;
  }, [
    products,
    query,
    selectedCategoryIds,
    selectedBrands,
    selectedAudiences,
    priceRange,
    sort,
  ]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredProducts.length / pageSize)),
    [filteredProducts.length, pageSize],
  );

  useEffect(() => {
    if (page > totalPages - 1) setPage(0);
  }, [page, totalPages]);

  const pagedProducts = useMemo(() => {
    const start = page * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, page, pageSize]);

  const handleToggleCategory = (id) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
    setPage(0);
  };

  const handleToggleDraftCategory = useCallback((id) => {
    setDraftCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const handleToggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((item) => item !== brand)
        : [...prev, brand],
    );
    setPage(0);
  };

  const handleToggleDraftBrand = useCallback((brand) => {
    setDraftBrands((prev) =>
      prev.includes(brand) ? prev.filter((x) => x !== brand) : [...prev, brand],
    );
  }, []);

  const handleToggleAudience = (label) => {
    setSelectedAudiences((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label],
    );
    setPage(0);
  };

  const handleToggleDraftAudience = useCallback((label) => {
    setDraftAudiences((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label],
    );
  }, []);

  const handleReset = () => {
    setHasTouchedPriceRange(false);
    setQuery("");
    setSort("best");
    setSelectedCategoryIds([]);
    setSelectedBrands([]);
    setSelectedAudiences([]);
    setPriceRange({ min: overallMinPrice, max: overallMaxPrice });
    setPage(0);
  };

  return (
    <PageTransition className="storefront-shell min-h-screen font-display flex flex-col text-slate-900 antialiased">
      <Header />

      <div className="storefront-container mx-auto flex-grow w-full max-w-[1280px] px-3 py-4 sm:px-4 lg:px-6">
        <MedicinesBreadcrumbs />

        <section className="storefront-hero storefront-fade-up mb-5 rounded-[32px] border border-white/70 px-5 py-6 sm:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                Danh muc thuoc
              </div>
              <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
                Lựa chọn thuốc và sản phẩm chăm sóc sức khỏe
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500 sm:text-base">
                Tìm kiếm nhanh, lọc linh hoạt và theo dõi ưu đãi trong một giao
                diện sạch sẽ, để nhìn và đồng nhất với toàn bộ website.
              </p>
            </div>
          </div>
        </section>

        <div className="flex items-start gap-4 flex-col lg:flex-row">
          <MedicinesFilters
            priceRange={priceRange}
            minPrice={overallMinPrice}
            maxPrice={overallMaxPrice}
            onChangePriceRange={handlePriceRangeChange}
            categories={categories}
            selectedCategoryIds={selectedCategoryIds}
            onToggleCategory={handleToggleCategory}
            brands={availableBrands}
            selectedBrands={selectedBrands}
            onToggleBrand={handleToggleBrand}
            audiences={availableAudiences}
            selectedAudiences={selectedAudiences}
            onToggleAudience={handleToggleAudience}
            onReset={handleReset}
          />

          <main className="w-full flex-1">
            {campaignPresentation ? (
              <section className="mb-4 overflow-hidden rounded-[30px] border border-sky-100 bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-400 p-5 text-white shadow-lg shadow-sky-500/10">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-white/90">
                      Uu dai noi bat
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">
                      {campaignPresentation.headline}
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm text-white/90 sm:text-base">
                      {campaignPresentation.detail ||
                        "Uu dai dang duoc ap dung trong thoi gian gioi han."}
                    </p>
                  </div>
                  <div className="shrink-0 rounded-2xl bg-white/15 px-4 py-3 text-center backdrop-blur">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-white/75">
                      Nhan uu dai
                    </div>
                    <div className="mt-1 text-xl font-black">
                      {campaignPresentation.badge}
                    </div>
                  </div>
                </div>
              </section>
            ) : null}

            <div className="storefront-panel rounded-[28px] p-3 sm:p-4">
              <MedicinesHeaderBar
                total={filteredProducts.length}
                showing={pagedProducts.length}
                query={query}
                onQueryChange={(value) => {
                  setQuery(value);
                  setPage(0);
                }}
                sort={sort}
                onSortChange={(value) => {
                  setSort(value);
                  setPage(0);
                }}
                onOpenFilters={openMobileFilters}
                filtersCount={activeFiltersCount}
              />
            </div>

            {loading ? (
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
                {Array.from({ length: 8 }).map((_, index) => (
                  <MedicineSkeleton key={index} />
                ))}
              </div>
            ) : error ? (
              <div className="mt-4 storefront-card rounded-[28px] p-6">
                <EmptyState
                  title="Khong the tai danh sach thuoc"
                  subtitle={error}
                  actionLabel="Tai lai"
                  onAction={handleReload}
                />
              </div>
            ) : pagedProducts.length === 0 ? (
              <div className="mt-4 storefront-card rounded-[28px] p-6">
                <EmptyState
                  title="Khong co san pham"
                  subtitle="Hien chua co thuoc nao de hien thi."
                  actionLabel="Tai lai"
                  onAction={handleReload}
                />
              </div>
            ) : (
              <div className="mt-4">
                <MedicinesGrid
                  products={pagedProducts}
                  onAddToCart={handleAddToCart}
                />
              </div>
            )}

            <MedicinesPagination
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              fixedPageSize={10}
              onPageChange={setPage}
            />
          </main>
        </div>
      </div>

      <MedicinesFiltersDrawer
        open={mobileFiltersOpen}
        onClose={closeMobileFilters}
        onApply={applyMobileFilters}
        onReset={resetMobileDraftFilters}
        priceRange={draftPriceRange}
        minPrice={overallMinPrice}
        maxPrice={overallMaxPrice}
        onChangePriceRange={setDraftPriceRange}
        categories={categories}
        selectedCategoryIds={draftCategoryIds}
        onToggleCategory={handleToggleDraftCategory}
        brands={availableBrands}
        selectedBrands={draftBrands}
        onToggleBrand={handleToggleDraftBrand}
        audiences={availableAudiences}
        selectedAudiences={draftAudiences}
        onToggleAudience={handleToggleDraftAudience}
      />

      <Footer />
    </PageTransition>
  );
};

export default MedicinesPage;
