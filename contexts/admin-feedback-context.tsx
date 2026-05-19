"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

type ModalState = {
  open: boolean;
  type: "success" | "error";
  message: string;
  onClose?: () => void;
};

type AdminFeedbackContextType = {
  showSuccess: (message?: string, onClose?: () => void) => void;
  showError: (message: string) => void;
};

const AdminFeedbackContext = createContext<AdminFeedbackContextType | null>(null);

function AdminFeedbackModal({
  open,
  type,
  message,
  onClose,
}: {
  open: boolean;
  type: "success" | "error";
  message: string;
  onClose: () => void;
}) {
  if (!open) return null;

  const isSuccess = type === "success";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-feedback-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
              isSuccess ? "bg-emerald-500/15" : "bg-destructive/15"
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="size-5 text-emerald-400" aria-hidden />
            ) : (
              <XCircle className="size-5 text-destructive" aria-hidden />
            )}
          </div>
          <h2
            id="admin-feedback-title"
            className="text-base font-semibold text-zinc-100"
          >
            {isSuccess ? "¡Guardado!" : "Ocurrió un error"}
          </h2>
        </div>

        <p className="mb-5 text-sm text-zinc-400">{message}</p>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`inline-flex h-9 items-center justify-center rounded-md px-5 text-sm font-medium text-white transition-opacity hover:opacity-90 ${
              isSuccess ? "bg-emerald-600" : "bg-destructive"
            }`}
          >
            {isSuccess ? "Continuar" : "Entendido"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminFeedbackProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [modal, setModal] = useState<ModalState>({
    open: false,
    type: "success",
    message: "",
  });

  const showSuccess = useCallback(
    (message = "¡Guardado correctamente!", onClose?: () => void) => {
      setModal({ open: true, type: "success", message, onClose });
    },
    [],
  );

  const showError = useCallback((message: string) => {
    setModal({ open: true, type: "error", message });
  }, []);

  function handleClose() {
    const cb = modal.onClose;
    setModal((prev) => ({ ...prev, open: false, onClose: undefined }));
    cb?.();
  }

  return (
    <AdminFeedbackContext.Provider value={{ showSuccess, showError }}>
      {children}
      <AdminFeedbackModal
        open={modal.open}
        type={modal.type}
        message={modal.message}
        onClose={handleClose}
      />
    </AdminFeedbackContext.Provider>
  );
}

export function useAdminFeedback() {
  const ctx = useContext(AdminFeedbackContext);
  if (!ctx)
    throw new Error(
      "useAdminFeedback debe usarse dentro de AdminFeedbackProvider",
    );
  return ctx;
}
