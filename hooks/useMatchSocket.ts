import { useEffect, useRef, useState } from 'react';
import { authAPI } from '../lib/api';

interface MatchNotification {
  type: string;
  data: any;
}

interface WebSocketMessage {
  type: string;
  data: any;
}

export const useMatchSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<MatchNotification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const [currentUser, setCurrentUser] = useState<any>(null);

  const connect = async () => {
    try {
      // 현재 사용자 정보 가져오기
      const user = await authAPI.getCurrentUser();
      setCurrentUser(user);
      
      // WebSocket 연결 (userId를 쿼리 파라미터로 전달)
      const ws = new WebSocket(`wss://api.match-a-lot.store/ws/match?userId=${user.Id}`);
      
      ws.onopen = () => {
        console.log('🔌 WebSocket 연결됨');
        setIsConnected(true);
        setSocket(ws);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const notification: MatchNotification = JSON.parse(event.data);
          console.log('📨 WebSocket 메시지 수신:', notification);
          setNotifications(prev => [...prev, notification]);
        } catch (err) {
          console.error('메시지 파싱 실패:', err);
        }
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket 연결 종료');
        setIsConnected(false);
        setSocket(null);
        
        // 재연결 시도
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 WebSocket 재연결 시도...');
          connect();
        }, 3000);
      };

      ws.onerror = (err) => {
        console.error('🚫 WebSocket 에러:', err);
        setError('WebSocket 연결 오류가 발생했습니다');
      };

    } catch (err) {
      console.error('WebSocket 연결 실패:', err);
      setError('인증 정보를 가져올 수 없습니다');
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (socket) {
      socket.close();
    }
  };

  const sendMessage = (message: WebSocketMessage) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(message));
      console.log('📤 WebSocket 메시지 전송:', message);
    } else {
      console.error('WebSocket이 연결되지 않았습니다');
      setError('서버와 연결되지 않았습니다. 다시 시도해주세요.');
    }
  };

  // 매칭 요청
  const requestMatch = (materialId: number, receiverId: number, requesterMaterialId: number) => {
    sendMessage({
      type: 'MATCH_REQUEST',
      data: {
        materialId,
        receiverId,
        requesterMaterialId
      }
    });
  };

  // 매칭 수락
  const acceptMatch = (matchId: number) => {
    sendMessage({
      type: 'MATCH_RESPONSE',
      data: {
        matchId,
        action: 'ACCEPT'
      }
    });
  };

  // 매칭 거절
  const rejectMatch = (matchId: number) => {
    sendMessage({
      type: 'MATCH_RESPONSE',
      data: {
        matchId,
        action: 'REJECT'
      }
    });
  };

  // 매칭 완료
  const completeMatch = (matchId: number) => {
    sendMessage({
      type: 'MATCH_RESPONSE',
      data: {
        matchId,
        action: 'COMPLETE'
      }
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = (index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    connect();
    return () => disconnect();
  }, []);

  return {
    isConnected,
    notifications,
    error,
    currentUser,
    requestMatch,
    acceptMatch,
    rejectMatch,
    completeMatch,
    clearNotifications,
    removeNotification,
    reconnect: connect
  };
};