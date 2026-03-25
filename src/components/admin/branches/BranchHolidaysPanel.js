import React, { useMemo, useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";

const TYPES = [
  { value: "CLOSED", label: "CLOSED" },
  { value: "OPEN_WITH_HOURS", label: "OPEN_WITH_HOURS" },
  { value: "HOLIDAY", label: "HOLIDAY" },
];

const normalizeType = (t) => {
  if (!t) return "CLOSED";
  if (t === "SPECIAL_HOURS") return "OPEN_WITH_HOURS";
  return t;
};

const formatHours = (h) => {
  if (!h) return "—";
  const open = h.openTime || "";
  const close = h.closeTime || "";
  if (!open && !close) return "—";
  return `${open || "?"} - ${close || "?"}`;
};

const isValidRange = (start, end) => {
  if (!start || !end) return false;
  return start <= end;
};

const parseDateInput = (value) => {
  if (!value) return null;
  // value is YYYY-MM-DD
  const [y, m, d] = value.split("-").map((x) => Number(x));
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d));
};

const toYmd = (date) => {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const addDaysUtc = (date, days) => {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};

const addYearsUtc = (date, years) => {
  const next = new Date(date.getTime());
  next.setUTCFullYear(next.getUTCFullYear() + years);
  return next;
};

const expandDateRange = (startYmd, endYmd) => {
  const start = parseDateInput(startYmd);
  const end = parseDateInput(endYmd);
  if (!start || !end) return [];
  const dates = [];
  for (let d = start; d.getTime() <= end.getTime(); d = addDaysUtc(d, 1)) {
    dates.push(toYmd(d));
  }
  return dates;
};

const BranchHolidaysPanel = ({ state, onCreate, onDelete }) => {
  const { loading, error, items, saving, saveError } = state;

  const [form, setForm] = useState({
    date: "",
    type: "CLOSED",
    openTime: "",
    closeTime: "",
    note: "",
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulk, setBulk] = useState({
    startDate: "",
    endDate: "",
    type: "CLOSED",
    openTime: "",
    closeTime: "",
    note: "",
    repeatYearly: false,
    years: 3,
  });
  const [bulkError, setBulkError] = useState("");
  const [bulkProgress, setBulkProgress] = useState({
    running: false,
    done: 0,
    total: 0,
  });

  const canSubmit = useMemo(() => {
    if (!form.date || !form.type) return false;
    const type = normalizeType(form.type);
    if (type === "OPEN_WITH_HOURS") {
      if (!form.openTime || !form.closeTime) return false;
      if (form.openTime >= form.closeTime) return false;
    }
    return true;
  }, [form]);

  const submit = async () => {
    if (!canSubmit) return;
    const type = normalizeType(form.type);
    await onCreate({
      date: form.date,
      type,
      openTime: type === "OPEN_WITH_HOURS" ? form.openTime : null,
      closeTime: type === "OPEN_WITH_HOURS" ? form.closeTime : null,
      note: form.note || null,
    });
    setForm({
      date: "",
      type: "CLOSED",
      openTime: "",
      closeTime: "",
      note: "",
    });
  };

  const openEdit = (h) => {
    setEditing({
      id: h.id,
      date: h.date,
      type: normalizeType(h.type),
      openTime: h.openTime || "",
      closeTime: h.closeTime || "",
      note: h.note || "",
    });
    setEditOpen(true);
  };

  const canSaveEdit = useMemo(() => {
    if (!editing) return false;
    if (!editing.date || !editing.type) return false;
    if (editing.type === "OPEN_WITH_HOURS") {
      if (!editing.openTime || !editing.closeTime) return false;
      if (editing.openTime >= editing.closeTime) return false;
    }
    return true;
  }, [editing]);

  const saveEdit = async () => {
    if (!editing || !canSaveEdit) return;
    // Backend doesn't provide update endpoint; implement as delete + create.
    await onDelete(editing.id);
    await onCreate({
      date: editing.date,
      type: editing.type,
      openTime: editing.type === "OPEN_WITH_HOURS" ? editing.openTime : null,
      closeTime: editing.type === "OPEN_WITH_HOURS" ? editing.closeTime : null,
      note: editing.note || null,
    });
    setEditOpen(false);
    setEditing(null);
  };

  const canBulk = useMemo(() => {
    if (!isValidRange(bulk.startDate, bulk.endDate)) return false;
    const type = normalizeType(bulk.type);
    if (type === "OPEN_WITH_HOURS") {
      if (!bulk.openTime || !bulk.closeTime) return false;
      if (bulk.openTime >= bulk.closeTime) return false;
    }
    if (bulk.repeatYearly) {
      const years = Number(bulk.years);
      if (!Number.isFinite(years) || years <= 0 || years > 20) return false;
    }
    return true;
  }, [bulk]);

  const runBulkImport = async () => {
    if (!canBulk) return;
    setBulkError("");
    const baseDates = expandDateRange(bulk.startDate, bulk.endDate);
    if (!baseDates.length) {
      setBulkError("Range ngày không hợp lệ.");
      return;
    }

    const type = normalizeType(bulk.type);
    const years = bulk.repeatYearly ? Math.trunc(Number(bulk.years)) : 1;

    const allDates = [];
    for (const d of baseDates) {
      const base = parseDateInput(d);
      if (!base) continue;
      for (let i = 0; i < years; i++) {
        allDates.push(toYmd(addYearsUtc(base, i)));
      }
    }

    // De-duplicate and keep stable order
    const seen = new Set();
    const dates = allDates.filter((d) => {
      if (seen.has(d)) return false;
      seen.add(d);
      return true;
    });

    setBulkProgress({ running: true, done: 0, total: dates.length });
    try {
      for (let i = 0; i < dates.length; i++) {
        const date = dates[i];
        await onCreate({
          date,
          type,
          openTime: type === "OPEN_WITH_HOURS" ? bulk.openTime : null,
          closeTime: type === "OPEN_WITH_HOURS" ? bulk.closeTime : null,
          note: bulk.note || null,
        });
        setBulkProgress({ running: true, done: i + 1, total: dates.length });
      }
      setBulkOpen(false);
    } catch (e) {
      setBulkError(e?.message || "Import thất bại");
    } finally {
      setBulkProgress((p) => ({ ...p, running: false }));
    }
  };

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

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
        <h4 className="font-semibold text-slate-900 dark:text-white">
          Thêm ngày nghỉ
        </h4>

        <div className="mt-2 flex flex-wrap gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBulkOpen(true)}
            disabled={saving}
          >
            Import nhiều ngày
          </Button>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Ngày
            </span>
            <Input
              className="mt-1"
              type="date"
              value={form.date}
              onChange={(e) => setForm((s) => ({ ...s, date: e.target.value }))}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Loại
            </span>
            <select
              value={form.type}
              onChange={(e) => setForm((s) => ({ ...s, type: e.target.value }))}
              className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          {normalizeType(form.type) === "OPEN_WITH_HOURS" ? (
            <>
              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Mở cửa
                </span>
                <Input
                  className="mt-1"
                  type="time"
                  value={form.openTime}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, openTime: e.target.value }))
                  }
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Đóng cửa
                </span>
                <Input
                  className="mt-1"
                  type="time"
                  value={form.closeTime}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, closeTime: e.target.value }))
                  }
                />
              </label>
            </>
          ) : null}

          <div className="sm:col-span-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Ghi chú
              </span>
              <Textarea
                className="mt-1"
                value={form.note}
                onChange={(e) =>
                  setForm((s) => ({ ...s, note: e.target.value }))
                }
              />
            </label>
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <Button onClick={submit} disabled={!canSubmit || saving}>
            {saving ? "Đang lưu..." : "Thêm"}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h4 className="font-semibold text-slate-900 dark:text-white">
            Danh sách ngày nghỉ
          </h4>
          <span className="text-xs text-slate-500">{items?.length || 0}</span>
        </div>

        {loading ? (
          <div className="px-4 py-6 text-slate-500">Đang tải...</div>
        ) : items?.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr className="text-left text-slate-600 dark:text-slate-300">
                  <th className="px-4 py-3 font-semibold">Ngày</th>
                  <th className="px-4 py-3 font-semibold">Loại</th>
                  <th className="px-4 py-3 font-semibold">Giờ</th>
                  <th className="px-4 py-3 font-semibold">Ghi chú</th>
                  <th className="px-4 py-3 font-semibold text-right">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {items.map((raw) => {
                  const h = { ...raw, type: normalizeType(raw.type) };
                  return (
                    <tr
                      key={h.id}
                      className="text-slate-900 dark:text-slate-100"
                    >
                      <td className="px-4 py-3 whitespace-nowrap font-semibold">
                        {h.date}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{h.type}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-700 dark:text-slate-300">
                        {h.type === "OPEN_WITH_HOURS" ? formatHours(h) : "—"}
                      </td>
                      <td className="px-4 py-3 min-w-[220px] text-slate-700 dark:text-slate-300">
                        {h.note || "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEdit(h)}
                            disabled={saving}
                          >
                            Sửa
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDelete(h.id)}
                            disabled={saving}
                          >
                            Xóa
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-4 py-6 text-slate-500">
            Chưa có ngày nghỉ. Bấm ‘Thêm’ để tạo ngày nghỉ đầu tiên.
          </div>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa ngày nghỉ</DialogTitle>
            <DialogDescription>
              Hiện chưa có API cập nhật; hệ thống sẽ xóa bản ghi cũ và tạo bản
              ghi mới.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Ngày
              </span>
              <Input
                className="mt-1"
                type="date"
                value={editing?.date || ""}
                onChange={(e) =>
                  setEditing((s) => ({ ...s, date: e.target.value }))
                }
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Loại
              </span>
              <select
                value={editing?.type || "CLOSED"}
                onChange={(e) =>
                  setEditing((s) => ({ ...s, type: e.target.value }))
                }
                className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>

            {editing?.type === "OPEN_WITH_HOURS" ? (
              <>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Mở cửa
                  </span>
                  <Input
                    className="mt-1"
                    type="time"
                    value={editing?.openTime || ""}
                    onChange={(e) =>
                      setEditing((s) => ({ ...s, openTime: e.target.value }))
                    }
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Đóng cửa
                  </span>
                  <Input
                    className="mt-1"
                    type="time"
                    value={editing?.closeTime || ""}
                    onChange={(e) =>
                      setEditing((s) => ({ ...s, closeTime: e.target.value }))
                    }
                  />
                </label>
              </>
            ) : null}

            <div className="sm:col-span-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Ghi chú
                </span>
                <Textarea
                  className="mt-1"
                  value={editing?.note || ""}
                  onChange={(e) =>
                    setEditing((s) => ({ ...s, note: e.target.value }))
                  }
                />
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              disabled={saving}
            >
              Hủy
            </Button>
            <Button onClick={saveEdit} disabled={!canSaveEdit || saving}>
              {saving ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import nhiều ngày nghỉ</DialogTitle>
            <DialogDescription>
              Tạo nhanh theo range ngày. Có thể lặp hằng năm (tạo cho nhiều
              năm).
            </DialogDescription>
          </DialogHeader>

          {bulkError ? (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {bulkError}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Từ ngày
              </span>
              <Input
                className="mt-1"
                type="date"
                value={bulk.startDate}
                onChange={(e) =>
                  setBulk((s) => ({ ...s, startDate: e.target.value }))
                }
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Đến ngày
              </span>
              <Input
                className="mt-1"
                type="date"
                value={bulk.endDate}
                onChange={(e) =>
                  setBulk((s) => ({ ...s, endDate: e.target.value }))
                }
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Loại
              </span>
              <select
                value={bulk.type}
                onChange={(e) =>
                  setBulk((s) => ({ ...s, type: e.target.value }))
                }
                className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>

            {normalizeType(bulk.type) === "OPEN_WITH_HOURS" ? (
              <>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Mở cửa
                  </span>
                  <Input
                    className="mt-1"
                    type="time"
                    value={bulk.openTime}
                    onChange={(e) =>
                      setBulk((s) => ({ ...s, openTime: e.target.value }))
                    }
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Đóng cửa
                  </span>
                  <Input
                    className="mt-1"
                    type="time"
                    value={bulk.closeTime}
                    onChange={(e) =>
                      setBulk((s) => ({ ...s, closeTime: e.target.value }))
                    }
                  />
                </label>
              </>
            ) : null}

            <div className="sm:col-span-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Ghi chú
                </span>
                <Textarea
                  className="mt-1"
                  value={bulk.note}
                  onChange={(e) =>
                    setBulk((s) => ({ ...s, note: e.target.value }))
                  }
                />
              </label>
            </div>

            <div className="sm:col-span-2 flex flex-col gap-2">
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 p-3">
                <input
                  type="checkbox"
                  checked={!!bulk.repeatYearly}
                  onChange={(e) =>
                    setBulk((s) => ({ ...s, repeatYearly: e.target.checked }))
                  }
                />
                <span className="text-sm text-slate-800 dark:text-slate-200">
                  Lặp hằng năm (tạo cho nhiều năm)
                </span>
              </label>

              {bulk.repeatYearly ? (
                <label className="block">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Số năm
                  </span>
                  <Input
                    className="mt-1"
                    type="number"
                    min={1}
                    max={20}
                    value={bulk.years}
                    onChange={(e) =>
                      setBulk((s) => ({ ...s, years: e.target.value }))
                    }
                  />
                </label>
              ) : null}
            </div>
          </div>

          {bulkProgress.total ? (
            <div className="text-xs text-slate-500">
              Tiến độ: {bulkProgress.done}/{bulkProgress.total}
            </div>
          ) : null}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkOpen(false)}
              disabled={bulkProgress.running || saving}
            >
              Đóng
            </Button>
            <Button
              onClick={runBulkImport}
              disabled={!canBulk || bulkProgress.running || saving}
            >
              {bulkProgress.running ? "Đang import..." : "Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BranchHolidaysPanel;
