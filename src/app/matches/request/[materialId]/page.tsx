'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { matchAPI, studyMaterialAPI, authAPI } from '../../../../../lib/api';

interface StudyMaterial {
  id: number;
  title: string;
  subject: string;
  examType: string;
  semesterDisplay: string;
  questionCount: number;
  uploaderNickname: string;
  uploaderTrustScore: number;
  uploaderId: number;
  createdAt: string;
  tags?: string[];
}

interface User {
  Id: number;
  nickname: string;
  email: string;
  trustScore: number;
}

interface PotentialPartner {
  id: number;
  title: string;
  subject: string;
  examType: string;
  semesterDisplay: string;
  questionCount: number;
  uploaderNickname: string;
  uploaderTrustScore: number;
  createdAt: string;
}

export default function MatchRequestPage() {
  const params = useParams();
  const router = useRouter();
  const materialId = params.materialId as string;

  const [targetMaterial, setTargetMaterial] = useState<StudyMaterial | null>(null);
  const [myMaterials, setMyMaterials] = useState<StudyMaterial[]>([]);
  const [potentialPartners, setPotentialPartners] = useState<PotentialPartner[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // 현재 사용자 정보 가져오기
        const user = await authAPI.getCurrentUser();
        setCurrentUser(user);

        // 타겟 자료 정보 가져오기
        const material = await studyMaterialAPI.getById(materialId);
        console.log('studyMaterialAPI.getById response:', JSON.stringify(material, null, 2));
        if (!material.uploaderId) {
            console.error('uploaderId is missing or undefined in material:', material);
            setError('자료의 업로더 정보를 찾을 수 없습니다.');
            return;
        }
        setTargetMaterial(material);

        // 내 자료인지 체크
        if (material.uploaderId === user.Id) {
          setError('자신이 업로드한 자료에는 매칭 요청을 보낼 수 없습니다.');
          return;
        }

        // 내가 업로드한 자료들 가져오기
        const myMaterialsData = await studyMaterialAPI.getMine();
        setMyMaterials(Array.isArray(myMaterialsData) ? myMaterialsData : []);

        // 잠재적 매칭 파트너 가져오기
        const partners = await matchAPI.getPotentialPartners(materialId);
        setPotentialPartners(Array.isArray(partners) ? partners : []);

      } catch (error) {
        console.error('데이터 로딩 실패:', error);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    if (materialId) {
      fetchData();
    }
  }, [materialId]);

  const handleSubmitRequest = async () => {
    if (!selectedMaterialId) {
      setError('교환할 자료를 선택해주세요.');
      return;
    }

    if (!targetMaterial || !currentUser) {
      setError('필요한 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      // 백엔드 API: POST /api/v1/match/request/{materialId}
      const requestData = {
        requesterMaterialId: parseInt(selectedMaterialId),
        receiverId: targetMaterial.uploaderId
      };

      console.log('materialId:', materialId); // 디버깅용
      console.log('requestData:', requestData); // 디버깅용
      
      // ✅ 수정된 API 함수 사용
      await matchAPI.request(materialId, requestData);
      
      setSuccess('매칭 요청이 성공적으로 전송되었습니다!');
      
      // 2초 후 매칭 관리 페이지로 이동
      setTimeout(() => {
        router.push('/matches');
      }, 2000);

    } catch (error) {
      console.error('매칭 요청 실패:', error);
      setError('매칭 요청 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">매칭 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!targetMaterial) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">😵</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">자료를 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-6">요청한 자료가 존재하지 않거나 삭제되었습니다.</p>
          <button
            onClick={() => router.push('/materials')}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            자료 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* 헤더 */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            ← 뒤로 가기
          </button>
          <h1 className="text-3xl font-bold text-gray-900">매칭 요청</h1>
          <p className="text-gray-600 mt-2">원하는 자료와 교환할 내 자료를 선택해주세요</p>
        </div>

        {/* 성공 메시지 */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-green-500 mr-3">✅</div>
              <div>
                <p className="text-green-800 font-medium">{success}</p>
                <p className="text-green-600 text-sm">매칭 관리 페이지로 이동합니다...</p>
              </div>
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-500 mr-3">❌</div>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* 왼쪽: 원하는 자료 정보 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">🎯</span>
              원하는 자료
            </h2>
            
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{targetMaterial.title}</h3>
                <p className="text-gray-600">{targetMaterial.subject} • {targetMaterial.examType}</p>
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <p>📅 {targetMaterial.semesterDisplay}</p>
                <p>📊 문제 수: {targetMaterial.questionCount}개</p>
                <p>👤 업로더: {targetMaterial.uploaderNickname}</p>
                <p>⭐ 신뢰도: {targetMaterial.uploaderTrustScore}점</p>
              </div>

              {targetMaterial.tags && targetMaterial.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {targetMaterial.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽: 내 자료 선택 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">📚</span>
              교환할 내 자료
            </h2>

            {myMaterials.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📝</div>
                <p className="text-gray-600 mb-4">업로드한 자료가 없습니다</p>
                <button
                  onClick={() => router.push('/upload')}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  자료 업로드하기
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myMaterials.map((material) => (
                  <label 
                    key={material.id}
                    className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedMaterialId === material.id.toString()
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="selectedMaterial"
                      value={material.id.toString()}
                      checked={selectedMaterialId === material.id.toString()}
                      onChange={(e) => setSelectedMaterialId(e.target.value)}
                      className="sr-only"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">{material.title}</h3>
                      <p className="text-sm text-gray-600">{material.subject} • {material.examType}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {material.semesterDisplay} • {material.questionCount}문제
                      </p>
                    </div>
                  </label>
                ))}
                
                {/* 요청 버튼 */}
                <button
                  onClick={handleSubmitRequest}
                  disabled={!selectedMaterialId || isSubmitting || !!error}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    !selectedMaterialId || isSubmitting || !!error
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isSubmitting ? '요청 중...' : '매칭 요청 보내기'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 잠재적 매칭 파트너 섹션 */}
        {potentialPartners.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">🔍</span>
              이 자료와 관련된 다른 자료들
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {potentialPartners.map((partner) => (
                <div key={partner.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">{partner.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{partner.subject} • {partner.examType}</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>📅 {partner.semesterDisplay}</p>
                    <p>📊 {partner.questionCount}문제</p>
                    <p>👤 {partner.uploaderNickname} (⭐{partner.uploaderTrustScore}점)</p>
                  </div>
                  <button
                    onClick={() => router.push(`/matches/request/${partner.id}`)}
                    className="mt-3 w-full text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded transition-colors"
                  >
                    이 자료에 요청하기
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 매칭 요청 가이드 */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 매칭 요청 가이드</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>• 매칭 요청을 보내면 상대방이 수락/거절을 결정합니다</p>
            <p>• 양쪽 모두 수락하면 자료 교환이 시작됩니다</p>
            <p>• 신뢰도가 0점 이상이어야 매칭 요청을 보낼 수 있습니다</p>
            <p>• 좋은 자료를 제공하면 신뢰도가 상승합니다</p>
            <p>• 자신이 업로드한 자료에는 매칭 요청을 보낼 수 없습니다</p>
          </div>
        </div>
      </div>
    </div>
  );
}
