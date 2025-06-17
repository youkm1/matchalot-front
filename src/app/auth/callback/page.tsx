'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // OAuth2 콜백 후 백엔드에서 처리된 결과를 받아옴
        const response = await fetch('/api/auth/callback', {
          method: 'GET',
          credentials: 'include', // 쿠키 포함
        });

        const data = await response.json();

        if (response.ok && data.token) {
          // 성공 처리
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          setStatus('success');
          setMessage(data.message);
          setIsNewUser(data.isNewUser);
          setUser(data.user);

          // 신규 사용자 트래킹
          if (data.isNewUser) {
            console.log('New user signup:', data.user);
            // 여기서 analytics 트래킹 가능
            // analytics.track('user_signup', { source: 'google_oauth' });
          } else {
            console.log('Existing user login:', data.user);
            // analytics.track('user_login');
          }

          // 3초 후 리다이렉트 (메시지 읽을 시간)
          setTimeout(() => {
            if (data.isNewUser) {
              // 신규 사용자: 온보딩 또는 프로필 설정
              router.push('/welcome');
            } else {
              // 기존 사용자: 바로 메인 페이지
              router.push('/materials');
            }
          }, 3000);

        } else {
          // 에러 처리
          setStatus('error');
          setMessage(data.message || '로그인 중 오류가 발생했습니다.');
        }

      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('네트워크 오류가 발생했습니다.');
      }
    };

    handleAuthCallback();
  }, [router]);

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">로그인 처리 중...</h2>
          <p className="text-gray-600">Google 계정 정보를 확인하고 있어요.</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-600 text-2xl">✅</span>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {isNewUser ? '가입 완료!' : '로그인 성공!'}
          </h2>
          
          {isNewUser ? (
            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                매치얼랏에 오신 걸 환영해요! 🎉
              </p>
              <p className="text-sm text-gray-500">
                {user?.nickname}님의 계정이 성공적으로 생성되었습니다.
              </p>
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-blue-600 text-sm">신뢰도</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    0점 (시작)
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  족보 공유로 신뢰도를 쌓아보세요!
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                다시 오신 걸 환영해요, {user?.nickname}님! 👋
              </p>
              <div className="mt-3 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-green-600 text-sm">현재 신뢰도</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    user?.trustScore >= 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user?.trustScore >= 0 ? '+' : ''}{user?.trustScore}점
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <p className="text-sm text-gray-500">
            {isNewUser 
              ? '서비스 사용법을 안내해드릴게요...' 
              : '학습자료 페이지로 이동합니다...'
            }
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">로그인 실패</h2>
          <div className="text-gray-600 mb-6">
            <p className="mb-2">{message}</p>
            {message.includes('숙명여자대학교') && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                <p className="text-yellow-800 font-semibold mb-1">💡 해결 방법:</p>
                <ul className="text-yellow-700 text-left space-y-1">
                  <li>• 개인 Gmail이 아닌 학교 계정을 사용해주세요</li>
                  <li>• @sookmyung.ac.kr로 끝나는 계정인지 확인해주세요</li>
                </ul>
              </div>
            )}
          </div>
          <button 
            onClick={() => router.push('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            다시 로그인하기
          </button>
        </div>
      </div>
    );
  }
}
