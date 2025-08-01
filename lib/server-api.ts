export interface StudyMaterialSummary {
  id: number;
  title: string;
  subject: string;
  examType: string;
  year: number;
  season: string;
  semesterDisplay: string;
  questionCount: number;
  uploaderNickname: string;
  uploaderId: number;
  uploaderTrustScore: number;
  createdAt: string;
  tags?: string[];
}

// 상세 학습자료 정보 (상세 페이지용)
export interface StudyMaterial extends StudyMaterialSummary {
  displayTitle: string;
  questions: Question[];
}
export interface Question {
  number: number;
  content: string;
  answer: string;
  explanation: string;
}
export interface User {
  Id: number;
  nickname: string;
  email: string;
  role: string;
  trustScore: number;
  createdAt: string;
}

export async function getServerMaterials(): Promise<StudyMaterial[]> {
    try {
        const response = await fetch(`/api/v1/study-materials`, {
        headers: {
        'Accept': 'application/json',
        },
        cache: 'no-store', // 항상 최신 데이터일것
    });
    
    if (!response.ok) {
      console.error('Failed to fetch materials:', response.status);
      return [];
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : data.materials || [];
    }
    catch(error) {
        console.error("족보 페치 중 에러: ", error);
        return [];
    }
    
}

export async function getServerSubjects(): Promise<Array<{id: string, name: string}>> {
  try {
    const response = await fetch(`/api/v1/study-materials/subjects`, {
      headers: { 'Accept': 'application/json' },
      cache: 'force-cache', // 과목 목록은 캐시 가능
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    // 백엔드 응답 형식에 맞게 파싱
    const subjects = data.subjects || [];
    return subjects.map((subject: string) => ({
      id: subject,
      name: 
        subject === 'KOREAN_WOMEN_HISTORY' ? '한국여성의역사' :
        subject === 'ALGORITHM' ? '알고리즘' :
        subject === 'DIGITAL_LOGIC_CIRCUIT' ? '디지털논리회로' :
        subject === 'MODERN_THOUGH' ? '보고듣고만지는현대사상' : subject
    }));
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }
}

export async function getServerExamTypes(): Promise<Array<{id: string, name: string}>> {
  try {
    const response = await fetch(`/api/v1/study-materials/exam-types`, {
      headers: { 'Accept': 'application/json' },
      cache: 'force-cache',
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    const examTypes = data.examTypes || [];
    return examTypes.map((type: string) => ({
      id: type,
      name: type === 'MIDTERM' ? '중간고사' : 
            type === 'FINAL' ? '기말고사' : type
    }));
  } catch (error) {
    console.error('Error fetching exam types:', error);
    return [];
  }
}
