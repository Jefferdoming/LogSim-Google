import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "./ui/button";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "default";
  children?: React.ReactNode;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default",
  children
}: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-full ${variant === 'destructive' ? 'bg-red-100' : 'bg-blue-100'}`}>
                  <AlertTriangle className={`w-5 h-5 ${variant === 'destructive' ? 'text-red-600' : 'text-blue-600'}`} />
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
              {description && (
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  {description}
                </p>
              )}
              
              {children}

              {!children && (
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={onClose} className="flex-1 border-slate-200 text-slate-700">
                    {cancelText}
                  </Button>
                  <Button 
                    variant={variant === 'destructive' ? 'destructive' : 'default'} 
                    onClick={() => {
                      onConfirm();
                      onClose();
                    }}
                    className={`flex-1 ${variant === 'default' ? 'gradient-btn' : ''}`}
                  >
                    {confirmText}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
