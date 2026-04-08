import React, { useMemo, useState } from "react";
import { Skeleton } from "../../../../shared/components/ui/Skeleton";
import StatusBadge from "./StatusBadge";

const TAB_KEYS = ["overview", "schedule", "certifications", "activity"];

const PharmacistDrawer = React.memo(function PharmacistDrawer({
  open,
  pharmacist,
  loading,
  error,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [visitedTabs, setVisitedTabs] = useState(new Set(["overview"]));

  const setTab = (tab) => {
    setActiveTab(tab);
    setVisitedTabs((prev) => new Set([...prev, tab]));
  };

  const languages = useMemo(
    () =>
      Array.isArray(pharmacist?.languages)
        ? pharmacist.languages.join(", ")
        : "-",
    [pharmacist?.languages],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30">
      <div className="absolute right-0 top-0 h-full w-full max-w-[840px] bg-white dark:bg-slate-900 shadow-sm border-l border-slate-200 dark:border-slate-800">
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-200 px-4 py-4 dark:border-slate-800">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={
                    pharmacist?.avatarUrl || "https://i.pravatar.cc/120?img=12"
                  }
                  alt={pharmacist?.name || "Pharmacist"}
                  className="h-12 w-12 rounded-md object-cover"
                />
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {pharmacist?.name || "Pharmacist detail"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {pharmacist?.email || pharmacist?.phone || "-"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Close
              </button>
            </div>
            <div className="mt-3 inline-flex">
              <StatusBadge
                status={pharmacist?.status}
                verified={pharmacist?.verified}
              />
            </div>
          </div>

          <div className="border-b border-slate-200 px-4 py-2 dark:border-slate-800">
            <div className="flex gap-2">
              {TAB_KEYS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setTab(tab)}
                  className={`rounded-md px-3 py-1.5 text-sm capitalize ${
                    activeTab === tab
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : error ? (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-300">
                {error}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {activeTab === "overview" && visitedTabs.has("overview") ? (
                  <>
                    <InfoItem
                      label="Specialization"
                      value={pharmacist?.specialty || "-"}
                    />
                    <InfoItem
                      label="Experience"
                      value={`${pharmacist?.experienceYears ?? 0} years`}
                    />
                    <InfoItem
                      label="Branch"
                      value={pharmacist?.branchName || "-"}
                    />
                    <InfoItem
                      label="Created"
                      value={pharmacist?.createdAt || "-"}
                    />
                    <InfoItem label="Phone" value={pharmacist?.phone || "-"} />
                    <InfoItem
                      label="License"
                      value={pharmacist?.licenseNumber || "-"}
                    />
                    <InfoItem
                      label="Education"
                      value={pharmacist?.education || "-"}
                    />
                    <InfoItem label="Languages" value={languages} />
                  </>
                ) : null}

                {activeTab === "schedule" && visitedTabs.has("schedule") ? (
                  <InfoItem
                    label="Working Schedule"
                    value={
                      pharmacist?.availability ||
                      pharmacist?.workingHours ||
                      "-"
                    }
                  />
                ) : null}

                {activeTab === "certifications" &&
                visitedTabs.has("certifications") ? (
                  <InfoItem
                    label="Certifications"
                    value={
                      pharmacist?.certifications ||
                      pharmacist?.licenseNumber ||
                      "No certification records"
                    }
                  />
                ) : null}

                {activeTab === "activity" && visitedTabs.has("activity") ? (
                  <InfoItem
                    label="Recent Activity"
                    value={
                      pharmacist?.lastActivity || "No activity logs available"
                    }
                  />
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

function InfoItem({ label, value }) {
  return (
    <div className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">
        {String(value || "-")}
      </p>
    </div>
  );
}

export default PharmacistDrawer;
