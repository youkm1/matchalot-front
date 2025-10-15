import { useState, useCallback } from 'react';
import { analyticsAPI } from '../lib/api';

export interface StatisticsSummary {
  totalRequests: number;
  totalAccepted: number;
  totalCompleted: number;
  acceptanceRate: string;
}

export interface HourlyStats {
  hourlyStatsByEventType: {
    MATCH_REQUESTED?: Record<string, number>;
    MATCH_ACCEPTED?: Record<string, number>;
    MATCH_COMPLETED?: Record<string, number>;
  };
  peakHour: string;
  peakCount: number;
}

export interface UserStats {
  topActiveUsers: Record<string, Record<string, number>>;
}

export interface SuccessRateStats {
  successRate: string;
  totalMatches: number;
  completedMatches: number;
}

export interface Analytics {
  summary: StatisticsSummary;
}

export const useAnalytics = () => {
  const [statistics, setStatistics] = useState<Analytics | null>(null);
  const [hourlyStats, setHourlyStats] = useState<HourlyStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [successRate, setSuccessRate] = useState<SuccessRateStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 현재 통계 조회
  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsAPI.getStatistics();
      setStatistics(data);
    } catch (err: any) {
      setError(err.message || '통계 조회에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 시간대별 통계
  const fetchHourlyStats = useCallback(async (date?: string) => {
    try {
      const data = await analyticsAPI.getHourlyStats(date);
      setHourlyStats(data);
    } catch (err: any) {
      setError(err.message || '시간대별 통계 조회에 실패했습니다.');
    }
  }, []);

  // 사용자별 활동 통계
  const fetchUserStats = useCallback(async (limit = 10) => {
    try {
      const data = await analyticsAPI.getUserStats(limit);
      setUserStats(data);
    } catch (err: any) {
      setError(err.message || '사용자 통계 조회에 실패했습니다.');
    }
  }, []);

  // 매칭 성공률 통계
  const fetchSuccessRate = useCallback(async () => {
    try {
      const data = await analyticsAPI.getSuccessRate();
      setSuccessRate(data);
    } catch (err: any) {
      setError(err.message || '성공률 통계 조회에 실패했습니다.');
    }
  }, []);

  // 통계 초기화
  const resetStatistics = useCallback(async () => {
    try {
      await analyticsAPI.resetStatistics();
      await fetchStatistics(); // 새로고침
      return true;
    } catch (err: any) {
      setError(err.message || '통계 초기화에 실패했습니다.');
      return false;
    }
  }, [fetchStatistics]);

  return {
    statistics,
    hourlyStats,
    userStats,
    successRate,
    loading,
    error,
    fetchStatistics,
    fetchHourlyStats,
    fetchUserStats,
    fetchSuccessRate,
    resetStatistics
  };
};