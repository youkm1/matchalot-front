'use client';

import { useEffect, useState } from 'react';
import { authAPI, adminAPI } from '@/lib/api';
import { getDisplayName } from '@/utils/nickname';
import { User, StudyMaterial } from '@/types';
import { createPdfUrl } from '@/utils/pdf';

// PendingMaterial은 StudyMaterial과 유사하므로 타입 별칭 사용
type PendingMaterial = Omit<StudyMaterial, 'uploaderId' | 'tags'> & {
  tempPdfData?: string;
};

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [pendingMaterials, setPendingMaterials] = useState<PendingMaterial[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'materials' | 'users'>('materials');
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const user = await authAPI.getCurrentUser();
      setCurrentUser(user);
      
      // 백엔드에서 role을 ADMIN으로 설정한 사용자만 접근 가능
      if (user.role !== 'ADMIN') {
        setError('관리자 권한이 필요합니다. 현재 권한: ' + user.role);
        return;
      }
      
      await Promise.all([
        loadPendingMaterials(),
        loadUsers()
      ]);
    } catch (error) {
      setError('접근 권한이 없습니다. 로그인 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPendingMaterials = async () => {
    try {
      const materials = await adminAPI.getPendingMaterials();
      setPendingMaterials(Array.isArray(materials) ? materials : []);
    } catch (error) {
      console.error('승인 대기 자료 로드 실패:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const users = await adminAPI.getAllUsers();
      setUsers(Array.isArray(users) ? users : []);
    } catch (error) {
      console.error('사용자 목록 로드 실패:', error);
    }
  };

  const approveMaterial = async (materialId: number) => {
    try {
      await adminAPI.approveMaterial(materialId);
      alert('족보가 승인되었습니다. PDF 데이터가 자동으로 정리됩니다.');
      
      // PDF 모달이 열려있다면 닫기
      setSelectedPdf(null);
      
      // 승인된 자료 목록에서 제거
      setPendingMaterials(prev => prev.filter(m => m.id !== materialId));
    } catch (error) {
      console.error('승인 실패:', error);
      alert('승인 중 오류가 발생했습니다.');
    }
  };

  const rejectMaterial = async (materialId: number) => {
    const reason = prompt('거절 사유를 입력해주세요:');
    if (!reason) return;

    try {
      await adminAPI.rejectMaterial(materialId, reason);
      alert('족보가 거절되었습니다. PDF 데이터가 자동으로 정리됩니다.');
      
      // PDF 모달이 열려있다면 닫기
      setSelectedPdf(null);
      
      // 거절된 자료 목록에서 제거
      setPendingMaterials(prev => prev.filter(m => m.id !== materialId));
    } catch (error) {
      console.error('거절 실패:', error);
      alert('거절 처리 중 오류가 발생했습니다.');
    }
  };

  const forceDeleteUser = async (userId: number, userEmail: string) => {
    const reason = prompt(`사용자 ${userEmail}을(를) 강제 탈퇴시키는 사유를 입력해주세요:`);
    if (!reason) return;

    if (!confirm(`정말로 ${userEmail} 사용자를 강제 탈퇴시키겠습니까?`)) return;

    try {
      await adminAPI.forceDeleteUser(userId, reason);
      alert('사용자가 강제 탈퇴 처리되었습니다.');
      setUsers(prev => prev.filter(u => u.Id !== userId));
    } catch (error) {
      console.error('강제 탈퇴 실패:', error);
      alert('강제 탈퇴 처리 중 오류가 발생했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
          <div className="text-red-500 text-4xl mb-4">🚫</div>
          <h2 className="text-xl font-semibold text-red-800 mb-2">접근 거부</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">관리자 대시보드</h1>
        <p className="text-gray-600">
          안녕하세요, {getDisplayName(currentUser?.nickname)}님! 관리자 권한으로 로그인되었습니다.
        </p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('materials')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'materials'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              승인 대기 자료 ({pendingMaterials.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              사용자 관리 ({users.length})
            </button>
          </nav>
        </div>
      </div>

      {/* 승인 대기 자료 탭 */}
      {activeTab === 'materials' && (
        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">승인 대기 중인 학습자료</h2>
              <p className="text-sm text-gray-600 mt-1">
                업로드된 자료를 검토하고 승인 또는 거절할 수 있습니다.
              </p>
            </div>
            
            {pendingMaterials.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 text-4xl mb-4">📋</div>
                <p className="text-gray-600">승인 대기 중인 자료가 없습니다.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {pendingMaterials.map((material) => (
                  <div key={material.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 flex-1">
                            <button
                              onClick={() => window.open(`/materials/${material.id}`, '_blank')}
                              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors text-left"
                            >
                              {material.title}
                            </button>
                          </h3>
                          {material.tempPdfData && (
                            <button
                              onClick={() => setSelectedPdf(material.tempPdfData!)}
                              className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                            >
                              📄 PDF 보기
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                          <div>
                            <span className="font-medium">과목:</span> {material.subject}
                          </div>
                          <div>
                            <span className="font-medium">시험:</span> {material.examType}
                          </div>
                          <div>
                            <span className="font-medium">학기:</span> {material.semesterDisplay}
                          </div>
                          <div>
                            <span className="font-medium">문제 수:</span> {material.questionCount}개
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div>
                            업로드: {material.uploaderNickname} 
                            <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                              신뢰도 {material.uploaderTrustScore}
                            </span>
                          </div>
                          <div>
                            {new Date(material.createdAt).toLocaleDateString('ko-KR')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-6">
                        <button
                          onClick={() => approveMaterial(material.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          승인
                        </button>
                        <button
                          onClick={() => rejectMaterial(material.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          거절
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 사용자 관리 탭 */}
      {activeTab === 'users' && (
        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">사용자 관리</h2>
              <p className="text-sm text-gray-600 mt-1">
                등록된 사용자들을 관리할 수 있습니다.
              </p>
            </div>
            
            {users.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 text-4xl mb-4">👥</div>
                <p className="text-gray-600">등록된 사용자가 없습니다.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        사용자
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        권한
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        신뢰도
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        가입일
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        관리
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.Id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.nickname}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'ADMIN' 
                              ? 'bg-purple-100 text-purple-800'
                              : user.role === 'MEMBER'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.trustScore}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {user.role !== 'ADMIN' && (
                            <button
                              onClick={() => forceDeleteUser(user.Id, user.email)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                            >
                              강제 탈퇴
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PDF 뷰어 모달 */}
      {selectedPdf && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-5/6 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">PDF 미리보기</h3>
              <button
                onClick={() => setSelectedPdf(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="flex-1 p-4">
              <iframe
                src={createPdfUrl(selectedPdf)}
                className="w-full h-full border rounded"
                title="PDF 뷰어"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
