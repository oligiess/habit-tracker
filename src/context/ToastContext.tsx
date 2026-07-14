import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { ToastProvider as RadixToastProvider, ToastViewport, Toast, ToastTitle } from "@/components/ui/toast";

interface ToastEntry {
  id: number;
  message: string;
}

interface ToastContextValue {
  toast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);

  const toast = useCallback((message: string) => {
    setToasts((prev) => [...prev, { id: nextId++, message }]);
  }, []);

  const dismiss = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      <RadixToastProvider swipeDirection="right" duration={3000}>
        {children}
        {toasts.map(({ id, message }) => (
          <Toast key={id} onOpenChange={(open) => !open && dismiss(id)}>
            <ToastTitle>{message}</ToastTitle>
          </Toast>
        ))}
        <ToastViewport />
      </RadixToastProvider>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
