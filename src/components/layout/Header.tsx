'use client'; //사용자와 상호작용 UI

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { authAPI } from '../../../lib/api';

interface User {
  Id: number;
  nickname: string
  eamil: string
  trustScore: number;
  createdAt: string
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null); 
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
  const checkAuth = async () => {
    console.log('🔍 Header: 인증 상태 확인 시작');
    console.log('🔍 Header: 현재 쿠키:', document.cookie);
    
    try {
      const currentUser = await authAPI.getCurrentUser();
      console.log('🔍 Header: 사용자 정보 받음:', currentUser);
      setUser(currentUser);
    } catch (error) {
      console.log('✅ Header: 인증 실패 (정상):', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  checkAuth();
}, []);


  const handleLogout = async () => {
  console.log(' 로그아웃 시작');
  
  try {
  
    const response = await authAPI.logout();
    
    console.log('백엔드 로그아웃:', response.status);
  } catch (error) {
    console.warn('백엔드 로그아웃 실패:', error);
  }

  // 클라이언트 정리
  setUser(null);
  
  const visibleCookies = document.cookie.split(";");
  console.log('👀 보이는 쿠키들:', visibleCookies);
  
  visibleCookies.forEach(cookie => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    const cookieName = name.trim();
    
    if (cookieName) {
      // 여러 경로에서 삭제 시도
      const paths = ['/', '/api', '/oauth2'];
      paths.forEach(path => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
      });
      console.log('🍪 일반 쿠키 삭제:', cookieName);
    }
  });
  sessionStorage.clear();
  localStorage.clear();
  console.log('스토리지 클리어 후 홈페이지로 이동');
  window.location.replace('/');
};

  
  const isLoggedIn = user !== null;

  const getAvatarLetter = (nickname: string) => {
    return nickname ? nickname.charAt(0) : 'U';
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 3) return 'bg-green-100 text-green-800';
    if (score >= 0) return 'bg-blue-100 text-blue-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🎯</span>
            <span className="text-xl font-bold text-gray-900">Match-a-lot</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/materials" 
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              학습자료
            </Link>
            <Link 
              href="/matches" 
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              매칭관리
            </Link>
            <Link 
              href="/upload" 
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              자료업로드
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoading ? (
              // ✅ 로딩 상태
              <div className="w-8 h-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
            ) : isLoggedIn && user ? (
              <>
                {/* ✅ 실제 사용자 정보 표시 */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {getAvatarLetter(user.nickname)}
                      </span>
                    </div>
                    <span className="text-gray-700 font-medium">{user.nickname}님</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getTrustScoreColor(user.trustScore)}`}>
                      신뢰도 {user.trustScore > 0 ? '+' : ''}{user.trustScore}
                    </span>
                  </div>
                  <Link 
                    href="/profile"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    마이페이지
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-red-600 transition-colors"
                  >
                    로그아웃
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* 로그아웃 상태 */}
                <Link 
                  href="/login"
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  로그인
                </Link>
                <Link 
                  href="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  시작하기
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/materials"
                className="text-gray-600 hover:text-blue-600 font-medium px-2 py-1 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                학습자료
              </Link>
              <Link 
                href="/matches"
                className="text-gray-600 hover:text-blue-600 font-medium px-2 py-1 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                매칭관리
              </Link>
              <Link 
                href="/upload"
                className="text-gray-600 hover:text-blue-600 font-medium px-2 py-1 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                자료업로드
              </Link>
              
              {/* Mobile Auth */}
              <div className="pt-4 border-t border-gray-200">
                {isLoggedIn && user ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 px-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {getAvatarLetter(user.nickname)}
                        </span>
                      </div>
                      <span className="text-gray-700 font-medium">{user.nickname}님</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getTrustScoreColor(user.trustScore)}`}>
                        신뢰도 {user.trustScore > 0 ? '+' : ''}{user.trustScore}
                      </span>
                    </div>
                    <Link 
                      href="/profile"
                      className="block text-gray-600 hover:text-blue-600 font-medium px-2 py-1 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      마이페이지
                    </Link>
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }}
                      className="block text-gray-600 hover:text-red-600 font-medium px-2 py-1 transition-colors w-full text-left"
                    >
                      로그아웃
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link 
                      href="/login"
                      className="block text-gray-600 hover:text-blue-600 font-medium px-2 py-1 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      로그인
                    </Link>
                    <Link 
                      href="/login"
                      className="block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      시작하기
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
