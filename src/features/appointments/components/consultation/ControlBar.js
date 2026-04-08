import React from "react";

const ControlBar = ({
  isAudioEnabled,
  isVideoEnabled,
  isScreenSharing,
  toggleAudio,
  toggleVideo,
  toggleScreenShare,
  onLeave,
  channel,
  disabled = false,
}) => {
  const canToggleVideo = !disabled && channel === "VIDEO" && !isScreenSharing;

  return (
    <footer className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-md z-50">
      <button
        onClick={toggleAudio}
        disabled={disabled}
        title={isAudioEnabled ? "Tắt mic" : "Bật mic"}
        className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
          !isAudioEnabled
            ? "bg-red-50 text-red-600 hover:bg-red-100"
            : "text-slate-600 hover:bg-slate-100"
        } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
      >
        <span className="material-symbols-outlined text-[20px]">
          {!isAudioEnabled ? "mic_off" : "mic"}
        </span>
      </button>

      <button
        onClick={toggleVideo}
        disabled={!canToggleVideo}
        title={isVideoEnabled ? "Tắt camera" : "Bật camera"}
        className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
          !isVideoEnabled
            ? "bg-red-50 text-red-600 hover:bg-red-100"
            : "text-slate-600 hover:bg-slate-100"
        } ${!canToggleVideo ? "opacity-40 cursor-not-allowed" : ""}`}
      >
        <span className="material-symbols-outlined text-[20px]">
          {!isVideoEnabled ? "videocam_off" : "videocam"}
        </span>
      </button>

      <button
        onClick={toggleScreenShare}
        disabled={disabled || channel !== "VIDEO"}
        title={isScreenSharing ? "Dừng chia sẻ màn hình" : "Chia sẻ màn hình"}
        className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
          isScreenSharing
            ? "bg-primary/10 text-primary"
            : "text-slate-600 hover:bg-slate-100"
        } ${disabled || channel !== "VIDEO" ? "opacity-40 cursor-not-allowed" : ""}`}
      >
        <span className="material-symbols-outlined text-[20px]">
          present_to_all
        </span>
      </button>

      <div className="w-px h-6 bg-slate-200 mx-1" />

      <button
        onClick={onLeave}
        className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">call_end</span>
        Kết thúc
      </button>
    </footer>
  );
};

export default ControlBar;
