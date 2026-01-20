import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import CategoryToolbar from "../../../components/admin/categories/CategoryToolbar";
import CategoryTree from "../../../components/admin/categories/CategoryTree";
import CategoryEditor from "../../../components/admin/categories/CategoryEditor";

const slugify = (value) =>
  value
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") || `category-${Date.now()}`;

const getDescendants = (id, list) => {
  if (!id) return [];
  const children = list.filter((c) => c.parentId === id).map((c) => c.id);
  return children.reduce(
    (acc, childId) => acc.concat(childId, getDescendants(childId, list)),
    [],
  );
};

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [expanded, setExpanded] = useState(() => new Set());
  const [draft, setDraft] = useState(null);
  const [mode, setMode] = useState("edit");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === selectedId) || null,
    [categories, selectedId],
  );

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    return categories
      .filter((cat) => {
        const matchesQuery = query
          ? `${cat.name} ${cat.slug}`.toLowerCase().includes(query)
          : true;
        const matchesStatus =
          statusFilter === "all"
            ? true
            : statusFilter === "active"
              ? cat.active
              : !cat.active;
        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "name-desc":
            return b.name.localeCompare(a.name);
          case "order-asc":
            return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
          case "order-desc":
            return (b.sortOrder ?? 0) - (a.sortOrder ?? 0);
          case "created-desc":
            return (
              new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime()
            );
          case "name-asc":
          default:
            return a.name.localeCompare(b.name);
        }
      });
  }, [categories, search, statusFilter, sortBy]);

  const parentOptions = useMemo(() => {
    if (!draft || !draft.id) return categories;
    const invalidIds = new Set([
      draft.id,
      ...getDescendants(draft.id, categories),
    ]);
    return categories.filter((cat) => !invalidIds.has(cat.id));
  }, [categories, draft]);

  const loadCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/catalog/internal/categories");
      if (!response.ok) {
        const message = await readErrorMessage(
          response,
          "Không thể tải danh mục",
        );
        throw new Error(message);
      }
      const payload = await response.json();
      setCategories(payload || []);
      const fallback = payload?.[0]?.id || null;
      setSelectedId((prev) => {
        const exists = payload?.some((cat) => cat.id === prev);
        return exists ? prev : fallback;
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      setDraft({ ...selectedCategory });
      setMode("edit");
    }
  }, [selectedCategory]);

  const handleSelectCategory = (id) => {
    setSelectedId(id);
    setMode("edit");
  };

  const handleToggleExpand = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExpandAll = () => {
    const next = new Set();
    categories.forEach((cat) => next.add(cat.id));
    setExpanded(next);
  };

  const handleCollapseAll = () => setExpanded(new Set());

  const handleSave = async () => {
    if (!draft?.name?.trim()) {
      setError("Tên danh mục không được để trống.");
      return;
    }

    setLoading(true);
    setError("");

    const payload = {
      name: draft.name.trim(),
      slug: slugify(draft.slug || draft.name),
      description: draft.description?.trim() || "",
      active: !!draft.active,
      sortOrder: Number(draft.sortOrder || 0),
      parentId: draft.parentId || null,
    };

    try {
      const endpoint =
        mode === "create"
          ? "/api/catalog/internal/categories"
          : `/api/catalog/internal/categories/${draft.id}`;
      const response = await fetch(endpoint, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const message = await readErrorMessage(
          response,
          `Không thể ${mode === "create" ? "tạo" : "cập nhật"} danh mục`,
        );
        throw new Error(message);
      }
      const saved = await response.json();
      await loadCategories();
      setSelectedId(saved?.id || null);
      setMode("edit");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    const newDraft = {
      id: null,
      name: "Danh mục mới",
      slug: "",
      description: "",
      active: true,
      sortOrder: 0,
      parentId: selectedCategory?.id || null,
    };
    setDraft(newDraft);
    setMode("create");
    setSelectedId(null);
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;

    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/catalog/internal/categories/${selectedCategory.id}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        const message = await readErrorMessage(
          response,
          "Không thể xóa danh mục",
        );
        throw new Error(message);
      }
      await loadCategories();
      setSelectedId(null);
      setDraft(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredDraft = draft;

  return (
    <AdminLayout activeKey="categories">
      <div className="flex-1 bg-background-light p-6 dark:bg-background-dark min-h-[calc(100vh-96px)]">
        <div className="mx-auto max-w-7xl flex flex-col gap-4">
          <CategoryToolbar
            onAdd={handleAdd}
            onExpandAll={handleExpandAll}
            onCollapseAll={handleCollapseAll}
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            onRefresh={loadCategories}
            totalCount={filteredCategories.length}
          />
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}
          {loading && (
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              Đang tải danh mục...
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
            <div className="lg:col-span-5">
              <CategoryTree
                categories={filteredCategories}
                expanded={expanded}
                onToggleExpand={handleToggleExpand}
                onSelect={handleSelectCategory}
                selectedId={selectedId}
              />
            </div>
            <div className="lg:col-span-7">
              <CategoryEditor
                category={filteredDraft}
                parentOptions={parentOptions}
                onChange={(change) =>
                  setDraft((prev) => ({ ...prev, ...change }))
                }
                onSave={handleSave}
                onDelete={handleDelete}
                onCancel={() => {
                  if (selectedCategory) {
                    setDraft({ ...selectedCategory });
                    setMode("edit");
                  } else {
                    setDraft(null);
                  }
                }}
                mode={mode}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCategoriesPage;
