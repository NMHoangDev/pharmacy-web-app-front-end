import React from "react";
import ActionDropdown from "./ActionDropdown";
import StatusBadge from "./StatusBadge";

const formatDate = (input) => {
  if (!input) return "-";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
  }).format(date);
};

const PharmacistRow = React.memo(function PharmacistRow({
  item,
  selected,
  onSelect,
  onOpenDrawer,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-800/40">
      <td className="px-3 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={(event) => onSelect(item.id, event.target.checked)}
          className="h-4 w-4 rounded border-slate-300"
        />
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-3">
          <img
            src={item.avatarUrl || "https://i.pravatar.cc/80?img=12"}
            alt={item.name}
            className="h-9 w-9 rounded-md object-cover"
          />
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {item.name}
            </p>
            <p className="text-xs text-slate-500">
              {item.email || item.phone || item.id}
            </p>
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-200">
        {item.specialty || "-"}
      </td>
      <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-200">
        {item.experienceYears ?? 0}
      </td>
      <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-200">
        {item.branchName || "-"}
      </td>
      <td className="px-3 py-3">
        <StatusBadge status={item.status} verified={item.verified} />
      </td>
      <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-200">
        {item.availability || "-"}
      </td>
      <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-200">
        {formatDate(item.createdAt)}
      </td>
      <td className="px-3 py-3">
        <label className="inline-flex items-center gap-2 text-xs text-slate-500">
          <input
            type="checkbox"
            checked={String(item.status || "").toUpperCase() !== "SUSPENDED"}
            onChange={() => onToggleStatus(item)}
            className="h-4 w-7 rounded-full border-slate-300"
          />
          {String(item.status || "").toUpperCase() === "SUSPENDED"
            ? "Off"
            : "On"}
        </label>
      </td>
      <td className="px-3 py-3">
        <ActionDropdown
          onView={() => onOpenDrawer(item)}
          onEdit={() => onEdit(item)}
          onToggleStatus={() => onToggleStatus(item)}
          onDelete={() => onDelete(item)}
        />
      </td>
    </tr>
  );
});

export default PharmacistRow;
