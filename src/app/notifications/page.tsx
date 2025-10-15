'use client';

import { useEffect, useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationItem from '@/components/notifications/NotificationItem';

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);
  const { 
    notifications, 
    fetchNotifications, 
    markAllAsRead,
    unreadCount 
  } = useNotifications();

  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);
      await fetchNotifications(filter === 'unread');
      setLoading(false);
    };
    
    loadNotifications();
  }, [filter, fetchNotifications]);

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    // 읽지 않음 필터가 활성화되어 있다면 목록 새로고침
    if (filter === 'unread') {
      await fetchNotifications(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">알림</h1>
          <p className="text-gray-600 mt-2">모든 알림을 한 곳에서 확인하세요</p>
        </div>

        {/* 필터 및 액션 바 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* 필터 탭 */}
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  전체 ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === 'unread'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  읽지 않음 ({unreadCount})
                </button>
              </div>

              {/* 모두 읽음 버튼 */}
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                >
                  모두 읽음 처리
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 알림 목록 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
              <span className="ml-3 text-gray-500">알림을 불러오는 중...</span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-5-5-5 5h5zm0 0v-2a3 3 0 00-3-3H9a3 3 0 00-3 3v2m12 0H3m9-10V7a3 3 0 00-3-3H9a3 3 0 00-3 3v0" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'unread' ? '읽지 않은 알림이 없습니다' : '알림이 없습니다'}
              </h3>
              <p className="text-gray-500">
                {filter === 'unread' 
                  ? '모든 알림을 읽으셨습니다!' 
                  : '새로운 알림이 도착하면 여기에 표시됩니다.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  showDelete={true}
                />
              ))}
            </div>
          )}
        </div>

        {/* 페이지네이션 (나중에 필요시 추가) */}
        {filteredNotifications.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            총 {filteredNotifications.length}개의 알림
          </div>
        )}
      </div>
    </div>
  );
}
