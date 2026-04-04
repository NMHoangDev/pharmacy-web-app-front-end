import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import AdminPageHeader from "../../../components/admin/shared/AdminPageHeader";
import StatsSection from "../../../components/admin/shared/StatsSection";
import AdminPageContainer from "../../../components/common/AdminPageContainer";
import AdminTableWrapper from "../../../components/common/AdminTableWrapper";
import DiscountFilters from "../../../components/admin/discounts/DiscountFilters";
import DiscountTable from "../../../components/admin/discounts/DiscountTable";
import DiscountModal from "../../../components/admin/discounts/DiscountModal";
import DiscountDetailDrawer from "../../../components/admin/discounts/DiscountDetailDrawer";
import {
  ScopeFilter,
  SortKey,
} from "../../../components/admin/discounts/discountTypes";
import {
  useCreateDiscountMutation,
  useDeleteDiscountMutation,
  useDiscountsQuery,
  useToggleDiscountStatusMutation,
  useUpdateDiscountMutation,
} from "../../../api/discounts/useDiscounts";
import { authApi as api } from "../../../api/httpClients";

const pagerBtn =
  "rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

const normalizeError = (err) => {
  const status = err?.status || err?.response?.status || 0;
  if (status === 409) {
    return "Mã khuyến mãi đã tồn tại. Vui lòng chọn mã khác.";
  }
  if (status === 403) {
    return "Bạn không có quyền truy cập tính năng này (403).";
  }
  if (status === 503) {
    return "Dịch vụ khuyến mãi đang bận/không khả dụng (503). Vui lòng thử lại sau.";
  }
  return err?.response?.data?.message || err?.message || "Có lỗi xảy ra.";
};

