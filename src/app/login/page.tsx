'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(''); // 이전 에러 메시지 지우기
      
      // Google OAuth2 로그인 시도
      // 실제로는 Spring Boot OAuth2 엔드포인트로 리다이렉트
      window.location.href = 'http://localhost:8080/login/oauth2/code/google';
      
    } catch (err) {
      setIsLoading(false);
      setError('로그인 중 오류가 발생했습니다.');
    }
  };

  // URL에서 에러 파라미터 확인 (Spring에서 리다이렉트 시)
  const urlParams = new URLSearchParams(window.location.search);
  const authError = urlParams.get('error');
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            매치얼랏 로그인 🎯
          </h1>
          <p className="text-gray-600">
            학습자료 매칭 플랫폼에 오신 걸 환영합니다!
          </p>
        </div>
        
        {/* 에러 메시지 (조건부 렌더링) */}
        {(error || authError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-red-500 text-xl mr-2">⚠️</span>
              <div>
                <h3 className="text-red-800 font-semibold">로그인 실패</h3>
                <p className="text-red-700 text-sm mt-1">
                  {authError === 'domain_not_allowed' 
                    ? '숙명여자대학교 구글 계정(@sookmyung.ac.kr)만 사용 가능합니다.'
                    : error || '알 수 없는 오류가 발생했습니다.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-center space-x-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="font-medium text-gray-700">로그인 중...</span>
              </>
            ) : (
              <>
                <span className="text-xl">🔍</span>
                <span className="font-medium text-gray-700">Google 계정으로 로그인</span>
              </>
            )}
          </button>
          
          {/* 정상적인 안내 메시지 (항상 표시) */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start">
              <span className="text-blue-500 text-sm mr-2">ℹ️</span>
              <p className="text-blue-800 text-sm">
                <strong>숙명여자대학교 재학생/졸업생만</strong> 이용 가능합니다.
                <br />
                학교 계정(@sookmyung.ac.kr)으로 로그인해주세요.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            로그인하면 이용약관과 개인정보처리방침에 동의하는 것으로 간주됩니다.
          </p>
        </div>

        {/* 개발용 정보 (나중에 제거) */}
        <div className="mt-6 p-3 bg-gray-100 rounded text-xs text-gray-600">
          <strong>개발 정보:</strong>
          <br />• 성공: user@sookmyung.ac.kr
          <br />• 실패: user@gmail.com → 에러 메시지 표시
        </div>
      </div>
    </div>
  );
}
