import React from "react";
import { Skeleton } from "../../../shared/components/ui/Skeleton";

const MedicineSkeleton = () => {
  return (
    <div className="flex flex-col bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden h-full">
      <div className="p-2">
        <div className="w-full aspect-square bg-white dark:bg-slate-800 rounded-md overflow-hidden border border-slate-100 dark:border-slate-700 relative">
          <Skeleton className="absolute inset-0" />
          <div className="absolute top-2 left-2 w-10 h-4 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>

      <div className="px-2 pb-2 flex flex-col gap-2 flex-1">
        <div className="min-h-[1.25rem] flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-12 rounded" />
          <Skeleton className="h-4 w-10 rounded" />
        </div>

        <div className="space-y-1">
          <Skeleton className="h-4 w-4/5 rounded" />
          <Skeleton className="h-4 w-3/5 rounded" />
        </div>

        <Skeleton className="h-3 w-24 rounded" />

        <div className="mt-auto flex items-end justify-between gap-2">
          <div className="space-y-1">
            <Skeleton className="h-5 w-24 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineSkeleton;
