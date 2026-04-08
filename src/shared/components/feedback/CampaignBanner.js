import React, { useEffect, useMemo, useState } from "react";

const DISMISS_STORAGE_KEY = "campaign_banner_dismiss";

const safeParseJSON = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const parseEndTimeMs = (endDate) => {
  if (!endDate) return null;
  const d = new Date(endDate);
  const ms = d.getTime();
  return Number.isFinite(ms) ? ms : null;
};

const formatCountdown = (ms) => {
  if (!Number.isFinite(ms) || ms <= 0) return "00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const isDismissedForCampaign = (campaignId, endTimeMs) => {
  const raw = localStorage.getItem(DISMISS_STORAGE_KEY);
  const data = safeParseJSON(raw);
  if (!data || String(data.id) !== String(campaignId)) return false;

  const until = Number(data.untilMs || 0);
  const effectiveUntil = until || endTimeMs || 0;
  return effectiveUntil ? Date.now() < effectiveUntil : true;
};

const dismissCampaign = (campaignId, endTimeMs) => {
  const payload = { id: campaignId, untilMs: endTimeMs || null };
  localStorage.setItem(DISMISS_STORAGE_KEY, JSON.stringify(payload));
};

const CampaignBanner = ({ campaign }) => {
  const endTimeMs = useMemo(
    () => parseEndTimeMs(campaign?.endDate),
    [campaign],
  );
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!campaign?.id) {
      setDismissed(false);
      return;
    }
    setDismissed(isDismissedForCampaign(campaign.id, endTimeMs));
  }, [campaign, endTimeMs]);

  useEffect(() => {
    if (!campaign || !endTimeMs) return undefined;

    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, [campaign, endTimeMs]);

  const remainingMs = endTimeMs ? Math.max(0, endTimeMs - nowMs) : null;
  const shouldHide =
    !campaign || dismissed || (remainingMs !== null && remainingMs <= 0);
  if (shouldHide) return null;

  const message = campaign.displayText || campaign.name || "Ưu đãi";

  return (
    <div className="bg-red-500 text-white text-sm">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3">
        <div className="min-w-0 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">
            local_offer
          </span>
          <span className="font-semibold truncate">{message}</span>
          {remainingMs !== null ? (
            <span className="hidden sm:inline text-white/90">
              • Còn {formatCountdown(remainingMs)}
            </span>
          ) : null}
        </div>

        <button
          type="button"
          className="shrink-0 h-8 w-8 grid place-items-center rounded-lg hover:bg-white/15 transition"
          aria-label="Ẩn thông báo khuyến mãi"
          onClick={() => {
            dismissCampaign(campaign.id, endTimeMs);
            setDismissed(true);
          }}
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>
    </div>
  );
};

export default CampaignBanner;
