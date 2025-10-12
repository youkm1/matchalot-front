// src/app/materials/[id]/page.tsx 수정된 부분

'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { studyMaterialAPI, authAPI, matchAPI } from '../../../../lib/api';
import { StudyMaterial, User } from '../../../../lib/server-api';
import Link from 'next/link';
import { getDisplayName } from '@/utils/nickname';

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {

    if (materialId) {
      fetchData();
    }
  }, [materialId]);
  const fetchData = async() => {
    try {
      setLoading(true);
      setError(null);

      let user = null;
      try {
        user = await authAPI.getCurrentUser();
        setCurrentUser(user);
        setIsLoggedIn(true);
      } catch (authError) {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
      const data = await studyMaterialAPI.getById(materialId);
      setMaterial(data);

      if (user && data) {
        const isOwner = data.uploaderId === user.id;

        if (isOwner) {
          console.log('소유자입니다');
          setHasAccess(true);
        } else {
          try {
            const hasCompleted = false;
            setHasAccess(hasCompleted);
          } catch (matchError) {
            setHasAccess(false);
          }
        }
      } else {
        console.log('비로그인 유저');
        setHasAccess(false);
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('401') || err.message.includes('403')) {
          alert('로그인을 진행해주세요');
          router.push('/login');
          return;
        } else if (err.message.includes('404')) {
          setError('요청한 자료를 찾을 수 없습니다.');
        } else {
          setError('자료를 불러오는 중 오류가 발생했습니다.');
        }
      } else {
        setError('알 수 없는 오류 발생하였습니다');
      }
    } finally {
      setLoading(false);
    }
  };
  const handleMatchRequest = () => {
    if (!isLoggedIn) {
      // 로그인하지 않은 경우 로그인 페이지로
      router.push('/login');
      return;
    }
    router.push(`/matches/request/${materialId}`);
  };

  const toggleAnswers = () => {
    if (!isLoggedIn) {
      // 로그인하지 않은 경우 로그인 페이지로
      router.push('/login');
      return;
    }
    
    if (!hasAccess) {
      // 권한이 없으면 매칭 요청 페이지로
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
        <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200 max-w-md">
          <div className="text-red-500 text-4xl mb-4">🚫</div>
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            {!isLoggedIn ? '로그인이 필요합니다' : '오류가 발생했습니다'}
          </h2>
          <p className="text-red-700 mb-4">{error || '족보를 찾을 수 없습니다.'}</p>
          
          {!isLoggedIn ? (
            <div className="space-y-3">
              <Link 
                href="/login"
                className="block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                로그인하러 가기
              </Link>
              <Link 
                href="/materials" 
                className="block text-blue-600 hover:underline text-sm"
              >
                목록으로 돌아가기
              </Link>
            </div>
          ) : (
            <Link 
              href="/materials" 
              className="text-blue-600 hover:underline"
            >
              목록으로 돌아가기
            </Link>
          )}
        </div>
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
              {isLoggedIn ? (
                !isOwner && (
                  <button
                    onClick={handleMatchRequest}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    🤝 매칭 요청
                  </button>
                )
              ) : (
                <button
                  onClick={() => router.push('/login')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  로그인하기
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
            <div className="text-gray-600">{material.title}</div>
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

        {/* 접근 권한 안내 - 비로그인 사용자용 */}
        {!isLoggedIn && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-blue-500 mr-3">ℹ️</div>
              <div>
                <p className="text-blue-800 font-medium">로그인하시면 더 많은 정보를 확인할 수 있습니다</p>
                <p className="text-blue-600 text-sm">문제 내용과 정답은 로그인 후 매칭을 통해 확인 가능합니다.</p>
              </div>
            </div>
          </div>
        )}

        {/* 접근 권한 안내 - 로그인했지만 권한 없는 사용자용 */}
        {isLoggedIn && !hasAccess && (
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
                  isLoggedIn && hasAccess
                    ? showAnswers
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {isLoggedIn && hasAccess
                  ? (showAnswers ? '정답 숨기기' : '정답 보기')
                  : !isLoggedIn
                  ? '🔒 로그인 필요'
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

                    {/* 권한에 따른 정답/해설 표시 */}
                    {isLoggedIn && hasAccess && showAnswers ? (
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
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="text-center text-gray-500">
                          <div className="text-2xl mb-2">🔒</div>
                          <p className="font-medium">
                            {!isLoggedIn 
                              ? '정답 및 해설은 로그인 후 확인 가능합니다'
                              : '정답 및 해설은 매칭 완료 후 확인 가능합니다'
                            }
                          </p>
                          <button
                            onClick={!isLoggedIn ? () => router.push('/login') : handleMatchRequest}
                            className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
                          >
                            {!isLoggedIn ? '로그인하기' : '매칭 요청하기'}
                          </button>
                        </div>
                      </div>
                    )}
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
        {isLoggedIn ? (
          !isOwner && (
            <div className="mt-8 text-center">
              <button
                onClick={handleMatchRequest}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
              >
                이 족보와 매칭 요청하기
              </button>
            </div>
          )
        ) : (
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              로그인하고 매칭 요청하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
