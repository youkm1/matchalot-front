'use client';

import { useNotifications, Notification } from '@/hooks/useNotifications';

interface NotificationItemProps {
  notification: Notification;
  onClick?: () => void;
  showDelete?: boolean;
}

export default function NotificationItem({ 
  notification, 
  onClick, 
  showDelete = false 
}: NotificationItemProps) {
  const { markAsRead, deleteNotification } = useNotifications();

  const getIcon = (type: string) => {
    switch(type) {
      case 'USER_PROMOTED': return '🎉';
      case 'MATERIAL_APPROVED': return '✅';
      case 'MATERIAL_REJECTED': return '❌';
      case 'MATCH_COMPLETED': return '🤝';
      case 'MATCH_REQUEST_RECEIVED': return '📬';
      case 'SYSTEM': return '📢';
      default: return '📢';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return '방금 전';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}일 전`;
    
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleClick = async () => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    onClick?.();
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification(notification.id);
  };

  return (
    <div 
      className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
        !notification.isRead ? 'bg-blue-50 border-l-4 border-blue-500' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        {/* 아이콘 */}
        <div className="flex-shrink-0 text-2xl">
          {getIcon(notification.type)}
        </div>
        
        {/* 내용 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className={`text-sm font-medium ${
                !notification.isRead ? 'text-gray-900' : 'text-gray-700'
              }`}>
                {notification.title}
              </h4>
              <p className={`text-sm mt-1 ${
                !notification.isRead ? 'text-gray-700' : 'text-gray-500'
              }`}>
                {notification.message}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {formatTime(notification.createdAt)}
              </p>
            </div>
            
            {/* 읽지 않음 표시 */}
            {!notification.isRead && (
              <div className="flex-shrink-0 ml-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
            )}
            
            {/* 삭제 버튼 */}
            {showDelete && (
              <button
                onClick={handleDelete}
                className="flex-shrink-0 ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                title="삭제"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
