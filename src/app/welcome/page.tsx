'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '../../../lib/api';

export default function WelcomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const user = await authAPI.getCurrentUser();
    if (user) {
      setUser(JSON.parse(user));
    } else {
      // 사용자 정보가 없으면 로그인 페이지로
      router.push('/login');
    }
  }, [router]);

  const steps = [
    {
      icon: '🎯',
      title: '매치어랏에 오신 걸 환영해요!',
      description: '숙명대학교 학습자료 매칭 플랫폼에서 족보를 공유하고 함께 성장해요.',
      detail: '신뢰도 시스템을 통해 안전하고 신뢰할 수 있는 자료 교환이 가능해요.'
    },
    {
      icon: '📚',
      title: '이렇게 사용해요',
      description: '간단한 3단계로 학습자료를 교환할 수 있어요!',
      detail: '내 자료 업로드 → 원하는 자료에 매칭 요청 → 서로 자료 교환'
    },
    {
      icon: '⭐',
      title: '신뢰도 시스템',
      description: '좋은 자료를 공유하면 신뢰도가 올라가요.',
      detail: '신뢰도가 높을수록 더 많은 매칭 기회를 얻을 수 있어요!'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // 온보딩 완료 후 메인 페이지로
      router.push('/materials');
    }
  };

  const handleSkip = () => {
    router.push('/materials');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        {/* 사용자 정보 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-blue-600 font-bold text-xl">
              {user.nickname?.charAt(0) || 'U'}
            </span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            {user.nickname}님
          </h2>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>

        {/* 온보딩 단계 */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">{steps[currentStep].icon}</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {steps[currentStep].title}
            </h3>
            <p className="text-gray-600 mb-3">
              {steps[currentStep].description}
            </p>
            <p className="text-sm text-gray-500">
              {steps[currentStep].detail}
            </p>
          </div>

          {/* 진행 표시기 */}
          <div className="flex justify-center space-x-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 버튼들 */}
        <div className="space-y-3">
          <button
            onClick={handleNext}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            {currentStep < steps.length - 1 ? '다음' : '시작하기'}
          </button>
          
          <button
            onClick={handleSkip}
            className="w-full text-gray-500 hover:text-gray-700 py-2 text-sm transition-colors"
          >
            건너뛰기
          </button>
        </div>

        {/* 빠른 액션 */}
        {currentStep === steps.length - 1 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-4">
              바로 시작해보세요!
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/materials"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm text-center transition-colors"
              >
                📚 자료 둘러보기
              </Link>
              <Link
                href="/upload"
                className="bg-green-100 hover:bg-green-200 text-green-700 py-2 px-3 rounded-lg text-sm text-center transition-colors"
              >
                📤 자료 업로드
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
