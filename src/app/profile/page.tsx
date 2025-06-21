'use client';

import { useEffect, useState } from "react";
import { authAPI } from "../../../lib/api";

interface User{
    Id:number;
    nickname: string;
    email:string;
    trustScore:number;
    CreatedAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
      } catch (err) {
        setError('사용자 정보를 불러올 수 없습니다.');
        console.error('Failed to fetch user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">오류 발생</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // 🎯 신뢰도 레벨 계산
  const getTrustLevel = (score: number) => {
    if (score >= 4) return { level: 'VIP', color: 'text-purple-600', bgColor: 'bg-purple-100' };
    if (score >= 2) return { level: '우수', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (score >= 0) return { level: '일반', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    return { level: '주의', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const trustLevel = getTrustLevel(user.trustScore);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            {/* 아바타 */}
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-2xl">
                {user.nickname.charAt(0)}
              </span>
            </div>
            
            {/* 사용자 정보 */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{user.nickname}</h1>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">
                가입일: {new Date(user.CreatedAt).toLocaleDateString()}
              </p>
            </div>

            {/* 신뢰도 배지 */}
            <div className={`px-4 py-2 rounded-full ${trustLevel.bgColor}`}>
              <span className={`font-semibold ${trustLevel.color}`}>
                {trustLevel.level}
              </span>
            </div>
          </div>
        </div>

        {/* 신뢰도 상세 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">신뢰도 현황</h2>
          
          <div className="space-y-4">
            {/* 신뢰도 점수 */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600">현재 신뢰도</span>
              <span className={`text-2xl font-bold ${trustLevel.color}`}>
                {user.trustScore > 0 ? '+' : ''}{user.trustScore}점
              </span>
            </div>

            {/* 신뢰도 바 */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  user.trustScore >= 0 ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ 
                  width: `${Math.min(Math.max((user.trustScore + 5) * 10, 0), 100)}%` 
                }}
              ></div>
            </div>

            {/* 신뢰도 설명 */}
            <div className="text-sm text-gray-600">
              <p>• 신뢰도는 -5점부터 +5점까지 가능합니다</p>
              <p>• 좋은 매칭 완료 시 +1점, 문제 발생 시 -1점</p>
              <p>• 신뢰도 0점 이상일 때 매칭 참여 가능합니다</p>
            </div>
          </div>
        </div>

        {/* 활동 통계 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">활동 통계</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">📚</div>
              <div className="text-lg font-semibold text-gray-900">업로드한 족보</div>
              <div className="text-gray-600">준비 중</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">🤝</div>
              <div className="text-lg font-semibold text-gray-900">완료된 매칭</div>
              <div className="text-gray-600">준비 중</div>
            </div>
          </div>
        </div>

        {/* 빠른 액션 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">빠른 액션</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a 
              href="/materials"
              className="block p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors"
            >
              <div className="text-2xl mb-2">📖</div>
              <div className="font-semibold text-blue-900">학습자료 보기</div>
            </a>
            
            <a 
              href="/upload"
              className="block p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors"
            >
              <div className="text-2xl mb-2">📤</div>
              <div className="font-semibold text-green-900">족보 업로드</div>
            </a>
            
            <a 
              href="/matches"
              className="block p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors"
            >
              <div className="text-2xl mb-2">🔄</div>
              <div className="font-semibold text-purple-900">매칭 관리</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
