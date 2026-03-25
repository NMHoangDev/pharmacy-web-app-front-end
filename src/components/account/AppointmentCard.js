import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import StatusBadge from "../appointments/StatusBadge";

const AppointmentCard = ({ appointment }) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState("");
  const [reminderOpen, setReminderOpen] = useState(false);
  const [reminderSet, setReminderSet] = useState(false);


  // Join Button Logic
  const isJoinable = () => {
    if (!appointment.startAt) return false;
    const now = new Date();
    const start = new Date(appointment.startAt);
    const end = new Date(appointment.endAt);
    const tenMinBefore = new Date(start.getTime() - 10 * 60000);
    const tenMinAfter = new Date(end.getTime() + 10 * 60000);
    
    // Status Logic
    const validStatuses = ["APPROVED", "CONFIRMED", "IN_PROGRESS"];
    if (!validStatuses.includes(appointment.status)) return false;

    return now >= tenMinBefore && now <= tenMinAfter;
  };

  useEffect(() => {
    if (!appointment.startAt) return;
    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(appointment.startAt);
      const diff = start - now;

      if (diff > 0 && diff < 60 * 60 * 1000) {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`);
      } else {
        setTimeLeft("");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [appointment.startAt]);

  // Reminder Logic
  useEffect(() => {
    const saved = localStorage.getItem(`reminder:${appointment.id}`);
    if (saved) setReminderSet(true);
  }, [appointment.id]);

  const handleSetReminder = (minutes) => {
    localStorage.setItem(`reminder:${appointment.id}`, JSON.stringify({ minutes, at: new Date().toISOString() }));
    setReminderSet(true);
    setReminderOpen(false);
    // In real app: Call API or Schedule Local Notification
  };

  const handleJoin = () => {
    if (["CANCELLED", "REJECTED", "COMPLETED"].includes(appointment.status)) return;
    navigate(`/consultation/${appointment.id}`, {
        state: { 
            appointmentId: appointment.id,
            pharmacistId: appointment.pharmacistId,
            channel: appointment.channel
        }
    });
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -2,  boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="group bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Column 1: Date & Time */}
            <div className="md:col-span-4 flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ngày hẹn</label>
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">event</span>
                    <span className="font-bold text-slate-900 dark:text-white text-base">
                        {new Date(appointment.startAt).toLocaleDateString("vi-VN", {
                            weekday: 'short', day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                    </span>
                </div>
                {timeLeft && (
                     <div className="mt-1 text-xs font-bold text-amber-600 flex items-center gap-1 animate-pulse">
                        <span className="material-symbols-outlined text-[14px]">timer</span>
                        Bắt đầu sau: {timeLeft}
                     </div>
                )}
                {appointment.notes && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1 italic">
                        "{appointment.notes}"
                    </p>
                )}
            </div>

            {/* Column 2: Status */}
            <div className="md:col-span-3 flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Trạng thái</label>
                <div className="flex items-start">
                    <StatusBadge status={appointment.status} />
                </div>
            </div>

            {/* Column 3: Pharmacist */}
            <div className="md:col-span-5 flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dược sĩ</label>
                {appointment.pharmacist ? (
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-slate-100 ring-2 ring-white dark:ring-slate-700 overflow-hidden shadow-sm flex items-center justify-center text-slate-500 font-bold uppercase">
                            {appointment.pharmacist.image ? (
                                <img src={appointment.pharmacist.image} alt={appointment.pharmacist.name} className="h-full w-full object-cover" />
                            ) : (
                                <span>{appointment.pharmacist.name?.charAt(0) || "D"}</span>
                            )}
                        </div>
                        <div className="flex flex-col">
                             <span className="font-bold text-sm text-slate-900 dark:text-white">{appointment.pharmacist.name}</span>
                             <span className="text-xs text-slate-500">{appointment.pharmacist.specialty || "Dược sĩ chuyên môn"}</span>
                        </div>
                    </div>
                ) : (
                    <span className="text-sm text-slate-500 italic">Đang phân công...</span>
                )}
            </div>
        </div>

        {/* Action Footer */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex justify-end gap-3">
             <button
                onClick={() => setReminderOpen(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    reminderSet 
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
             >
                <span className="material-symbols-outlined text-[16px]">{reminderSet ? "notifications_active" : "notifications_none"}</span>
                {reminderSet ? "Đã đặt nhắc" : "Nhắc lịch"}
             </button>

             <div className="relative group/tooltip">
                <button
                    onClick={handleJoin}
                    disabled={["CANCELLED", "REJECTED", "COMPLETED"].includes(appointment.status)}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all ${
                        !["CANCELLED", "REJECTED", "COMPLETED"].includes(appointment.status)
                        ? "bg-primary text-white hover:bg-primary/90 hover:shadow-md hover:-translate-y-0.5"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                >
                    <span className="material-symbols-outlined text-[16px]">
                        {appointment.channel === 'VIDEO' ? 'videocam' : appointment.channel === 'VOICE' ? 'call' : 'chat'}
                    </span>
                    Vào phòng tư vấn
                </button>
                {/* Tooltip */}
                {!["CANCELLED", "REJECTED", "COMPLETED"].includes(appointment.status) && (
                    <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {isJoinable() ? "Có thể bắt đầu cuộc gọi ngay" : "Bạn có thể vào phòng để chờ"}
                    </div>
                )}
                 {["CANCELLED", "REJECTED", "COMPLETED"].includes(appointment.status) && (
                    <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Đã kết thúc hoặc bị hủy
                    </div>
                )}
             </div>
        </div>
      </motion.div>

        {/* Reminder Modal */}
       <Dialog open={reminderOpen} onOpenChange={setReminderOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Đặt nhắc hẹn</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
             {[5, 15, 30, 60].map(min => (
                 <button
                    key={min}
                    onClick={() => handleSetReminder(min)}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all"
                 >
                    <span className="text-lg font-bold text-slate-700">{min}</span>
                    <span className="text-xs text-slate-500">phút trước</span>
                 </button>
             ))}
          </div>
          <DialogFooter>
            <button onClick={() => setReminderOpen(false)} className="text-sm text-slate-500 hover:text-slate-700">Hủy</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AppointmentCard;
