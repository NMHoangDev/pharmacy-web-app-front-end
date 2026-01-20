import React from "react";

const PharmacistProfileCard = ({ pharmacist }) => {
  const safePharmacist = pharmacist ?? {
    name: "Dược sĩ Lan",
    specialty: "Chuyên khoa Dược lý",
    verifiedText: "Đã xác thực chuyên môn",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBTidUbsxzYttvUhrQ3fSXseJVq_AcqBQPIeNTsoS_KdEv7lx3v8tQ5LIOPlJsFTyjrSAmwVo750vortZDckvjFVlbDzjgaeSlU7qz8ByiNx5DGykd8QHqORQ9LfXcwCkw5dyabj_hnDbPnpSK7WwfHl__-k-9pX3ve8D-y2w7ezYC-LYSBGilTvcRQwi0GlxvARTyn5fPVdEYCzuCg0gHJDL9pK3NdOf6rUdsJL-uE52J7OJ1uIvnkVKQgELJ0-puFAA-b7tAzV2PN",
    workingHours: "08:00 - 17:00",
    workingDays: "Thứ 2 - Thứ 7",
    languages: "Tiếng Việt, English",
    education: "Đại học Dược Hà Nội",
    online: true,
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4">
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-32 border-4 border-slate-50 dark:border-slate-800 shadow-sm"
            style={{ backgroundImage: `url('${safePharmacist.image}')` }}
          />
          <div
            className={`absolute bottom-1 right-1 border-2 border-white dark:border-slate-900 rounded-full p-1 ${
              safePharmacist.online ? "bg-green-500" : "bg-slate-400"
            }`}
            title={safePharmacist.online ? "Online" : "Offline"}
          >
            <div className="size-2.5 bg-white rounded-full" />
          </div>
        </div>

        <h3 className="text-slate-900 dark:text-white text-xl font-bold leading-tight mb-1">
          {safePharmacist.name}
        </h3>
        <p className="text-primary text-sm font-medium bg-primary/10 px-3 py-1 rounded-full mb-3">
          {safePharmacist.specialty}
        </p>

        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm mb-6">
          <span className="material-symbols-outlined text-[18px] text-primary">
            verified
          </span>
          <span>{safePharmacist.verifiedText}</span>
        </div>

        <div className="w-full h-px bg-slate-100 dark:bg-slate-800 mb-6" />

        <div className="w-full flex flex-col gap-4 text-left">
          <div className="flex items-start gap-3">
            <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined">schedule</span>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                Giờ làm việc
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {safePharmacist.workingHours}
              </p>
              <p className="text-xs text-slate-400">
                {safePharmacist.workingDays}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined">language</span>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                Ngôn ngữ
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {safePharmacist.languages}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined">school</span>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                Học vấn
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {safePharmacist.education}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacistProfileCard;
