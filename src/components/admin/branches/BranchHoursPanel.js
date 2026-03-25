import React, { useEffect, useMemo, useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";

const DAYS = [
  { key: "mon", label: "T2" },
  { key: "tue", label: "T3" },
  { key: "wed", label: "T4" },
  { key: "thu", label: "T5" },
  { key: "fri", label: "T6" },
  { key: "sat", label: "T7" },
  { key: "sun", label: "CN" },
];

const safeParseJsonObject = (value) => {
  if (!value || typeof value !== "string") return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

const defaultDay = () => ({
  open: false,
  openTime: "08:00",
  closeTime: "17:00",
});

const normalizeDay = (raw) => {
  if (!raw || typeof raw !== "object") return defaultDay();
  const openBool = typeof raw.open === "boolean" ? raw.open : null;

  const openTime =
    (typeof raw.openTime === "string" && raw.openTime) ||
    (typeof raw.open === "string" && raw.open) ||
    "08:00";
  const closeTime =
    (typeof raw.closeTime === "string" && raw.closeTime) ||
    (typeof raw.close === "string" && raw.close) ||
    "17:00";

  const inferredOpen =
    openBool != null
      ? openBool
      : Boolean(
          (typeof raw.openTime === "string" && raw.openTime) ||
          (typeof raw.closeTime === "string" && raw.closeTime) ||
          (typeof raw.open === "string" && raw.open) ||
          (typeof raw.close === "string" && raw.close),
        );

  return {
    open: inferredOpen,
    openTime,
    closeTime,
  };
};

const normalizeLunchBreak = (rawJson) => {
  const obj = safeParseJsonObject(rawJson);
  if (!obj) {
    return { enabled: false, start: "12:00", end: "13:00" };
  }
  const start =
    (typeof obj.start === "string" && obj.start) ||
    (typeof obj.from === "string" && obj.from) ||
    "12:00";
  const end =
    (typeof obj.end === "string" && obj.end) ||
    (typeof obj.to === "string" && obj.to) ||
    "13:00";
  const enabled = typeof obj.enabled === "boolean" ? obj.enabled : true;
  return { enabled, start, end };
};

const BranchHoursPanel = ({ state, onSave }) => {
  const { loading, error, data, saving, saveError } = state;
  const [weekly, setWeekly] = useState(() =>
    DAYS.reduce((acc, d) => {
      acc[d.key] = defaultDay();
      return acc;
    }, {}),
  );
  const [lunchEnabled, setLunchEnabled] = useState(false);
  const [lunchStart, setLunchStart] = useState("12:00");
  const [lunchEnd, setLunchEnd] = useState("13:00");
  const [parseWarning, setParseWarning] = useState("");

  useEffect(() => {
    if (!data) return;
    const parsedWeekly = safeParseJsonObject(data.weeklyHoursJson);
    if (
      !parsedWeekly &&
      data.weeklyHoursJson &&
      data.weeklyHoursJson.trim() &&
      data.weeklyHoursJson !== "{}"
    ) {
      setParseWarning(
        "Giờ làm hiện tại đang bị lỗi định dạng. Bạn có thể chỉnh lại và lưu để ghi đè dữ liệu.",
      );
    } else {
      setParseWarning("");
    }
    setWeekly((prev) => {
      const next = { ...prev };
      for (const d of DAYS) {
        next[d.key] = normalizeDay(parsedWeekly?.[d.key]);
      }
      return next;
    });

    const lunch = normalizeLunchBreak(data.lunchBreakJson);
    setLunchEnabled(!!lunch.enabled);
    setLunchStart(lunch.start);
    setLunchEnd(lunch.end);
  }, [data]);

  const validation = useMemo(() => {
    const errors = [];
    for (const d of DAYS) {
      const row = weekly[d.key];
      if (!row?.open) continue;
      if (!row.openTime || !row.closeTime) {
        errors.push(`${d.label}: cần chọn giờ mở/đóng`);
        continue;
      }
      if (row.openTime >= row.closeTime) {
        errors.push(`${d.label}: giờ mở phải < giờ đóng`);
      }
    }
    if (lunchEnabled) {
      if (!lunchStart || !lunchEnd) {
        errors.push("Nghỉ trưa: cần chọn giờ bắt đầu/kết thúc");
      } else if (lunchStart >= lunchEnd) {
        errors.push("Nghỉ trưa: giờ bắt đầu phải < giờ kết thúc");
      }
    }
    return {
      ok: errors.length === 0,
      errors,
    };
  }, [weekly, lunchEnabled, lunchStart, lunchEnd]);

  const copyMondayToOthers = () => {
    const mon = weekly.mon || defaultDay();
    setWeekly((prev) => {
      const next = { ...prev };
      for (const d of DAYS) {
        if (d.key === "mon") continue;
        next[d.key] = { ...mon };
      }
      return next;
    });
  };

  const buildPayload = () => {
    const weeklyHoursJson = JSON.stringify(
      DAYS.reduce((acc, d) => {
        const row = weekly[d.key] || defaultDay();
        acc[d.key] = {
          open: !!row.open,
          openTime: row.openTime || "08:00",
          closeTime: row.closeTime || "17:00",
        };
        return acc;
      }, {}),
    );

    const lunchBreakJson = lunchEnabled
      ? JSON.stringify({
          enabled: true,
          start: lunchStart || "12:00",
          end: lunchEnd || "13:00",
        })
      : null;

    return { weeklyHoursJson, lunchBreakJson };
  };

  if (loading) {
    return <div className="text-slate-500">Đang tải giờ làm...</div>;
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          {error}
        </div>
      ) : null}

      {saveError ? (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {saveError}
        </div>
      ) : null}

      {parseWarning ? (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          {parseWarning}
        </div>
      ) : null}

      {!validation.ok ? (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          <div className="font-semibold">Cần kiểm tra lại</div>
          <ul className="mt-1 list-disc pl-5 space-y-1">
            {validation.errors.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">
              Giờ làm theo tuần
            </div>
            <div className="text-xs text-slate-500">
              Bật “Mở” để nhập giờ mở/đóng.
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={copyMondayToOthers}
            disabled={saving}
          >
            Copy giờ T2 cho các ngày khác
          </Button>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {DAYS.map((d) => {
            const row = weekly[d.key] || defaultDay();
            return (
              <div
                key={d.key}
                className="px-4 py-3 grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-center"
              >
                <div className="sm:col-span-2 font-semibold text-slate-900 dark:text-white">
                  {d.label}
                </div>

                <div className="sm:col-span-3">
                  <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2">
                    <input
                      type="checkbox"
                      checked={!!row.open}
                      onChange={(e) =>
                        setWeekly((prev) => ({
                          ...prev,
                          [d.key]: { ...row, open: e.target.checked },
                        }))
                      }
                    />
                    <span className="text-sm text-slate-800 dark:text-slate-200">
                      {row.open ? "Mở" : "Đóng"}
                    </span>
                  </label>
                </div>

                <div className="sm:col-span-3">
                  <label className="block">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      Giờ mở
                    </span>
                    <Input
                      className="mt-1"
                      type="time"
                      value={row.openTime || ""}
                      disabled={!row.open || saving}
                      onChange={(e) =>
                        setWeekly((prev) => ({
                          ...prev,
                          [d.key]: { ...row, openTime: e.target.value },
                        }))
                      }
                    />
                  </label>
                </div>

                <div className="sm:col-span-3">
                  <label className="block">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      Giờ đóng
                    </span>
                    <Input
                      className="mt-1"
                      type="time"
                      value={row.closeTime || ""}
                      disabled={!row.open || saving}
                      onChange={(e) =>
                        setWeekly((prev) => ({
                          ...prev,
                          [d.key]: { ...row, closeTime: e.target.value },
                        }))
                      }
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">
              Nghỉ trưa
            </div>
            <div className="text-xs text-slate-500">
              Tùy chọn (không bắt buộc).
            </div>
          </div>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!lunchEnabled}
              onChange={(e) => setLunchEnabled(e.target.checked)}
              disabled={saving}
            />
            <span className="text-sm text-slate-800 dark:text-slate-200">
              Có nghỉ trưa
            </span>
          </label>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Bắt đầu
            </span>
            <Input
              className="mt-1"
              type="time"
              value={lunchStart}
              disabled={!lunchEnabled || saving}
              onChange={(e) => setLunchStart(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Kết thúc
            </span>
            <Input
              className="mt-1"
              type="time"
              value={lunchEnd}
              disabled={!lunchEnabled || saving}
              onChange={(e) => setLunchEnd(e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button
          onClick={() => onSave(buildPayload())}
          disabled={saving || !validation.ok}
        >
          {saving ? "Đang lưu..." : "Lưu giờ làm"}
        </Button>
      </div>
    </div>
  );
};

export default BranchHoursPanel;
