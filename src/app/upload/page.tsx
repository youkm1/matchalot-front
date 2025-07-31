'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { studyMaterialAPI, authAPI } from '../../../lib/api';

interface QuestionSolution {
  number: number;
  answer: string;
  explanation: string;
}

interface Subject {
  id: string;
  name: string;
}

interface ExamType {
  id: string;
  name: string;
}

interface User {
  Id: number;
  nickname: string;
  email: string;
  role: string;
  trustScore: number;
  createdAt: string;
}

export default function UploadPage() {
  const router = useRouter();
  
  // ✅ 인증 상태 관리 추가
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const [step, setStep] = useState(1); 
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  // 기본 정보
  const [formData, setFormData] = useState({
    subject: '',
    examType: '',
    year: new Date().getFullYear(),
    season: '',
    title: ''
  });
  
  // 문제 해답 목록 (문제 번호 + 답 + 설명)
  const [solutions, setSolutions] = useState<QuestionSolution[]>([
    { number: 1, answer: '', explanation: '' }
  ]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [error, setError] = useState('');

  // ✅ 인증 체크 및 데이터 로드
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        setIsAuthLoading(true);
        
        // 🔒 인증 상태 확인
        const user = await authAPI.getCurrentUser();
        console.log('✅ 사용자 인증 확인:', user);
        setCurrentUser(user);
        
        // 권한 체크 (신뢰도가 너무 낮으면 업로드 제한)
        if (user.trustScore < -5) {
          setAuthError('신뢰도가 너무 낮아 자료를 업로드할 수 없습니다. (-5점 미만)');
          return;
        }
        
        // 인증 성공 후 기본 데이터 로드
        await loadBasicData();
        
      } catch (error) {
        console.error('❌ 인증 실패:', error);
        alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
        router.push('/login');
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [router]);

  const loadBasicData = async () => {
    try {
      const [subjectsResponse, examTypesResponse] = await Promise.all([
        studyMaterialAPI.getSubjects(),
        studyMaterialAPI.getExamTypes()
      ]);
      
      const subjectsData = subjectsResponse.subjects || [];
      const examTypesData = examTypesResponse.examTypes || [];
      
      setSubjects(subjectsData.map((name: string) => ({
        id: name,
        name: name
      })));

      setExamTypes(examTypesData.map((name: string) => ({
        id: name,
        name: name
      })));
      
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      setError('기본 데이터 로드에 실패했습니다.');
      
      // 폴백 데이터
      setSubjects([
        { id: '한국여성의역사', name: '한국여성의역사' },
        { id: '알고리즘', name: '알고리즘' },
        { id: '디지털논리회로', name: '디지털논리회로'},
        { id: '통계학입문', name: '통계학입문'}
      ]);
      setExamTypes([
        { id: '중간고사', name: '중간고사' },
        { id: '기말고사', name: '기말고사' }
      ]);
    }
  };

  // ✅ 인증 로딩 중이면 로딩 화면 표시
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">인증 확인 중...</h2>
          <p className="text-gray-600">로그인 상태를 확인하고 있습니다.</p>
        </div>
      </div>
    );
  }

  // ✅ 인증 에러가 있으면 에러 화면 표시
  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200 max-w-md">
          <div className="text-red-500 text-4xl mb-4">🚫</div>
          <h2 className="text-xl font-semibold text-red-800 mb-2">업로드 권한이 부족합니다</h2>
          <p className="text-red-700 mb-4">{authError}</p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/materials')}
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              자료 둘러보기
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="block w-full text-blue-600 hover:underline text-sm"
            >
              마이페이지에서 내 정보 확인
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ 사용자 정보가 없으면 에러
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200 max-w-md">
          <div className="text-red-500 text-4xl mb-4">😵</div>
          <h2 className="text-xl font-semibold text-red-800 mb-2">사용자 정보를 찾을 수 없습니다</h2>
          <p className="text-red-700 mb-4">다시 로그인해주세요.</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            로그인하러 가기
          </button>
        </div>
      </div>
    );
  }

  // PDF 파일 업로드 처리
  const handlePDFUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      if (file.size > 10 * 1024 * 1024) {
        setError('파일 크기는 10MB 이하여야 합니다.');
        return;
      }
      
      setPdfFile(file);
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      setStep(2);
      setError('');
    } else {
      setError('PDF 파일만 업로드 가능합니다.');
    }
  };

  // 해답 추가
  const addSolution = () => {
    if (solutions.length >= 20) {
      setError('최대 20개까지 문제 해답을 추가할 수 있습니다.');
      return;
    }
    
    const nextNumber = Math.max(...solutions.map(s => s.number)) + 1;
    setSolutions([
      ...solutions,
      { number: nextNumber, answer: '', explanation: '' }
    ]);
  };

  // 해답 삭제
  const removeSolution = (index: number) => {
    if (solutions.length === 1) {
      setError('최소 1개의 문제 해답은 있어야 합니다.');
      return;
    }
    
    const newSolutions = solutions.filter((_, i) => i !== index);
    setSolutions(newSolutions);
  };

  // 해답 내용 업데이트
  const updateSolution = (index: number, field: keyof QuestionSolution, value: string | number) => {
    const newSolutions = [...solutions];
    newSolutions[index] = {
      ...newSolutions[index],
      [field]: field === 'number' ? Number(value) : value
    };
    setSolutions(newSolutions);
  };

  // 폼 제출
  const handleSubmit = async () => {
    setError('');
    
    // 유효성 검사
    if (!formData.subject || !formData.examType || !formData.title || !formData.season) {
      setError('모든 기본 정보를 입력해주세요.');
      return;
    }

    const validSolutions = solutions.filter(s => s.answer.trim() && s.explanation.trim());
    if (validSolutions.length === 0) {
      setError('최소 1개의 문제 해답을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 🎯 문제 번호 + 답 + 설명 형식으로 전송
      const questionsForBackend = validSolutions.map(sol => ({
        number: sol.number,
        content: `문제 ${sol.number}번 (PDF 참조)`, // PDF 참조 표시
        answer: sol.answer,
        explanation: sol.explanation
      }));

      const uploadData = {
        subject: formData.subject,
        examType: formData.examType,
        year: formData.year,
        season: formData.season,
        title: formData.title.trim(),
        questions: questionsForBackend
      };

      console.log('업로드 데이터:', uploadData);
      const result = await studyMaterialAPI.upload(uploadData);
      console.log('업로드 성공:', result);
      
      alert('학습자료가 성공적으로 업로드되었습니다!');
      router.push('/materials');
      
    } catch (error: any) {
      console.error('업로드 실패:', error);
      
      // ✅ 인증 관련 에러 처리 추가
      if (error?.status === 401 || error?.message?.includes('unauthorized')) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        router.push('/login');
        return;
      }
      
      if (error?.status === 403) {
        alert('업로드 권한이 없습니다. 신뢰도를 확인해주세요.');
        return;
      }
      
      setError('업로드에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
    }
  };

  const getDisplayName = (nickname: string) => {
    if (!nickname) return '송이';
    return nickname.charAt(0) + '송이';
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* ✅ 헤더에 사용자 정보 추가 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                학습자료 업로드
              </h1>
              <p className="text-gray-600">
                족보 PDF와 함께 나만의 해설을 공유해보세요! 🎯
              </p>
            </div>
            
            {/* 사용자 정보 표시 */}
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">업로더</div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">
                  {getDisplayName(currentUser.nickname)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(currentUser.role)}`}>
                  {getRoleDisplayName(currentUser.role)}
                </span>
                <span className="text-xs text-gray-500">
                  신뢰도 {currentUser.trustScore > 0 ? '+' : ''}{currentUser.trustScore}
                </span>
              </div>
            </div>
          </div>
          
          {/* ✅ 준회원 안내 메시지 */}
          {currentUser.role === 'PENDING' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <span className="text-yellow-500 text-xl mr-3">💡</span>
                <div>
                  <h4 className="text-yellow-800 font-semibold">준회원 안내</h4>
                  <p className="text-yellow-700 text-sm mt-1">
                    첫 번째 자료가 승인되면 정회원으로 승격되고 신뢰도 +5점을 받게 됩니다!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <span className="text-red-500 text-xl mr-3">⚠️</span>
              <div>
                <h3 className="text-red-800 font-semibold">오류</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* 진행 단계 표시 */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            {[1, 2, 3].map((stepNum) => (
              <React.Fragment key={stepNum}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-16 h-1 ${
                    step > stepNum ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600 max-w-md mx-auto">
            <span>PDF 업로드</span>
            <span>기본 정보</span>
            <span>문제 해답</span>
          </div>
        </div>

        {/* Step 1: PDF 업로드 */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              📄 족보 PDF 업로드
            </h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors">
              <div className="text-4xl mb-4">📎</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                족보 PDF 파일을 선택하세요
              </h3>
              <p className="text-gray-600 mb-6">
                최대 10MB, PDF 형식만 업로드 가능합니다
              </p>
              
              <label className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg cursor-pointer transition-colors">
                파일 선택
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePDFUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">📝 새로운 업로드 방식</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• PDF에는 족보 원본을 업로드하세요</li>
                <li>• 다음 단계에서 <strong>문제 번호 + 답 + 설명</strong>을 입력해주세요</li>
                <li>• 모든 문제가 아닌 중요하거나 어려운 문제만 해도 OK!</li>
                <li>• 다른 학우들이 이해하기 쉽게 설명해주시면 됩니다</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 2: 기본 정보 입력 */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-start space-x-8">
              {/* PDF 미리보기 */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-4">📄 업로드된 족보</h3>
                {pdfUrl && (
                  <>
                    <div className="border rounded-lg p-4 bg-gray-50 mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">📄</div>
                        <div>
                          <div className="font-medium">{pdfFile?.name}</div>
                          <div className="text-sm text-gray-600">
                            {pdfFile && (pdfFile.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg overflow-hidden">
                      <iframe
                        src={pdfUrl}
                        className="w-full h-96"
                        title="PDF 미리보기"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* 기본 정보 입력 폼 */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-4">📋 기본 정보 입력</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      과목 *
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">과목 선택</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      시험 유형 *
                    </label>
                    <select
                      value={formData.examType}
                      onChange={(e) => setFormData({...formData, examType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">시험 유형 선택</option>
                      {examTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        연도 *
                      </label>
                      <select
                        value={formData.year}
                        onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {[2025, 2024, 2023, 2022, 2021, 2020].map(year => (
                          <option key={year} value={year}>{year}년</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        학기 *
                      </label>
                      <select
                        value={formData.season}
                        onChange={(e) => setFormData({...formData, season: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">학기 선택</option>
                        <option value="1학기">1학기</option>
                        <option value="여름계절">여름계절</option>
                        <option value="2학기">2학기</option>
                        <option value="겨울계절">겨울계절</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      제목 *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="예: 2024년 1학기 자료구조 중간고사 해답"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={goBack}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    이전
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!formData.subject || !formData.examType || !formData.title || !formData.season}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    다음: 문제 해답 작성
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: 문제 해답 입력 */}
        {step === 3 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">📝 문제 해답 작성</h3>
              <div className="text-sm text-gray-600">
                {solutions.length}/20 문제
              </div>
            </div>

            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">💡 해답 작성 팁</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• <strong>문제 번호</strong>: PDF의 문제 번호를 정확히 입력하세요</li>
                <li>• <strong>답</strong>: 정답을 명확하게 작성해주세요</li>
                <li>• <strong>설명</strong>: 왜 이 답이 나오는지 단계별로 설명해주세요</li>
                <li>• 모든 문제가 아닌 <strong>중요한 문제</strong>만 선별해서 작성해도 됩니다</li>
              </ul>
            </div>

            <div className="space-y-6">
              {solutions.map((solution, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium">문제 번호</h4>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={solution.number}
                        onChange={(e) => updateSolution(index, 'number', e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">번</span>
                    </div>
                    {solutions.length > 1 && (
                      <button
                        onClick={() => removeSolution(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        삭제
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        정답 *
                      </label>
                      <textarea
                        value={solution.answer}
                        onChange={(e) => updateSolution(index, 'answer', e.target.value)}
                        placeholder="정답을 입력하세요"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        해설 *
                      </label>
                      <textarea
                        value={solution.explanation}
                        onChange={(e) => updateSolution(index, 'explanation', e.target.value)}
                        placeholder="이 답이 나오는 과정을 단계별로 설명해주세요..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={addSolution}
                disabled={solutions.length >= 20}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
              >
                + 문제 추가
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={goBack}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  이전
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>업로드 중...</span>
                    </>
                  ) : (
                    <span>📤 업로드 완료</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
