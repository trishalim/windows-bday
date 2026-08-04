import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangleIcon, XIcon } from 'lucide-react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-[10000] grid place-items-center bg-ink/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onPointerDown={onCancel}>

      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 460, damping: 30 }}
        onPointerDown={(e) => e.stopPropagation()}
        className="w-[280px] bevel-out bg-chrome shadow-[4px_5px_0_rgba(58,28,44,0.4)]">

        <header className="titlebar-pink flex items-center gap-1.5 px-1.5 py-1">
          <AlertTriangleIcon className="h-3.5 w-3.5 text-white" />
          <h2 className="flex-1 truncate text-[13px] font-bold text-white drop-shadow-[1px_1px_0_rgba(0,0,0,0.35)]">
            {title}
          </h2>
          <button
            type="button"
            aria-label="Cancel"
            onClick={onCancel}
            className="bevel-btn grid h-[18px] w-[18px] place-items-center text-ink">

            <XIcon className="h-3 w-3" strokeWidth={3} />
          </button>
        </header>

        <div className="p-3">
          <p className="text-[12px] leading-relaxed text-ink">{message}</p>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="bevel-btn px-3 py-[3px] text-[12px] font-bold text-ink">

              {cancelLabel}
            </button>
            <button
              type="button"
              autoFocus
              onClick={onConfirm}
              className="bevel-btn bg-hotpink px-3 py-[3px] text-[12px] font-bold text-white">

              {confirmLabel}
            </button>
          </div>
        </div>
      </motion.div>
    </div>);

}
