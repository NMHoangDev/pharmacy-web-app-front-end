import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminLayout from "../../components/AdminLayout";
import DrugFilters from "../../components/drugs/DrugFilters";
import DrugTable from "../../components/drugs/DrugTable";
import DrugModal from "../../components/drugs/DrugModal";
import ReviewModerationModal from "../../components/drugs/ReviewModerationModal";
import { authApi as api } from "../../../../shared/api/httpClients";
import { generateProductPrDraft } from "../../../content/api/contentApi";
import AdminPageContainer from "../../../../shared/components/common/AdminPageContainer";
import AdminTableWrapper from "../../../../shared/components/common/AdminTableWrapper";
import AdminPageHeader from "../../components/shared/AdminPageHeader";
import StatsSection from "../../components/shared/StatsSection";
import useMedicineStats from "../../../../shared/hooks/queries/useMedicineStats";
import { useBranches } from "../../../../shared/hooks/useBranches";

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
  } catch {
    return {};
  }
};

const isPersistedImageRef = (value) => {
  if (!value || typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("data:")) return false;
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  ) {
    return true;
  }
  return !(trimmed.length > 256 && /^[A-Za-z0-9+/=]+$/.test(trimmed));
};

const sanitizeImageList = (images = []) =>
  (Array.isArray(images) ? images : []).filter(isPersistedImageRef);

const sanitizeAttributes = (attributes = {}) => {
  const next = { ...(attributes || {}) };
  next.images = sanitizeImageList(next.images);
  if (!next.images.length) delete next.images;
  if (!isPersistedImageRef(next.image)) delete next.image;
  if (!isPersistedImageRef(next.imageUrl)) delete next.imageUrl;
  return next;
};

const resolveDrugStatus = (drug) =>
  drug?.status ||
  drug?.effectiveStatus ||
  drug?.globalStatus ||
  drug?.branchStatus ||
  "INACTIVE";

const pagerBtn =
  "rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

const REVIEW_COUNT_CONCURRENCY = 4;
const PRIMARY_TIMEOUT_MS = 15000;
const SECONDARY_TIMEOUT_MS = 10000;

const buildProductPrRequest = (values, categories) => {
  const categoryName =
    categories.find((item) => String(item.id) === String(values.categoryId))
      ?.name || "";

  return {
    name: values.name?.trim() || "",
    categoryName,
    shortDescription: values.description?.trim() || "",
    dosageForm: values.dosageForm?.trim() || "",
    packaging: values.packaging?.trim() || "",
    activeIngredient: values.activeIngredient?.trim() || "",
    indications: values.indications?.trim() || "",
    usageDosage: values.usageDosage?.trim() || "",
    contraindicationsWarning: values.contraindicationsWarning?.trim() || "",
    otherInformation: values.otherInformation?.trim() || "",
    prescriptionRequired: !!values.rx,
    salePrice: Number(values.salePrice || 0) || 0,
    toneHint: "tin cậy, tinh tế, không quảng cáo lộ",
    campaignGoal: "tạo bản nháp bài viết PR để admin review và biên tập tiếp",
  };
};