const AdminDiscountsPage = () => {
  const [categories, setCategories] = useState([]);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState(ScopeFilter.ALL);
  const [status, setStatus] = useState("ALL");
  const [type, setType] = useState("ALL");
  const [sort, setSort] = useState(SortKey.NEWEST);
  const [quickTab, setQuickTab] = useState("ALL");

  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create | edit
  const [editingDiscount, setEditingDiscount] = useState(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerDiscount, setDrawerDiscount] = useState(null);

  const [uiError, setUiError] = useState("");

  const discountsQuery = useDiscountsQuery();
  const createMutation = useCreateDiscountMutation();
  const updateMutation = useUpdateDiscountMutation();
  const deleteMutation = useDeleteDiscountMutation();
  const toggleMutation = useToggleDiscountStatusMutation();

  const loading = discountsQuery.isLoading;
  const discounts = useMemo(
    () => discountsQuery.data || [],
    [discountsQuery.data],
  );

  const categoryMap = useMemo(() => {
    const map = new Map();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  const discountStats = useMemo(() => {
    const total = discounts.length;
    const active = discounts.filter(
      (item) => String(item.status || "").toUpperCase() === "ACTIVE",
    ).length;
    const scheduled = discounts.filter(
      (item) => String(item.status || "").toUpperCase() === "SCHEDULED",
    ).length;
    const pausedOrExpired = discounts.filter((item) =>
      ["DISABLED", "EXPIRED", "CANCELED"].includes(
        String(item.status || "").toUpperCase(),
      ),
    ).length;

    return [
      {
        key: "total",
        label: "Tổng chương trình",
        value: total.toLocaleString("vi-VN"),
        description: "Khuyến mãi đang được quản lý",
        icon: "sell",
      },
      {
        key: "active",
        label: "Đang hiệu lực",
        value: active.toLocaleString("vi-VN"),
        description: "Đang áp dụng cho người dùng",
        icon: "check_circle",
        tone: active > 0 ? "up" : "neutral",
      },
      {
        key: "scheduled",
        label: "Đã lên lịch",
        value: scheduled.toLocaleString("vi-VN"),
        description: "Sắp bắt đầu trong thời gian tới",
        icon: "schedule",
      },
      {
        key: "inactive",
        label: "Tạm dừng / Hết hạn",
        value: pausedOrExpired.toLocaleString("vi-VN"),
        description: "Cần rà soát để dọn dẹp chiến dịch",
        icon: "pause_circle",
        tone: pausedOrExpired > 0 ? "neutral" : "up",
      },
    ];
  }, [discounts]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.get("/api/catalog/public/categories");
        setCategories(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.warn("Không thể tải danh mục", err);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(0);
  }, [searchInput, scope, status, type, sort, pageSize, quickTab]);

  useEffect(() => {
    if (discountsQuery.error) {
      setUiError(normalizeError(discountsQuery.error));
    }
  }, [discountsQuery.error]);

  const filteredDiscounts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const byQuickTab = (item) => {
      if (quickTab === "ALL") return true;
      return String(item.status) === String(quickTab);
    };

    const bySearch = (item) => {
      if (!query) return true;
      const hay =
        `${item.name || ""} ${item.code || ""} ${item.description || ""}`.toLowerCase();
      return hay.includes(query);
    };

    const byStatus = (item) => {
      if (!status || status === "ALL") return true;
      return String(item.status) === String(status);
    };

    const byType = (item) => {
      if (!type || type === "ALL") return true;
      return String(item.type) === String(type);
    };

    const byScope = (item) => {
      if (!scope || scope === ScopeFilter.ALL) return true;

      const scopes = Array.isArray(item.scopes) ? item.scopes : [];
      const hasAll = scopes.some((s) => String(s.scopeType) === "ALL");
      const hasProduct = scopes.some((s) => String(s.scopeType) === "PRODUCT");
      const hasCategory = scopes.some(
        (s) => String(s.scopeType) === "CATEGORY",
      );

      if (scope === ScopeFilter.SYSTEM) return hasAll || !scopes.length;
      if (scope === ScopeFilter.PRODUCT) return hasProduct;
      if (scope === ScopeFilter.CATEGORY) return hasCategory;
      return true;
    };

    const list = discounts
      .filter(byQuickTab)
      .filter(bySearch)
      .filter(byStatus)
      .filter(byType)
      .filter(byScope);

    const sorted = [...list].sort((a, b) => {
      const aCreated = new Date(a.createdAt || 0).getTime();
      const bCreated = new Date(b.createdAt || 0).getTime();
      const aEnd = new Date(a.endDate || 0).getTime();
      const bEnd = new Date(b.endDate || 0).getTime();

      if (sort === SortKey.EXPIRING_SOON) return aEnd - bEnd;
      if (sort === SortKey.HIGHEST_VALUE) {
        const aValue = Number(a.value || 0);
        const bValue = Number(b.value || 0);
        return bValue - aValue;
      }
      return bCreated - aCreated;
    });

    return sorted;
  }, [discounts, search, scope, status, type, sort, quickTab]);

  const totalElements = filteredDiscounts.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
  const safePage = Math.min(Math.max(0, page), Math.max(0, totalPages - 1));

  const pagedDiscounts = useMemo(() => {
    const start = safePage * pageSize;
    return filteredDiscounts.slice(start, start + pageSize);
  }, [filteredDiscounts, safePage, pageSize]);

  const openCreateModal = () => {
    setModalMode("create");
    setEditingDiscount(null);
    setModalOpen(true);
  };

  const openEditModal = (discount) => {
    setModalMode("edit");
    setEditingDiscount(discount);
    setModalOpen(true);
  };

  const openViewDrawer = (discount) => {
    setDrawerDiscount(discount);
    setDrawerOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingDiscount(null);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerDiscount(null);
  };

  const handleSave = async (payload, meta) => {
    setUiError("");

    try {
      if (meta.mode === "edit") {
        await updateMutation.mutateAsync({ id: meta.id, payload });
        window.alert("Cập nhật khuyến mãi thành công");
      } else {
        await createMutation.mutateAsync(payload);
        window.alert("Tạo khuyến mãi thành công");
      }
      closeModal();
    } catch (err) {
      setUiError(normalizeError(err));
    }
  };

  const handleDelete = async (discount) => {
    if (!discount?.id) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa khuyến mãi này?")) {
      return;
    }

    setUiError("");
    try {
      await deleteMutation.mutateAsync(discount.id);
    } catch (err) {
      setUiError(normalizeError(err));
    }
  };

  const handleToggleStatus = async (discount) => {
    if (!discount?.id) return;
    setUiError("");

    const current = String(discount.status);

    const computeEnabledStatus = () => {
      const now = new Date();
      const start = discount.startDate ? new Date(discount.startDate) : null;
      const end = discount.endDate ? new Date(discount.endDate) : null;

      if (start && now < start) return "SCHEDULED";
      if (end && now > end) return "EXPIRED";
      return "ACTIVE";
    };

    const desired =
      current === "DISABLED" ? computeEnabledStatus() : "DISABLED";

    try {
      await toggleMutation.mutateAsync({ id: discount.id, status: desired });
    } catch (err) {
      setUiError(normalizeError(err));
    }
  };

  return (
    <AdminLayout activeKey="discounts">
      <AdminPageContainer>
        <AdminPageHeader
          title="Quản lý khuyến mãi"
          subtitle="Quản lý chương trình giảm giá, phạm vi áp dụng và thời gian hiệu lực"
          actions={
            <button
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              type="button"
              onClick={openCreateModal}
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Tạo khuyến mãi
            </button>
          }
        />
        <StatsSection
          items={discountStats}
          loading={loading && !discounts.length}
          emptyText="Chưa có dữ liệu tổng quan khuyến mãi"
        />

        <DiscountFilters
          search={searchInput}
          onSearchChange={setSearchInput}
          scope={scope}
          onScopeChange={setScope}
          status={status}
          onStatusChange={setStatus}
          type={type}
          onTypeChange={setType}
          sort={sort}
          onSortChange={setSort}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          quickTab={quickTab}
          onQuickTabChange={setQuickTab}
          onReset={() => {
            setSearchInput("");
            setSearch("");
            setScope(ScopeFilter.ALL);
            setStatus("ALL");
            setType("ALL");
            setSort(SortKey.NEWEST);
            setQuickTab("ALL");
            setPageSize(10);
          }}
        />

        {loading ? (
          <AdminTableWrapper className="px-4 py-3 text-sm text-slate-600">
            Đang tải dữ liệu khuyến mãi...
          </AdminTableWrapper>
        ) : (
          <DiscountTable
            discounts={pagedDiscounts}
            categoryMap={categoryMap}
            onView={openViewDrawer}
            onEdit={openEditModal}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        )}

        <AdminTableWrapper className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-slate-500">
              Tổng {totalElements.toLocaleString("vi-VN")} chương trình
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={pagerBtn}
                disabled={safePage <= 0}
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              >
                Trước
              </button>
              <span className="text-sm text-slate-600">
                Trang {Math.max(1, safePage + 1)} / {Math.max(1, totalPages)}
              </span>
              <button
                type="button"
                className={pagerBtn}
                disabled={safePage >= Math.max(0, totalPages - 1)}
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

      <DiscountModal
        open={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        initialData={editingDiscount}
        mode={modalMode}
        categories={categories}
      />

      <DiscountDetailDrawer
        open={drawerOpen}
        discount={drawerDiscount}
        categoryMap={categoryMap}
        onClose={closeDrawer}
      />
    </AdminLayout>
  );
};

export default AdminDiscountsPage;
