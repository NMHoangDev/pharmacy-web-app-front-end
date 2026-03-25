import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppointmentCard from "./AppointmentCard";
import { Skeleton } from "../ui/Skeleton";

const AppointmentList = ({ appointments, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
             <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                 <div className="md:col-span-4 space-y-2">
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-6 w-40 rounded" />
                 </div>
                 <div className="md:col-span-3 space-y-2">
                    <Skeleton className="h-4 w-16 rounded" />
                    <Skeleton className="h-8 w-24 rounded-full" />
                 </div>
                 <div className="md:col-span-5 space-y-2">
                     <Skeleton className="h-4 w-16 rounded" />
                     <div className="flex gap-3">
                        <Skeleton className="size-10 rounded-full" />
                         <div className="space-y-1">
                            <Skeleton className="h-4 w-32 rounded" />
                            <Skeleton className="h-3 w-24 rounded" />
                         </div>
                     </div>
                 </div>
             </div>
          </div>
        ))}
      </div>
    );
  }

  if (!appointments || appointments.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 border-dashed">
              <div className="size-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[32px] text-slate-400">calendar_today</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Chưa có lịch hẹn nào</h3>
              <p className="text-sm text-slate-500">Đặt lịch tư vấn ngay với dược sĩ của chúng tôi.</p>
          </div>
      )
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {appointments.map((apt) => (
          <AppointmentCard key={apt.id} appointment={apt} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AppointmentList;