const shouldFallbackStatusMethod = (error) => {
  const statusCode = Number(error?.response?.status || 0);
  return [404, 405, 415, 501].includes(statusCode);
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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mutationLoading, setMutationLoading] = useState(false);
  const [togglingProductId, setTogglingProductId] = useState(null);
  const [error, setError] = useState("");
  const [reloadIndex, setReloadIndex] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const { data: medicineStatsData, isLoading: medicineStatsLoading } =
    useMedicineStats({ range: "7d" });
  const { branches } = useBranches();
  const availabilityRef = useRef({});
  const loadRequestIdRef = useRef(0);
  const loadAbortControllerRef = useRef(null);

  const categoryMap = useMemo(() => {
    const map = new Map();
    categories.forEach((category) => map.set(category.id, category.name));
    return map;
  }, [categories]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.get("/api/catalog/public/categories", {
          timeout: SECONDARY_TIMEOUT_MS,
        });
        setCategories(response.data || []);
      } catch (err) {
        console.warn("Khong the tai danh muc", err);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    availabilityRef.current = availabilityMap;
  }, [availabilityMap]);

  const syncInventory = useCallback(
    async (
      productId,
      targetStock,
      currentOnHandOverride,
      timeoutMs = SECONDARY_TIMEOUT_MS,
    ) => {
      const normalizedStock = Number(targetStock);
      if (!Number.isFinite(normalizedStock)) {
        return;
      }

      const current = Number.isFinite(currentOnHandOverride)
        ? currentOnHandOverride
        : (availabilityRef.current[productId]?.onHand ??
          availabilityRef.current[productId]?.available ??
          0);

      const delta = normalizedStock - current;
      if (delta === 0) {
        return;
      }

      await api.post(
        "/api/inventory/internal/inventory/adjust",
        {
          productId,
          delta,
          reason: "Admin sync",
        },
        {
          timeout: timeoutMs,
        },
      );
    },
    [],
  );

  const fetchAvailability = useCallback(
    async (items, { requestId, signal } = {}) => {
      if (!items.length) {
        setAvailabilityMap({});
        return;
      }

      try {
        const response = await api.post(
          "/api/inventory/internal/inventory/availability/batch",
          {
            branchIds: branches.map((branch) => branch.id).filter(Boolean),
            items: items.map((item) => ({
              productId: item.id,
              qty: 1,
            })),
          },
          {
            signal,
            timeout: SECONDARY_TIMEOUT_MS,
          },
        );

        const payload = response.data || {};
        const map = {};
        (payload.items ?? []).forEach((entry) => {
          const current = map[entry.productId] || {
            productId: entry.productId,
            onHand: 0,
            reserved: 0,
            available: 0,
          };
          current.onHand += Number(entry.onHand || 0);
          current.reserved += Number(entry.reserved || 0);
          current.available += Number(entry.available || 0);
          map[entry.productId] = current;
        });

        const seedTasks = [];
        items.forEach((item) => {
          const entry = map[item.id];
          if (!entry) return;
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

        if (requestId && requestId !== loadRequestIdRef.current) {
          return;
        }

        setAvailabilityMap(map);
        if (seedTasks.length) {
          await Promise.allSettled(seedTasks);
        }
      } catch (err) {
        if (axios.isCancel(err) || err?.code === "ERR_CANCELED") {
          return;
        }
        console.warn("Loi khi tai ton kho", err);
        setAvailabilityMap({});
      }
    },
    [branches, syncInventory],
  );

  const fetchReviewCounts = useCallback(
    async (items, { requestId, signal } = {}) => {
      if (!items.length) {
        setReviewCounts({});
        return;
      }

      const map = {};
      for (let i = 0; i < items.length; i += REVIEW_COUNT_CONCURRENCY) {
        const chunk = items.slice(i, i + REVIEW_COUNT_CONCURRENCY);
        const settled = await Promise.all(
          chunk.map(async (item) => {
            if (signal?.aborted) {
              return null;
            }
            try {
              const response = await api.get(
                `/api/reviews/internal/product/${item.id}`,
                {
                  params: { page: 0, size: 1 },
                  signal,
                  timeout: 8000,
                },
              );
              const payload = response.data || {};
              return [item.id, payload.totalElements ?? 0];
            } catch {
              return [item.id, 0];
            }
          }),
        );

        if (requestId && requestId !== loadRequestIdRef.current) {
          return;
        }

        settled.forEach((entry) => {
          if (!entry) return;
          const [productId, total] = entry;
          map[productId] = total;
        });
      }

      setReviewCounts(map);
    },
    [],
  );

  const loadProducts = useCallback(async () => {
    const requestId = loadRequestIdRef.current + 1;
    loadRequestIdRef.current = requestId;
    if (loadAbortControllerRef.current) {
      loadAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    loadAbortControllerRef.current = controller;

    setLoading(true);
    setError("");

    try {
      const queryParams = {
        page: String(page),
        size: String(pageSize),
        sort,
      };
      if (search.trim()) queryParams.q = search.trim();
      if (status && status !== "ALL") queryParams.status = status;
      if (categoryId) queryParams.categoryId = categoryId;

      const response = await api.get("/api/catalog/internal/products", {
        params: queryParams,
        signal: controller.signal,
        timeout: PRIMARY_TIMEOUT_MS,
      });

      if (requestId !== loadRequestIdRef.current) return;
      const payload = response.data || {};
      const items = payload.content ?? [];
      setTotalPages(payload.totalPages ?? 1);
      setTotalElements(payload.totalElements ?? items.length);
      setProducts(items);
      fetchAvailability(items, {
        requestId,
        signal: controller.signal,
      });
      fetchReviewCounts(items.slice(0, 8), {
        requestId,
        signal: controller.signal,
      });
    } catch (err) {
      if (
        err.name !== "AbortError" &&
        !axios.isCancel(err) &&
        err?.code !== "ERR_CANCELED"
      ) {
        if (err?.code === "ECONNABORTED") {
          setError(
            "Tải danh sách thuốc quá thời gian chờ. Vui lòng thử lại hoặc thu hẹp bộ lọc.",
          );
        } else {
          setError(err.response?.data?.message || err.message);
        }
      }
    } finally {
      if (requestId === loadRequestIdRef.current) {
        setLoading(false);
      }
    }
  }, [
    page,
    pageSize,
    sort,
    search,
    status,
    categoryId,
    fetchAvailability,
    fetchReviewCounts,
  ]);

  useEffect(() => {
    setPage(0);
  }, [search, categoryId, status, sort, pageSize]);

  useEffect(() => {
    const timer = setTimeout(() => loadProducts(), 300);
    return () => clearTimeout(timer);
  }, [
    search,
    categoryId,
    status,
    sort,
    pageSize,
    page,
    reloadIndex,
    loadProducts,
  ]);

  useEffect(
    () => () => {
      if (loadAbortControllerRef.current) {
        loadAbortControllerRef.current.abort();
      }
    },
    [],
  );

  const buildCatalogRequest = useCallback(
    (base = {}, overrides = {}) => {
      const baseAttributes = sanitizeAttributes(
        parseAttributes(base.attributes),
      );
      const mergedAttributes = sanitizeAttributes({
        ...baseAttributes,
        ...(overrides.attributes || {}),
      });

      const slugCandidate =
        overrides.slug ||
        base.slug ||
        slugify(overrides.name || base.name || overrides.sku || base.sku);

      return {
        sku: overrides.sku || base.sku || `SKU-${Date.now()}`,
        name: overrides.name || base.name || "Thuoc moi",
        slug: slugCandidate,
        categoryId:
          overrides.categoryId || base.categoryId || categories[0]?.id || null,
        costPrice: overrides.costPrice ?? base.costPrice ?? 0,
        salePrice:
          overrides.salePrice ??
          base.baseSalePrice ??
          base.salePrice ??
          base.effectivePrice ??
          0,
        status: overrides.status || resolveDrugStatus(base) || "ACTIVE",
        prescriptionRequired:
          overrides.prescriptionRequired ?? base.prescriptionRequired ?? false,
        description: overrides.description ?? base.description ?? "",
        dosageForm: overrides.dosageForm ?? base.dosageForm ?? "",
        packaging: overrides.packaging ?? base.packaging ?? "",
        activeIngredient:
          overrides.activeIngredient ?? base.activeIngredient ?? "",
        indications: overrides.indications ?? base.indications ?? "",
        usageDosage: overrides.usageDosage ?? base.usageDosage ?? "",
        contraindicationsWarning:
          overrides.contraindicationsWarning ??
          base.contraindicationsWarning ??
          "",
        otherInformation:
          overrides.otherInformation ?? base.otherInformation ?? "",
        imageUrl: overrides.imageUrl ?? base.imageUrl ?? defaultImage,
        attributes: JSON.stringify(mergedAttributes),
      };
    },
    [categories],
  );

  const enrichedDrugs = useMemo(
    () =>
      products.map((product) => {
        const availability = availabilityMap[product.id];
        const attrs = parseAttributes(product.attributes);
        const unit = attrs.unit || "don vi";
        const fallbackStock =
          typeof attrs.stock === "number"
            ? attrs.stock
            : Number.isFinite(Number(attrs.stock))
              ? Number(attrs.stock)
              : null;
        const available =
          availability?.available ??
          (fallbackStock != null ? Math.max(0, fallbackStock) : 0);
        const images = sanitizeImageList(
          Array.isArray(attrs.images)
            ? attrs.images
            : product.imageUrl
              ? [product.imageUrl]
              : [],
        );
        const stockStatus =
          available <= 0 ? "out" : available < 5 ? "low" : "in";
        const stockLabel = available ? `${available} ${unit}` : "Het hang";
        const categoryName =
          categoryMap.get(product.categoryId) || "Khong xac dinh";

        return {
          ...product,
          categoryName,
          category: categoryName,
          priceLabel: formatPrice(
            product.effectivePrice ?? product.baseSalePrice ?? 0,
          ),
          unit,
          stockStatus,
          stockLabel,
          stockQuantity: available,
          status: resolveDrugStatus(product),
          image: product.imageUrl || images[0] || defaultImage,
          images,
          albumId: attrs.albumId || "",
          rx: !!product.prescriptionRequired,
          reviewCount: reviewCounts[product.id] ?? 0,
        };
      }),
    [products, availabilityMap, categoryMap, reviewCounts],
  );

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

  const medicineMetrics = medicineStatsData?.metrics || medicineStatsData || {};
  const medicineStatsCards = useMemo(
    () => [
      {
        key: "total",
        label: "Tổng số SKU",
        value: Number(
          medicineMetrics.totalMedicines ?? totalElements ?? products.length,
        ).toLocaleString("vi-VN"),
        description: "Số SKU đang được quản lý",
        icon: "medication",
      },
      {
        key: "active",
        label: "Đang kinh doanh",
        value: Number(
          medicineMetrics.activeMedicines ??
            enrichedDrugs.filter((item) => item.status === "ACTIVE").length,
        ).toLocaleString("vi-VN"),
        description: "Đủ điều kiện hiển thị và bán",
        icon: "inventory_2",
      },
      {
        key: "lowStock",
        label: "Tồn kho thấp",
        value: Number(
          medicineMetrics.lowStockMedicines ??
            enrichedDrugs.filter((item) => item.stockStatus === "low").length,
        ).toLocaleString("vi-VN"),
        description: "Cần bổ sung sớm",
        icon: "warning",
        tone: "down",
      },
      {
        key: "outOfStock",
        label: "Hết hàng",
        value: Number(
          medicineMetrics.outOfStockMedicines ??
            enrichedDrugs.filter((item) => item.stockStatus === "out").length,
        ).toLocaleString("vi-VN"),
        description: "Không có tồn kho khả dụng để bán",
        icon: "remove_shopping_cart",
        tone: "down",
      },
    ],
    [medicineMetrics, totalElements, products.length, enrichedDrugs],
  );

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
      const message = "Vui lòng tạo ít nhất một danh mục trước khi thêm thuốc.";
      setError(message);
      throw new Error(message);
    }

    setMutationLoading(true);
    setError("");

    try {
      const overrides = {
        sku: values.sku?.trim(),
        name: values.name.trim(),
        slug: slugify(values.name || values.sku),
        categoryId: targetCategoryId,
        costPrice: values.costPrice ?? 0,
        salePrice: values.salePrice ?? 0,
        status: values.status || "ACTIVE",
        prescriptionRequired: !!values.rx,
        description: values.description?.trim() || "",
        dosageForm: values.dosageForm?.trim() || "",
        packaging: values.packaging?.trim() || "",
        activeIngredient: values.activeIngredient?.trim() || "",
        indications: values.indications?.trim() || "",
        usageDosage: values.usageDosage?.trim() || "",
        contraindicationsWarning: values.contraindicationsWarning?.trim() || "",
        otherInformation: values.otherInformation?.trim() || "",
        imageUrl: values.image?.trim() || values.images?.[0] || defaultImage,
        attributes: {
          unit: values.unit?.trim() || "don vi",
          albumId: values.albumId || "",
          images: sanitizeImageList(values.images || []),
          stock: Number(values.stock || 0),
          dosageForm: values.dosageForm?.trim() || "",
          packaging: values.packaging?.trim() || "",
          activeIngredient: values.activeIngredient?.trim() || "",
          indications: values.indications?.trim() || "",
          usageDosage: values.usageDosage?.trim() || "",
          contraindicationsWarning:
            values.contraindicationsWarning?.trim() || "",
          otherInformation: values.otherInformation?.trim() || "",
          form: values.dosageForm?.trim() || "",
          packing: values.packaging?.trim() || "",
          ingredient: values.activeIngredient?.trim() || "",
          usage: values.indications?.trim() || "",
          dosage: values.usageDosage?.trim() || "",
          warning: values.contraindicationsWarning?.trim() || "",
          contraindications: values.contraindicationsWarning?.trim() || "",
          extraInfo: values.otherInformation?.trim() || "",
        },
      };

      const requestBody = buildCatalogRequest(
        meta.mode === "edit" ? editingProduct : undefined,
        overrides,
      );

      const response =
        meta.mode === "edit"
          ? await api.put(
              `/api/catalog/internal/products/${meta.id}`,
              requestBody,
              {
                timeout: PRIMARY_TIMEOUT_MS,
              },
            )
          : await api.post("/api/catalog/internal/products", requestBody, {
              timeout: PRIMARY_TIMEOUT_MS,
            });

      const payload = response.data;
      setReloadIndex((prev) => prev + 1);
      Promise.resolve(
        syncInventory(
          payload.id,
          Number(values.stock || 0),
          undefined,
          SECONDARY_TIMEOUT_MS,
        ),
      ).catch((syncError) => {
        console.warn("Đồng bộ tồn kho thất bại sau khi lưu thuốc", syncError);
      });

      if (meta.mode === "create" && meta.createPrPost) {
        try {
          const prDraft = await generateProductPrDraft(
            buildProductPrRequest(values, categories),
          );
          closeModal();
          window.alert("Đã lưu thuốc và tạo sẵn bản nháp PR để bạn review.");
          navigate("/admin/content", {
            state: {
              contentDraft: {
                seedId: `drug-${payload.id}-${Date.now()}`,
                selectedProductId: payload.id,
                sourceProductName: values.name?.trim() || payload.name || "",
                title: prDraft?.title || "",
                excerpt: prDraft?.excerpt || "",
                caption: prDraft?.caption || "",
                contentHtml: prDraft?.contentHtml || "",
                tags: prDraft?.suggestedTags || [],
                disclaimer: prDraft?.disclaimer || "",
                coverImageUrl:
                  payload.imageUrl ||
                  values.image?.trim() ||
                  values.images?.[0] ||
                  defaultImage,
              },
            },
          });
        } catch (prError) {
          closeModal();
          window.alert(
            `Đã lưu thuốc nhưng chưa thể tạo bài PR tự động: ${prError?.message || "Lỗi AI"}`,
          );
        }
      } else {
        closeModal();
        window.alert(
          meta.mode === "edit"
            ? "Cập nhật thuốc thành công"
            : "Thêm thuốc thành công",
        );
      }

      return payload;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        (meta.mode === "edit"
          ? "Cập nhật thuốc thất bại."
          : "Thêm thuốc thất bại.");
      setError(message);
      throw new Error(message);
    } finally {
      setMutationLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    if (togglingProductId && String(togglingProductId) === String(id)) {
      return;
    }

    setMutationLoading(true);
    setTogglingProductId(id);
    setError("");

    try {
      const product = enrichedDrugs.find(
        (item) => String(item.id) === String(id),
      );
      if (!product) {
        throw new Error("Không tìm thấy sản phẩm cần đổi trạng thái.");
      }

      const currentStatus = resolveDrugStatus(product);
      const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

      // Optimistic UI update for responsive toggles.
      setProducts((prev) =>
        prev.map((item) =>
          String(item.id) === String(id)
            ? {
                ...item,
                status: nextStatus,
                effectiveStatus: nextStatus,
                globalStatus: nextStatus,
              }
            : item,
        ),
      );

      let payload = {};
      try {
        const response = await api.patch(
          `/api/catalog/internal/products/${id}/status`,
          {
            status: nextStatus,
          },
          {
            timeout: SECONDARY_TIMEOUT_MS,
          },
        );
        payload = response.data || {};
      } catch (primaryError) {
        if (!shouldFallbackStatusMethod(primaryError)) {
          throw primaryError;
        }

        const fallback = await api.put(
          `/api/catalog/internal/products/${id}/status`,
          {
            status: nextStatus,
          },
          {
            timeout: SECONDARY_TIMEOUT_MS,
          },
        );
        payload = fallback.data || {};
      }

      setProducts((prev) =>
        prev.map((item) =>
          String(item.id) === String(id)
            ? {
                ...item,
                ...payload,
                status: nextStatus,
                effectiveStatus: nextStatus,
                globalStatus: nextStatus,
              }
            : item,
        ),
      );
      window.alert(
        nextStatus === "ACTIVE"
          ? "Đã bật kinh doanh thuốc."
          : "Đã ngừng kinh doanh thuốc.",
      );
    } catch (err) {
      // Rollback if API failed after optimistic update.
      const rollbackStatus =
        enrichedDrugs.find((item) => String(item.id) === String(id))?.status ||
        "INACTIVE";
      setProducts((prev) =>
        prev.map((item) =>
          String(item.id) === String(id)
            ? {
                ...item,
                status: rollbackStatus,
                effectiveStatus: rollbackStatus,
                globalStatus: rollbackStatus,
              }
            : item,
        ),
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Cập nhật trạng thái thất bại.",
      );
    } finally {
      setMutationLoading(false);
      setTogglingProductId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      return;
    }

    setMutationLoading(true);
    setError("");
    try {
      await api.delete(`/api/catalog/internal/products/${id}`, {
        timeout: PRIMARY_TIMEOUT_MS,
      });
      setReloadIndex((prev) => prev + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setMutationLoading(false);
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
        costPrice: editingProduct.costPrice ?? 0,
        salePrice:
          editingProduct.effectivePrice ?? editingProduct.baseSalePrice ?? 0,
        unit: editingProduct.unit,
        stock: editingProduct.stockQuantity,
        status: resolveDrugStatus(editingProduct),
        rx: editingProduct.rx,
        description: editingProduct.description || "",
        dosageForm:
          editingProduct.dosageForm ||
          parseAttributes(editingProduct.attributes).dosageForm ||
          parseAttributes(editingProduct.attributes).form ||
          "",
        packaging:
          editingProduct.packaging ||
          parseAttributes(editingProduct.attributes).packaging ||
          parseAttributes(editingProduct.attributes).packing ||
          "",
        activeIngredient:
          editingProduct.activeIngredient ||
          parseAttributes(editingProduct.attributes).activeIngredient ||
          parseAttributes(editingProduct.attributes).ingredient ||
          "",
        indications:
          editingProduct.indications ||
          parseAttributes(editingProduct.attributes).indications ||
          parseAttributes(editingProduct.attributes).usage ||
          "",
        usageDosage:
          editingProduct.usageDosage ||
          parseAttributes(editingProduct.attributes).usageDosage ||
          parseAttributes(editingProduct.attributes).dosage ||
          "",
        contraindicationsWarning:
          editingProduct.contraindicationsWarning ||
          parseAttributes(editingProduct.attributes).contraindicationsWarning ||
          parseAttributes(editingProduct.attributes).warning ||
          parseAttributes(editingProduct.attributes).contraindications ||
          "",
        otherInformation:
          editingProduct.otherInformation ||
          parseAttributes(editingProduct.attributes).otherInformation ||
          parseAttributes(editingProduct.attributes).extraInfo ||
          "",
        image: editingProduct.image,
        images: sanitizeImageList(editingProduct.images || []),
        albumId: editingProduct.albumId || "",
      }
    : null;

  return (
    <AdminLayout activeKey="drugs">
      <AdminPageContainer>
        <AdminPageHeader
          title="Quản lý thuốc"
          subtitle="Theo dõi danh mục, tồn kho và trạng thái kinh doanh"
          actions={
            <button
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              type="button"
              onClick={openCreateModal}
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Thêm thuốc mới
            </button>
          }
        />

        <StatsSection
          items={medicineStatsCards}
          loading={medicineStatsLoading && !products.length}
          emptyText="Chưa có dữ liệu tổng quan thuốc"
        />

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
          <AdminTableWrapper className="px-4 py-3 text-sm text-slate-600">
            Đang tải dữ liệu sản phẩm...
          </AdminTableWrapper>
        )}

        <DrugTable
          drugs={filteredDrugs}
          onToggleStatus={handleToggleStatus}
          togglingProductId={togglingProductId}
          onEdit={openEditModal}
          onDelete={handleDelete}
          onViewReviews={handleViewReviews}
        />

        <AdminTableWrapper className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-slate-500">
              Tổng {totalElements.toLocaleString("vi-VN")} sản phẩm
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={pagerBtn}
                disabled={page <= 0}
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              >
                Trước
              </button>
              <span className="text-sm text-slate-600">
                Trang {Math.max(1, page + 1)} / {Math.max(1, totalPages)}
              </span>
              <button
                type="button"
                className={pagerBtn}
                disabled={page >= Math.max(0, totalPages - 1)}
                onClick={() =>
                  setPage((prev) =>
                    Math.min(Math.max(0, totalPages - 1), prev + 1),
                  )
                }
              >
                Sau
              </button>
            </div>
          </div>
        </AdminTableWrapper>
      </AdminPageContainer>

      <DrugModal
        open={modalOpen}
        onClose={closeModal}
        onSave={handleSaveDrug}
        busy={mutationLoading}
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
