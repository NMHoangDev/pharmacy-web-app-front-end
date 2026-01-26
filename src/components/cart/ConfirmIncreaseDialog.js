import React from "react";
import * as Dialog from "@radix-ui/react-dialog";

const ConfirmIncreaseDialog = ({
  open,
  onOpenChange,
  productName,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <Dialog.Overlay className="fixed inset-0 bg-[var(--overlay)] backdrop-blur-sm" />

          <div className="fixed z-60 w-[92vw] max-w-md mx-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl p-6 text-[var(--text)]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Dialog.Title className="text-lg font-semibold text-[var(--text)] mb-1">
                  Sản phẩm đã có trong giỏ hàng
                </Dialog.Title>
                <Dialog.Description className="text-sm text-[var(--muted)] mb-3">
                  Bạn đã thêm sản phẩm này vào giỏ hàng. Bạn muốn tăng số lượng
                  không?
                </Dialog.Description>
                <div className="inline-block bg-[var(--surface-2)] px-3 py-1 rounded-lg text-sm font-medium text-[var(--text)]">
                  {productName}
                </div>
              </div>
              <button
                aria-label="Đóng"
                onClick={() => onOpenChange(false)}
                className="ml-3 text-[var(--muted)] hover:text-[var(--text)] rounded-md p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="px-4 py-2.5 rounded-xl bg-transparent border border-[rgba(255,255,255,0.12)] text-[var(--muted)] hover:bg-white/5 focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus)] disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  onCancel && onCancel();
                  onOpenChange(false);
                }}
              >
                Huỷ
              </button>
              <button
                className="px-4 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus)] disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  onConfirm && onConfirm();
                  onOpenChange(false);
                }}
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ConfirmIncreaseDialog;
