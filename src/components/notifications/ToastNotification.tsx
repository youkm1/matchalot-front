'use client';

import { useEffect, useState } from 'react';
import { Notification } from '@/hooks/useNotifications';

interface ToastNotificationProps {
  notification: Notification;
  onClose: () => void;
  duration?: number;
}

export default function ToastNotification({ 
  notification, 
  onClose, 
  duration = 5000 
}: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 애니메이션을 위해 약간 지연 후 표시
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // 자동 닫기
    const closeTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // 애니메이션 완료 후 제거
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(closeTimer);
    };
  }, [duration, onClose]);

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

  const getThemeColor = (type: string) => {
    switch(type) {
      case 'USER_PROMOTED': return 'border-l-green-500 bg-green-50';
      case 'MATERIAL_APPROVED': return 'border-l-green-500 bg-green-50';
      case 'MATERIAL_REJECTED': return 'border-l-red-500 bg-red-50';
      case 'MATCH_COMPLETED': return 'border-l-blue-500 bg-blue-50';
      case 'MATCH_REQUEST_RECEIVED': return 'border-l-purple-500 bg-purple-50';
      case 'SYSTEM': return 'border-l-gray-500 bg-gray-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div 
      className={`transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`w-80 bg-white border-l-4 rounded-lg shadow-lg overflow-hidden ${getThemeColor(notification.type)}`}>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 text-xl">
              {getIcon(notification.type)}
            </div>
            
            <div className="flex-1 min-w-0 text-left">
              <h4 className="text-sm font-semibold text-gray-900 mb-1 leading-tight">
                {notification.title}
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed break-words">
                {notification.message}
              </p>
            </div>
            
            <button
              onClick={handleClose}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* 진행률 바 */}
        <div className="h-1 bg-gray-200">
          <div 
            className="h-full bg-blue-500 transition-all ease-linear"
            style={{
              animation: `shrink ${duration}ms linear forwards`
            }}
          />
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}