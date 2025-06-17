export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            매치어랏 🎯
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
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors">
              학습자료 둘러보기
            </button>
            <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors">
              로그인하기
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            왜 매치얼랏인가요?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 rounded-lg bg-blue-50">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                신뢰할 수 있는 매칭
              </h3>
              <p className="text-gray-600">
                신뢰도 시스템으로 안전하고 신뢰할 수 있는 
                학습자료 교환을 보장합니다.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 rounded-lg bg-green-50">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                다양한 학습자료
              </h3>
              <p className="text-gray-600">
                중간고사, 기말고사 족보부터 
                과제, 프로젝트까지 다양한 자료를 만나보세요.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 rounded-lg bg-purple-50">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                빠른 매칭
              </h3>
              <p className="text-gray-600">
                원하는 자료를 쉽고 빠르게 찾고,
                실시간으로 매칭 요청을 주고받으세요.
              </p>
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
