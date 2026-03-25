import React, { useEffect, useMemo, useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";

const safeParseJson = (value) => {
  if (!value || typeof value !== "string") return { ok: true, value: null };
  const trimmed = value.trim();
  if (!trimmed) return { ok: true, value: null };
  try {
    return { ok: true, value: JSON.parse(trimmed) };
  } catch {
    return { ok: false, value: null };
  }
};

const isValidTimeHHmm = (value) => {
  if (!value) return true;
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
};

const toNonNegativeIntOrNull = (value) => {
  const n = toIntOrNull(value);
  if (n == null) return null;
  return n < 0 ? null : n;
};

const toIntOrNull = (value) => {
  if (value === "" || value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : null;
};

const toBool = (value) => !!value;

const defaultsFromData = (data) => ({
  slotDurationMinutes: data?.slotDurationMinutes ?? 30,
  bufferBeforeMinutes: data?.bufferBeforeMinutes ?? 0,
  bufferAfterMinutes: data?.bufferAfterMinutes ?? 0,
  leadTimeMinutes: data?.leadTimeMinutes ?? 0,
  cutoffTime: data?.cutoffTime || "",
  maxBookingsPerPharmacistPerDay: data?.maxBookingsPerPharmacistPerDay ?? "",
  maxBookingsPerCustomerPerWeek: data?.maxBookingsPerCustomerPerWeek ?? "",
  channelsJson: data?.channelsJson ?? "",
  pricingJson: data?.pricingJson ?? "",
  pickupEnabled: data?.pickupEnabled ?? true,
  deliveryEnabled: data?.deliveryEnabled ?? false,
  deliveryZonesJson: data?.deliveryZonesJson ?? "",
  shippingFeeRulesJson: data?.shippingFeeRulesJson ?? "",
  defaultWarehouseCode: data?.defaultWarehouseCode ?? "",
  allowNegativeStock: data?.allowNegativeStock ?? false,
  defaultReorderPoint: data?.defaultReorderPoint ?? 20,
  enableFefo: data?.enableFefo ?? true,
});

const BranchSettingsPanel = ({ state, onSave }) => {
  const { loading, error, data, saving, saveError } = state;
  const [form, setForm] = useState(() => defaultsFromData(null));
  const [showAdvancedDelivery, setShowAdvancedDelivery] = useState(false);

  useEffect(() => {
    setForm(defaultsFromData(data));
  }, [data]);

  const validations = useMemo(() => {
    const errors = [];

    const slot = Number(form.slotDurationMinutes);
    if (![15, 20, 30, 60].includes(slot)) {
      errors.push("Slot duration chỉ hỗ trợ: 15/20/30/60.");
    }

    const numberFields = [
      { key: "bufferBeforeMinutes", label: "Buffer trước" },
      { key: "bufferAfterMinutes", label: "Buffer sau" },
      { key: "leadTimeMinutes", label: "Lead time" },
      {
        key: "maxBookingsPerPharmacistPerDay",
        label: "Max booking/dược sĩ/ngày",
      },
      { key: "maxBookingsPerCustomerPerWeek", label: "Max booking/khách/tuần" },
      { key: "defaultReorderPoint", label: "Default reorder point" },
    ];
    for (const f of numberFields) {
      const raw = form[f.key];
      if (raw === "" || raw == null) continue;
      const n = Number(raw);
      if (!Number.isFinite(n) || n < 0) {
        errors.push(`${f.label} phải là số >= 0.`);
      }
    }

    if (!isValidTimeHHmm(form.cutoffTime)) {
      errors.push("Cutoff time không đúng định dạng HH:mm.");
    }

    const jsonFields = [
      { key: "channelsJson", label: "Channels JSON" },
      { key: "pricingJson", label: "Pricing JSON" },
    ];
    for (const jf of jsonFields) {
      const parsed = safeParseJson(form[jf.key]);
      if (!parsed.ok) errors.push(`${jf.label} không phải JSON hợp lệ.`);
    }

    if (form.deliveryEnabled) {
      const dz = safeParseJson(form.deliveryZonesJson);
      const sf = safeParseJson(form.shippingFeeRulesJson);
      if (!dz.ok) errors.push("Delivery zones JSON không phải JSON hợp lệ.");
      if (!sf.ok)
        errors.push("Shipping fee rules JSON không phải JSON hợp lệ.");
    }

    return { ok: errors.length === 0, errors };
  }, [form]);

  const canSave = useMemo(() => {
    return validations.ok;
  }, [validations.ok]);

  const preview = useMemo(() => {
    const slot = Number(form.slotDurationMinutes);
    const before = Number(form.bufferBeforeMinutes || 0);
    const after = Number(form.bufferAfterMinutes || 0);

    const channels = safeParseJson(form.channelsJson);
    const pricing = safeParseJson(form.pricingJson);
    const deliveryZones = safeParseJson(form.deliveryZonesJson);
    const shippingRules = safeParseJson(form.shippingFeeRulesJson);

    const zonesCount =
      deliveryZones.ok &&
      deliveryZones.value &&
      Array.isArray(deliveryZones.value.zones)
        ? deliveryZones.value.zones.length
        : null;
    const rulesCount =
      shippingRules.ok &&
      shippingRules.value &&
      Array.isArray(shippingRules.value.rules)
        ? shippingRules.value.rules.length
        : null;

    return {
      slot,
      before,
      after,
      lead: Number(form.leadTimeMinutes || 0),
      cutoff: form.cutoffTime || null,
      channelsOk: channels.ok,
      pricingOk: pricing.ok,
      deliveryEnabled: !!form.deliveryEnabled,
      pickupEnabled: !!form.pickupEnabled,
      zonesCount,
      rulesCount,
      allowNegativeStock: !!form.allowNegativeStock,
      enableFefo: !!form.enableFefo,
      reorderPoint: Number(form.defaultReorderPoint || 0),
    };
  }, [form]);

  const submit = () => {
    if (!canSave) return;

    const deliveryEnabled = toBool(form.deliveryEnabled);

    onSave({
      slotDurationMinutes: toIntOrNull(form.slotDurationMinutes),
      bufferBeforeMinutes: toNonNegativeIntOrNull(form.bufferBeforeMinutes),
      bufferAfterMinutes: toNonNegativeIntOrNull(form.bufferAfterMinutes),
      leadTimeMinutes: toNonNegativeIntOrNull(form.leadTimeMinutes),
      cutoffTime: form.cutoffTime ? form.cutoffTime : null,
      maxBookingsPerPharmacistPerDay: toNonNegativeIntOrNull(
        form.maxBookingsPerPharmacistPerDay,
      ),
      maxBookingsPerCustomerPerWeek: toNonNegativeIntOrNull(
        form.maxBookingsPerCustomerPerWeek,
      ),
      channelsJson: form.channelsJson || null,
      pricingJson: form.pricingJson || null,
      pickupEnabled: toBool(form.pickupEnabled),
      deliveryEnabled,
      // Dependency rule: when delivery is off, do not persist zone/rule configs
      deliveryZonesJson: deliveryEnabled
        ? form.deliveryZonesJson || null
        : null,
      shippingFeeRulesJson: deliveryEnabled
        ? form.shippingFeeRulesJson || null
        : null,
      defaultWarehouseCode: form.defaultWarehouseCode || null,
      allowNegativeStock: toBool(form.allowNegativeStock),
      defaultReorderPoint: toNonNegativeIntOrNull(form.defaultReorderPoint),
      enableFefo: toBool(form.enableFefo),
    });
  };

  if (loading) {
    return <div className="text-slate-500">Đang tải cấu hình...</div>;
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

      {!validations.ok ? (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          <div className="font-semibold">Cần kiểm tra lại</div>
          <ul className="mt-1 list-disc pl-5 space-y-1">
            {validations.errors.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
        <div className="font-semibold text-slate-900 dark:text-white">
          Preview
        </div>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
          <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-3">
            <div className="text-xs text-slate-500">Đặt lịch</div>
            <div className="mt-1 text-slate-900 dark:text-slate-100">
              Slot: <span className="font-semibold">{preview.slot}p</span> ·
              Buffer: {preview.before}p/{preview.after}p · Lead: {preview.lead}p
            </div>
            <div className="mt-1 text-slate-700 dark:text-slate-300">
              Cutoff: <span className="font-mono">{preview.cutoff || "—"}</span>
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-3">
            <div className="text-xs text-slate-500">Bán hàng</div>
            <div className="mt-1 text-slate-900 dark:text-slate-100">
              Pickup:{" "}
              <span className="font-semibold">
                {preview.pickupEnabled ? "ON" : "OFF"}
              </span>{" "}
              · Delivery:{" "}
              <span className="font-semibold">
                {preview.deliveryEnabled ? "ON" : "OFF"}
              </span>
            </div>
            <div className="mt-1 text-slate-700 dark:text-slate-300">
              Zones: {preview.zonesCount == null ? "—" : preview.zonesCount} ·
              Rules: {preview.rulesCount == null ? "—" : preview.rulesCount}
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-3">
            <div className="text-xs text-slate-500">Kho</div>
            <div className="mt-1 text-slate-900 dark:text-slate-100">
              Negative stock:{" "}
              <span className="font-semibold">
                {preview.allowNegativeStock ? "ALLOW" : "BLOCK"}
              </span>{" "}
              · FEFO:{" "}
              <span className="font-semibold">
                {preview.enableFefo ? "ON" : "OFF"}
              </span>
            </div>
            <div className="mt-1 text-slate-700 dark:text-slate-300">
              Reorder point: {preview.reorderPoint}
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-3">
            <div className="text-xs text-slate-500">JSON trạng thái</div>
            <div className="mt-1 text-slate-900 dark:text-slate-100">
              Channels:{" "}
              <span className="font-semibold">
                {preview.channelsOk ? "OK" : "INVALID"}
              </span>{" "}
              · Pricing:{" "}
              <span className="font-semibold">
                {preview.pricingOk ? "OK" : "INVALID"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Slot duration (phút)
          </span>
          <select
            value={form.slotDurationMinutes}
            onChange={(e) =>
              setForm((s) => ({ ...s, slotDurationMinutes: e.target.value }))
            }
            className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={60}>60</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Cutoff time
          </span>
          <Input
            className="mt-1"
            type="time"
            value={form.cutoffTime || ""}
            onChange={(e) =>
              setForm((s) => ({ ...s, cutoffTime: e.target.value }))
            }
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Buffer trước (phút)
          </span>
          <Input
            className="mt-1"
            type="number"
            min={0}
            value={form.bufferBeforeMinutes}
            onChange={(e) =>
              setForm((s) => ({ ...s, bufferBeforeMinutes: e.target.value }))
            }
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Buffer sau (phút)
          </span>
          <Input
            className="mt-1"
            type="number"
            min={0}
            value={form.bufferAfterMinutes}
            onChange={(e) =>
              setForm((s) => ({ ...s, bufferAfterMinutes: e.target.value }))
            }
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Lead time (phút)
          </span>
          <Input
            className="mt-1"
            type="number"
            min={0}
            value={form.leadTimeMinutes}
            onChange={(e) =>
              setForm((s) => ({ ...s, leadTimeMinutes: e.target.value }))
            }
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Max booking / dược sĩ / ngày
          </span>
          <Input
            className="mt-1"
            type="number"
            min={0}
            value={form.maxBookingsPerPharmacistPerDay}
            onChange={(e) =>
              setForm((s) => ({
                ...s,
                maxBookingsPerPharmacistPerDay: e.target.value,
              }))
            }
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Max booking / khách / tuần
          </span>
          <Input
            className="mt-1"
            type="number"
            min={0}
            value={form.maxBookingsPerCustomerPerWeek}
            onChange={(e) =>
              setForm((s) => ({
                ...s,
                maxBookingsPerCustomerPerWeek: e.target.value,
              }))
            }
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Default warehouse code
          </span>
          <Input
            className="mt-1"
            value={form.defaultWarehouseCode}
            onChange={(e) =>
              setForm((s) => ({ ...s, defaultWarehouseCode: e.target.value }))
            }
            placeholder="WH-01"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Default reorder point
          </span>
          <Input
            className="mt-1"
            type="number"
            min={0}
            value={form.defaultReorderPoint}
            onChange={(e) =>
              setForm((s) => ({ ...s, defaultReorderPoint: e.target.value }))
            }
          />
        </label>

        <div className="sm:col-span-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 p-3">
            <input
              type="checkbox"
              checked={!!form.pickupEnabled}
              onChange={(e) =>
                setForm((s) => ({ ...s, pickupEnabled: e.target.checked }))
              }
            />
            <span className="text-sm text-slate-800 dark:text-slate-200">
              Pickup enabled
            </span>
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 p-3">
            <input
              type="checkbox"
              checked={!!form.deliveryEnabled}
              onChange={(e) =>
                setForm((s) => ({ ...s, deliveryEnabled: e.target.checked }))
              }
            />
            <span className="text-sm text-slate-800 dark:text-slate-200">
              Delivery enabled
            </span>
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 p-3">
            <input
              type="checkbox"
              checked={!!form.allowNegativeStock}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  allowNegativeStock: e.target.checked,
                }))
              }
            />
            <span className="text-sm text-slate-800 dark:text-slate-200">
              Allow negative stock
            </span>
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 p-3">
            <input
              type="checkbox"
              checked={!!form.enableFefo}
              onChange={(e) =>
                setForm((s) => ({ ...s, enableFefo: e.target.checked }))
              }
            />
            <span className="text-sm text-slate-800 dark:text-slate-200">
              Enable FEFO
            </span>
          </label>
        </div>

        <div className="sm:col-span-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Channels JSON
            </span>
            <Textarea
              className="mt-1 font-mono text-xs"
              value={form.channelsJson}
              onChange={(e) =>
                setForm((s) => ({ ...s, channelsJson: e.target.value }))
              }
              placeholder='{"channels":["web","phone"]}'
            />
          </label>
        </div>

        <div className="sm:col-span-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Pricing JSON
            </span>
            <Textarea
              className="mt-1 font-mono text-xs"
              value={form.pricingJson}
              onChange={(e) =>
                setForm((s) => ({ ...s, pricingJson: e.target.value }))
              }
              placeholder='{"rules":[]}'
            />
          </label>
        </div>

        <div className="sm:col-span-2">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  Delivery nâng cao
                </div>
                <div className="text-xs text-slate-500">
                  Ẩn/hiện các JSON cấu hình vùng và phí ship.
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedDelivery((v) => !v)}
              >
                {showAdvancedDelivery ? "Ẩn" : "Hiện"}
              </Button>
            </div>

            {showAdvancedDelivery ? (
              <div className="p-4 space-y-4">
                {!form.deliveryEnabled ? (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm">
                    Delivery đang tắt: các cấu hình zones/rules sẽ không được
                    lưu.
                  </div>
                ) : null}

                <label className="block">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Delivery zones JSON
                  </span>
                  <Textarea
                    className="mt-1 font-mono text-xs"
                    value={form.deliveryZonesJson}
                    disabled={!form.deliveryEnabled}
                    onChange={(e) =>
                      setForm((s) => ({
                        ...s,
                        deliveryZonesJson: e.target.value,
                      }))
                    }
                    placeholder='{"zones":[]}'
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Shipping fee rules JSON
                  </span>
                  <Textarea
                    className="mt-1 font-mono text-xs"
                    value={form.shippingFeeRulesJson}
                    disabled={!form.deliveryEnabled}
                    onChange={(e) =>
                      setForm((s) => ({
                        ...s,
                        shippingFeeRulesJson: e.target.value,
                      }))
                    }
                    placeholder='{"rules":[]}'
                  />
                </label>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button onClick={submit} disabled={!canSave || saving}>
          {saving ? "Đang lưu..." : "Lưu cấu hình"}
        </Button>
      </div>
    </div>
  );
};

export default BranchSettingsPanel;
