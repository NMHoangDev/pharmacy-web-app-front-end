import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import DrugFilters from "../../../components/admin/drugs/DrugFilters";
import DrugTable from "../../../components/admin/drugs/DrugTable";
import DrugModal from "../../../components/admin/drugs/DrugModal";
import ReviewModerationModal from "../../../components/admin/drugs/ReviewModerationModal";

const defaultImage =
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=300&q=80";

const formatPrice = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

const slugify = (value) =>
  value
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") || `drug-${Date.now()}`;

const parseAttributes = (value) => {
  if (!value) return {};
  try {
    return JSON.parse(value);
  } catch (error) {
    return {};
  }
};

const readErrorMessage = async (response, fallback) => {
  try {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await response.json();
      return data.message || data.error || fallback;
    }
    const text = await response.text();
    return text || fallback;
  } catch {
    return fallback;
  }
};

const AdminDrugsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [availabilityMap, setAvailabilityMap] = useState({});
  const [reviewCounts, setReviewCounts] = useState({});
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("ALL");
  const [sort, setSort] = useState("name,asc");
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingProduct, setEditingProduct] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);
  const [reviewStatus, setReviewStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reloadIndex, setReloadIndex] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const categoryMap = useMemo(() => {
    const map = new Map();
    categories.forEach((category) => map.set(category.id, category.name));
    return map;
  }, [categories]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/catalog/public/categories");
        if (!response.ok) {
          const message = await readErrorMessage(
            response,
            "Không thể tải danh mục",
          );
          throw new Error(message);
        }
        const payload = await response.json();
        setCategories(payload);
      } catch (err) {
        console.warn("Không thể tải danh mục", err);
      }
    };

    loadCategories();
  }, []);

  const fetchAvailability = async (items) => {
    if (!items.length) {
      setAvailabilityMap({});
      return;
    }

    const params = new URLSearchParams();
    items.forEach((item) => params.append("productIds", item.id));

    try {
      const response = await fetch(
        `/api/inventory/internal/inventory/availability?${params.toString()}`,
      );
      if (!response.ok) {
        const message = await readErrorMessage(
          response,
          "Không thể tải tồn kho",
        );
        throw new Error(message);
      }
      const payload = await response.json();
      const map = {};
      (payload.items ?? []).forEach((entry) => {
        map[entry.productId] = entry;
      });

      const seedTasks = [];
      items.forEach((item) => {
        const entry = map[item.id];
        if (!entry) {
          return;
        }
        const attrs = parseAttributes(item.attributes);
        const seedStock = Number(attrs.stock);
        if (
          Number.isFinite(seedStock) &&
          seedStock > 0 &&
          entry.onHand === 0 &&
          entry.reserved === 0
        ) {
          map[item.id] = {
            ...entry,
            onHand: seedStock,
            available: seedStock,
          };
          seedTasks.push(syncInventory(item.id, seedStock, entry.onHand));
        }
      });

      setAvailabilityMap(map);
      if (seedTasks.length) {
        await Promise.allSettled(seedTasks);
      }
    } catch (err) {
      console.warn("Lỗi khi tải tồn kho", err);
      setAvailabilityMap({});
    }
  };

  const fetchReviewCounts = async (items) => {
    if (!items.length) {
      setReviewCounts({});
      return;
    }

    const tasks = items.map(async (item) => {
      try {
        const response = await fetch(
          `/api/reviews/internal/product/${item.id}?page=0&size=1`,
        );
        if (!response.ok) {
          return [item.id, 0];
        }
        const payload = await response.json();
        return [item.id, payload.totalElements ?? 0];
      } catch {
        return [item.id, 0];
      }
    });

    const settled = await Promise.all(tasks);
    const map = {};
    settled.forEach(([productId, total]) => {
      map[productId] = total;
    });
    setReviewCounts(map);
  };

  const loadProducts = async (signal) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        size: String(pageSize),
        sort,
      });
      if (search.trim()) {
        params.set("q", search.trim());
      }
      if (status && status !== "ALL") {
        params.set("status", status);
      }
      if (categoryId) {
        params.set("categoryId", categoryId);
      }

      const response = await fetch(
        `/api/catalog/internal/products?${params.toString()}`,
        { signal },
      );
      if (!response.ok) {
        const message = await readErrorMessage(
          response,
          "Không thể tải sản phẩm",
        );
        throw new Error(message);
      }

      const payload = await response.json();
      if (signal.aborted) return;

      const items = payload.content ?? [];
      setTotalPages(payload.totalPages ?? 1);
      setTotalElements(payload.totalElements ?? items.length);
      setProducts(items);
      fetchAvailability(items);
      fetchReviewCounts(items);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message);
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    setPage(0);
  }, [search, filter, categoryId, status, sort, pageSize]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => loadProducts(controller.signal), 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, filter, categoryId, status, sort, pageSize, page, reloadIndex]);

  const syncInventory = async (
    productId,
    targetStock,
    currentOnHandOverride,
  ) => {
    const normalizedStock = Number(targetStock);
    if (!Number.isFinite(normalizedStock)) {
      return;
    }

    const current = Number.isFinite(currentOnHandOverride)
      ? currentOnHandOverride
      : (availabilityMap[productId]?.onHand ??
        availabilityMap[productId]?.available ??
        0);
    const delta = normalizedStock - current;
    if (delta === 0) {
      return;
    }

    try {
      const response = await fetch("/api/inventory/internal/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          delta,
          reason: "Admin sync",
        }),
      });
      if (!response.ok) {
        const message = await readErrorMessage(
          response,
          "Không thể đồng bộ tồn kho",
        );
        throw new Error(message);
      }
    } catch (err) {
      console.warn("Đồng bộ tồn kho thất bại", err);
    }
  };

  const buildCatalogRequest = (base = {}, overrides = {}) => {
    const baseAttributes = parseAttributes(base.attributes);
    const mergedAttributes = {
      ...baseAttributes,
      ...(overrides.attributes || {}),
    };

    const slugCandidate =
      overrides.slug ||
      base.slug ||
      slugify(overrides.name || base.name || overrides.sku || base.sku);

    return {
      sku: overrides.sku || base.sku || `SKU-${Date.now()}`,
      name: overrides.name || base.name || "Thuốc mới",
      slug: slugCandidate,
      categoryId:
        overrides.categoryId || base.categoryId || categories[0]?.id || null,
      price: overrides.price ?? base.price ?? 0,
      status: overrides.status || base.status || "ACTIVE",
      prescriptionRequired:
        overrides.prescriptionRequired ?? base.prescriptionRequired ?? false,
      description: overrides.description ?? base.description ?? "",
      imageUrl: overrides.imageUrl ?? base.imageUrl ?? defaultImage,
      attributes: JSON.stringify(mergedAttributes),
    };
  };

  const enrichedDrugs = useMemo(() => {
    return products.map((product) => {
      const availability = availabilityMap[product.id];
      const attrs = parseAttributes(product.attributes);
      const unit = attrs.unit || "đơn vị";
      const fallbackStock =
        typeof attrs.stock === "number"
          ? attrs.stock
          : Number.isFinite(Number(attrs.stock))
            ? Number(attrs.stock)
            : null;
      const available =
        availability?.available ??
        (fallbackStock != null ? Math.max(0, fallbackStock) : 0);
      const images = Array.isArray(attrs.images)
        ? attrs.images
        : product.imageUrl
          ? [product.imageUrl]
          : [];
      const stockStatus = available <= 0 ? "out" : available < 5 ? "low" : "in";
      const stockLabel = available ? `${available} ${unit}` : "Hết hàng";

      const categoryName =
        categoryMap.get(product.categoryId) || "Không xác định";

      return {
        ...product,
        categoryName,
        category: categoryName,
        priceLabel: formatPrice(product.price),
        unit,
        stockStatus,
        stockLabel,
        stockQuantity: available,
        status: product.status || "INACTIVE",
        image: product.imageUrl || images[0] || defaultImage,
        images,
        albumId: attrs.albumId || "",
        rx: !!product.prescriptionRequired,
        reviewCount: reviewCounts[product.id] ?? 0,
      };
    });
  }, [products, availabilityMap, categoryMap, reviewCounts]);

  const filteredDrugs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return enrichedDrugs.filter((drug) => {
      const matchesQuery = query
        ? `${drug.name} ${drug.sku} ${drug.categoryName}`
            .toLowerCase()
            .includes(query)
        : true;

      const matchesFilter = (() => {
        if (filter === "out") return drug.stockStatus === "out";
        if (filter === "rx") return !!drug.rx;
        if (filter === "low") return drug.stockStatus === "low";
        return true;
      })();

      return matchesQuery && matchesFilter;
    });
  }, [enrichedDrugs, search, filter]);

  const openCreateModal = () => {
    setModalMode("create");
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEditModal = (drug) => {
    setModalMode("edit");
    setEditingProduct(drug);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveDrug = async (values, meta) => {
    const targetCategoryId = values.categoryId || categories[0]?.id || null;
    if (!targetCategoryId) {
      setError("Vui lòng tạo ít nhất một danh mục trước khi thêm thuốc.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const overrides = {
        sku: values.sku?.trim(),
        name: values.name.trim(),
        slug: slugify(values.name || values.sku),
        categoryId: targetCategoryId,
        price: values.price ?? 0,
        status: values.status || "ACTIVE",
        prescriptionRequired: !!values.rx,
        description: "",
        imageUrl: values.image?.trim() || values.images?.[0] || defaultImage,
        attributes: {
          unit: values.unit?.trim() || "đơn vị",
          albumId: values.albumId || "",
          images: values.images || [],
          stock: Number(values.stock || 0),
        },
      };

      const requestBody = buildCatalogRequest(
        meta.mode === "edit" ? editingProduct : undefined,
        overrides,
      );

      const endpoint =
        meta.mode === "edit"
          ? `/api/catalog/internal/products/${meta.id}`
          : "/api/catalog/internal/products";

      const response = await fetch(endpoint, {
        method: meta.mode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const message = await readErrorMessage(
          response,
          `Không thể ${meta.mode === "edit" ? "cập nhật" : "tạo"} thuốc`,
        );
        throw new Error(message);
      }

      const payload = await response.json();
      await syncInventory(payload.id, values.stock);
      setReloadIndex((prev) => prev + 1);
      window.alert(
        meta.mode === "edit"
          ? "Cập nhật thuốc thành công"
          : "Thêm thuốc thành công",
      );
      closeModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    setLoading(true);
    setError("");

    try {
      const product = products.find((item) => item.id === id);
      if (!product) return;

      const requestBody = buildCatalogRequest(product, {
        status: product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
      });

      const response = await fetch(`/api/catalog/internal/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const message = await readErrorMessage(
          response,
          "Không thể thay đổi trạng thái sản phẩm",
        );
        throw new Error(message);
      }

      const payload = await response.json();
      await syncInventory(
        payload.id,
        availabilityMap[payload.id]?.available ?? 0,
      );
      setReloadIndex((prev) => prev + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/catalog/internal/products/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const message = await readErrorMessage(
          response,
          "Không thể xóa sản phẩm",
        );
        throw new Error(message);
      }
      setReloadIndex((prev) => prev + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReviews = (productId) => {
    const product = enrichedDrugs.find((item) => item.id === productId);
    setReviewProduct(product || null);
    setReviewStatus("");
    setReviewModalOpen(true);
  };

  const modalInitialData = editingProduct
    ? {
        id: editingProduct.id,
        name: editingProduct.name,
        sku: editingProduct.sku,
        categoryId: editingProduct.categoryId,
        price: editingProduct.price,
        unit: editingProduct.unit,
        stock: editingProduct.stockQuantity,
        status: editingProduct.status,
        rx: editingProduct.rx,
        image: editingProduct.image,
        images: editingProduct.images || [],
        albumId: editingProduct.albumId || "",
      }
    : null;

  return (
    <AdminLayout activeKey="drugs">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Quản lý thuốc
            </h2>
            <p className="text-slate-500 mt-1 dark:text-slate-400">
              Quản lý danh mục, giá cả và tồn kho thuốc toàn hệ thống.
            </p>
          </div>
          <button
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            type="button"
            onClick={openCreateModal}
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Thêm thuốc mới
          </button>
        </div>

        <DrugFilters
          search={search}
          onSearchChange={setSearch}
          filter={filter}
          onFilterChange={setFilter}
          categories={categories}
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
          status={status}
          onStatusChange={setStatus}
          sort={sort}
          onSortChange={setSort}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          onReset={() => {
            setSearch("");
            setFilter("all");
            setCategoryId("");
            setStatus("ALL");
            setSort("name,asc");
            setPageSize(10);
          }}
        />

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            Đang tải dữ liệu sản phẩm...
          </div>
        )}

        <DrugTable
          drugs={filteredDrugs}
          onToggleStatus={handleToggleStatus}
          onEdit={openEditModal}
          onDelete={handleDelete}
          onViewReviews={handleViewReviews}
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <span>Tổng {totalElements.toLocaleString("vi-VN")} sản phẩm</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 disabled:opacity-50"
              disabled={page === 0}
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            >
              Trước
            </button>
            <span>
              Trang {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 disabled:opacity-50"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      <DrugModal
        open={modalOpen}
        onClose={closeModal}
        onSave={handleSaveDrug}
        initialData={modalInitialData}
        categories={categories}
        mode={modalMode}
      />

      <ReviewModerationModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        product={reviewProduct}
        statusFilter={reviewStatus}
        onStatusFilterChange={setReviewStatus}
      />
    </AdminLayout>
  );
};

export default AdminDrugsPage;
