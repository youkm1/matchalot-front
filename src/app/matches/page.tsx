export default function MatchesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        매칭 관리 
      </h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">
            받은 요청
          </h2>
          <div className="text-center py-8">
            <div className="text-3xl mb-2">📥</div>
            <p className="text-blue-700">새로운 매칭 요청이 없습니다.</p>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-900 mb-4">
            보낸 요청
          </h2>
          <div className="text-center py-8">
            <div className="text-3xl mb-2">📤</div>
            <p className="text-green-700">보낸 매칭 요청이 없습니다.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
