import React from "react";

const STATUS_META = {
  VERIFIED: {
    label: "Verified",
    className:
      "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-900/40",
  },
  PENDING: {
    label: "Pending",
    className:
      "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-900/40",
  },
  SUSPENDED: {
    label: "Suspended",
    className:
      "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-900/40",
  },
};

const resolveStatus = (status, verified) => {
  const normalized = String(status || "").toUpperCase();
  if (normalized === "SUSPENDED") return "SUSPENDED";
  if (verified) return "VERIFIED";
  return "PENDING";
};

const StatusBadge = React.memo(function StatusBadge({ status, verified }) {
  const key = resolveStatus(status, verified);
  const meta = STATUS_META[key];
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${meta.className}`}
    >
      {meta.label}
    </span>
  );
});

export { resolveStatus };
export default StatusBadge;
