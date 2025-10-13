import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = 'https://api.match-a-lot.store';

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedEntityId?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // SSE 연결
  const connectSSE = useCallback(() => {
    if (eventSource) {
      eventSource.close();
    }

    const sse = new EventSource(`${API_BASE_URL}/api/v1/notifications/stream`, {
      withCredentials: true
    });

    sse.addEventListener('notification', (event) => {
      try {
        const notification: Notification = JSON.parse(event.data);
        handleNewNotification(notification);
      } catch (error) {
        console.error('알림 파싱 에러:', error);
      }
    });

    sse.addEventListener('heartbeat', () => {
      console.log('SSE 연결 유지 중...');
    });

    sse.onopen = () => {
      console.log('SSE 연결 성공');
      setIsConnected(true);
    };

    sse.onerror = (error) => {
      console.error('SSE 연결 에러:', error);
      setIsConnected(false);
      
      // 3초 후 재연결 시도
      setTimeout(() => {
        if (sse.readyState === EventSource.CLOSED) {
          console.log('SSE 재연결 시도...');
          connectSSE();
        }
      }, 3000);
    };

    setEventSource(sse);
  }, [eventSource]);

  // 새 알림 처리
  const handleNewNotification = useCallback((notification: Notification) => {
    console.log('새 알림 수신:', notification);
    
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // 브라우저 알림 권한이 있으면 표시
    if (Notification.permission === 'granted') {
      new window.Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico'
      });
    }
  }, []);

  // 읽지 않은 개수 조회
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/notifications/unread-count`, {
        credentials: 'include'
      });
      
      if (response.status === 401) {
        // 로그인 필요
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('읽지 않은 알림 개수 조회 실패:', error);
    }
  }, []);

  // 알림 목록 조회
  const fetchNotifications = useCallback(async (unreadOnly = false) => {
    try {
      const url = unreadOnly 
        ? `${API_BASE_URL}/api/v1/notifications?unread=true`
        : `${API_BASE_URL}/api/v1/notifications`;
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('알림 목록 조회 실패:', error);
    }
  }, []);

  // 알림 읽음 처리
  const markAsRead = useCallback(async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/notifications/${id}/read`, {
        method: 'PUT',
        credentials: 'include'
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
    }
  }, []);

  // 모든 알림 읽음 처리
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/notifications/read-all`, {
        method: 'PUT',
        credentials: 'include'
      });
      
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('모든 알림 읽음 처리 실패:', error);
    }
  }, []);

  // 알림 삭제
  const deleteNotification = useCallback(async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/notifications/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        const notification = notifications.find(n => n.id === id);
        if (notification && !notification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('알림 삭제 실패:', error);
    }
  }, [notifications]);

  // 브라우저 알림 권한 요청
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  // 초기화
  useEffect(() => {
    fetchUnreadCount();
    fetchNotifications();
    connectSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
    fetchUnreadCount,
    requestNotificationPermission
  };
};