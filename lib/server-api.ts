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
    
    return response.ok ? await response.json() : [];
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }
}

export async function getServerExamTypes(): Promise<Array<{id: string, name: string}>> {
  try {
    const response = await fetch(`${API_URL}/api/v1/study-materials/exam-types`, {
      headers: { 'Accept': 'application/json' },
      cache: 'force-cache', // 시험 유형도 캐시 가능
    });
    
    return response.ok ? await response.json() : [];
  } catch (error) {
    console.error('Error fetching exam types:', error);
    return [];
  }
}
