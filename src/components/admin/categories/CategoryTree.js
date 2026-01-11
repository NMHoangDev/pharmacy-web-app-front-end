import React, { useMemo } from "react";

const statusBadge = (status) => {
  if (status === "hidden")
    return (
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        Ẩn
      </span>
    );
  return (
    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
      Hiển thị
    </span>
  );
};

const CategoryNode = ({
  node,
  level,
  childrenMap,
  expanded,
  onToggleExpand,
  onSelect,
  selectedId,
}) => {
  const kids = childrenMap[node.id] || [];
  const isExpanded = expanded.has(node.id);
  const hasChildren = kids.length > 0;
  const isSelected = selectedId === node.id;

  return (
    <li>
      <div
        className={`group flex items-center gap-2 rounded-lg p-2 transition-colors cursor-pointer ${
          isSelected
            ? "bg-primary/10 ring-1 ring-primary/30 text-primary"
            : "hover:bg-background-light dark:hover:bg-slate-800 text-text-main dark:text-white"
        }`}
        onClick={() => onSelect(node.id)}
      >
        <span className="material-symbols-outlined text-[18px] text-slate-400 opacity-0 group-hover:opacity-100">
          drag_indicator
        </span>
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(node.id);
            }}
            className={`text-text-secondary dark:text-slate-400 transition-colors ${
              isSelected ? "text-primary" : ""
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isExpanded ? "expand_more" : "chevron_right"}
            </span>
          </button>
        ) : (
          <span className="w-5" />
        )}
        {hasChildren ? (
          <span className="material-symbols-outlined text-yellow-500 text-[20px]">
            folder
          </span>
        ) : (
          <span className="material-symbols-outlined text-[18px] text-slate-400">
            fiber_manual_record
          </span>
        )}
        <div className="flex-1">
          <p
            className={`text-sm font-medium flex items-center gap-2 ${
              isSelected ? "text-primary" : ""
            }`}
          >
            {node.name}
            {node.itemCount != null && (
              <span className="text-xs text-slate-400">
                {node.itemCount} sp
              </span>
            )}
          </p>
          {node.description && (
            <p className="text-xs text-text-secondary dark:text-slate-400 line-clamp-1">
              {node.description}
            </p>
          )}
        </div>
        {statusBadge(node.status)}
      </div>
      {hasChildren && isExpanded && (
        <ul className="ml-6 mt-1 space-y-1 border-l border-border-light pl-2 dark:border-border-dark">
          {kids.map((child) => (
            <CategoryNode
              key={child.id}
              node={child}
              level={level + 1}
              childrenMap={childrenMap}
              expanded={expanded}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const CategoryTree = ({
  categories,
  expanded,
  onToggleExpand,
  onSelect,
  selectedId,
}) => {
  const childrenMap = useMemo(() => {
    const map = {};
    categories.forEach((cat) => {
      const parentId = cat.parentId || "root";
      if (!map[parentId]) map[parentId] = [];
      map[parentId].push(cat);
    });
    Object.keys(map).forEach((key) => {
      map[key].sort((a, b) => a.name.localeCompare(b.name));
    });
    return map;
  }, [categories]);

  return (
    <div className="flex flex-col rounded-xl border border-border-light bg-surface-light shadow-sm dark:border-border-dark dark:bg-surface-dark overflow-hidden h-full">
      <div className="border-b border-border-light p-4 dark:border-border-dark flex justify-between items-center bg-gray-50 dark:bg-gray-800/40">
        <h3 className="font-semibold text-text-main dark:text-white">
          Cấu trúc danh mục
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {(childrenMap["root"] || []).map((cat) => (
            <CategoryNode
              key={cat.id}
              node={cat}
              level={0}
              childrenMap={childrenMap}
              expanded={expanded}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CategoryTree;
