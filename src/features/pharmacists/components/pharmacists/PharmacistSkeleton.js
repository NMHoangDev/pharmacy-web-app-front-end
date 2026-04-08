import React from "react";
import { Skeleton } from "../../../../shared/components/ui/Skeleton";

const PharmacistSkeleton = () => {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 gap-4 shadow-sm">
      <div className="flex gap-4">
        {/* Avatar Skeleton */}
        <Skeleton className="size-14 rounded-lg shrink-0" />

        <div className="flex-1 flex flex-col gap-2">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-28 rounded-md" />
            <Skeleton className="h-5 w-12 rounded-md" />
          </div>
          <Skeleton className="h-4 w-20 rounded-md" />
          <div className="flex gap-2 mt-1">
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-5 w-20 rounded-md" />
          </div>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-3">
        <Skeleton className="h-10 rounded-xl" />
        <Skeleton className="h-10 rounded-xl" />
      </div>
    </div>
  );
};

export default PharmacistSkeleton;
