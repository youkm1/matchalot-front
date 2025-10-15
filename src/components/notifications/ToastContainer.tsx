'use client';

import { useEffect, useState } from 'react';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import ToastNotification from './ToastNotification';

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Notification[]>([]);
  const [shownNotificationIds, setShownNotificationIds] = useState<Set<number>>(new Set());
  const { notifications } = useNotifications();

  // localStorage에서 이미 표시된 알림 ID들 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('shownNotificationIds');
      if (stored) {
        try {
          const ids = JSON.parse(stored);
          setShownNotificationIds(new Set(ids));
        } catch (e) {
          console.error('Failed to parse shownNotificationIds:', e);
        }
      }
    }
  }, []);

  useEffect(() => {
    // 새로운 알림이 추가될 때만 토스트 표시
    const latestNotification = notifications[0];
    if (latestNotification && !latestNotification.isRead) {
      // 이미 표시된 알림인지 확인
      if (!shownNotificationIds.has(latestNotification.id)) {
        setToasts(prev => [latestNotification, ...prev].slice(0, 3)); // 최대 3개만 표시
        setShownNotificationIds(prev => {
          const newSet = new Set([...prev, latestNotification.id]);
          // localStorage에 저장
          if (typeof window !== 'undefined') {
            localStorage.setItem('shownNotificationIds', JSON.stringify([...newSet]));
          }
          return newSet;
        });
      }
    }
  }, [notifications, shownNotificationIds]);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // 알림이 읽음 처리되면 토스트에서도 제거
  useEffect(() => {
    setToasts(prev => prev.filter(toast => !toast.isRead));
  }, [notifications]);

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3">
      {toasts.map((toast, index) => (
        <div 
          key={toast.id}
          style={{ 
            transform: `translateY(${index * 8}px)`,
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
