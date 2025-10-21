'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { matchAPI, authAPI } from '@/lib/api';
import { getDisplayName } from '@/utils/nickname';

interface MatchResponse {
  matchId: number;
  requesterId: number;
  receiverId: number;
  requesterMaterialId: number;
  receiverMaterialId: number;
  partnerMaterialId?: number; // 상대방 자료 ID 추가
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'EXPIRED';
  requesterNickname: string;
  receiverNickname: string;
  partnerMaterialTitle: string;
  //백엔드에선 해당 타이틀 정보를 리턴값이 없어서 null값이
  receiverMaterialTitle: string;
  createdAt: string;
  updatedAt: string;
}

export default function MatchesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [receivedRequests, setReceivedRequests] = useState<MatchResponse[]>([]);
  const [sentRequests, setSentRequests] = useState<MatchResponse[]>([]);
  const [activeMatches, setActiveMatches] = useState<MatchResponse[]>([]);
  const [completedMatches, setCompletedMatches] = useState<MatchResponse[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'received' | 'sent' | 'active' | 'completed'>('received');

  useEffect(() => {
    checkAuthAndFetchMatches();
  }, []);

  const checkAuthAndFetchMatches = async () => {
    try {
      setIsLoading(true);
      setError('');
      const user = await authAPI.getCurrentUser();
      if (!user) {
        throw new Error('401: 로그인이 필요합니다.');
      }
      setCurrentUser(user);
      
      // 매칭 데이터 로드
      const [received, sent, active,my] = await Promise.all([
        matchAPI.getReceived().catch(e => {
          console.error('getReceived에서 실패',e);
          return [];
        }),
        matchAPI.getSent().catch(e => {
          console.error('getSent에서 실패',e);
          return [];
        }),
        matchAPI.getActive().catch(e => {
          console.error('getReceived에서 실패',e);
          return [];
        }),
        matchAPI.getMine().catch(e => {
          console.error('getSent에서 실패',e);
          return [];
        })
      ]);
      console.log('🔍 API 응답 데이터:', {
        received,
        sent,
        active,
        my
      });
      
      setReceivedRequests(Array.isArray(received)?received:[]);
      setSentRequests(Array.isArray(sent)?sent:[]);
      setActiveMatches(Array.isArray(active)?active:[]);

      const completed = Array.isArray(my) ? my.filter(match => match.status === 'COMPLETED'):[];
      setCompletedMatches(completed);
    } catch (error) {
      console.error('인증 또는 데이터 로드 실패:', error);
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('403') || error.message.includes('로그인')) {
          setIsLoading(false);
          setTimeout(() => {
            alert('로그인이 필요한 서비스입니다. 로그인 페이지로 이동합니다.');
            router.push('/login');
          }, 100);
          return;
        } else if (error.message.includes('404')) {
          setError('매칭 API를 찾을 수 없습니다. 개발자에게 문의하세요.');
        } else {
          setError('매칭 정보를 불러오는 중 오류가 발생했습니다.');
        }
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (matchId: number) => {
    try {
      const matched = String(matchId);
      await matchAPI.accept(matched);
      await checkAuthAndFetchMatches();
    } catch (error) {
      console.error('매칭 수락 실패:', error);
      setError('매칭 수락 중 오류가 발생했습니다.');
    }
  };

  const handleReject = async (matchId: number) => {
    try {
      var matched = ""+matchId;
      await matchAPI.reject(matched.toString());
      await checkAuthAndFetchMatches(); // 데이터 새로고침
    } catch (error) {
      console.error('매칭 거절 실패:', error);
      setError('매칭 거절 중 오류가 발생했습니다.');
    }
  };

  const handleComplete = async (matchId: number) => {
    try {
      await matchAPI.complete(matchId.toString());
      await checkAuthAndFetchMatches(); // 데이터 새로고침
    } catch (error) {
      console.error('매칭 완료 실패:', error);
      setError('매칭 완료 중 오류가 발생했습니다.');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'PENDING': { text: '대기중', className: 'bg-yellow-100 text-yellow-800' },
      'ACCEPTED': { text: '수락됨', className: 'bg-green-100 text-green-800' },
      'REJECTED': { text: '거절됨', className: 'bg-red-100 text-red-800' },
      'COMPLETED': { text: '완료됨', className: 'bg-blue-100 text-blue-800' },
      'EXPIRED': { text: '만료됨', className: 'bg-gray-100 text-gray-800' }
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || { text: status, className: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusInfo.className}`}>
        {statusInfo.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) {
      console.warn('날짜 문자열이 없습니다:', dateString);
      return '날짜 없음';
    }
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('유효하지 않은 날짜:', dateString);
        return '유효하지 않은 날짜';
      }
      
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('날짜 파싱 오류:', error, dateString);
      return '날짜 파싱 오류';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">매칭 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-4xl mb-4">
            {error.includes('로그인') ? '🔐' : error.includes('404') ? '🔍' : '😵'}
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {error.includes('로그인') ? '인증 필요' : error.includes('404') ? 'API 없음' : '오류 발생'}
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          
          <div className="space-y-3">
            <button
              onClick={() => checkAuthAndFetchMatches()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              다시 시도
            </button>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              로그인 페이지로
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">매칭 관리</h1>
        <p className="text-gray-600">
          매칭 요청을 관리하고 자료 교환을 진행하세요.
        </p>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-500 text-xl mr-3">❌</div>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* 통계 요약 */}
      <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{receivedRequests.length}</div>
          <div className="text-sm text-gray-600">받은 요청</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{sentRequests.length}</div>
          <div className="text-sm text-gray-600">보낸 요청</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{activeMatches.length}</div>
          <div className="text-sm text-gray-600">진행중</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{completedMatches.length}</div>
          <div className="text-sm text-gray-600">완료</div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* 탭 네비게이션 */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('received')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'received'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              받은 요청 ({receivedRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'sent'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              보낸 요청 ({sentRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'active'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              진행중 ({activeMatches.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'completed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              완료 ({completedMatches.length})
            </button>
          </nav>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="p-6">
          {/* 받은 요청 탭 */}
          {activeTab === 'received' && (
            <div className="space-y-4">
              {receivedRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-4xl mb-4">📥</div>
                  <p className="text-gray-600">받은 매칭 요청이 없습니다.</p>
                  <p className="text-gray-500 text-sm mt-2">자료를 업로드하면 다른 사용자들이 매칭 요청을 보낼 수 있습니다.</p>
                </div>
              ) : (
                receivedRequests.map((match) => (
                  <div key={match.matchId} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {getDisplayName(match.requesterNickname)}님의 매칭 요청
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(match.createdAt)}
                        </p>
                      </div>
                      {getStatusBadge(match.status)}
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-1">상대방이 제안한 자료</p>
                        <p className="text-blue-800 font-medium">{match.partnerMaterialTitle}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-green-900 mb-1">내가 받을 자료</p>
                        <p className="text-green-800 font-medium">{match.receiverMaterialTitle}</p>
                      </div>
                    </div>

                    {match.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(match.matchId)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          수락
                        </button>
                        <button
                          onClick={() => handleReject(match.matchId)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          거절
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* 보낸 요청 탭 */}
          {activeTab === 'sent' && (
            <div className="space-y-4">
              {sentRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-4xl mb-4">📤</div>
                  <p className="text-gray-600">보낸 매칭 요청이 없습니다.</p>
                  <p className="text-gray-500 text-sm mt-2">원하는 자료에 매칭 요청을 보내보세요.</p>
                </div>
              ) : (
                sentRequests.map((match) => (
                  <div key={match.matchId} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {getDisplayName(match.receiverNickname)}님에게 보낸 요청
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(match.createdAt)}
                        </p>
                      </div>
                      {getStatusBadge(match.status)}
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-1">내가 제안한 자료</p>
                        <p className="text-blue-800 font-medium">{match.partnerMaterialTitle}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-green-900 mb-1">요청한 상대방 자료</p>
                        <p className="text-green-800 font-medium">{match.receiverMaterialTitle}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 진행중 매칭 탭 */}
          {activeTab === 'active' && (
            <div className="space-y-4">
              {activeMatches.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-4xl mb-4">🔄</div>
                  <p className="text-gray-600">진행중인 매칭이 없습니다.</p>
                </div>
              ) : (
                activeMatches.map((match) => (
                  <div key={match.matchId} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {getDisplayName(match.receiverNickname)}님과의 매칭
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(match.updatedAt)}
                        </p>
                      </div>
                      {getStatusBadge(match.status)}
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-1">내 자료</p>
                        <p className="text-blue-800 font-medium">{match.partnerMaterialTitle}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-green-900 mb-1">상대방 자료</p>
                        <p className="text-green-800 font-medium">{match.receiverMaterialTitle}</p>
                        {match.partnerMaterialId && (
                          <button
                            onClick={() => router.push(`/materials/${match.partnerMaterialId}`)}
                            className="mt-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            📖 내용 보기
                          </button>
                        )}
                      </div>
                    </div>

                    {match.status === 'ACCEPTED' && (
                      <button
                        onClick={() => handleComplete(match.matchId)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        매칭 완료
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* 완료된 매칭 탭 */}
          {activeTab === 'completed' && (
            <div className="space-y-4">
              {completedMatches.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-4xl mb-4">✅</div>
                  <p className="text-gray-600">완료된 매칭이 없습니다.</p>
                </div>
              ) : (
                completedMatches.map((match) => (
                  <div key={match.matchId} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {getDisplayName(match.receiverNickname)}님과의 매칭 완료
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(match.updatedAt)}
                        </p>
                      </div>
                      {getStatusBadge(match.status)}
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-1">교환한 내 자료</p>
                        <p className="text-blue-800 font-medium">{match.partnerMaterialTitle}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-green-900 mb-1">받은 상대방 자료</p>
                        <p className="text-green-800 font-medium">{match.receiverMaterialTitle}</p>
                        {match.partnerMaterialId && (
                          <button
                            onClick={() => router.push(`/materials/${match.partnerMaterialId}`)}
                            className="mt-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            📖 해설 보기
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* 안내 메시지 */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 매칭 관리 가이드</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>• <strong>받은 요청:</strong> 다른 사용자가 내 자료에 보낸 요청들을 확인하고 수락/거절할 수 있습니다</p>
          <p>• <strong>보낸 요청:</strong> 내가 다른 사용자에게 보낸 요청들의 상태를 확인할 수 있습니다</p>
          <p>• <strong>진행중:</strong> 양쪽이 수락한 매칭들을 관리하고 완료 처리할 수 있습니다</p>
          <p>• <strong>완료:</strong> 성공적으로 교환 완료된 매칭들의 히스토리를 확인할 수 있습니다</p>
        </div>
      </div>
    </div>
  );
}
