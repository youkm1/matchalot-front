const API_URL = process.env.API_URL || 'http://localhost:8080';

export interface StudyMaterial {

    id: number;
    title: string;
    subject: string;
    examType: string;
    semesterDisplay: string;
    questionCount: number;
    uploaderNickname: string;
    uploaderTrustScore: number;
    createdAt: string;
    tags?: string[];
}

export async function getServerMaterials(): Promise<StudyMaterial[]> {
    try {
        const response = await fetch(`${API_URL}/api/v1/study-materials`, {
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
    const response = await fetch(`${API_URL}/api/v1/study-materials/subjects`, {
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
        subject === 'STATISTICS_INTRODUCTION' ? '통계학입문' : subject
    }));
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }
}

export async function getServerExamTypes(): Promise<Array<{id: string, name: string}>> {
  try {
    const response = await fetch(`${API_URL}/api/v1/study-materials/exam-types`, {
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
