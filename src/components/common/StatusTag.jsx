import React from "react";

const STYLE_MAP = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  inactive: "bg-slate-100 text-slate-600 ring-slate-400/20",
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  danger: "bg-rose-50 text-rose-700 ring-rose-600/20",
  info: "bg-sky-50 text-sky-700 ring-sky-600/20",
};

const StatusTag = ({ label, tone = "inactive" }) => {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset ${STYLE_MAP[tone] || STYLE_MAP.inactive}`}
    >
      {label}
    </span>
  );
};

export default StatusTag;