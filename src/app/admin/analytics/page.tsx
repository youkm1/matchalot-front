'use client';

import { useEffect } from 'react';
import { useAnalytics } from '../../../hooks/useAnalytics';

// 통계 카드 컴포넌트
function StatCard({ title, value, icon }: { title: string; value: string | number; icon: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const {
    statistics,
    hourlyStats,
    userStats,
    loading,
    error,
    fetchStatistics,
    fetchHourlyStats,
    fetchUserStats,
    resetStatistics
  } = useAnalytics();

  useEffect(() => {
    fetchStatistics();
    fetchHourlyStats();
    fetchUserStats();
  }, [fetchStatistics, fetchHourlyStats, fetchUserStats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">📊 통계 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">에러 발생</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => fetchStatistics()}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">📊 매칭 통계 대시보드</h1>
        <button
          onClick={resetStatistics}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          통계 초기화
        </button>
      </div>

      {/* 요약 통계 */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="오늘 매칭 요청"
            value={statistics.summary.totalRequests}
            icon="🎯"
          />
          <StatCard 
            title="매칭 수락"
            value={statistics.summary.totalAccepted}
            icon="✅"
          />
          <StatCard 
            title="매칭 완료"
            value={statistics.summary.totalCompleted}
            icon="🎉"
          />
          <StatCard 
            title="수락률"
            value={statistics.summary.acceptanceRate}
            icon="📈"
          />
        </div>
      )}

      {/* 시간대별 차트 */}
      {hourlyStats && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">⏰ 시간대별 매칭 요청</h2>
          <div className="grid grid-cols-12 gap-1">
            {Object.entries(hourlyStats.hourlyStatsByEventType.MATCH_REQUESTED || {})
              .map(([hour, count]) => (
                <div key={hour} className="text-center">
                  <div 
                    className="bg-blue-500 mb-1"
                    style={{ height: `${Math.max(4, count * 4)}px` }}
                  ></div>
                  <div className="text-xs">{hour}</div>
                  <div className="text-xs font-bold">{count}</div>
                </div>
              ))}
          </div>
          <p className="text-center mt-4 text-gray-600">
            피크 시간: {hourlyStats.peakHour}시 ({hourlyStats.peakCount}건)
          </p>
        </div>
      )}

      {/* 활발한 사용자 */}
      {userStats && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">👑 활발한 사용자</h2>
          <div className="space-y-2">
            {Object.entries(userStats.topActiveUsers).map(([userId, stats]) => (
              <div key={userId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>사용자 {userId}</span>
                <span className="font-semibold">
                  {Object.values(stats as Record<string, number>).reduce((sum, val) => sum + val, 0)}건
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 안내 메시지 */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 통계 대시보드 가이드</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>• <strong>오늘 매칭 요청:</strong> 오늘 하루 동안 발생한 총 매칭 요청 수</p>
          <p>• <strong>매칭 수락:</strong> 오늘 수락된 매칭 요청 수</p>
          <p>• <strong>매칭 완료:</strong> 오늘 완전히 완료된 매칭 수</p>
          <p>• <strong>수락률:</strong> 매칭 요청 대비 수락 비율</p>
          <p>• <strong>시간대별 차트:</strong> 시간대별 매칭 요청 패턴 분석</p>
          <p>• <strong>활발한 사용자:</strong> 매칭 활동이 많은 상위 사용자들</p>
        </div>
      </div>
    </div>
  );
}