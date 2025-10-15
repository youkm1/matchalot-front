'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { studyMaterialAPI } from '@/lib/api';
import MaterialsList from '@/components/MaterialsList';

export default function MaterialsPage() {
  // 타입을 명시적으로 지정
  const [materials, setMaterials] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [examTypes, setExamTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      studyMaterialAPI.getAll(),
      studyMaterialAPI.getSubjects(), 
      studyMaterialAPI.getExamTypes()
    ])
    .then(([materialsData, subjectsData, examTypesData]) => {
      setMaterials(Array.isArray(materialsData) ? materialsData : []);
      setSubjects(subjectsData?.subjects || []);
      setExamTypes(examTypesData?.examTypes || []);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

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

      {/* 검색/필터 영역 */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="제목으로 검색..."
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <select 
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">모든 과목</option>
            {subjects.map((subject: any, index: number) => (
              <option key={index} value={subject}>
                {subject}
              </option>
            ))}
          </select>
          
          <select 
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">모든 시험</option>
            {examTypes.map((type: any, index: number) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
          
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            🔍 검색
          </button>
        </div>
      </div>

      {/* 자료 목록 */}
      <MaterialsList materials={materials} />
    </div>
  );
}
