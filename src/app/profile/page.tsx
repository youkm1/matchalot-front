'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, studyMaterialAPI, matchAPI } from '../../../lib/api';
import { getDisplayName } from '../../utils/nickname';

interface User {
  Id: number;
  nickname: string;
  email: string;
  role: string;
  trustScore: number;
  createdAt: string;
}

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

function WithdrawalModal({ isOpen, onClose, onConfirm }: WithdrawalModalProps) {
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('탈퇴 사유를 입력해주세요.');
      return;
    }
    
    setIsProcessing(true);
    await onConfirm(reason);
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">정말 탈퇴하시겠습니까?</h3>
        
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <span className="text-red-500 text-xl mr-3">⚠️</span>
            <div>
              <h4 className="text-red-800 font-semibold text-sm">탈퇴 시 주의사항</h4>
              <ul className="text-red-700 text-xs mt-2 space-y-1">
                <li>• 업로드한 모든 자료가 삭제됩니다</li>
                <li>• 진행 중인 매칭이 모두 취소됩니다</li>
                <li>• 신뢰도 점수가 초기화됩니다</li>
                <li>• 동일 계정으로 재가입 시 모든 데이터가 새로 시작됩니다</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              탈퇴 사유를 알려주세요 (선택사항)
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="서비스 개선을 위해 탈퇴 사유를 알려주시면 감사하겠습니다."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? '처리 중...' : '탈퇴하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  
  // 실제 활동 데이터
  const [myMaterials, setMyMaterials] = useState<any[]>([]);
  const [myMatches, setMyMatches] = useState<any[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
      
      // 병렬로 활동 데이터 로드
      await loadActivityData();
    } catch (error) {
      setError('프로필 정보를 불러올 수 없습니다. 로그인 후 다시 시도해주세요.');
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const loadActivityData = async () => {
    try {
      setStatsLoading(true);
      
      const [materials, matches, received, sent] = await Promise.all([
        studyMaterialAPI.getMine(),
        matchAPI.getMine(),
        matchAPI.getReceived(),
        matchAPI.getSent()
      ]);

      setMyMaterials(Array.isArray(materials) ? materials : []);
      setMyMatches(Array.isArray(matches) ? matches : []);
      setReceivedRequests(Array.isArray(received) ? received : []);
      setSentRequests(Array.isArray(sent) ? sent : []);
      
    } catch (error) {
      console.error('활동 데이터 로드 실패:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleDeleteMaterial = async (materialId: number) => {
    if (!confirm('정말로 이 자료를 삭제하시겠습니까?')) return;

    try {
      await studyMaterialAPI.delete(materialId.toString());
      alert('자료가 삭제되었습니다.');
      
      // 목록 새로고침
      await loadActivityData();
    } catch (error) {
      console.error('자료 삭제 실패:', error);
      alert('자료 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleWithdrawal = async (reason: string) => {
    try {
      // 1단계: 탈퇴 사유 전송 (새로운 API 사용)
      await authAPI.withdrawalRequest(reason);

      // 2단계: 실제 탈퇴 처리 (새로운 API 사용)
      await authAPI.deleteAccount();

      alert('회원 탈퇴가 완료되었습니다. 그동안 이용해주셔서 감사합니다.');
      
      // 클라이언트 정리
      setUser(null);
      
      // 쿠키 정리
      document.cookie.split(';').forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name) {
          ['/', '/api', '/oauth2', '/auth'].forEach(path => {
            ['', 'localhost', '.localhost', '127.0.0.1'].forEach(domain => {
              const domainPart = domain ? `; domain=${domain}` : '';
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}${domainPart}; SameSite=Lax`;
            });
          });
        }
      });

      sessionStorage.clear();
      localStorage.clear();
      
      // 홈페이지로 이동
      setTimeout(() => {
        window.location.replace('/');
      }, 2000);
    } catch (error) {
      console.error('탈퇴 처리 실패:', error);
      alert('탈퇴 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsWithdrawalModalOpen(false);
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ADMIN': return '관리자';
      case 'MEMBER': return '정회원';
      case 'PENDING': return '준회원';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-800';
      case 'MEMBER': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">프로필을 불러오고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
          <div className="text-red-500 text-4xl mb-4">😞</div>
          <h2 className="text-xl font-semibold text-red-800 mb-2">오류가 발생했습니다</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">마이페이지</h1>
          <p className="text-gray-600">계정 정보와 활동 내역을 확인할 수 있습니다.</p>
        </div>

        {/* 프로필 카드 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              {/* 아바타 */}
              <div className="bg-blue-600 text-white w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mr-6">
                {user.nickname ? user.nickname[0].toUpperCase() : 'U'}
              </div>
              
              {/* 기본 정보 */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{getDisplayName(user.nickname)}</h2>
                <p className="text-gray-600 mb-2">{user.email}</p>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                    {getRoleDisplayName(user.role)}
                  </span>
                  <span className={`font-semibold ${getTrustScoreColor(user.trustScore)}`}>
                    신뢰도 {user.trustScore}점
                  </span>
                </div>
              </div>
            </div>
            
            {/* 관리자 페이지 버튼 - role이 ADMIN인 경우만 표시 */}
            {user.role === 'ADMIN' && (
              <button
                onClick={() => router.push('/admin')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <span>👑</span>
                관리자 페이지
              </button>
            )}
          </div>
        </div>

        {/* 계정 정보 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">계정 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">닉네임</label>
              <p className="text-gray-900">{getDisplayName(user.nickname)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
              <p className="text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">회원 등급</label>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                {getRoleDisplayName(user.role)}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">가입일</label>
              <p className="text-gray-900">{new Date(user.createdAt).toLocaleDateString('ko-KR')}</p>
            </div>
          </div>
        </div>

        {/* 신뢰도 정보 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">신뢰도 정보</h3>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">현재 신뢰도</span>
              <span className={`text-lg font-bold ${getTrustScoreColor(user.trustScore)}`}>
                {user.trustScore}점
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  user.trustScore >= 80 ? 'bg-green-500' :
                  user.trustScore >= 60 ? 'bg-blue-500' :
                  user.trustScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(user.trustScore, 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>신뢰도 범위: -5 ~ 5 </strong>   [-5 미만 시 매칭이 불가합니다.]
              <br></br>
              💡 <strong>신뢰도 높이는 방법:</strong> Win-Win 시스템: 매칭 완료 시 서로에게 +1점을 부여합니다.
            </p>
          </div>
        </div>

        {/* 활동 통계 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">활동 통계</h3>
          {statsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center p-4 bg-gray-50 rounded-lg animate-pulse">
                  <div className="w-8 h-8 bg-gray-300 rounded mx-auto mb-2"></div>
                  <div className="w-16 h-4 bg-gray-300 rounded mx-auto"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{myMaterials.length}</div>
                <div className="text-sm text-blue-700">업로드한 자료</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {myMatches.filter(m => m.status === 'COMPLETED').length}
                </div>
                <div className="text-sm text-green-700">성공한 매칭</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{receivedRequests.length}</div>
                <div className="text-sm text-purple-700">받은 요청</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{sentRequests.length}</div>
                <div className="text-sm text-orange-700">보낸 요청</div>
              </div>
            </div>
          )}
        </div>

        {/* 내가 업로드한 자료 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">내가 업로드한 자료</h3>
            <button
              onClick={() => router.push('/upload')}
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition-colors"
            >
              + 자료 업로드
            </button>
          </div>
          
          {statsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : myMaterials.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📚</div>
              <p>아직 업로드한 자료가 없습니다.</p>
              <button
                onClick={() => router.push('/upload')}
                className="mt-3 text-blue-600 hover:text-blue-800 font-medium"
              >
                첫 자료 업로드하기 →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myMaterials.slice(0, 5).map((material: any) => (
                <div key={material.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{material.title}</h4>
                    <p className="text-sm text-gray-600">
                      {material.subject} • {material.examType} • {material.questionCount}문제
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(material.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/materials/${material.id}`)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      보기
                    </button>
                    <button
                      onClick={() => handleDeleteMaterial(material.id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
              {myMaterials.length > 5 && (
                <div className="text-center pt-3">
                  <button
                    onClick={() => router.push('/materials?filter=my')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    전체 보기 ({myMaterials.length}개) →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 빠른 액션 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 액션</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/upload')}
              className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <div className="text-2xl mb-2">📤</div>
              <div className="font-medium text-gray-900">자료 업로드</div>
              <div className="text-sm text-gray-600">새로운 학습자료 업로드</div>
            </button>
            <button
              onClick={() => router.push('/materials')}
              className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <div className="text-2xl mb-2">📚</div>
              <div className="font-medium text-gray-900">자료 둘러보기</div>
              <div className="text-sm text-gray-600">다른 사용자의 자료 확인</div>
            </button>
            <button
              onClick={() => router.push('/matches')}
              className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <div className="text-2xl mb-2">🤝</div>
              <div className="font-medium text-gray-900">매칭 관리</div>
              <div className="text-sm text-gray-600">요청 현황 및 관리</div>
            </button>
          </div>
        </div>

        {/* 탈퇴 */}
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <h4 className="font-semibold text-red-800 mb-2">회원 탈퇴</h4>
            <p className="text-red-700 text-sm mb-4">
              탈퇴 시 모든 데이터가 삭제되며, 복구할 수 없습니다!
            </p>
            <button
              onClick={() => setIsWithdrawalModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              회원 탈퇴
            </button>
          </div>
        </div>
      </div>

      {/* 탈퇴 모달 */}
      <WithdrawalModal
        isOpen={isWithdrawalModalOpen}
        onClose={() => setIsWithdrawalModalOpen(false)}
        onConfirm={handleWithdrawal}
      />
    </div>
  );
}
