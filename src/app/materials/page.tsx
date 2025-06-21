
// ✅ 'use client' 제거 - Server Component로 동작

import Link from 'next/link';
import { getServerExamTypes, getServerMaterials, getServerSubjects } from '../../../lib/server-api';
import MaterialsList from '@/components/MaterialsList';


export default async function MaterialsPage() {
  // 서버에서 병렬로 데이터 로딩
  const [materials, subjects, examTypes] = await Promise.all([
    getServerMaterials(),
    getServerSubjects(),
    getServerExamTypes()
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">학습자료</h1>
          <p className="text-gray-600 mt-2">다양한 학습자료를 찾아보세요!</p>
        </div>
        
        <Link
          href="/upload"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          📤 자료 업로드
        </Link>
      </div>

      {/* 통계 정보 */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{materials.length}</div>
            <div className="text-gray-600">전체 자료</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{subjects.length}</div>
            <div className="text-gray-600">과목 수</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{examTypes.length}</div>
            <div className="text-gray-600">시험 유형</div>
          </div>
        </div>
      </div>

      {/* 검색/필터 영역 (클라이언트 컴포넌트로 분리 가능) */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="제목으로 검색..."
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled
          />
          
          <select 
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled
          >
            <option value="">모든 과목</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          
          <select 
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled
          >
            <option value="">모든 시험</option>
            {examTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors opacity-50 cursor-not-allowed"
            disabled
          >
            검색 (개발 예정)
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          💡 검색 기능은 클라이언트 컴포넌트로 추후 개발 예정
        </div>
      </div>

      
      <MaterialsList materials={materials} />

      {/* 페이지네이션 (추후 구현) */}
      {materials.length > 0 && (
        <div className="mt-8 flex justify-center">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2">
            <span className="text-gray-600">페이지네이션 기능 개발 예정</span>
          </div>
        </div>
      )}
    </div>
  );
}

// 🚀 Next.js 메타데이터 (SEO 최적화)
export const metadata = {
  title: '학습자료 - 매치얼랏',
  description: '숙명여자대학교 학습자료 매칭 플랫폼에서 다양한 족보와 자료를 찾아보세요.',
};
