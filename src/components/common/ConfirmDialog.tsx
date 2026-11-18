import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'success' | 'warning' | 'primary';
  isLoading?: boolean;
  children?: React.ReactNode;
  confirmDisabled?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  isLoading = false,
  children,
  confirmDisabled = false,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: XCircle,
          iconColor: 'text-rose-600 bg-rose-50 border-rose-200',
          confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-sm shadow-rose-600/30',
        };
      case 'success':
        return {
          icon: CheckCircle,
          iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
          confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-sm shadow-emerald-600/30',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconColor: 'text-amber-600 bg-amber-50 border-amber-200',
          confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500 shadow-sm shadow-amber-600/30',
        };
      default:
        return {
          icon: Info,
          iconColor: 'text-blue-600 bg-blue-50 border-blue-200',
          confirmBtn: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-sm shadow-blue-600/30',
        };
    }
  };

  const { icon: Icon, iconColor, confirmBtn } = getVariantStyles();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="lg">
      <div className="space-y-4">
        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-xl border shrink-0 ${iconColor}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
          </div>
        </div>

        {children && <div className="mt-3 pt-3 border-t border-slate-100">{children}</div>}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading || confirmDisabled}
            className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 ${confirmBtn}`}
          >
            {isLoading && (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};
