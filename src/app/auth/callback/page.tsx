'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { User } from '../../../../types';

const API_BASE_URL =  'https://api.match-a-lot.store';

interface UserInfo {
  email: string;
  nickname: string;
}

interface AuthData {
  user: User;
  isNewUser: boolean;
  message: string;
}

// 기존 로직을 별도 컴포넌트로 분리
function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const success = searchParams.get('success');
        const error = searchParams.get('error');
        const action = searchParams.get('action');
        const isNewUser = searchParams.get('isNewUser');
        
        if (error) {
          setStatus('error');
          setMessage(decodeURIComponent(searchParams.get('message') || '로그인 중 오류가 발생했습니다.'));
          return;
        }

        if (success === 'true') {
          setStatus('success');
          setMessage(isNewUser === 'true' ? '회원가입이 완료되었습니다!' : '로그인이 완료되었습니다!');
          
          try {
            const userResponse = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Accept': 'application/json',
              }
            });

            if (userResponse.ok) {
              const userData = await userResponse.json();
              setUserInfo({
                email: userData.email,
                nickname: userData.nickname
              });
            }
          } catch (error) {
            console.log('Failed to fetch user info:', error);
          }

          setTimeout(() => {
            if (isNewUser === 'true') {
              router.push('/welcome');
            } else {
              router.push('/materials');
            }
          }, 2000);
          return;
        }

        if (action === 'signup') {
          const email = searchParams.get('email');
          const name = searchParams.get('name');
          
          if (email && name) {
            setUserInfo({
              email: decodeURIComponent(email),
              nickname: decodeURIComponent(name)
            });
          }
          
          setStatus('signup');
          setMessage('신규 사용자입니다. 회원가입을 진행합니다...');
          await performSignup();
          return;
        }

        await checkAuthStatus();

      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('인증 처리 중 네트워크 오류가 발생했습니다.');
      }
    };

    const checkAuthStatus = async () => {
      try {
        const statusResponse = await fetch(`${API_BASE_URL}/api/v1/auth/callback`, {
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

        setUserInfo({
          email: statusData.email,
          nickname: statusData.nickname
        });

        if (statusData.action === 'login_complete') {
          setStatus('success');
          setMessage('로그인이 완료되었습니다!');
          
          setTimeout(() => {
            router.push('/materials');
          }, 2000);
        } else if (statusData.action === 'signup') {
          setStatus('signup');
          setMessage('신규 사용자입니다. 회원가입을 진행합니다...');
          await performSignup();
        } else if (statusData.action === 'login') {
          setStatus('login');
          setMessage('기존 사용자입니다. 로그인을 진행합니다...');
          await performLogin();
        }
      } catch (error) {
        console.error('Auth status check error:', error);
        setStatus('error');
        setMessage('인증 상태 확인 중 오류가 발생했습니다.');
      }
    };

    const performLogin = async () => {
      try {
        setIsProcessing(true);
        
        try {
          const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('auth-token='))
            ?.split('=')[1];
          const headers = {
            'Accept': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          };
          
          const currentUserResponse = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
            method: 'GET',
            credentials: 'include',
            headers
          });

          if (currentUserResponse.ok) {
            const userData = await currentUserResponse.json();
            console.log('Already logged in:', userData);
            
            handleAuthSuccess({
              user: userData,
              message: '로그인이 완료되었습니다!',
              isNewUser: false
            }, false);
            return;
          }
        } catch (error) {
          console.log('Not logged in yet, proceeding with login...');
        }

        const loginResponse = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });

        const contentType = loginResponse.headers.get('content-type');
        let loginData;
        
        if (contentType && contentType.includes('application/json')) {
          loginData = await loginResponse.json();
        } else {
          const textResponse = await loginResponse.text();
          console.log('Non-JSON response:', textResponse);
          loginData = { error: textResponse };
        }

        if (loginResponse.ok && loginData.user) {
          handleAuthSuccess(loginData, false);
        } else {
          setStatus('error');
          setMessage(loginData.message || loginData.error || '로그인에 실패했습니다.');
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
        
        const signupResponse = await fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });

        const contentType = signupResponse.headers.get('content-type');
        let signupData;
    
        if (contentType && contentType.includes('application/json')) {
          signupData = await signupResponse.json();
        } else {
          const textResponse = await signupResponse.text();
          console.log('Non-JSON response:', textResponse);
          signupData = { error: textResponse };
        }

        if (signupResponse.ok && signupData.user) {
          handleAuthSuccess(signupData, signupData.isNewUser);
        } else if (signupData.message?.includes('이미 가입된 사용자')) {
          setMessage('이미 가입된 사용자입니다. 로그인을 진행합니다...');
          await performLogin();
        } else {
          setStatus('error');
          setMessage(signupData.message || signupData.error || '회원가입에 실패했습니다.');
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

      if (data.user) {
        setUserInfo({
          email: data.user.email,
          nickname: data.user.nickname
        });
      }

      if (isNewUser) {
        console.log('New user signup:', data.user);
      } else {
        console.log('User login:', data.user);
      }

      setTimeout(() => {
        if (isNewUser) {
          router.push('/welcome');
        } else {
          router.push('/materials');
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

// Suspense로 감싼 메인 컴포넌트
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">로딩 중...</h2>
          <p className="text-gray-600">잠시만 기다려주세요.</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
