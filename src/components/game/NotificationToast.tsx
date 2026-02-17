'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success';
}

interface NotificationToastProps {
  notifications: Notification[];
}

const TYPE_STYLES = {
  info: {
    bg: 'rgba(244,162,97,0.15)',
    border: 'rgba(244,162,97,0.3)',
    color: 'var(--accent-gold)',
  },
  warning: {
    bg: 'rgba(230,57,70,0.15)',
    border: 'rgba(230,57,70,0.3)',
    color: 'var(--accent-red)',
  },
  success: {
    bg: 'rgba(88,129,87,0.15)',
    border: 'rgba(88,129,87,0.3)',
    color: 'var(--accent-green)',
  },
};

export default function NotificationToast({ notifications }: NotificationToastProps) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => {
          const style = TYPE_STYLES[notif.type];
          return (
            <motion.div
              key={notif.id}
              className="px-4 py-2 rounded-xl text-xs font-bold shadow-lg"
              style={{
                background: style.bg,
                border: `1px solid ${style.border}`,
                color: style.color,
                backdropFilter: 'blur(8px)',
              }}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              {notif.message}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
