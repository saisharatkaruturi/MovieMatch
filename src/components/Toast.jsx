import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import './Toast.css';

const KIND_ICONS = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

const KIND_CLASS = {
  success: 'toast--success',
  error: 'toast--error',
  info: 'toast--info',
};

const Toast = () => {
  const { toasts, dismiss } = useToast();

  return (
    <div className="toast-stack" role="region" aria-live="polite" aria-label="Notifications">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            className={`toast ${KIND_CLASS[t.kind] || 'toast--info'}`}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          >
            <span className="toast__icon" aria-hidden="true">{KIND_ICONS[t.kind] || KIND_ICONS.info}</span>
            <div className="toast__body">
              {t.title && <p className="toast__title">{t.title}</p>}
              <p className="toast__msg">{t.message}</p>
            </div>
            <button
              type="button"
              className="toast__close"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;