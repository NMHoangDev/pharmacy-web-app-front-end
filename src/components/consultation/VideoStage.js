import React from "react";

const VideoStage = ({
  localStream,
  remoteStream,
  patientName,
  pharmacistName,
  role,
  isRemoteCamOff,
  isLocalCamOff,
}) => {
  const isPharmacist = role === "PHARMACIST";
  const remoteName = isPharmacist ? patientName : pharmacistName;
  const remoteLabel = isPharmacist ? "Bệnh nhân" : "Dược sĩ";

  return (
    <div className="flex-1 relative flex flex-col p-6 overflow-hidden">
      {/* Main Remote Video Area */}
      <div className="relative flex-1 bg-white rounded-[24px] overflow-hidden border border-slate-200 flex items-center justify-center shadow-lg group">
        {/* Remote Video Element */}
        {remoteStream && !isRemoteCamOff ? (
          <video
            ref={(el) => {
              if (el && el.srcObject !== remoteStream)
                el.srcObject = remoteStream;
            }}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          /* Fallback Avatar State */
          <div className="flex flex-col items-center gap-6">
            <div className="size-48 rounded-full bg-primary/20 flex items-center justify-center text-primary text-6xl font-bold">
              {remoteName?.charAt(0) || "BN"}
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-slate-900">
                {remoteName}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Đang chờ {remoteLabel.toLowerCase()} bật camera...
              </p>
            </div>
          </div>
        )}

        {/* Self View (Picture in Picture style) */}
        {!isLocalCamOff ? (
          <div className="absolute top-6 right-6 w-48 aspect-video bg-slate-900 rounded-xl border border-slate-200 shadow-lg overflow-hidden">
            <video
              ref={(el) => {
                if (el && el.srcObject !== localStream)
                  el.srcObject = localStream;
              }}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
              style={{ transform: "scaleX(-1)" }}
            />
            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] font-medium text-white">
              Bạn
            </div>
          </div>
        ) : (
          <div className="absolute top-6 right-6 w-48 aspect-video bg-slate-100 rounded-xl border border-slate-200 shadow-lg overflow-hidden">
            <div className="w-full h-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-3xl">
                person
              </span>
            </div>
            <div className="absolute bottom-2 left-2 bg-white/90 px-2 py-0.5 rounded text-[10px] font-medium text-slate-700 border border-slate-200">
              Bạn (Camera tắt)
            </div>
          </div>
        )}

        {/* Patient Name Tag via Remote Stream Label (optional) */}
        <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-white/95 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
          <span className="material-symbols-outlined text-primary text-sm">
            mic
          </span>
          <span className="text-sm font-medium text-slate-800">
            {remoteName}
          </span>
        </div>
      </div>

      {/* Meta Text (Bottom Left of Video) */}
      <div className="mt-4 flex items-center gap-3">
        <div className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
          <p className="text-slate-600 text-sm font-medium leading-none">
            {new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            <span className="mx-2 opacity-30">|</span>
            <span className="text-slate-800">IDs: ...</span>
          </p>
        </div>
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span className="text-[10px] uppercase font-bold text-red-500 tracking-tighter">
            Live
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoStage;
