import React from "react";
import { Skeleton } from "../ui/Skeleton";

const MedicineSkeleton = () => {
  return (
    <div className="flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden h-full">
      <div className="p-4 pb-0">
        <div className="w-full aspect-square bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-700 relative">
          <Skeleton className="w-24 h-24 rounded-full" />
           <div className="absolute top-3 right-3 w-16 h-6 rounded-full bg-slate-200 dark:bg-slate-700" />
           <div className="absolute bottom-3 left-3 w-12 h-6 rounded-lg bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>

      <div className="flex flex-col p-4 pt-4 gap-2 flex-grow">
        <Skeleton className="h-6 w-3/4 rounded-md" />
        <Skeleton className="h-6 w-1/2 rounded-md" />
        
        <div className="mt-2 flex flex-col gap-1">
          <Skeleton className="h-3 w-full rounded-md" />
          <div className="flex items-center gap-2 mt-1">
             <Skeleton className="h-3 w-1/3 rounded-md" />
             <Skeleton className="h-3 w-12 rounded-md" />
          </div>
        </div>
      </div>

      <div className="mt-auto p-4 border-t border-slate-50 dark:border-slate-800 flex flex-col gap-4">
        <div className="flex justify-between items-center">
             <div className="flex flex-col gap-1">
                <Skeleton className="h-3 w-8 rounded" />
                <Skeleton className="h-6 w-24 rounded" />
             </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="flex-1 h-10 rounded-xl" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export default MedicineSkeleton;
