'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { studyMaterialAPI, authAPI, matchAPI } from '../../../../lib/api';
import Link from 'next/link';
import { getDisplayName } from '@/utils/nickname';

interface Question {
  number: number;
  content: string;
  answer: string;
  explanation: string;
}

interface StudyMaterial {
  id: number;
  title: string;
  subject: string;
  examType: string;
  year: number;
  season: string;
  semesterDisplay: string;
  questionCount: number;
  uploaderNickname: string;
  uploaderId: number; // 추가된 필드
  createdAt: string;
  displayTitle: string;
  questions: Question[];
}

interface User {
  Id: number;
  nickname: string;
  email: string;
  trustScore: number;
}

export default function MaterialDetailPage() {
  const params = useParams();
  const router = useRouter();
  const materialId = params.id as string;
  
  const [material, setMaterial] = useState<StudyMaterial | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 현재 사용자 정보 가져오기
        const user = await authAPI.getCurrentUser();
        setCurrentUser(user);

        // 자료 정보 가져오기
        const data = await studyMaterialAPI.getById(materialId);
        setMaterial(data);

        // 🔒 매칭 완료 여부 확인
        // TODO: 실제 매칭 완료 여부 확인 API 구현 후 수정
        // const hasCompletedMatch = await matchAPI.checkAccess(materialId);
        
        // 임시: 자신이 업로드한 자료면 접근 허용
        const isOwner = data.uploaderId === user.Id;
        setHasAccess(isOwner);
        
      } catch (err) {
        console.error('족보 조회 실패:', err);
        setError('족보를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (materialId) {
      fetchData();
    }
  }, [materialId]);

  const handleMatchRequest = () => {
    router.push(`/matches/request/${materialId}`);
  };

  const toggleAnswers = () => {
    if (!hasAccess) {
      // 권한이 없으면 매칭 요청 페이지로 이동
      handleMatchRequest();
      return;
    }
    setShowAnswers(!showAnswers);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-red-600 text-lg mb-4">{error || '족보를 찾을 수 없습니다.'}</div>
        <Link href="/materials" className="text-blue-600 hover:underline">
          족보 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const isOwner = currentUser && material.uploaderId === currentUser.Id;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/materials" className="text-blue-600 hover:underline flex items-center">
              ← 목록으로
            </Link>
            <div className="flex gap-2">
              {!isOwner && (
                <button
                  onClick={handleMatchRequest}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  🤝 매칭 요청
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 족보 정보 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{material.title}</h1>
            <div className="text-gray-600">{material.displayTitle}</div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <div className="text-sm text-gray-500">과목</div>
              <div className="font-medium">{material.subject}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">시험</div>
              <div className="font-medium">{material.examType}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">학기</div>
              <div className="font-medium">{material.semesterDisplay}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">문제 수</div>
              <div className="font-medium">{material.questionCount}개</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-sm text-gray-500">업로더:</span>
                <span className="ml-1 font-medium">{getDisplayName(material.uploaderNickname)}</span>
                {isOwner && (
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    내 자료
                  </span>
                )}
              </div>
              <div>
                <span className="text-sm text-gray-500">업로드:</span>
                <span className="ml-1">{new Date(material.createdAt).toLocaleDateString('ko-KR')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 접근 권한 안내 */}
        {!hasAccess && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-orange-500 mr-3">🔒</div>
              <div>
                <p className="text-orange-800 font-medium">정답 및 해설은 매칭 완료 후 확인 가능합니다</p>
                <p className="text-orange-600 text-sm">매칭 요청을 보내서 자료를 교환해보세요!</p>
              </div>
            </div>
          </div>
        )}

        {/* 문제 섹션 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">문제 목록</h2>
              <button
                onClick={toggleAnswers}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  hasAccess
                    ? showAnswers
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {hasAccess 
                  ? (showAnswers ? '정답 숨기기' : '정답 보기')
                  : '🔒 매칭 후 확인 가능'
                }
              </button>
            </div>
          </div>

          <div className="p-6">
            {material.questions && material.questions.length > 0 ? (
              <div className="space-y-6">
                {material.questions.map((question, index) => (
                  <div key={question.number} className="border border-gray-200 rounded-lg p-4">
                    <div className="mb-3">
                      <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">
                        문제 {question.number}
                      </span>
                    </div>
                    
                    <div className="mb-4 text-gray-900 whitespace-pre-wrap">
                      {question.content}
                    </div>

                    {/* 🔒 권한에 따른 정답/해설 표시 */}
                    {hasAccess && showAnswers ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="mb-2">
                          <span className="text-sm font-medium text-green-800">정답:</span>
                          <span className="ml-2 text-green-900">{question.answer}</span>
                        </div>
                        {question.explanation && (
                          <div>
                            <span className="text-sm font-medium text-green-800">해설:</span>
                            <div className="mt-1 text-green-900 whitespace-pre-wrap">{question.explanation}</div>
                          </div>
                        )}
                      </div>
                    ) : !hasAccess ? (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="text-center text-gray-500">
                          <div className="text-2xl mb-2">🔒</div>
                          <p className="font-medium">정답 및 해설은 매칭 완료 후 확인 가능합니다</p>
                          <button
                            onClick={handleMatchRequest}
                            className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
                          >
                            매칭 요청하기
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                문제 정보를 불러올 수 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 하단 액션 */}
        {!isOwner && (
          <div className="mt-8 text-center">
            <button
              onClick={handleMatchRequest}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              이 족보와 매칭 요청하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
