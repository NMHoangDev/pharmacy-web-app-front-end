import React, { useMemo, useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { isUuid } from "../../../api/client";

const BranchStaffPanel = ({ state, onAssign, onRemove }) => {
  const { loading, error, items, saving, saveError } = state;

  const [form, setForm] = useState({
    userId: "",
    role: "STAFF",
    active: true,
    skillsJson: "",
  });

  const canSubmit = useMemo(() => {
    return (
      isUuid(String(form.userId || "")) && !!String(form.role || "").trim()
    );
  }, [form.userId, form.role]);

  const submit = () => {
    if (!canSubmit) return;
    onAssign({
      userId: form.userId,
      role: String(form.role).trim(),
      active: !!form.active,
      skillsJson: form.skillsJson || null,
    });
    setForm({ userId: "", role: "STAFF", active: true, skillsJson: "" });
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
          Gán nhân sự vào chi nhánh
        </h4>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              userId (UUID)
            </span>
            <Input
              className="mt-1 font-mono text-xs"
              value={form.userId}
              onChange={(e) =>
                setForm((s) => ({ ...s, userId: e.target.value }))
              }
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Role
            </span>
            <select
              value={form.role}
              onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))}
              className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <option value="STAFF">STAFF</option>
              <option value="PHARMACIST">PHARMACIST</option>
              <option value="MANAGER">MANAGER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 p-3 sm:col-span-2">
            <input
              type="checkbox"
              checked={!!form.active}
              onChange={(e) =>
                setForm((s) => ({ ...s, active: e.target.checked }))
              }
            />
            <span className="text-sm text-slate-800 dark:text-slate-200">
              Active
            </span>
          </label>

          <div className="sm:col-span-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                skillsJson (optional)
              </span>
              <Textarea
                className="mt-1 font-mono text-xs"
                value={form.skillsJson}
                onChange={(e) =>
                  setForm((s) => ({ ...s, skillsJson: e.target.value }))
                }
                placeholder='{"skills":["vaccination"]}'
              />
            </label>
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <Button onClick={submit} disabled={!canSubmit || saving}>
            {saving ? "Đang lưu..." : "Gán"}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h4 className="font-semibold text-slate-900 dark:text-white">
            Danh sách nhân sự
          </h4>
          <span className="text-xs text-slate-500">{items?.length || 0}</span>
        </div>

        {loading ? (
          <div className="px-4 py-6 text-slate-500">Đang tải...</div>
        ) : items?.length ? (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {items.map((p) => (
              <div
                key={p.userId}
                className="px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {p.role} · {p.active ? "ACTIVE" : "INACTIVE"}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono truncate">
                    {p.userId}
                  </div>
                  {p.skillsJson ? (
                    <div className="text-xs text-slate-500 font-mono truncate">
                      {p.skillsJson}
                    </div>
                  ) : null}
                </div>
                <div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onRemove(p.userId)}
                    disabled={saving}
                  >
                    Gỡ
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-6 text-slate-500">Chưa có nhân sự.</div>
        )}
      </div>
    </div>
  );
};

export default BranchStaffPanel;
