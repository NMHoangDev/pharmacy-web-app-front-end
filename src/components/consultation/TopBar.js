import React from "react";
import { useNavigate } from "react-router-dom";

const TopBar = ({
  role,
  pharmacistName,
  patientName,
  connectionQuality = "high",
}) => {
  const navigate = useNavigate();
  const isPharmacist = role === "PHARMACIST";

  return (
    <header className="w-full bg-white border-b border-slate-200 px-6 py-2 z-50">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined filled-icon">
              medical_services
            </span>
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight text-slate-900">
              Phòng Tư vấn Trực tuyến
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              {isPharmacist ? "Bệnh nhân" : "Dược sĩ"}:{" "}
              {isPharmacist ? patientName : pharmacistName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-200">
          <span className="material-symbols-outlined text-primary text-sm">
            signal_cellular_alt
          </span>
          <p className="text-xs text-slate-600">
            {connectionQuality === "high"
              ? "Kết nối ổn định. Chất lượng video HD đang được tối ưu."
              : "Kết nối không ổn định."}
          </p>
          <div className="flex gap-3 ml-2">
            <button className="text-primary text-xs font-bold hover:underline">
              Xem chi tiết
            </button>
            <button className="text-slate-400 hover:text-slate-700 transition-colors">
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full border-2 border-white bg-primary/90 flex items-center justify-center text-[10px] font-bold text-white">
              {(isPharmacist ? patientName : "Bạn")?.charAt(0) || "BN"}
            </div>
          </div>
          <span className="text-xs font-medium text-slate-700">
            {isPharmacist ? "Bệnh nhân" : "Bạn"}:{" "}
            {isPharmacist ? patientName : ""}
          </span>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
