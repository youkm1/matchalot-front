'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { studyMaterialAPI, authAPI, matchAPI } from '@/lib/api';
import { getDisplayName } from '@/utils/nickname';
import { useNotifications } from '@/hooks/useNotifications';
import { StudyMaterial, User } from '@/types';

// PotentialPartner는 StudyMaterial과 거의 같으므로 타입 별칭 사용
type PotentialPartner = Omit<StudyMaterial, 'uploaderId' | 'tags'>;

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
  
  // SSE 알림 시스템 사용
  const {
    notifications,
    isConnected,
    markAsRead
  } = useNotifications();

  useEffect(() => { 
    if (materialId) {
      fetchData();
    }
  }, [materialId]);

  const fetchData = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        const user = await authAPI.getCurrentUser();
        setCurrentUser(user);

        const material = await studyMaterialAPI.getById(materialId);
        console.log('studyMaterialAPI.getById response:', JSON.stringify(material, null, 2));
        
        if (!material.uploaderId) {
            console.error('uploaderId is missing or undefined in material:', material);
            setError('자료의 업로더 정보를 찾을 수 없습니다.');
            return;
        }
        setTargetMaterial(material);

        const [myMaterialsData, partners] = await Promise.all([
          studyMaterialAPI.getMine().catch(e=>{
            console.error('내 자료 갖고오기 실패: ',e);
            return [];
          }),
          studyMaterialAPI.getAll().then(materials => 
            // 같은 과목의 다른 사용자 자료들을 찾음
            materials.filter((m: { subject: any; examType: any; id: number; uploaderId: any; }) => 
              m.subject === material.subject && 
              m.examType === material.examType &&
              m.id !== parseInt(materialId) &&
              m.uploaderId !== user.Id
            )
          ).catch(e => {
            console.error('잠재적 파트너 로드 실패:', e);
            return [];
          })
        ]);
        
        console.log('✅ 데이터 로드 완료:', {
          myMaterials: myMaterialsData.length,
          potentialPartners: partners.length
        });
        
        setMyMaterials(Array.isArray(myMaterialsData) ? myMaterialsData : []); 
        setPotentialPartners(Array.isArray(partners) ? partners : []);

      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('401')) {
            alert('로그인을 진행해주세요');
            router.push('/login');
            return;
          } else if (error.message.includes('403')) {
            setError('일시적인 신뢰도 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
          } else if (error.message.includes('400')) {
            setError('이미 매칭이 진행 중이거나 중복된 요청입니다.');
          } else if (error.message.includes('404')) {
            setError('요청한 자료를 찾을 수 없습니다.');
          } else {
            setError('데이터를 불러오는 중 오류가 발생했습니다.');
          }
        } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
      } finally {
        setIsLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!selectedMaterialId) {
      setError('교환할 자료를 선택해주세요.');
      return;
    }

    if (!targetMaterial || !currentUser) {
      setError('필요한 정보를 찾을 수 없습니다.');
      return;
    }

    // 자신의 족보에 매칭 요청하는 것을 방지
    if (targetMaterial.uploaderId === currentUser.Id) {
      setError('자신이 업로드한 자료에는 매칭 요청을 보낼 수 없습니다.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      console.log('REST API 매칭 요청:', {
        materialId: materialId,
        receiverId: targetMaterial.uploaderId,
        requesterMaterialId: parseInt(selectedMaterialId)
      });
      
      // REST API로 매칭 요청
      const response = await matchAPI.request(materialId, {
        receiverId: targetMaterial.uploaderId,
        requesterMaterialId: parseInt(selectedMaterialId)
      });

      console.log('매칭 요청 성공:', response);
      setSuccess('매칭 요청이 성공적으로 전송되었습니다!');

      // SSE로 실시간 알림 자동 수신

      // 2초 후 매칭 관리 페이지로 이동
      setTimeout(() => {
        router.push('/matches');
      }, 2000);

    } catch (error) {
      console.error('매칭 요청 실패:', error);
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('403')) {
          alert('로그인을 진행해주세요');
          router.push('/login');
          return;
        } else if (error.message.includes('403')) {
          // 403 에러는 권한 문제 (신뢰도 부족)
          setError('신뢰도가 부족하여 매칭을 요청할 수 없습니다. 좋은 자료를 업로드하여 신뢰도를 높여보세요.');
        } else if (error.message.includes('400')) {
          // 백엔드 에러 메시지에서 구체적인 내용 추출
          const errorMessage = error.message;
          if (errorMessage.includes('본인과는 매칭할 수 없습니다')) {
            setError('자신이 업로드한 자료에는 매칭 요청을 보낼 수 없습니다.');
          } else if (errorMessage.includes('본인의 족보만 매칭에 사용할 수 있습니다')) {
            setError('본인이 업로드한 족보만 교환에 사용할 수 있습니다.');
          } else if (errorMessage.includes('해당 과목의 족보를 가지고 있지 않습니다')) {
            setError('상대방이 같은 과목의 족보를 가지고 있지 않아 매칭이 불가능합니다.');
          } else if (errorMessage.includes('신뢰도가 부족하여 매칭할 수 없습니다')) {
            setError('신뢰도가 부족합니다. 좋은 자료를 업로드하여 신뢰도를 높여보세요.');
          } else if (errorMessage.includes('이미 진행 중인 매칭이 있습니다')) {
            setError('이미 진행 중인 매칭이 있습니다. 기존 매칭을 완료한 후 다시 시도해주세요.');
          } else {
            setError('이미 진행 중인 매칭이 있습니다. 매칭 관리 페이지에서 확인해주세요.');
          }
        } else if (error.message.includes('409')) {
          setError('이미 매칭 요청을 보낸 자료입니다.');
        } else {
          setError('매칭 요청 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
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

        {/* SSE 연결 상태 표시 */}
        {isConnected && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-green-500 mr-3">🔔</div>
              <p className="text-green-800">실시간 알림 연결됨</p>
            </div>
          </div>
        )}

        {/* 실시간 알림 표시 */}
        {notifications.length > 0 && (
          <div className="mb-6">
            {notifications.slice(0, 3).map((notification) => (
              <div key={notification.id} 
                   className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-2">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium text-blue-800">{notification.title}</p>
                    <p className="text-blue-600">{notification.message}</p>
                  </div>
                  <button 
                    onClick={() => markAsRead(notification.id)}
                    className="text-blue-400 hover:text-blue-600"
                  >
                    ✓
                  </button>
                </div>
              </div>
            ))}
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
                <p>👤 업로더: {getDisplayName(targetMaterial.uploaderNickname)}</p>
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
                    <p>👤 {getDisplayName(partner.uploaderNickname)} (⭐{partner.uploaderTrustScore}점)</p>
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
