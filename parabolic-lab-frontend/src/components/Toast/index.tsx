"use client";
import { Button } from "amvasdev-ui";
import { X } from "lucide-react";
import { ReactNode } from "react";

interface ToastContainerProps {
  children: ReactNode;
}

// Viewport fijo para apilar toasts (abajo a la derecha en desktop, ancho
// completo con márgenes en móvil). z alto para quedar sobre los modales.
export const ToastContainer = ({ children }: ToastContainerProps) => (
  <div className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-full sm:max-w-sm z-[100] flex flex-col gap-3">
    {children}
  </div>
);

interface ToastProps {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  onClose?: () => void;
  actions?: ReactNode;
}

const Toast = ({ icon, title, description, onClose, actions }: ToastProps) => (
  <div className="bg-base-100 shadow-xl border border-base-300 rounded-2xl p-4 animate-fade-in">
    <div className="flex items-start gap-3">
      {icon ? <span className="text-2xl select-none">{icon}</span> : null}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        {description ? (
          <div className="text-sm text-base-content/70 mt-0.5">
            {description}
          </div>
        ) : null}
      </div>
      {onClose ? (
        <Button
          variant="ghost"
          size="xs"
          className="btn-square -mt-1 -mr-1 shrink-0"
          onClick={onClose}
        >
          <X size={14} />
        </Button>
      ) : null}
    </div>
    {actions ? <div className="flex gap-2 mt-3 justify-end">{actions}</div> : null}
  </div>
);

export default Toast;
