'use client'; //사용자와 상호작용 UI

import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 임시로 false

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
            {isLoggedIn ? (
              <>
                {/* Logged in state */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">카</span>
                    </div>
                    <span className="text-gray-700 font-medium">카렌님</span>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      신뢰도 +3
                    </span>
                  </div>
                  <Link 
                    href="/profile"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    마이페이지
                  </Link>
                  <button className="text-gray-600 hover:text-red-600 transition-colors">
                    로그아웃
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Logged out state */}
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
                {isLoggedIn ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 px-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">카</span>
                      </div>
                      <span className="text-gray-700 font-medium">카렌님</span>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        신뢰도 +3
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
                      className="block text-gray-600 hover:text-red-600 font-medium px-2 py-1 transition-colors w-full text-left"
                      onClick={() => setIsMenuOpen(false)}
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
