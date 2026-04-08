import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../../shared/components/ui/dialog";
import BranchSettingsPanel from "./BranchSettingsPanel";
import BranchHoursPanel from "./BranchHoursPanel";
import BranchHolidaysPanel from "./BranchHolidaysPanel";
import BranchStaffPanel from "./BranchStaffPanel";
import BranchAuditPanel from "./BranchAuditPanel";

const BranchDetailModal = ({
  open,
  onOpenChange,
  branch,
  tab,
  tabs,
  onTabChange,
  onEdit,
  settingsState,
  hoursState,
  holidaysState,
  staffState,
  auditState,
  onSaveSettings,
  onSaveHours,
  onCreateHoliday,
  onDeleteHoliday,
  onAssignStaff,
  onRemoveStaff,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(96vw,1120px)] max-w-6xl max-h-[88vh] overflow-hidden p-0 gap-0">
        <DialogHeader className="border-b border-slate-200 bg-slate-50/60 px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle className="truncate">
                {branch
                  ? `${branch.name} (${branch.code})`
                  : "Chi tiết chi nhánh"}
              </DialogTitle>
              <DialogDescription className="mt-1">
                Quản lý thông tin, cài đặt, giờ làm việc và nhân sự của chi
                nhánh
              </DialogDescription>
            </div>
            {branch ? (
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <span className="material-symbols-outlined text-[18px]">
                  edit
                </span>
                Sửa
              </button>
            ) : null}
          </div>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 border-b border-slate-200 px-5 py-3">
          {(tabs || []).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onTabChange(item.key)}
              className={
                tab === item.key
                  ? "rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary"
                  : "rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              }
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
          {!branch ? (
            <div className="text-sm text-slate-500">
              Chọn một chi nhánh để xem chi tiết.
            </div>
          ) : null}

          {branch && tab === "info" ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Trạng thái
                </p>
                <p className="font-medium text-slate-900">{branch.status}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Timezone
                </p>
                <p className="font-medium text-slate-900">
                  {branch.timezone || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Thành phố
                </p>
                <p className="font-medium text-slate-900">
                  {branch.city || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Số điện thoại
                </p>
                <p className="font-medium text-slate-900">
                  {branch.phone || "-"}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Địa chỉ
                </p>
                <p className="font-medium text-slate-900">
                  {branch.addressLine || "-"}
                </p>
              </div>
            </div>
          ) : null}

          {branch && tab === "settings" ? (
            <BranchSettingsPanel
              state={settingsState}
              onSave={onSaveSettings}
            />
          ) : null}

          {branch && tab === "hours" ? (
            <BranchHoursPanel state={hoursState} onSave={onSaveHours} />
          ) : null}

          {branch && tab === "holidays" ? (
            <BranchHolidaysPanel
              state={holidaysState}
              onCreate={onCreateHoliday}
              onDelete={onDeleteHoliday}
            />
          ) : null}

          {branch && tab === "staff" ? (
            <BranchStaffPanel
              state={staffState}
              onAssign={onAssignStaff}
              onRemove={onRemoveStaff}
            />
          ) : null}

          {branch && tab === "audit" ? (
            <BranchAuditPanel state={auditState} />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BranchDetailModal;
