import React, { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import InventoryToolbar from "../../components/inventory/InventoryToolbar";
import InventoryTable from "../../components/inventory/InventoryTable";
import AdminPageHeader from "../../components/shared/AdminPageHeader";
import BranchSelect from "../../components/shared/BranchSelect";
import StatsSection from "../../components/shared/StatsSection";
import AdminPageContainer from "../../../../shared/components/common/AdminPageContainer";
import AdminTableWrapper from "../../../../shared/components/common/AdminTableWrapper";
import {
  approveStockDocument,
  createCatalogProduct,
  createStockDocument,
  deleteCatalogProduct,
  deleteInventoryItem,
  exportStockReport,
  getInventoryAvailability,
  listCatalogCategories,
  listCatalogProducts,
  listInventoryActivities,
  submitStockDocument,
  updateCatalogProduct,
  upsertCatalogBranchSetting,
} from "../../api/adminInventoryApi";
import { useBranches } from "../../../../shared/hooks/useBranches";
import { useAdminBranchSelection } from "../../../../shared/hooks/useAdminBranchSelection";

const initialItems = [
  {
    id: "inv-1",
    image:
      "https://images.unsplash.com/photo-1582719478248-54e9f2afefc5?auto=format&fit=crop&w=300&q=80",
    name: "Dầu cá Omega-3",
    sku: "OMG-001",
    stock: 120,
    threshold: 30,
    unit: "Hộp",
    price: 320000,
    type: "supplement",
  },
  {
    id: "inv-2",
    image:
      "https://images.unsplash.com/photo-1580281780460-82d277b0e3b3?auto=format&fit=crop&w=300&q=80",
    name: "Paracetamol 500mg",
    sku: "PCM-500",
    stock: 40,
    threshold: 50,
    unit: "Vỉ",
    price: 25000,
    type: "drug",
  },
  {
    id: "inv-3",
    image:
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=300&q=80",
    name: "Máy đo huyết áp Omron",
    sku: "OMR-BP",
    stock: 8,
    threshold: 10,
    unit: "Máy",
    price: 1250000,
    type: "device",
  },
  {
    id: "inv-4",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=300&q=80",
    name: "Vitamin C 1000mg",
    sku: "VITC-1K",
    stock: 15,
    threshold: 25,
    unit: "Hộp",
    price: 180000,
    type: "supplement",
  },
  {
    id: "inv-5",
    image:
      "https://images.unsplash.com/photo-1584367369853-8f7c9083ba40?auto=format&fit=crop&w=300&q=80",
    name: "Khẩu trang y tế 4 lớp",
    sku: "MASK-4L",
    stock: 200,
    threshold: 60,
    unit: "Hộp",
    price: 55000,
    type: "device",
  },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const parseAttributes = (value) => {
  if (!value) return {};
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

const slugify = (value) =>
  value
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") || `drug-${Date.now()}`;

const buildMedicineAttributes = (modal) => ({
  unit: modal.unit || "Hộp",
  threshold: Number(modal.threshold || 0) || 20,
  dosageForm: modal.dosageForm || "",
  packaging: modal.packaging || "",
  activeIngredient: modal.activeIngredient || "",
  indications: modal.indications || "",
  usageDosage: modal.usageDosage || "",
  contraindicationsWarning: modal.contraindicationsWarning || "",
  otherInformation: modal.otherInformation || "",
  form: modal.dosageForm || "",
  packing: modal.packaging || "",
  ingredient: modal.activeIngredient || "",
  usage: modal.indications || "",
  dosage: modal.usageDosage || "",
  warning: modal.contraindicationsWarning || "",
  contraindications: modal.contraindicationsWarning || "",
  extraInfo: modal.otherInformation || "",
});

const AdminInventoryPage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const {
    branches,
    loading: branchLoading,
    error: branchError,
  } = useBranches();
  const { branchId, setBranchId } = useAdminBranchSelection();
  const [filters, setFilters] = useState({
    query: "",
    category: "all",
    status: "all",
  });
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(0);
  const [, setActivityLoading] = useState(false);
  const [, setActivityError] = useState("");
  const [, setRecentActivityEvents] = useState([]);
  const [stockModal, setStockModal] = useState({
    open: false,
    mode: "in",
    sku: "",
    qty: 10,
    reason: "",
    batchNo: "",
    expiryDate: "",
  });
  const [editModal, setEditModal] = useState({
    open: false,
    item: null,
    name: "",
    sku: "",
    categoryId: "",
    costPrice: 0,
    salePrice: 0,
    unit: "",
    threshold: 20,
    status: "ACTIVE",
    rx: false,
    imageUrl: "",
    description: "",
    dosageForm: "",
    packaging: "",
    activeIngredient: "",
    indications: "",
    usageDosage: "",
    contraindicationsWarning: "",
    otherInformation: "",
    newStock: 0,
    reason: "",
    batchNo: "",
    expiryDate: "",
  });
  const [addModal, setAddModal] = useState({
    open: false,
    name: "",
    sku: "",
    categoryId: "",
    costPrice: 0,
    salePrice: 0,
    unit: "",
    threshold: 20,
    status: "ACTIVE",
    rx: false,
    imageUrl: "",
    description: "",
    dosageForm: "",
    packaging: "",
    activeIngredient: "",
    indications: "",
    usageDosage: "",
    contraindicationsWarning: "",
    otherInformation: "",
    initialStock: 0,
    reason: "",
    batchNo: "",
    expiryDate: "",
  });

  const [detailModal, setDetailModal] = useState({
    open: false,
    item: null,
  });
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const actorName = "admin-ui";

  const ensureBranchSelected = useCallback(() => {
    const exists = branchId
      ? branches.some((branch) => branch.id === branchId)
      : false;
    if (!branchId || !exists) {
      setError("Vui lòng chọn chi nhánh trước khi thao tác kho");
      return false;
    }
    return true;
  }, [branchId, branches]);

  const refreshAvailability = async (productIds = []) => {
    if (!productIds.length) return;
    const availability = await getInventoryAvailability(productIds, branchId);
    const availabilityMap = (availability?.items || []).reduce((acc, inv) => {
      acc[inv.productId] = inv;
      return acc;
    }, {});
    setItems((prev) =>
      prev.map((item) => {
        const inv = availabilityMap[item.id];
        if (!inv) return item;
        const onHand = inv.onHand ?? item.stock;
        const reserved = inv.reserved ?? item.reserved ?? 0;
        const available = inv.available ?? Math.max(onHand - reserved, 0);
        return { ...item, stock: onHand, reserved, available };
      }),
    );
  };

  const createAndApproveStockDocument = async ({
    type,
    productId,
    quantity,
    reason,
    unitCost,
    skuSnapshot,
    batchNo,
    expiryDate,
  }) => {
    if (!branchId) {
      throw new Error("Vui lòng chọn chi nhánh trước khi thao tác kho");
    }
    const createPayload = {
      type,
      supplierName: null,
      supplierId: null,
      invoiceNo: null,
      reason: reason || "",
      createdBy: actorName,
      branchId: branchId || null,
      lines: [
        {
          productId,
          quantity,
          unitCost: unitCost ?? null,
          skuSnapshot: skuSnapshot || null,
          batchNo: batchNo || null,
          expiryDate: expiryDate || null,
        },
      ],
    };
    const created = await createStockDocument(createPayload);
    if (!created?.id) {
      throw new Error("Không thể tạo phiếu kho");
    }
    await submitStockDocument(created.id, actorName);
    await approveStockDocument(created.id, actorName);
    return created.id;
  };

  useEffect(() => {
    let active = true;
    const loadInventory = async () => {
      setLoading(true);
      setError("");
      try {
        const [categoryList, productPage] = await Promise.all([
          listCatalogCategories(),
          listCatalogProducts({
            page: 0,
            size: 200,
            branchId: branchId || undefined,
          }),
        ]);
        const products = productPage?.content || productPage?.items || [];
        const productIds = products.map((p) => p.id).filter(Boolean);
        const availability = await getInventoryAvailability(
          productIds,
          branchId,
        );
        const availabilityMap = (availability?.items || []).reduce(
          (acc, item) => {
            acc[item.productId] = item;
            return acc;
          },
          {},
        );
        const categoryMap = (categoryList || []).reduce((acc, c) => {
          acc[c.id] = c.name;
          return acc;
        }, {});

        const mapped = products.map((p) => {
          const attrs = parseAttributes(p.attributes);
          const threshold = Number(
            attrs.threshold ?? attrs.reorderPoint ?? attrs.minStock ?? 20,
          );
          const inventory = availabilityMap[p.id] || {};
          const onHand = inventory.onHand ?? 0;
          const reserved = inventory.reserved ?? 0;
          const available =
            inventory.available ?? Math.max(onHand - reserved, 0);
          return {
            id: p.id,
            name: p.name,
            sku: p.sku,
            slug: p.slug,
            stock: onHand,
            reserved,
            available,
            threshold: Number.isFinite(threshold) ? threshold : 20,
            unit: attrs.unit || "Hộp",
            price: p.effectivePrice ?? p.baseSalePrice ?? 0,
            costPrice: p.costPrice ?? 0,
            salePrice: p.baseSalePrice ?? 0,
            image: p.imageUrl,
            categoryId: p.categoryId,
            categoryLabel: categoryMap[p.categoryId] || "Chưa phân loại",
            catalogStatus: p.effectiveStatus || p.globalStatus || "ACTIVE",
            prescriptionRequired: !!p.prescriptionRequired,
            description: p.description || "",
            dosageForm: p.dosageForm || attrs.dosageForm || attrs.form || "",
            packaging: p.packaging || attrs.packaging || attrs.packing || "",
            activeIngredient:
              p.activeIngredient ||
              attrs.activeIngredient ||
              attrs.ingredient ||
              "",
            indications:
              p.indications || attrs.indications || attrs.usage || "",
            usageDosage:
              p.usageDosage || attrs.usageDosage || attrs.dosage || "",
            contraindicationsWarning:
              p.contraindicationsWarning ||
              attrs.contraindicationsWarning ||
              attrs.warning ||
              attrs.contraindications ||
              "",
            otherInformation:
              p.otherInformation ||
              attrs.otherInformation ||
              attrs.extraInfo ||
              "",
            imageUrl: p.imageUrl || "",
            attributes: attrs,
          };
        });

        if (active) {
          setCategories(categoryList || []);
          setItems(mapped);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Không thể tải dữ liệu kho");
          setItems(initialItems);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadInventory();
    return () => {
      active = false;
    };
  }, [branchId]);

  useEffect(() => {
    if (!branches.length) return;
    const exists = branchId
      ? branches.some((branch) => branch.id === branchId)
      : false;
    if (!branchId || !exists) {
      setBranchId(branches[0].id);
    }
  }, [branchId, branches, setBranchId]);

  useEffect(() => {
    if (!editModal.open || !editModal.item?.id) return;
    let active = true;
    const syncBranchStock = async () => {
      try {
        const availability = await getInventoryAvailability(
          [editModal.item.id],
          branchId,
        );
        const inv = (availability?.items || [])[0];
        const onHand = inv?.onHand ?? 0;
        if (active) {
          setEditModal((prev) => ({
            ...prev,
            newStock: Number.isFinite(onHand) ? onHand : prev.newStock,
          }));
        }
      } catch {
        // ignore: fallback keeps previous value
      }
    };
    syncBranchStock();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId, editModal.open, editModal.item?.id]);

  useEffect(() => {
    let active = true;
    const loadActivities = async () => {
      setActivityLoading(true);
      setActivityError("");
      try {
        const data = await listInventoryActivities({
          limit: 8,
          ...(branchId ? { branchId } : {}),
        });
        if (active) {
          const events = Array.isArray(data)
            ? data
            : data?.content || data?.items || [];
          setRecentActivityEvents(events);
        }
      } catch (err) {
        if (active) {
          setActivityError(err.message || "Không thể tải hoạt động kho");
        }
      } finally {
        if (active) setActivityLoading(false);
      }
    };

    loadActivities();
    return () => {
      active = false;
    };
  }, [branchId]);

  const enrichedItems = useMemo(
    () =>
      items.map((item) => {
        const status =
          item.stock <= 0 ? "out" : item.stock <= item.threshold ? "low" : "in";
        return {
          ...item,
          status,
          inventoryStatus: status,
          categoryLabel: item.categoryLabel || "Chưa phân loại",
          priceLabel: formatCurrency(item.price),
        };
      }),
    [items],
  );

  const filtered = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    return enrichedItems.filter((item) => {
      const matchQuery =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query);
      const matchCategory =
        filters.category === "all" || item.categoryId === filters.category;
      const matchStatus =
        filters.status === "all" || item.status === filters.status;
      return matchQuery && matchCategory && matchStatus;
    });
  }, [enrichedItems, filters]);

  useEffect(() => {
    setPage(0);
  }, [filters, pageSize, branchId]);

  const totalPages = useMemo(() => {
    const total = Math.ceil(filtered.length / Math.max(1, pageSize));
    return Math.max(1, total);
  }, [filtered.length, pageSize]);

  useEffect(() => {
    setPage((prev) => Math.min(Math.max(0, totalPages - 1), Math.max(0, prev)));
  }, [totalPages]);

  const pagedItems = useMemo(() => {
    const start = page * pageSize;
    const end = start + pageSize;
    return filtered.slice(start, end);
  }, [filtered, page, pageSize]);

  const warnings = useMemo(() => {
    const list = enrichedItems.filter((i) => i.status !== "in");
    const outCount = list.filter((i) => i.status === "out").length;
    const lowCount = list.filter((i) => i.status === "low").length;
    return {
      list,
      outCount,
      lowCount,
      total: list.length,
    };
  }, [enrichedItems]);

  const inventoryStats = useMemo(() => {
    const totalProducts = enrichedItems.length;
    const totalOnHand = enrichedItems.reduce(
      (sum, item) => sum + Number(item.stock || 0),
      0,
    );
    const totalValue = enrichedItems.reduce(
      (sum, item) => sum + Number(item.stock || 0) * Number(item.price || 0),
      0,
    );
    const warningCount = warnings.total;
    const outCount = warnings.outCount;

    return [
      {
        key: "products",
        label: "Sản phẩm trong kho",
        value: totalProducts.toLocaleString("vi-VN"),
        description: "SKU đang theo dõi theo chi nhánh hiện tại",
        icon: "inventory_2",
      },
      {
        key: "onhand",
        label: "Tổng tồn on-hand",
        value: totalOnHand.toLocaleString("vi-VN"),
        description: "Số lượng vật lý hiện có",
        icon: "warehouse",
      },
      {
        key: "warning",
        label: "Mức cảnh báo",
        value: warningCount.toLocaleString("vi-VN"),
        description: `Hết hàng: ${outCount.toLocaleString("vi-VN")}`,
        icon: "warning",
        tone: outCount > 0 ? "down" : warningCount > 0 ? "neutral" : "up",
      },
      {
        key: "value",
        label: "Giá trị tồn kho",
        value: formatCurrency(totalValue),
        description: "Ước tính theo giá bán hiện tại",
        icon: "payments",
      },
    ];
  }, [enrichedItems, warnings.outCount, warnings.total]);

  const resolveDownloadName = (contentDisposition) => {
    if (!contentDisposition) return "inventory-report.xlsx";
    const match = /filename\*?=(?:UTF-8'')?"?([^;"\n]+)"?/i.exec(
      contentDisposition,
    );
    if (!match) return "inventory-report.xlsx";
    try {
      return decodeURIComponent(match[1]);
    } catch {
      return match[1];
    }
  };

  const handleExport = async () => {
    if (!ensureBranchSelected()) return;
    setExporting(true);
    setError("");
    try {
      const params = {
        branchId,
        ...(filters.query ? { q: filters.query.trim() } : {}),
        ...(filters.category !== "all" ? { categoryId: filters.category } : {}),
        ...(filters.status !== "all" ? { status: filters.status } : {}),
      };
      const response = await exportStockReport(params);
      const filename = resolveDownloadName(
        response?.headers?.["content-disposition"],
      );
      const blob = new Blob([response.data], {
        type:
          response?.headers?.["content-type"] ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Không thể xuất báo cáo");
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCatalogProduct(id);
      await deleteInventoryItem(id, branchId);
      setItems((prev) => prev.filter((i) => i.id !== id));
      const refreshed = await listInventoryActivities({
        limit: 8,
        ...(branchId ? { branchId } : {}),
      });
      const events = Array.isArray(refreshed)
        ? refreshed
        : refreshed?.content || refreshed?.items || [];
      setRecentActivityEvents(events);
    } catch (err) {
      setError(err.message || "Không thể xóa khỏi kho");
    }
  };

  const handleUpdateStock = async (id, newStock, options = {}) => {
    const current = items.find((i) => i.id === id);
    if (!current) return;
    const delta = newStock - current.stock;
    if (!Number.isFinite(delta) || delta === 0) return;

    const previousStock = current.stock;
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const reserved = i.reserved || 0;
        const available = Math.max((newStock || 0) - reserved, 0);
        return { ...i, stock: newStock, available };
      }),
    );

    try {
      const reasonOverride = options?.reason;
      await createAndApproveStockDocument({
        type: "ADJUST",
        productId: id,
        quantity: delta,
        reason: reasonOverride || "Điều chỉnh từ màn hình kho",
        unitCost: current.costPrice ?? null,
        skuSnapshot: current.sku,
        batchNo: options?.batchNo,
        expiryDate: options?.expiryDate,
      });
      await refreshAvailability([id]);
      const refreshed = await listInventoryActivities({
        limit: 8,
        ...(branchId ? { branchId } : {}),
      });
      const events = Array.isArray(refreshed)
        ? refreshed
        : refreshed?.content || refreshed?.items || [];
      setRecentActivityEvents(events);
    } catch (err) {
      setItems((prev) =>
        prev.map((i) => {
          if (i.id !== id) return i;
          const reserved = i.reserved || 0;
          const available = Math.max((previousStock || 0) - reserved, 0);
          return { ...i, stock: previousStock, available };
        }),
      );
      setError(err.message || "Không thể cập nhật tồn kho");
    }
  };

  const handleQuickAdjust = (direction) => {
    if (!branchId) {
      setError("Vui lòng chọn chi nhánh trước khi thao tác kho");
      return;
    }
    setStockModal({
      open: true,
      mode: direction,
      sku: "",
      qty: 10,
      reason: direction === "in" ? "Nhập kho" : "Xuất kho",
      batchNo: "",
      expiryDate: "",
    });
  };

  const submitStockModal = async () => {
    const sku = stockModal.sku.trim();
    if (!sku) return;
    const amount = Number(stockModal.qty || 0);
    if (!Number.isFinite(amount) || amount <= 0) return;
    const target = items.find((i) => i.sku === sku);
    if (!target) {
      setError("Không tìm thấy sản phẩm theo SKU đã nhập");
      return;
    }

    const currentOnHand = Number(target.stock || 0);
    const currentReserved = Number(target.reserved || 0);
    const currentAvailable =
      target.available ?? Math.max(currentOnHand - currentReserved, 0);
    if (stockModal.mode === "out" && amount > currentAvailable) {
      setError("Số lượng xuất vượt quá số lượng sẵn có");
      return;
    }

    const nextStock =
      stockModal.mode === "in"
        ? currentOnHand + amount
        : currentOnHand - amount;
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== target.id) return i;
        const reserved = i.reserved || 0;
        const available = Math.max((nextStock || 0) - reserved, 0);
        return { ...i, stock: nextStock, available };
      }),
    );

    try {
      await createAndApproveStockDocument({
        type: stockModal.mode === "in" ? "IN" : "OUT",
        productId: target.id,
        quantity: amount,
        reason:
          stockModal.reason ||
          (stockModal.mode === "in" ? "Nhập kho" : "Xuất kho"),
        unitCost: target.costPrice ?? null,
        skuSnapshot: target.sku,
        batchNo: stockModal.batchNo,
        expiryDate: stockModal.expiryDate || null,
      });
      await refreshAvailability([target.id]);
      const refreshed = await listInventoryActivities({
        limit: 8,
        ...(branchId ? { branchId } : {}),
      });
      const events = Array.isArray(refreshed)
        ? refreshed
        : refreshed?.content || refreshed?.items || [];
      setRecentActivityEvents(events);
      setStockModal((prev) => ({ ...prev, open: false }));
    } catch (err) {
      setItems((prev) =>
        prev.map((i) => {
          if (i.id !== target.id) return i;
          const reserved = i.reserved || 0;
          const available = Math.max((currentOnHand || 0) - reserved, 0);
          return { ...i, stock: currentOnHand, available };
        }),
      );
      setError(err.message || "Không thể cập nhật tồn kho");
    }
  };

  const openEditModal = (item) => {
    if (!ensureBranchSelected()) return;
    setEditModal({
      open: true,
      item,
      name: item.name,
      sku: item.sku,
      categoryId: item.categoryId || "",
      costPrice: item.costPrice ?? 0,
      salePrice: item.salePrice ?? 0,
      unit: item.unit || "",
      threshold: item.threshold ?? 20,
      status: item.catalogStatus || item.status || "ACTIVE",
      rx: !!item.prescriptionRequired,
      imageUrl: item.imageUrl || "",
      description: item.description || "",
      dosageForm: item.dosageForm || "",
      packaging: item.packaging || "",
      activeIngredient: item.activeIngredient || "",
      indications: item.indications || "",
      usageDosage: item.usageDosage || "",
      contraindicationsWarning: item.contraindicationsWarning || "",
      otherInformation: item.otherInformation || "",
      newStock: item.stock,
      reason: "Điều chỉnh tồn kho",
      batchNo: "",
      expiryDate: "",
    });
  };

  const openAddModal = () => {
    if (!ensureBranchSelected()) return;
    setAddModal((prev) => ({
      ...prev,
      open: true,
    }));
  };

  const openDetailModal = (item) => {
    if (!item) return;
    setDetailModal({ open: true, item });
  };

  const submitAddModal = async () => {
    if (!ensureBranchSelected()) return;
    if (!addModal.name || !addModal.sku || !addModal.categoryId) {
      setError("Vui lòng nhập đầy đủ tên, SKU và danh mục");
      return;
    }
    try {
      const slug = slugify(addModal.name);
      const attributes = JSON.stringify({
        unit: addModal.unit || "Hộp",
        threshold: Number(addModal.threshold || 0) || 20,
      });
      void attributes;
      const payload = {
        sku: addModal.sku,
        name: addModal.name,
        slug,
        categoryId: addModal.categoryId,
        costPrice: Number(addModal.costPrice || 0),
        salePrice: Number(addModal.salePrice || 0),
        status: addModal.status || "ACTIVE",
        prescriptionRequired: !!addModal.rx,
        description: addModal.description || "",
        dosageForm: addModal.dosageForm || "",
        packaging: addModal.packaging || "",
        activeIngredient: addModal.activeIngredient || "",
        indications: addModal.indications || "",
        usageDosage: addModal.usageDosage || "",
        contraindicationsWarning: addModal.contraindicationsWarning || "",
        otherInformation: addModal.otherInformation || "",
        imageUrl: addModal.imageUrl || "",
        attributes: JSON.stringify(buildMedicineAttributes(addModal)),
      };
      const created = await createCatalogProduct(payload);

      if (created?.id) {
        await upsertCatalogBranchSetting(created.id, {
          branchId,
          status: addModal.status || "ACTIVE",
          priceOverride: null,
          note: null,
        });
      }

      const categoryLabel =
        categories.find((c) => c.id === addModal.categoryId)?.name ||
        "Chưa phân loại";
      const newItem = {
        id: created?.id,
        name: created?.name || addModal.name,
        sku: created?.sku || addModal.sku,
        slug: created?.slug || slug,
        stock: 0,
        reserved: 0,
        available: 0,
        threshold: Number(addModal.threshold || 0) || 20,
        unit: addModal.unit || "Hộp",
        price: Number(addModal.salePrice || 0),
        costPrice: Number(addModal.costPrice || 0),
        salePrice: Number(addModal.salePrice || 0),
        image: addModal.imageUrl || "",
        categoryId: addModal.categoryId,
        categoryLabel,
        catalogStatus: addModal.status || "ACTIVE",
        prescriptionRequired: !!addModal.rx,
        description: addModal.description || "",
        dosageForm: addModal.dosageForm || "",
        packaging: addModal.packaging || "",
        activeIngredient: addModal.activeIngredient || "",
        indications: addModal.indications || "",
        usageDosage: addModal.usageDosage || "",
        contraindicationsWarning: addModal.contraindicationsWarning || "",
        otherInformation: addModal.otherInformation || "",
        imageUrl: addModal.imageUrl || "",
        attributes: buildMedicineAttributes(addModal),
      };
      setItems((prev) => [newItem, ...prev]);

      const initialStock = Number(addModal.initialStock || 0);
      if (created?.id && initialStock > 0) {
        await createAndApproveStockDocument({
          type: "IN",
          productId: created.id,
          quantity: initialStock,
          reason: addModal.reason || "Nhập kho ban đầu",
          unitCost: Number(addModal.costPrice || 0),
          skuSnapshot: created?.sku || addModal.sku,
          batchNo: addModal.batchNo,
          expiryDate: addModal.expiryDate || null,
        });
        await refreshAvailability([created.id]);
      }

      const refreshed = await listInventoryActivities({
        limit: 8,
        ...(branchId ? { branchId } : {}),
      });
      const events = Array.isArray(refreshed)
        ? refreshed
        : refreshed?.content || refreshed?.items || [];
      setRecentActivityEvents(events);

      setAddModal({
        open: false,
        name: "",
        sku: "",
        categoryId: "",
        costPrice: 0,
        salePrice: 0,
        unit: "",
        threshold: 20,
        status: "ACTIVE",
        rx: false,
        imageUrl: "",
        description: "",
        dosageForm: "",
        packaging: "",
        activeIngredient: "",
        indications: "",
        usageDosage: "",
        contraindicationsWarning: "",
        otherInformation: "",
        initialStock: 0,
        reason: "",
        batchNo: "",
        expiryDate: "",
      });
    } catch (err) {
      setError(err.message || "Không thể thêm thuốc mới");
    }
  };

  const submitEditModal = async () => {
    if (!editModal.item) return;
    if (!ensureBranchSelected()) return;
    const target = editModal.item;
    const nextSlug = target.slug || slugify(editModal.name || target.name);
    const nextAttributes = {
      ...(target.attributes || {}),
      ...buildMedicineAttributes(editModal),
    };
    await updateCatalogProduct(target.id, {
      sku: editModal.sku || target.sku,
      name: editModal.name || target.name,
      slug: nextSlug,
      categoryId: editModal.categoryId || target.categoryId,
      costPrice: Number(editModal.costPrice || 0),
      salePrice: Number(editModal.salePrice || 0),
      status: editModal.status || target.status || "ACTIVE",
      prescriptionRequired: !!editModal.rx,
      description: editModal.description || target.description || "",
      dosageForm: editModal.dosageForm || target.dosageForm || "",
      packaging: editModal.packaging || target.packaging || "",
      activeIngredient:
        editModal.activeIngredient || target.activeIngredient || "",
      indications: editModal.indications || target.indications || "",
      usageDosage: editModal.usageDosage || target.usageDosage || "",
      contraindicationsWarning:
        editModal.contraindicationsWarning ||
        target.contraindicationsWarning ||
        "",
      otherInformation:
        editModal.otherInformation || target.otherInformation || "",
      imageUrl: editModal.imageUrl || target.imageUrl || "",
      attributes: JSON.stringify(nextAttributes),
    });

    await upsertCatalogBranchSetting(target.id, {
      branchId,
      status: editModal.status || target.status || "ACTIVE",
      priceOverride: null,
      note: null,
    });

    if (Number(editModal.newStock) !== target.stock) {
      await handleUpdateStock(target.id, Number(editModal.newStock || 0), {
        reason: editModal.reason || "Điều chỉnh tồn kho",
        batchNo: editModal.batchNo,
        expiryDate: editModal.expiryDate || null,
      });
    }

    const categoryLabel =
      categories.find((c) => c.id === editModal.categoryId)?.name ||
      target.categoryLabel;

    setItems((prev) =>
      prev.map((item) =>
        item.id === target.id
          ? {
              ...item,
              name: editModal.name || item.name,
              sku: editModal.sku || item.sku,
              categoryId: editModal.categoryId || item.categoryId,
              categoryLabel,
              costPrice: Number(editModal.costPrice || 0),
              salePrice: Number(editModal.salePrice || 0),
              price: Number(editModal.salePrice || 0),
              unit: editModal.unit || item.unit,
              threshold: Number(editModal.threshold || 0) || item.threshold,
              catalogStatus:
                editModal.status || item.catalogStatus || item.status,
              prescriptionRequired: !!editModal.rx,
              description: editModal.description || item.description,
              dosageForm: editModal.dosageForm || item.dosageForm,
              packaging: editModal.packaging || item.packaging,
              activeIngredient:
                editModal.activeIngredient || item.activeIngredient,
              indications: editModal.indications || item.indications,
              usageDosage: editModal.usageDosage || item.usageDosage,
              contraindicationsWarning:
                editModal.contraindicationsWarning ||
                item.contraindicationsWarning,
              otherInformation:
                editModal.otherInformation || item.otherInformation,
              imageUrl: editModal.imageUrl || item.imageUrl,
              attributes: nextAttributes,
            }
          : item,
      ),
    );

    setEditModal({
      open: false,
      item: null,
      name: "",
      sku: "",
      categoryId: "",
      costPrice: 0,
      salePrice: 0,
      unit: "",
      threshold: 20,
      status: "ACTIVE",
      rx: false,
      imageUrl: "",
      description: "",
      dosageForm: "",
      packaging: "",
      activeIngredient: "",
      indications: "",
      usageDosage: "",
      contraindicationsWarning: "",
      otherInformation: "",
      newStock: 0,
      reason: "",
      batchNo: "",
      expiryDate: "",
    });
  };

  const pagerBtn =
    "rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <AdminLayout activeKey="inventory">
      <AdminPageContainer>
        <AdminPageHeader
          title="Quản lý kho hàng"
          subtitle="Giám sát tồn kho, giá trị và nhập/xuất sản phẩm"
          actions={
            <>
              <button
                type="button"
                onClick={() => handleQuickAdjust("in")}
                className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <span className="material-symbols-outlined text-[20px]">
                  download
                </span>
                Nhập kho
              </button>

              <button
                type="button"
                onClick={() => handleQuickAdjust("out")}
                className="flex h-10 items-center justify-center gap-2 rounded-lg border border-primary bg-white px-4 text-sm font-medium text-primary shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <span className="material-symbols-outlined text-[20px]">
                  upload
                </span>
                Xuất kho
              </button>
            </>
          }
        />

        <StatsSection
          items={inventoryStats}
          loading={loading && !items.length}
          emptyText="Chưa có dữ liệu tổng quan kho"
        />

        <InventoryToolbar
          filters={filters}
          onChange={setFilters}
          categories={categories}
          branches={branches}
          branchId={branchId}
          onBranchChange={setBranchId}
          branchLoading={branchLoading}
          branchEmptyLabel="Chọn chi nhánh"
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          onReset={() => {
            setFilters({ query: "", category: "all", status: "all" });
            setPageSize(20);
          }}
          onAdd={openAddModal}
        />

        {branchError && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {branchError}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <AdminTableWrapper className="px-4 py-3 text-sm text-slate-600">
            Đang tải dữ liệu kho...
          </AdminTableWrapper>
        ) : filtered.length ? (
          <AdminTableWrapper className="overflow-hidden" padded={false}>
            <InventoryTable
              items={pagedItems}
              onDelete={handleDelete}
              onChangeStock={handleUpdateStock}
              onEdit={openEditModal}
              onViewDetail={openDetailModal}
            />
          </AdminTableWrapper>
        ) : (
          <AdminTableWrapper className="p-8 text-center">
            <p className="text-lg font-semibold text-slate-900">
              Không có sản phẩm nào phù hợp
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Thử thay đổi từ khóa hoặc bộ lọc.
            </p>
          </AdminTableWrapper>
        )}

        <AdminTableWrapper className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-500">
                Tổng {filtered.length.toLocaleString("vi-VN")} sản phẩm
              </span>

              {warnings.total > 0 ? (
                <button
                  type="button"
                  onClick={() => setWarningModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                  title="Xem danh sách cảnh báo"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    warning
                  </span>
                  <span>
                    Cảnh báo: Hết {warnings.outCount} · Sắp hết{" "}
                    {warnings.lowCount}
                  </span>
                </button>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                  <span className="material-symbols-outlined text-[16px]">
                    check_circle
                  </span>
                  Kho ổn định
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {exporting ? "Đang xuất..." : "Xuất báo cáo"}
              </button>

              <button
                type="button"
                className="h-9 rounded-lg bg-primary px-3 text-sm font-medium text-white hover:bg-primary/90"
              >
                Tạo phiếu kiểm kê
              </button>

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

      {addModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={() =>
              setAddModal({
                open: false,
                name: "",
                sku: "",
                categoryId: "",
                costPrice: 0,
                salePrice: 0,
                unit: "",
                threshold: 20,
                status: "ACTIVE",
                rx: false,
                imageUrl: "",
                description: "",
                dosageForm: "",
                packaging: "",
                activeIngredient: "",
                indications: "",
                usageDosage: "",
                contraindicationsWarning: "",
                otherInformation: "",
                initialStock: 0,
                reason: "",
                batchNo: "",
                expiryDate: "",
              })
            }
          />
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Thêm thuốc mới
            </h3>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <label className="text-xs text-slate-500">Chi nhánh</label>
                <div className="mt-1 h-9">
                  <BranchSelect
                    branches={branches}
                    value={branchId}
                    onChange={setBranchId}
                    loading={branchLoading}
                    emptyLabel="Chọn chi nhánh"
                    size="sm"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Tồn kho ban đầu/phiếu kho sẽ áp dụng cho chi nhánh này.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500">Tên thuốc</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                    value={addModal.name}
                    onChange={(e) =>
                      setAddModal((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">SKU</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                    value={addModal.sku}
                    onChange={(e) =>
                      setAddModal((prev) => ({ ...prev, sku: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500">Danh mục</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                    value={addModal.categoryId}
                    onChange={(e) =>
                      setAddModal((prev) => ({
                        ...prev,
                        categoryId: e.target.value,
                      }))
                    }
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Trạng thái</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                    value={addModal.status}
                    onChange={(e) =>
                      setAddModal((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                  >
                    <option value="ACTIVE">Đang bán</option>
                    <option value="INACTIVE">Ngưng bán</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500">Giá gốc</label>
                  <input
                    type="number"
                    min="0"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                    value={addModal.costPrice}
                    onChange={(e) =>
                      setAddModal((prev) => ({
                        ...prev,
                        costPrice: Number(e.target.value || 0),
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Giá bán</label>
                  <input
                    type="number"
                    min="0"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                    value={addModal.salePrice}
                    onChange={(e) =>
                      setAddModal((prev) => ({
                        ...prev,
                        salePrice: Number(e.target.value || 0),
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500">Đơn vị</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                    value={addModal.unit}
                    onChange={(e) =>
                      setAddModal((prev) => ({ ...prev, unit: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Định mức</label>
                  <input
                    type="number"
                    min="0"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                    value={addModal.threshold}
                    onChange={(e) =>
                      setAddModal((prev) => ({
                        ...prev,
                        threshold: Number(e.target.value || 0),
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500">
                    Tồn kho ban đầu
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                    value={addModal.initialStock}
                    onChange={(e) =>
                      setAddModal((prev) => ({
                        ...prev,
                        initialStock: Number(e.target.value || 0),
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">
                    Lý do nhập kho
                  </label>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                    value={addModal.reason}
                    onChange={(e) =>
                      setAddModal((prev) => ({
                        ...prev,
                        reason: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500">Số lô</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                    value={addModal.batchNo}
                    onChange={(e) =>
                      setAddModal((prev) => ({
                        ...prev,
                        batchNo: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Hạn sử dụng</label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                    value={addModal.expiryDate}
                    onChange={(e) =>
                      setAddModal((prev) => ({
                        ...prev,
                        expiryDate: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500">Ảnh URL</label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  value={addModal.imageUrl}
                  onChange={(e) =>
                    setAddModal((prev) => ({
                      ...prev,
                      imageUrl: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Mô tả</label>
                <textarea
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  value={addModal.description}
                  onChange={(e) =>
                    setAddModal((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs text-slate-500">Dạng bào chế</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                    value={addModal.dosageForm}
                    onChange={(e) =>
                      setAddModal((prev) => ({
                        ...prev,
                        dosageForm: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Quy cách</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                    value={addModal.packaging}
                    onChange={(e) =>
                      setAddModal((prev) => ({
                        ...prev,
                        packaging: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500">Thành phần chính</label>
                <textarea
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  value={addModal.activeIngredient}
                  onChange={(e) =>
                    setAddModal((prev) => ({
                      ...prev,
                      activeIngredient: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Công dụng</label>
                <textarea
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  value={addModal.indications}
                  onChange={(e) =>
                    setAddModal((prev) => ({
                      ...prev,
                      indications: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">
                  Cách dùng &amp; liều dùng
                </label>
                <textarea
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  value={addModal.usageDosage}
                  onChange={(e) =>
                    setAddModal((prev) => ({
                      ...prev,
                      usageDosage: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">
                  Chống chỉ định &amp; cảnh báo
                </label>
                <textarea
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  value={addModal.contraindicationsWarning}
                  onChange={(e) =>
                    setAddModal((prev) => ({
                      ...prev,
                      contraindicationsWarning: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Thông tin khác</label>
                <textarea
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  value={addModal.otherInformation}
                  onChange={(e) =>
                    setAddModal((prev) => ({
                      ...prev,
                      otherInformation: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-primary"
                  checked={addModal.rx}
                  onChange={(e) =>
                    setAddModal((prev) => ({
                      ...prev,
                      rx: e.target.checked,
                    }))
                  }
                />
                <span className="text-xs text-slate-600">Thuốc kê đơn</span>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm dark:border-slate-700"
                onClick={() =>
                  setAddModal({
                    open: false,
                    name: "",
                    sku: "",
                    categoryId: "",
                    costPrice: 0,
                    salePrice: 0,
                    unit: "",
                    threshold: 20,
                    status: "ACTIVE",
                    rx: false,
                    imageUrl: "",
                    description: "",
                    dosageForm: "",
                    packaging: "",
                    activeIngredient: "",
                    indications: "",
                    usageDosage: "",
                    contraindicationsWarning: "",
                    otherInformation: "",
                    initialStock: 0,
                    reason: "",
                    batchNo: "",
                    expiryDate: "",
                  })
                }
              >
                Hủy
              </button>
              <button
                className="rounded-lg bg-primary px-4 py-2 text-sm text-white"
                onClick={submitAddModal}
              >
                Tạo sản phẩm
              </button>
            </div>
          </div>
        </div>
      )}

      {stockModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setStockModal((prev) => ({ ...prev, open: false }))}
          />
          <div className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {stockModal.mode === "in" ? "Nhập kho" : "Xuất kho"}
            </h3>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <label className="text-xs text-slate-500">SKU</label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  value={stockModal.sku}
                  onChange={(e) =>
                    setStockModal((prev) => ({ ...prev, sku: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Số lượng</label>
                <input
                  type="number"
                  min="1"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  value={stockModal.qty}
                  onChange={(e) =>
                    setStockModal((prev) => ({
                      ...prev,
                      qty: Number(e.target.value || 0),
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Lý do</label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  value={stockModal.reason}
                  onChange={(e) =>
                    setStockModal((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500">Số lô</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                    value={stockModal.batchNo}
                    onChange={(e) =>
                      setStockModal((prev) => ({
                        ...prev,
                        batchNo: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Hạn sử dụng</label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                    value={stockModal.expiryDate}
                    onChange={(e) =>
                      setStockModal((prev) => ({
                        ...prev,
                        expiryDate: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm dark:border-slate-700"
                onClick={() =>
                  setStockModal((prev) => ({ ...prev, open: false }))
                }
              >
                Hủy
              </button>
              <button
                className="rounded-lg bg-primary px-4 py-2 text-sm text-white"
                onClick={submitStockModal}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {editModal.open && editModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={() =>
              setEditModal({
                open: false,
                item: null,
                name: "",
                sku: "",
                categoryId: "",
                costPrice: 0,
                salePrice: 0,
                unit: "",
                threshold: 20,
                status: "ACTIVE",
                rx: false,
                imageUrl: "",
                description: "",
                dosageForm: "",
                packaging: "",
                activeIngredient: "",
                indications: "",
                usageDosage: "",
                contraindicationsWarning: "",
                otherInformation: "",
                newStock: 0,
                reason: "",
                batchNo: "",
                expiryDate: "",
              })
            }
          />
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Điều chỉnh tồn kho
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {editModal.item.name} · SKU {editModal.item.sku}
            </p>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <label className="text-xs text-slate-500">Chi nhánh</label>
                <div className="mt-1 h-9">
                  <BranchSelect
                    branches={branches}
                    value={branchId}
                    onChange={setBranchId}
                    loading={branchLoading}
                    emptyLabel="Chọn chi nhánh"
                    size="sm"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Thay đổi chi nhánh sẽ cập nhật tồn kho hiển thị trong form.
                </p>
              </div>

              <div>
                <label className="text-xs text-slate-500">Tên thuốc</label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  value={editModal.name}
                  onChange={(e) =>
                    setEditModal((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500">SKU</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                    value={editModal.sku}
                    onChange={(e) =>
                      setEditModal((prev) => ({ ...prev, sku: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Danh mục</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                    value={editModal.categoryId}
                    onChange={(e) =>
                      setEditModal((prev) => ({
                        ...prev,
                        categoryId: e.target.value,
                      }))
                    }
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500">Giá gốc</label>
                  <input
                    type="number"
                    min="0"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                    value={editModal.costPrice}
                    onChange={(e) =>
                      setEditModal((prev) => ({
                        ...prev,
                        costPrice: Number(e.target.value || 0),
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Giá bán</label>
                  <input
                    type="number"
                    min="0"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                    value={editModal.salePrice}
                    onChange={(e) =>
                      setEditModal((prev) => ({
                        ...prev,
                        salePrice: Number(e.target.value || 0),
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500">Đơn vị</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                    value={editModal.unit}
                    onChange={(e) =>
                      setEditModal((prev) => ({
                        ...prev,
                        unit: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Định mức</label>
                  <input
                    type="number"
                    min="0"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                    value={editModal.threshold}
                    onChange={(e) =>
                      setEditModal((prev) => ({
                        ...prev,
                        threshold: Number(e.target.value || 0),
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500">Trạng thái</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                    value={editModal.status}
                    onChange={(e) =>
                      setEditModal((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                  >
                    <option value="ACTIVE">Đang bán</option>
                    <option value="INACTIVE">Ngưng bán</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-primary"
                    checked={editModal.rx}
                    onChange={(e) =>
                      setEditModal((prev) => ({
                        ...prev,
                        rx: e.target.checked,
                      }))
                    }
                  />
                  <span className="text-xs text-slate-600">Thuốc kê đơn</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500">Ảnh URL</label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  value={editModal.imageUrl}
                  onChange={(e) =>
                    setEditModal((prev) => ({
                      ...prev,
                      imageUrl: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Tồn kho mới</label>
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  value={editModal.newStock}
                  onChange={(e) =>
                    setEditModal((prev) => ({
                      ...prev,
                      newStock: Number(e.target.value || 0),
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Lý do</label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  value={editModal.reason}
                  onChange={(e) =>
                    setEditModal((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500">Số lô</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                    value={editModal.batchNo}
                    onChange={(e) =>
                      setEditModal((prev) => ({
                        ...prev,
                        batchNo: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Hạn sử dụng</label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                    value={editModal.expiryDate}
                    onChange={(e) =>
                      setEditModal((prev) => ({
                        ...prev,
                        expiryDate: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500">Mô tả</label>
                <textarea
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  value={editModal.description}
                  onChange={(e) =>
                    setEditModal((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs text-slate-500">Dạng bào chế</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                    value={editModal.dosageForm}
                    onChange={(e) =>
                      setEditModal((prev) => ({
                        ...prev,
                        dosageForm: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Quy cách</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                    value={editModal.packaging}
                    onChange={(e) =>
                      setEditModal((prev) => ({
                        ...prev,
                        packaging: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500">Thành phần chính</label>
                <textarea
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  value={editModal.activeIngredient}
                  onChange={(e) =>
                    setEditModal((prev) => ({
                      ...prev,
                      activeIngredient: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Công dụng</label>
                <textarea
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  value={editModal.indications}
                  onChange={(e) =>
                    setEditModal((prev) => ({
                      ...prev,
                      indications: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">
                  Cách dùng &amp; liều dùng
                </label>
                <textarea
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  value={editModal.usageDosage}
                  onChange={(e) =>
                    setEditModal((prev) => ({
                      ...prev,
                      usageDosage: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">
                  Chống chỉ định &amp; cảnh báo
                </label>
                <textarea
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  value={editModal.contraindicationsWarning}
                  onChange={(e) =>
                    setEditModal((prev) => ({
                      ...prev,
                      contraindicationsWarning: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Thông tin khác</label>
                <textarea
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  value={editModal.otherInformation}
                  onChange={(e) =>
                    setEditModal((prev) => ({
                      ...prev,
                      otherInformation: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm dark:border-slate-700"
                onClick={() =>
                  setEditModal({
                    open: false,
                    item: null,
                    name: "",
                    sku: "",
                    categoryId: "",
                    costPrice: 0,
                    salePrice: 0,
                    unit: "",
                    threshold: 20,
                    status: "ACTIVE",
                    rx: false,
                    imageUrl: "",
                    description: "",
                    dosageForm: "",
                    packaging: "",
                    activeIngredient: "",
                    indications: "",
                    usageDosage: "",
                    contraindicationsWarning: "",
                    otherInformation: "",
                    newStock: 0,
                    reason: "",
                    batchNo: "",
                    expiryDate: "",
                  })
                }
              >
                Hủy
              </button>
              <button
                className="rounded-lg bg-primary px-4 py-2 text-sm text-white"
                onClick={submitEditModal}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {detailModal.open && detailModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setDetailModal({ open: false, item: null })}
          />
          <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-lg font-semibold text-slate-900 dark:text-white">
                  Chi tiết sản phẩm
                </h3>
                <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                  {detailModal.item.name} · SKU {detailModal.item.sku}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailModal({ open: false, item: null })}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                title="Đóng"
              >
                <span className="material-symbols-outlined text-[18px]">
                  close
                </span>
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div
                className="h-14 w-14 shrink-0 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                style={{
                  backgroundImage: `url(${detailModal.item.image || detailModal.item.imageUrl || ""})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {detailModal.item.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {detailModal.item.categoryLabel || "Chưa phân loại"} ·{" "}
                  {detailModal.item.unit || ""}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Tồn kho
                </div>
                <div className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                  {detailModal.item.stock ?? 0}
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Sẵn dùng
                </div>
                <div className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                  {detailModal.item.available ??
                    Math.max(
                      (detailModal.item.stock || 0) -
                        (detailModal.item.reserved || 0),
                      0,
                    )}
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Giữ hàng
                </div>
                <div className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                  {detailModal.item.reserved ?? 0}
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Định mức
                </div>
                <div className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                  {detailModal.item.threshold ?? 0}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Giá bán
                </div>
                <div className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(
                    detailModal.item.salePrice ?? detailModal.item.price ?? 0,
                  )}
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Giá gốc
                </div>
                <div className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(detailModal.item.costPrice ?? 0)}
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm dark:border-slate-700"
                onClick={() => setDetailModal({ open: false, item: null })}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {warningModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setWarningModalOpen(false)}
          />
          <div className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Cảnh báo tồn kho
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Hết {warnings.outCount} · Sắp hết {warnings.lowCount}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setWarningModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                title="Đóng"
              >
                <span className="material-symbols-outlined text-[18px]">
                  close
                </span>
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {warnings.list.slice(0, 20).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800"
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-slate-900 dark:text-white">
                      {item.name}
                    </div>
                    <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                      SKU {item.sku} · Định mức {item.threshold}
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {item.stock} {item.unit}
                      </div>
                      <div
                        className={`text-[11px] font-semibold ${
                          item.status === "out"
                            ? "text-rose-600 dark:text-rose-300"
                            : "text-amber-700 dark:text-amber-200"
                        }`}
                      >
                        {item.status === "out" ? "Hết hàng" : "Sắp hết"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setWarningModalOpen(false);
                        openDetailModal(item);
                      }}
                      className="h-8 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50
                                 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      View detail
                    </button>
                  </div>
                </div>
              ))}
              {warnings.total === 0 && (
                <div className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  Kho ổn định, chưa có sản phẩm cần lưu ý.
                </div>
              )}
              {warnings.total > 20 && (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Đang hiển thị 20/{warnings.total} sản phẩm cảnh báo.
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm dark:border-slate-700"
                onClick={() => setWarningModalOpen(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminInventoryPage;
