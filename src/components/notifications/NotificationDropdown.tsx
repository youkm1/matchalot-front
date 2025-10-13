'use client';

import { useEffect, useState } from 'react';
import { useNotifications, Notification } from '../../../hooks/useNotifications';
import NotificationItem from './NotificationItem';

interface NotificationDropdownProps {
  onClose: () => void;
}

export default function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const [loading, setLoading] = useState(true);
  const { 
    notifications, 
    markAllAsRead, 
    fetchNotifications 
  } = useNotifications();

  useEffect(() => {
    const loadNotifications = async () => {
      await fetchNotifications();
      setLoading(false);
    };
    
    loadNotifications();
  }, [fetchNotifications]);

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <>
      {/* 배경 클릭 시 닫기 */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      <div className="absolute top-full right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-lg shadow-lg z-50 md:w-96">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">알림</h3>
          {notifications.some(n => !n.isRead) && (
            <button 
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              모두 읽음
            </button>
          )}
        </div>

        {/* 본문 */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="w-6 h-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
              <span className="ml-2 text-gray-500">로딩 중...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-5-5-5 5h5zm0 0v-2a3 3 0 00-3-3H9a3 3 0 00-3 3v2m12 0H3m9-10V7a3 3 0 00-3-3H9a3 3 0 00-3 3v0" />
              </svg>
              <p>알림이 없습니다</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.slice(0, 10).map(notification => (
                <NotificationItem 
                  key={notification.id}
                  notification={notification}
                  onClick={onClose}
                />
              ))}
            </div>
          )}
        </div>

        {/* 푸터 */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <a 
              href="/notifications"
              className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
              onClick={onClose}
            >
              모든 알림 보기
            </a>
          </div>
        )}
      </div>
    </>
  );
}