'use client';

import { useState, useEffect } from 'react';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // URL에서 에러 파라미터 확인 (useEffect로 이동)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authError = urlParams.get('error');
    
    if (authError) {
      switch (authError) {
        case 'domain_not_allowed':
          setError('숙명여자대학교 구글 계정(@sookmyung.ac.kr)만 사용 가능합니다.');
          break;
        case 'auth_failed':
          setError('OAuth2 인증에 실패했습니다. 다시 시도해주세요.');
          break;
        case 'oauth_error':
          setError('로그인 중 오류가 발생했습니다.');
          break;
        case 'server_error':
          setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
          break;
        default:
          setError('알 수 없는 오류가 발생했습니다.');
      }
      
      // URL에서 에러 파라미터 제거 (뒤로가기 시 에러 메시지 안 보이게)
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setError(''); // 이전 에러 메시지 지우기
    //rewrites로프록시됨
    window.location.href = `https://api.match-a-lot.store/oauth2/authorization/google`;

  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Match-A-lot 로그인 🎯
          </h1>
          <p className="text-gray-600">
            학습자료 매칭 플랫폼에 오신 걸 환영합니다!
          </p>
        </div>
        
        {/* 에러 메시지 (조건부 렌더링) */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <span className="text-red-500 text-xl mr-3 flex-shrink-0">⚠️</span>
              <div>
                <h3 className="text-red-800 font-semibold">로그인 실패</h3>
                <p className="text-red-700 text-sm mt-1">
                  {error}
                </p>
                {error.includes('숙명여자대학교') && (
                  <p className="text-red-600 text-xs mt-2">
                    개인 Gmail 계정이 아닌 학교에서 발급받은 계정을 사용해주세요.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-center space-x-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="font-medium text-gray-700">로그인 중...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-medium text-gray-700">Google 계정으로 로그인</span>
              </>
            )}
          </button>
          
          {/* 안내 메시지 (항상 표시) */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <span className="text-blue-500 text-lg mr-3 flex-shrink-0">ℹ️</span>
              <div>
                <p className="text-blue-800 text-sm">
                  <strong>숙명여자대학교 재학생/졸업생만</strong> 이용 가능합니다.
                </p>
                <p className="text-blue-700 text-xs mt-1">
                  학교 계정(@sookmyung.ac.kr)으로 로그인해주세요.
                </p>
              </div>
            </div>
          </div>
        </div>
        
    
      </div>
    </div>
  );
}
