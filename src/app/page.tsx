'use client'
import Link from "next/link";
import { useEffect } from "react";
import { authAPI } from "@/lib/api";

export default function HomePage() {
  useEffect(() => {
    const initializeCsrfToken = async () => {
      try {
        await authAPI.getCsrfToken();

      } catch (error) {
        console.warn("csrf 토큰 생성 실패: ", error);
      }
    };
    initializeCsrfToken();
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Match-a-lot 🎯
          </h1>
          <p className="text-2xl text-gray-600 mb-4 max-w-3xl mx-auto">
            숙명대학교 학습자료 매칭 플랫폼
          </p>
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            족보를 공유하고 서로 도움을 주고받으세요! 
            신뢰할 수 있는 학습자료 교환으로 함께 성장해요.
          </p>
          
          {/* CTA Buttons */}
          <div className="space-x-4 mb-16">
            <Link href="/materials">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors">
                학습자료 둘러보기
              </button>
            </Link>
            <Link href="/login">
              <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors">
                로그인하기
              </button>
            </Link>
          </div>

          {/* 스크롤 다운 버튼 */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                document.getElementById('features-section')?.scrollIntoView({ 
                  behavior: 'smooth' 
                });
              }}
              className="group flex flex-col items-center text-blue-600 hover:text-blue-700 transition-colors"
            >
              <div className="text-sm font-medium mb-2">서비스 소개 보기</div>
              <div className="animate-bounce">
                <svg 
                  className="w-6 h-6 group-hover:scale-110 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 14l-7 7m0 0l-7-7m7 7V3" 
                  />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features-section" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            왜 Match-a-lot인가요?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Feature 1 */}
            <div className="text-center p-6 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                안전한 1:1 매칭 시스템
              </h3>
              <p className="text-gray-600 mb-4">
                신뢰도 점수로 안전한 상대방을 확인하고, 
                상호 동의 후에만 자료를 교환합니다.
              </p>
              <div className="text-sm text-blue-600 font-medium">
                ✓ 신뢰도 시스템 ✓ 매칭 승인 필수
              </div>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                족보 + 해설 패키지
              </h3>
              <p className="text-gray-600 mb-4">
                단순 족보가 아닌 문제별 정답과 상세한 해설까지! 
                실제 공부에 도움되는 완전한 자료를 제공합니다.
              </p>
              <div className="text-sm text-green-600 font-medium">
                ✓ 문제 + 정답 + 해설 ✓ 과목별 분류
              </div>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                실시간 매칭 알림
              </h3>
              <p className="text-gray-600 mb-4">
                매칭 요청부터 승인, 완료까지 모든 과정을 
                실시간으로 알려드려 놓치지 않아요.
              </p>
              <div className="text-sm text-purple-600 font-medium">
                ✓ 즉시 알림 ✓ 매칭 상태 추적
              </div>
            </div>
          </div>

          {/* 상세 기능 소개 */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
              🔍 주요 기능 상세 가이드
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* 매칭 시스템 설명 */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">매칭 요청은 어떻게 하나요?</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      원하는 족보를 찾아 <span className="font-medium text-blue-600">"매칭 요청"</span> 버튼을 누르고, 
                      내가 가진 자료를 선택해서 교환 제안을 보내면 됩니다. 
                      상대방이 수락하면 서로의 해설을 볼 수 있어요!
                    </p>
                  </div>
                </div>
              </div>

              {/* 업로드 시스템 설명 */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">족보 업로드는 어떻게 하나요?</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      PDF 족보를 업로드하고 문제별로 <span className="font-medium text-green-600">정답과 해설</span>을 직접 작성합니다. 
                      관리자 승인 후 다른 사용자들과 매칭할 수 있어요. 
                      모든 문제가 아닌 중요한 문제만 선별해서 올려도 OK!
                    </p>
                  </div>
                </div>
              </div>

              {/* 신뢰도 시스템 설명 */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-start space-x-4">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">신뢰도 점수는 무엇인가요?</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      좋은 자료를 올리고 성실하게 매칭에 참여할수록 <span className="font-medium text-orange-600">신뢰도가 상승</span>합니다. 
                      높은 신뢰도를 가진 사용자와 매칭할 때 더 안심하고 양질의 자료를 기대할 수 있어요!
                    </p>
                  </div>
                </div>
              </div>

              {/* 매칭 완료 후 */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">매칭 완료 후에는 뭘 할 수 있나요?</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      매칭이 완료되면 <span className="font-medium text-purple-600">상대방의 해설과 정답</span>을 자유롭게 볼 수 있습니다. 
                      매칭 관리 페이지에서 완료된 매칭 목록을 확인하고 
                      언제든지 다시 볼 수 있어요!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            이렇게 사용해요!
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-xl">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">가입하기</h3>
                <p className="text-gray-600 text-sm">숙명대 구글 계정으로 간편 가입</p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 font-bold text-xl">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">자료 업로드</h3>
                <p className="text-gray-600 text-sm">내가 가진 족보나 자료를 올리기</p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 font-bold text-xl">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">매칭 요청</h3>
                <p className="text-gray-600 text-sm">원하는 자료에 매칭 요청 보내기</p>
              </div>
              
              <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-orange-600 font-bold text-xl">4</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">자료 교환</h3>
                <p className="text-gray-600 text-sm">서로의 자료를 안전하게 교환</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">매치얼랏</h3>
          <p className="text-gray-400 mb-6">
            숙명여자대학교 학습자료 매칭 플랫폼
          </p>
          <div className="space-x-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              이용약관
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              개인정보처리방침
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              문의하기
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
