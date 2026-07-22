'use client';

import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center gap-3 text-red-400">
          <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{description}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold gap-1.5 shadow-lg shadow-red-600/20"
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{confirmText}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
