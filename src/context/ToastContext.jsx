import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

let toastIdCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  // Timeouts are tracked so we can clear them on unmount.
  const timeoutsRef = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const handle = timeoutsRef.current.get(id);
    if (handle) {
      clearTimeout(handle);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const toast = useCallback((message, options = {}) => {
    const id = ++toastIdCounter;
    const entry = {
      id,
      kind: options.kind || 'info',
      title: options.title || null,
      message,
    };
    setToasts((prev) => [...prev, entry]);
    const handle = setTimeout(() => dismiss(id), options.duration ?? 2400);
    timeoutsRef.current.set(id, handle);
    return id;
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast, dismiss, toasts }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Outside provider: fall back to a console-only stub so production code
    // never crashes, even if a provider is forgotten somewhere.
    return { toast: (m) => console.log('[toast]', m), dismiss: () => {}, toasts: [] };
  }
  return ctx;
};