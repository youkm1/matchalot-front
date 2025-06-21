'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface UserInfo {
  email: string;
  nickname: string;
}

interface AuthData {
  user: {
    id: number;
    nickname: string;
    email: string;
    trustScore: number;
    createdAt: string;
  };
  isNewUser: boolean;
  message: string;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('checking'); // checking, login, signup, success, error
  const [message, setMessage] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // URL 파라미터 확인
        const success = searchParams.get('success');
        const error = searchParams.get('error');
        
        if (error) {
          setStatus('error');
          setMessage(decodeURIComponent(searchParams.get('message') || '로그인 중 오류가 발생했습니다.'));
          return;
        }

        if (success !== 'true') {
          setStatus('error');
          setMessage('잘못된 콜백 요청입니다.');
          return;
        }

        // 1단계: 사용자 상태 확인
        const statusResponse = await fetch('/api/v1/auth/callback', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });

        if (!statusResponse.ok) {
          throw new Error(`HTTP ${statusResponse.status}: ${statusResponse.statusText}`);
        }

        const statusData = await statusResponse.json();

        if (statusData.status === 'error') {
          setStatus('error');
          setMessage(statusData.message);
          return;
        }

        // 사용자 정보 저장
        setUserInfo({
          email: statusData.email,
          nickname: statusData.nickname
        });

        if (statusData.action === 'login') {
          setStatus('login');
          setMessage('기존 사용자입니다. 로그인을 진행합니다...');
          await performLogin();
        } else if (statusData.action === 'signup') {
          setStatus('signup');
          setMessage('신규 사용자입니다. 회원가입을 진행합니다...');
          await performSignup();
        }

      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('인증 처리 중 네트워크 오류가 발생했습니다.');
      }
    };

    const performLogin = async () => {
      try {
        setIsProcessing(true);
        
        const loginResponse = await fetch('/api/v1/auth/login', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });

        const loginData = await loginResponse.json();

        if (loginData.token) {
          handleAuthSuccess(loginData, false);
        } else {
          setStatus('error');
          setMessage(loginData.message || '로그인에 실패했습니다.');
        }
      } catch (error) {
        console.error('Login error:', error);
        setStatus('error');
        setMessage('로그인 처리 중 오류가 발생했습니다.');
      } finally {
        setIsProcessing(false);
      }
    };

    const performSignup = async () => {
      try {
        setIsProcessing(true);
        
        const signupResponse = await fetch('/api/v1/auth/signup', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });

        const signupData = await signupResponse.json();

        if (signupData.token) {
          handleAuthSuccess(signupData, signupData.isNewUser);
        } else if (signupData.message?.includes('이미 가입된 사용자')) {
          setMessage('이미 가입된 사용자입니다. 로그인을 진행합니다...');
          await performLogin();
        } else {
          setStatus('error');
          setMessage(signupData.message || '회원가입에 실패했습니다.');
        }
      } catch (error) {
        console.error('Signup error:', error);
        setStatus('error');
        setMessage('회원가입 처리 중 오류가 발생했습니다.');
      } finally {
        setIsProcessing(false);
      }
    };

    const handleAuthSuccess = (data: AuthData, isNewUser: boolean) => {
      
      setStatus('success');
      setMessage(isNewUser ? '회원가입이 완료되었습니다!' : '로그인이 완료되었습니다!');

      
      if (isNewUser) {
        console.log('New user signup:', data.user);
      } else {
        console.log('User login:', data.user);
      }

      // 2초 후 리다이렉트
      setTimeout(() => {
        if (isNewUser) {
          router.push('/welcome'); // 신규 사용자 온보딩
        } else {
          router.push('/materials'); // 기존 사용자 메인 페이지
        }
      }, 2000);
    };

    handleAuthCallback();
  }, [router, searchParams]);

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">사용자 정보 확인 중...</h2>
          <p className="text-gray-600">Google 계정 정보를 확인하고 있어요.</p>
        </div>
      </div>
    );
  }

  if (status === 'login' || status === 'signup') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {status === 'login' ? '로그인 처리 중...' : '회원가입 처리 중...'}
          </h2>
          <p className="text-gray-600">{message}</p>
          {userInfo && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>{userInfo.nickname}</strong> ({userInfo.email})
              </p>
            </div>
          )}
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
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">인증 실패</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          
          <button 
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            로그인 페이지로 돌아가기
          </button>
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
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">인증 성공!</h2>
          <p className="text-gray-600 mb-4">{message}</p>
          
          {userInfo && (
            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                환영합니다, <strong>{userInfo.nickname}</strong>님!
              </p>
            </div>
          )}
          
          <div className="text-sm text-gray-500">
            곧 메인 페이지로 이동합니다...
          </div>
        </div>
      </div>
    );
  }

  return null;
}
