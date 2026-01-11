import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import CategoryToolbar from "../../../components/admin/categories/CategoryToolbar";
import CategoryTree from "../../../components/admin/categories/CategoryTree";
import CategoryEditor from "../../../components/admin/categories/CategoryEditor";

const initialCategories = [
  {
    id: "cat-1",
    name: "Thuốc",
    parentId: null,
    status: "active",
    description: "Nhóm chính cho các loại thuốc kê đơn và không kê đơn.",
    itemCount: 340,
  },
  {
    id: "cat-1-1",
    name: "Thuốc kê đơn",
    parentId: "cat-1",
    status: "active",
    description: "Yêu cầu đơn của bác sĩ, quản lý chặt chẽ.",
    itemCount: 145,
  },
  {
    id: "cat-1-2",
    name: "Thuốc không kê đơn",
    parentId: "cat-1",
    status: "active",
    description: "Có thể bán trực tiếp cho khách hàng tại quầy.",
    itemCount: 88,
  },
  {
    id: "cat-1-2-1",
    name: "Giảm đau",
    parentId: "cat-1-2",
    status: "active",
    description: "Nhóm thuốc giảm đau, hạ sốt thông dụng.",
    itemCount: 32,
  },
  {
    id: "cat-1-2-2",
    name: "Cảm cúm",
    parentId: "cat-1-2",
    status: "hidden",
    description: "Sản phẩm hỗ trợ điều trị cảm lạnh và cúm.",
    itemCount: 18,
  },
  {
    id: "cat-2",
    name: "Thực phẩm chức năng",
    parentId: null,
    status: "active",
    description: "Bổ sung vitamin, khoáng chất và dinh dưỡng.",
    itemCount: 96,
  },
  {
    id: "cat-3",
    name: "Thiết bị y tế",
    parentId: null,
    status: "active",
    description: "Thiết bị theo dõi sức khỏe và vật tư tiêu hao.",
    itemCount: 42,
  },
];

const getDescendants = (id, list) => {
  const children = list.filter((c) => c.parentId === id).map((c) => c.id);
  return children.reduce(
    (acc, childId) => acc.concat(childId, getDescendants(childId, list)),
    []
  );
};

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState(initialCategories);
  const [selectedId, setSelectedId] = useState(initialCategories[0].id);
  const [expanded, setExpanded] = useState(() => new Set(["cat-1", "cat-1-2"]));
  const [draft, setDraft] = useState(() => initialCategories[0]);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === selectedId) || null,
    [categories, selectedId]
  );

  useEffect(() => {
    if (selectedCategory) {
      setDraft(selectedCategory);
    }
  }, [selectedCategory]);

  const parentOptions = useMemo(() => {
    if (!selectedCategory) return categories;
    const invalidIds = new Set([
      selectedCategory.id,
      ...getDescendants(selectedCategory.id, categories),
    ]);
    return categories.filter((cat) => !invalidIds.has(cat.id));
  }, [categories, selectedCategory]);

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
    categories.forEach((cat) => {
      const hasChild = categories.some((c) => c.parentId === cat.id);
      if (hasChild) next.add(cat.id);
    });
    setExpanded(next);
  };

  const handleCollapseAll = () => setExpanded(new Set());

  const handleSave = () => {
    if (!draft.name.trim()) return;
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === draft.id
          ? { ...cat, ...draft, name: draft.name.trim() }
          : cat
      )
    );
  };

  const handleAdd = () => {
    const newId = `cat-${Date.now()}`;
    const newCat = {
      id: newId,
      name: "Danh mục mới",
      parentId: null,
      status: "active",
      description: "",
      itemCount: 0,
      image: "",
    };
    setCategories((prev) => [newCat, ...prev]);
    setExpanded((prev) => new Set(prev).add("root"));
    setSelectedId(newId);
  };

  const handleDelete = () => {
    if (!selectedCategory) return;
    const idsToRemove = [
      selectedCategory.id,
      ...getDescendants(selectedCategory.id, categories),
    ];
    const remaining = categories.filter((cat) => !idsToRemove.includes(cat.id));
    setCategories(remaining);
    const fallback = remaining[0]?.id || null;
    setSelectedId(fallback);
    if (fallback)
      setExpanded((prev) => new Set(prev).add(remaining[0].parentId || ""));
  };

  const filteredDraft = selectedCategory ? draft : null;

  return (
    <AdminLayout activeKey="categories">
      <div className="flex-1 overflow-hidden bg-background-light p-6 dark:bg-background-dark">
        <div className="mx-auto max-w-7xl flex flex-col h-full">
          <CategoryToolbar
            onAdd={handleAdd}
            onExpandAll={handleExpandAll}
            onCollapseAll={handleCollapseAll}
          />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-220px)] min-h-[640px]">
            <div className="lg:col-span-5 h-full">
              <CategoryTree
                categories={categories}
                expanded={expanded}
                onToggleExpand={handleToggleExpand}
                onSelect={setSelectedId}
                selectedId={selectedId}
              />
            </div>
            <div className="lg:col-span-7 h-full">
              <CategoryEditor
                category={filteredDraft}
                parentOptions={parentOptions}
                onChange={(change) =>
                  setDraft((prev) => ({ ...prev, ...change }))
                }
                onSave={handleSave}
                onDelete={handleDelete}
                onCancel={() => selectedCategory && setDraft(selectedCategory)}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCategoriesPage;
