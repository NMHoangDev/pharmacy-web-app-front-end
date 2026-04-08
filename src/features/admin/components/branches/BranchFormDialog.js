import React, { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../shared/components/ui/dialog";
import { Button } from "../../../../shared/components/ui/button";
import { Input } from "../../../../shared/components/ui/input";
import { Textarea } from "../../../../shared/components/ui/textarea";
import BranchMapPicker from "./BranchMapPicker";

const Field = ({ label, children, hint }) => (
  <label className="block">
    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
      {label}
    </span>
    <div className="mt-1">{children}</div>
    {hint ? (
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
    ) : null}
  </label>
);

const BranchFormDialog = ({
  open,
  onOpenChange,
  mode,
  values,
  onChange,
  onSubmit,
  saving,
  error,
}) => {
  const isCreate = mode === "create";

  const title = useMemo(
    () => (isCreate ? "Tạo chi nhánh" : "Cập nhật chi nhánh"),
    [isCreate],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {isCreate
              ? "Tạo chi nhánh mới và khởi tạo cấu hình mặc định."
              : "Cập nhật thông tin chi nhánh."}
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {isCreate ? (
            <Field
              label="Mã chi nhánh"
              hint="Chỉ gồm chữ thường/số/dấu -, 2-64 ký tự."
            >
              <Input
                value={values.code}
                onChange={(e) => onChange({ ...values, code: e.target.value })}
                placeholder="vd: q1-main"
              />
            </Field>
          ) : (
            <Field label="Mã chi nhánh">
              <Input value={values.code} disabled />
            </Field>
          )}

          <Field label="Tên chi nhánh">
            <Input
              value={values.name}
              onChange={(e) => onChange({ ...values, name: e.target.value })}
              placeholder="Nhà thuốc Quận 1"
            />
          </Field>

          <Field label="Trạng thái">
            <select
              value={values.status}
              onChange={(e) => onChange({ ...values, status: e.target.value })}
              className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </Field>

          <Field label="Timezone">
            <Input
              value={values.timezone}
              onChange={(e) =>
                onChange({ ...values, timezone: e.target.value })
              }
              placeholder="Asia/Ho_Chi_Minh"
            />
          </Field>

          <Field label="SĐT">
            <Input
              value={values.phone}
              onChange={(e) => onChange({ ...values, phone: e.target.value })}
              placeholder="0123 456 789"
            />
          </Field>

          <Field label="Email">
            <Input
              value={values.email}
              onChange={(e) => onChange({ ...values, email: e.target.value })}
              placeholder="branch@example.com"
            />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Địa chỉ">
              <Input
                value={values.addressLine}
                onChange={(e) =>
                  onChange({ ...values, addressLine: e.target.value })
                }
                placeholder="123 Nguyễn Huệ"
              />
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field
              label="Chọn vị trí trên bản đồ"
              hint="Click lên bản đồ để lấy tọa độ + tự điền địa chỉ (phường/xã, quận/huyện, tỉnh/thành...)."
            >
              <BranchMapPicker
                value={values}
                onChange={onChange}
                preferAutoFillName={isCreate}
              />
            </Field>
          </div>

          <Field label="Phường/Xã">
            <Input
              value={values.ward}
              onChange={(e) => onChange({ ...values, ward: e.target.value })}
              placeholder="Bến Nghé"
            />
          </Field>

          <Field label="Quận/Huyện">
            <Input
              value={values.district}
              onChange={(e) =>
                onChange({ ...values, district: e.target.value })
              }
              placeholder="Quận 1"
            />
          </Field>

          <Field label="Thành phố">
            <Input
              value={values.city}
              onChange={(e) => onChange({ ...values, city: e.target.value })}
              placeholder="Hồ Chí Minh"
            />
          </Field>

          <Field label="Tỉnh">
            <Input
              value={values.province}
              onChange={(e) =>
                onChange({ ...values, province: e.target.value })
              }
              placeholder="Hồ Chí Minh"
            />
          </Field>

          <Field label="Quốc gia">
            <Input
              value={values.country}
              onChange={(e) => onChange({ ...values, country: e.target.value })}
              placeholder="VN"
            />
          </Field>

          <Field label="Latitude">
            <Input
              value={values.latitude}
              onChange={(e) =>
                onChange({ ...values, latitude: e.target.value })
              }
              placeholder="10.775"
            />
          </Field>

          <Field label="Longitude">
            <Input
              value={values.longitude}
              onChange={(e) =>
                onChange({ ...values, longitude: e.target.value })
              }
              placeholder="106.703"
            />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Cover image URL">
              <Input
                value={values.coverImageUrl}
                onChange={(e) =>
                  onChange({ ...values, coverImageUrl: e.target.value })
                }
                placeholder="https://..."
              />
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field label="Ghi chú">
              <Textarea
                value={values.notes}
                onChange={(e) => onChange({ ...values, notes: e.target.value })}
                placeholder="Mô tả thêm về chi nhánh..."
              />
            </Field>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Hủy
          </Button>
          <Button onClick={onSubmit} disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BranchFormDialog;
