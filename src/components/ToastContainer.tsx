"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useToastStore } from "@/stores/toastStore";
import type { ToastType } from "@/stores/toastStore";
import { Button } from "@/components/ui/Button";

const TYPE_STYLES: Record<ToastType, string> = {
  success: "border-success bg-success/10 text-success",
  error: "border-accent bg-accent/10 text-accent",
  info: "border-white/20 bg-surface text-white/80",
};

const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div
      className="fixed bottom-4 right-4 z-toast flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      role="status"
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-lg ${TYPE_STYLES[toast.type]}`}
          >
            <span className="flex-1">{toast.message}</span>
            <Button
              variant="icon"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss"
              className="flex-shrink-0"
            >
              <X size={14} />
            </Button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
