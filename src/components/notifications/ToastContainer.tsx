'use client';

import { useEffect, useState } from 'react';
import { useNotifications, Notification } from '../../../hooks/useNotifications';
import ToastNotification from './ToastNotification';

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Notification[]>([]);
  const { notifications } = useNotifications();

  useEffect(() => {
    // 새로운 알림이 추가될 때만 토스트 표시
    const latestNotification = notifications[0];
    if (latestNotification && !latestNotification.isRead) {
      // 이미 표시된 알림인지 확인
      const isAlreadyShown = toasts.some(toast => toast.id === latestNotification.id);
      if (!isAlreadyShown) {
        setToasts(prev => [latestNotification, ...prev].slice(0, 3)); // 최대 3개만 표시
      }
    }
  }, [notifications, toasts]);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast, index) => (
        <div 
          key={toast.id}
          style={{ 
            transform: `translateY(${index * 10}px)`,
            zIndex: 50 - index 
          }}
        >
          <ToastNotification
            notification={toast}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}