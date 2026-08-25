import { useState, useCallback } from "react";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

let toastListeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

const notify = () => {
  toastListeners.forEach((listener) => listener([...toasts]));
};

export function toast({ title, description, variant = "default" }: Omit<Toast, "id">) {
  const id = Math.random().toString(36).substring(2, 9);
  toasts = [...toasts, { id, title, description, variant }];
  notify();

  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  }, 3000);
}

export function useToast() {
  const [, setLocalToasts] = useState<Toast[]>([]);

  const showToast = useCallback(({ title, description, variant = "default" }: Omit<Toast, "id">) => {
    toast({ title, description, variant });
  }, []);

  return { toast: showToast };
}

export function getToasts() {
  return toasts;
}

export function subscribeToToasts(listener: (toasts: Toast[]) => void) {
  toastListeners.push(listener);
  return () => {
    toastListeners = toastListeners.filter((l) => l !== listener);
  };
}
