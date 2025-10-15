'use client';

import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';

export default function NotificationBell() {
  const [showDropdown, setShowDropdown] = useState(false);
  const { unreadCount, isConnected } = useNotifications();

  return (
    <div className="relative">
      <button 
        className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
        onClick={() => setShowDropdown(!showDropdown)}
        aria-label="알림"
      >
        <span className="text-2xl">🔔</span>
        
        {/* 읽지 않은 알림 배지 */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        
        {/* 연결 상태 표시 */}
        <span 
          className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-400' : 'bg-gray-400'
          }`}
          title={isConnected ? '실시간 알림 연결됨' : '연결 끊김'}
        />
      </button>

      {showDropdown && (
        <NotificationDropdown onClose={() => setShowDropdown(false)} />
      )}
    </div>
  );
}
