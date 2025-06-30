'use client';

import { useEffect, useState } from "react";
import { matchAPI } from "../../lib/api";

interface MatchResponse {
    id: number;
    requesterId: number;
    receiverId: number;
    requesterMaterialId: number;
    recevierMaterialId: number;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'EXPIRED';
    requesterNickname: string;
    partnerNickname: string;
    requesterMaterialTitle: string;
    partnerMaterialTitle: string;
    createdAt: string;
    updatedAt: string;
}

//매치 총 관리 페이지
export default function MatchManagement() {
    const [receivedRequests, setReceivedRequests] = useState<MatchResponse[]>([]);
    const [sentRequests, setSentRequests] = useState<MatchResponse[]>([]);
    const [activeMatches, setActiveMatches] = useState<MatchResponse[]>([]);
    const [completedMatches, setCompletedMatches] = useState<MatchResponse[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'received' | 'sent' | 'active' | 'completed'>('received');

    useEffect(() => {
        fetchAllMatches();
    },[]);

    const fetchAllMatches = async () => {
        try {
            setIsLoading(true);
            setError('');

            const [received, sent, active, my] = await Promise.all([
                matchAPI.getReceived(),
                matchAPI.getSent(),
                matchAPI.getActive(),
                matchAPI.getMine()
            ]);

            setReceivedRequests(Array.isArray(received) ? received : []);
            setSentRequests(Array.isArray(sent) ? sent : []);
            setActiveMatches(Array.isArray(active) ? active : []);
      
            // 완료된 매칭들은 전체 매칭에서 COMPLETED 상태만 필터링
            const completed = Array.isArray(my) ? my.filter(match => match.status === 'COMPLETED') : [];
            setCompletedMatches(completed);

        } catch (error) {
            console.error(error);
            setError('매칭 정보를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAccept = async (matchId: number) => {
        try {
            await matchAPI.accept(matchId.toString());
            await fetchAllMatches(); //데이터 새로고침!!
        } catch (error) {
            console.error('매칭 수락 실패: ',error);
            setError('매칭 수락 중 오류가 발생했습니다.');
        }
    };

    const handleReject = async (matchId: number) => {
        try {
            await matchAPI.reject(matchId.toString());
            await fetchAllMatches(); // 데이터 새로고침
        } catch (error) {
            console.error('매칭 거절 실패:', error);
            setError('매칭 거절 중 오류가 발생했습니다.');
        }
    };

    const handleComplete = async (matchId: number) => {
        try {
        await matchAPI.complete(matchId.toString());
        await fetchAllMatches(); // 데이터 새로고침
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
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">매칭 관리</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">매칭 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">매칭 관리</h2>
      
      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-red-500 mr-3">❌</div>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* 탭 네비게이션 */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => setActiveTab('received')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'received'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          받은 요청 ({receivedRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'sent'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          보낸 요청 ({sentRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'active'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          진행중 ({activeMatches.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'completed'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          완료됨 ({completedMatches.length})
        </button>
      </div>

      {/* 받은 요청 탭 */}
      {activeTab === 'received' && (
        <div className="space-y-4">
          {receivedRequests.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📥</div>
              <p className="text-gray-600">새로운 매칭 요청이 없습니다.</p>
            </div>
          ) : (
            receivedRequests.map((match) => (
              <div key={match.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {match.requesterNickname}님의 매칭 요청
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(match.createdAt)}
                    </p>
                  </div>
                  {getStatusBadge(match.status)}
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">요청자가 제안한 자료</p>
                    <p className="text-blue-800">{match.requesterMaterialTitle}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-green-900">요청받은 내 자료</p>
                    <p className="text-green-800">{match.partnerMaterialTitle}</p>
                  </div>
                </div>

                {match.status === 'PENDING' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleAccept(match.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      수락
                    </button>
                    <button
                      onClick={() => handleReject(match.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
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
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📤</div>
              <p className="text-gray-600">보낸 매칭 요청이 없습니다.</p>
            </div>
          ) : (
            sentRequests.map((match) => (
              <div key={match.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {match.partnerNickname}님에게 보낸 요청
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(match.createdAt)}
                    </p>
                  </div>
                  {getStatusBadge(match.status)}
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">내가 제안한 자료</p>
                    <p className="text-blue-800">{match.requesterMaterialTitle}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-green-900">요청한 상대방 자료</p>
                    <p className="text-green-800">{match.partnerMaterialTitle}</p>
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
            <div className="text-center py-8">
              <div className="text-4xl mb-4">⚡</div>
              <p className="text-gray-600">진행 중인 매칭이 없습니다.</p>
            </div>
          ) : (
            activeMatches.map((match) => (
              <div key={match.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {match.partnerNickname}님과의 매칭
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(match.updatedAt)}에 수락됨
                    </p>
                  </div>
                  {getStatusBadge(match.status)}
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">내 자료</p>
                    <p className="text-blue-800">{match.requesterMaterialTitle}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-green-900">상대방 자료</p>
                    <p className="text-green-800">{match.partnerMaterialTitle}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleComplete(match.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  교환 완료 처리
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* 완료된 매칭 탭 */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          {completedMatches.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">✅</div>
              <p className="text-gray-600">완료된 매칭이 없습니다.</p>
            </div>
          ) : (
            completedMatches.map((match) => (
              <div key={match.id} className="border border-gray-200 rounded-lg p-4 opacity-75">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {match.partnerNickname}님과의 매칭
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(match.updatedAt)}에 완료됨
                    </p>
                  </div>
                  {getStatusBadge(match.status)}
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">교환한 내 자료</p>
                    <p className="text-gray-900">{match.requesterMaterialTitle}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">받은 자료</p>
                    <p className="text-gray-900">{match.partnerMaterialTitle}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
