'use client';

import React, { useState, useEffect } from 'react';
import { studyMaterialAPI } from '../../../lib/api';

interface Question {
  number: number;
  content: string;
  answer: string;
  description?: string;
}

interface Subject {
  id: string;
  name: string;
}

interface ExamType {
  id: string;
  name: string;
}

export default function UploadPage() {
  const [step, setStep] = useState(1); // 1: PDF 업로드, 2: 정보 입력, 3: 문제 입력
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
  
  // 문제 목록
  const [questions, setQuestions] = useState<Question[]>([
    { number: 1, content: '', answer: '', description: '' }
  ]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // 과목과 시험 유형 목록 로드
    const loadData = async () => {
      try {
        const [subjectsResponse, examTypesResponse] = await Promise.all([
          studyMaterialAPI.getSubjects(),
          studyMaterialAPI.getExamTypes()
        ]);
        
        // API 응답 형식에 맞게 파싱
        const subjectsData = Array.isArray(subjectsResponse) 
          ? subjectsResponse 
          : subjectsResponse.subjects || [];
        const examTypesData = Array.isArray(examTypesResponse) 
          ? examTypesResponse 
          : examTypesResponse.examTypes || [];
        
        setSubjects(subjectsData.map((item: any) => {
        if (typeof item === 'string') {
          return {
            id: item,
            name: item === 'KOREAN_WOMEN_HISTORY' ? '한국여성의역사' :
                  item === 'ALGORITHM' ? '알고리즘' :
                  item === 'DIGITAL_LOGIC_CIRCUIT' ? '디지털논리회로' :
                  item === 'STATISTICS_INTRODUCTION' ? '통계학입문' : item
          };
        }
        return item;
      }));

      setExamTypes(examTypesData.map((item: any) => {
        if (typeof item === 'string') {
          return {
            id: item,
            name: item === 'MIDTERM' ? '중간고사' :
                  item === 'FINAL' ? '기말고사' : item
          };
        }
        return item;
      }));
        
      } catch (error) {
        console.error('데이터 로드 실패:', error);
        setError('기본 데이터 로드에 실패했습니다.');
        
        // fallback 데이터
        setSubjects([
        { id: 'KOREAN_WOMEN_HISTORY', name: '한국여성의역사' },
        { id: 'ALGORITHM', name: '알고리즘' },
        { id: 'DIGITAL_LOGIC_CIRCUIT', name: '디지털논리회로'},
        { id: 'STATISTICS_INTRODUCTION', name: '통계학입문'}
      ]);
      setExamTypes([
        { id: 'MIDTERM', name: '중간고사' },
        { id: 'FINAL', name: '기말고사' }
      ]);
      }
    };
    loadData();
  }, []);

  // PDF 파일 업로드 처리
  const handlePDFUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      if (file.size > 10 * 1024 * 1024) { // 10MB 제한
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

  // 문제 추가
  const addQuestion = () => {
    if (questions.length >= 50) {
      setError('최대 50개까지 문제를 추가할 수 있습니다.');
      return;
    }
    
    setQuestions([
      ...questions,
      { number: questions.length + 1, content: '', answer: '', description: '' }
    ]);
  };

  // 문제 삭제
  const removeQuestion = (index: number) => {
    if (questions.length === 1) {
      setError('최소 1개의 문제는 있어야 합니다.');
      return;
    }
    
    const newQuestions = questions.filter((_, i) => i !== index);
    // 문제 번호 재정렬
    const reorderedQuestions = newQuestions.map((q, i) => ({
      ...q,
      number: i + 1
    }));
    setQuestions(reorderedQuestions);
  };

  // 문제 내용 업데이트
  const updateQuestion = (index: number, field: keyof Question, value: string | number) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: field === 'number' ? Number(value) : value
    };
    setQuestions(newQuestions);
  };

  // 폼 제출
  const handleSubmit = async () => {
    setError('');
    
    // 유효성 검사
    if (!formData.subject || !formData.examType || !formData.title || !formData.season) {
      setError('모든 기본 정보를 입력해주세요.');
      return;
    }

    const invalidQuestions = questions.filter(q => !q.content.trim() || !q.answer.trim());
    if (invalidQuestions.length > 0) {
      setError('모든 문제의 내용과 답안을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const uploadData = {
        subject: formData.subject,
        examType: formData.examType === 'MIDTERM' ? '중간고사' : 
            formData.examType === 'FINAL' ? '기말고사' : formData.examType,
        year: formData.year,
        season: formData.season,
        title: formData.title.trim(),
        questions: questions.map(q => ({
          number: q.number,
          content: q.content.trim(),
          answer: q.answer.trim(),
          explanation: q.description?.trim() || undefined
        }))
      };

      console.log('업로드 데이터:', uploadData);
      const result = await studyMaterialAPI.upload(uploadData);
      console.log('업로드 성공:', result);
      
      alert('학습자료가 성공적으로 업로드되었습니다!');
      
      // 성공 후 materials 페이지로 이동
      window.location.href = '/materials';
      
    } catch (error) {
      console.error('업로드 실패:', error);
      setError('업로드에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 뒒로 가기
  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            학습자료 업로드
          </h1>
          <p className="text-gray-600">
            족보를 업로드하고 다른 학우들과 공유해보세요!
          </p>
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
            <span>문제 입력</span>
          </div>
        </div>

        {/* Step 1: PDF 업로드 */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              📄 PDF 파일 업로드
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
              <h4 className="font-semibold text-blue-800 mb-2">📝 업로드 안내</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• PDF 파일을 업로드한 후 문제를 직접 입력해주세요</li>
                <li>• 명확한 문제와 정답을 작성해주세요</li>
                <li>• 품질 좋은 자료일수록 신뢰도가 더 올라갑니다</li>
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
                <h3 className="text-lg font-semibold mb-4">📄 업로드된 파일</h3>
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
                      placeholder="예: 2024년 1학기 자료구조 중간고사"
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
                    다음: 문제 입력
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: 문제 입력 */}
        {step === 3 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">📝 문제 입력</h3>
              <div className="text-sm text-gray-600">
                {questions.length}/50 문제
              </div>
            </div>

            <div className="space-y-6">
              {questions.map((question, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">문제 {question.number}</h4>
                    {questions.length > 1 && (
                      <button
                        onClick={() => removeQuestion(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        삭제
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        문제 내용 *
                      </label>
                      <textarea
                        value={question.content}
                        onChange={(e) => updateQuestion(index, 'content', e.target.value)}
                        placeholder="문제 내용을 입력하세요"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        정답 *
                      </label>
                      <textarea
                        value={question.answer}
                        onChange={(e) => updateQuestion(index, 'answer', e.target.value)}
                        placeholder="정답을 입력하세요"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        해설 (선택)
                      </label>
                      <textarea
                        value={question.description || ''}
                        onChange={(e) => updateQuestion(index, 'description', e.target.value)}
                        placeholder="추가 설명이나 해설을 입력하세요"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={addQuestion}
                disabled={questions.length >= 50}
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
