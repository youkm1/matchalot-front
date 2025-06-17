export default function UploadPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        학습자료 업로드 
      </h1>
      
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">📄</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            족보나 학습자료를 업로드하세요!
          </h2>
          <p className="text-gray-600">
            다른 학우들과 자료를 공유하고 신뢰도를 쌓아보세요! 최대 5점을 얻을 수 있어요.
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <div className="text-3xl mb-4">🚧</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            업로드 기능 준비 중
          </h3>
          <p className="text-gray-600">
            곧 파일 업로드와 문제 등록 기능이 추가됩니다.
          </p>
        </div>
      </div>
    </div>
  )
}
