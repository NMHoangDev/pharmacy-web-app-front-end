import React from "react";

const InfoRow = ({ icon, label, value, subvalue }) => (
  <div className="flex items-start gap-3">
    <span className="material-symbols-outlined text-[18px] text-slate-500 mt-0.5">
      {icon}
    </span>
    <div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value}</p>
      {subvalue ? (
        <p className="text-xs text-slate-500 mt-0.5">{subvalue}</p>
      ) : null}
    </div>
  </div>
);

const PharmacistProfileCard = ({ pharmacist }) => {
  const safePharmacist = pharmacist ?? {
    name: "Dược sĩ",
    specialty: "Tư vấn dược",
    verified: false,
    verifiedText: "Chưa xác thực",
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80",
    workingHours: "08:00 - 17:00",
    workingDays: "Thứ 2 - Thứ 7",
    languages: "Tiếng Việt",
    education: "Đang cập nhật",
    branchName: "Chưa gắn chi nhánh",
    online: false,
  };

  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <img
          src={safePharmacist.image}
          alt={safePharmacist.name}
          className="h-16 w-16 rounded-lg border border-slate-200 object-cover"
        />

        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-slate-900 leading-6 line-clamp-2">
            {safePharmacist.name}
          </h3>
          <p className="mt-0.5 text-sm text-slate-600 line-clamp-1">
            {safePharmacist.specialty}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={[
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                safePharmacist.online
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-600",
              ].join(" ")}
            >
              <span
                className={[
                  "h-2 w-2 rounded-full",
                  safePharmacist.online ? "bg-emerald-500" : "bg-slate-400",
                ].join(" ")}
              />
              {safePharmacist.online ? "Đang online" : "Tạm offline"}
            </span>

            <span
              className={[
                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                safePharmacist.verified
                  ? "bg-blue-50 text-blue-700"
                  : "bg-slate-100 text-slate-600",
              ].join(" ")}
            >
              {safePharmacist.verified
                ? safePharmacist.verifiedText || "Đã xác thực"
                : "Chưa xác thực"}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-4 border-t border-slate-200 pt-4">
        <InfoRow
          icon="storefront"
          label="Chi nhánh"
          value={safePharmacist.branchName || "Chưa gắn chi nhánh"}
        />
        <InfoRow
          icon="schedule"
          label="Giờ làm việc"
          value={safePharmacist.workingHours}
          subvalue={safePharmacist.workingDays}
        />
        <InfoRow
          icon="language"
          label="Ngôn ngữ"
          value={safePharmacist.languages}
        />
        <InfoRow
          icon="school"
          label="Học vấn"
          value={safePharmacist.education}
        />
      </div>

      <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        Tư vấn 1-1 bảo mật, ưu tiên giải pháp phù hợp với tình trạng sức khỏe
        của bạn.
      </div>
    </aside>
  );
};

export default PharmacistProfileCard;
