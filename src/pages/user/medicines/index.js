import React, { useEffect, useMemo, useState } from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import MedicinesBreadcrumbs from "../../../components/medicines/MedicinesBreadcrumbs";
import MedicinesFilters from "../../../components/medicines/MedicinesFilters";
import MedicinesHeaderBar from "../../../components/medicines/MedicinesHeaderBar";
import MedicinesGrid from "../../../components/medicines/MedicinesGrid";
import MedicinesPagination from "../../../components/medicines/MedicinesPagination";
import medicinesProducts, { parsePrice } from "../../../data/medicinesProducts";

const formatPrice = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")} đ`;

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

const fallbackPrices = medicinesProducts.map((p) => parsePrice(p.price));
const fallbackMin = Math.min(...fallbackPrices);
const fallbackMax = Math.max(...fallbackPrices);

const MedicinesPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("best");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedAudiences, setSelectedAudiences] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  const [priceRange, setPriceRange] = useState({
    min: fallbackMin,
    max: fallbackMax,
  });

  const handlePriceRangeChange = (nextRange) => {
    let { min, max } = nextRange;
    if (min > max) {
      [min, max] = [max, min];
    }
    min = Math.max(overallMinPrice, min);
    max = Math.min(overallMaxPrice, max);
    setPriceRange({ min, max });
  };

  const overallMinPrice = useMemo(() => {
    if (!products.length) return fallbackMin;
    return Math.min(...products.map((item) => item.priceValue));
  }, [products]);

  const overallMaxPrice = useMemo(() => {
    if (!products.length) return fallbackMax;
    return Math.max(...products.map((item) => item.priceValue));
  }, [products]);

  useEffect(() => {
    setPriceRange((prev) => ({
      min: Math.max(overallMinPrice, prev.min),
      max: Math.min(overallMaxPrice, prev.max),
    }));
  }, [overallMinPrice, overallMaxPrice]);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const categoryResponse = await fetch("/api/catalog/public/categories", {
          signal: controller.signal,
        });
        if (categoryResponse.ok) {
          const categoryPayload = await categoryResponse.json();
          setCategories(categoryPayload || []);
        }

        const response = await fetch(
          "/api/catalog/public/products?size=200&sort=name,asc",
          { signal: controller.signal },
        );
        if (!response.ok) {
          throw new Error("Không thể tải danh sách sản phẩm");
        }
        const payload = await response.json();
        const items = payload.content ?? [];
        const mapped = items.map((item) => {
          const attrs = parseAttributes(item.attributes);
          const badge = resolveBadge(attrs, item.createdAt);
          const priceValue = Number(item.price || 0);
          return {
            id: item.id,
            slug: item.slug,
            title: item.name,
            description: item.description || attrs.shortDescription || "",
            price: formatPrice(priceValue),
            priceValue,
            oldPrice: attrs.oldPrice ? formatPrice(attrs.oldPrice) : "",
            image:
              item.imageUrl ||
              "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=300&q=80",
            rx: !!item.prescriptionRequired,
            consult: !!attrs.consultationRequired,
            badge: badge?.label,
            badgeColor: badge?.color,
            categoryId: item.categoryId,
            brand: attrs.brand || attrs.manufacturer || "",
            audience: attrs.audience || attrs.target || "",
            createdAt: item.createdAt,
          };
        });
        setProducts(mapped);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Không thể tải danh sách sản phẩm");
          setProducts(
            medicinesProducts.map((product) => ({
              ...product,
              slug: product.slug || `drug-${product.id}`,
              priceValue: parsePrice(product.price),
              categoryId: null,
              brand: product.brand || "",
              audience: product.audience || "",
              createdAt: null,
            })),
          );
        }
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, []);

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
    if (page > totalPages - 1) {
      setPage(0);
    }
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

  const handleToggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((item) => item !== brand)
        : [...prev, brand],
    );
    setPage(0);
  };

  const handleToggleAudience = (label) => {
    setSelectedAudiences((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label],
    );
    setPage(0);
  };

  const handleReset = () => {
    setQuery("");
    setSort("best");
    setSelectedCategoryIds([]);
    setSelectedBrands([]);
    setSelectedAudiences([]);
    setPriceRange({ min: overallMinPrice, max: overallMaxPrice });
    setPage(0);
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-display flex flex-col text-slate-900 dark:text-white antialiased">
      <Header />
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-6 flex-grow w-full">
        <MedicinesBreadcrumbs />
        <div className="flex flex-col lg:flex-row gap-8 items-start">
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
          <main className="flex-1 w-full">
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
            />
            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 mb-4">
                {error}
              </div>
            ) : null}
            {loading ? (
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 mb-4">
                Đang tải sản phẩm...
              </div>
            ) : null}
            <MedicinesGrid products={pagedProducts} />
            <MedicinesPagination
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(value) => {
                setPageSize(value);
                setPage(0);
              }}
            />
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MedicinesPage;
