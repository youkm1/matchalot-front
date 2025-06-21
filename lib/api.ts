// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // 🚀 CSRF 토큰 가져오기
  private async getCsrfToken(): Promise<string> {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/auth/csrf-token`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.token || '';
      }
      return '';
    } catch (error) {
      console.warn('Failed to get CSRF token:', error);
      return '';
    }
  }

  async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    const method = (options.method || 'GET').toUpperCase();
    
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    //  데이터 변경 작업에만 CSRF 토큰 추가
    const isModifyingRequest = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    if (isModifyingRequest) {
      try {
        const csrfToken = await this.getCsrfToken();
        if (csrfToken) {
          headers['X-CSRF-Token'] = csrfToken;
        }
      } catch (error) {
        console.warn('Failed to get CSRF token:', error);
      }
    }

    const config: RequestInit = {
      method,
      headers,
      credentials: 'include', //  httpOnly 쿠키 자동 포함
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Unauthorized');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 응답이 JSON인지 확인
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      // JSON이 아닌 경우 텍스트로 반환
      return await response.text();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }


  get(endpoint: string, options: RequestInit = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  post(endpoint: string, data?: any, options: RequestInit = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  put(endpoint: string, data?: any, options: RequestInit = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  patch(endpoint: string, data?: any, options: RequestInit = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  delete(endpoint: string, options: RequestInit = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }
}


export const apiClient = new ApiClient();


export const authAPI = {
  getCurrentUser: () => apiClient.get('/api/v1/auth/me'),
  logout: () => apiClient.post('/api/v1/auth/logout'),
  handleCallback: () => apiClient.get('/api/v1/auth/callback'),
  getCsrfToken: () => apiClient.get('/api/v1/auth/csrf-token'),
};


export const studyMaterialAPI = {
  // 업로드
  upload: (data: any) => apiClient.post('/api/v1/study-materials', data),
  
  // 조회
  getAll: (params?: Record<string, any>) => {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return apiClient.get(`/api/v1/study-materials${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id: string) => apiClient.get(`/api/v1/study-materials/${id}`),
  getMine: () => apiClient.get('/api/v1/study-materials/my'),
  

  update: (id: string, data: any) => apiClient.put(`/api/v1/study-materials/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/v1/study-materials/${id}`),
  
  
  getSubjects: () => apiClient.get('/api/v1/study-materials/subjects'),
  getExamTypes: () => apiClient.get('/api/v1/study-materials/exam-types'),
};


export const matchAPI = {
  
  request: (data: any) => apiClient.post('/api/v1/match/request', data),
  
  // 잠재적 파트너 조회
  getPotentialPartners: (materialId: string) => 
    apiClient.get(`/api/v1/match/potential/${materialId}`),
  
  // 매칭 상태 변경
  accept: (matchId: string) => apiClient.put(`/api/v1/match/${matchId}/accept`),
  reject: (matchId: string) => apiClient.put(`/api/v1/match/${matchId}/reject`),
  complete: (matchId: string) => apiClient.put(`/api/v1/match/${matchId}/complete`),
  
  // 매칭 목록 조회
  getReceived: () => apiClient.get('/api/v1/match/received'),
  getSent: () => apiClient.get('/api/v1/match/sent'),
  getMine: () => apiClient.get('/api/v1/match/my'),
  getActive: () => apiClient.get('/api/v1/match/active'),
  
  // 유틸리티
  cleanup: () => apiClient.post('/api/v1/match/cleanup'),
};

// 🎯 타입 정의 (선택사항)
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  status?: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  status: number;
}

export const ApiUtils = {
  
  buildQueryString: (params: Record<string, any>): string => {
    const filtered = Object.entries(params).filter(([_, value]) => value !== undefined && value !== null);
    return new URLSearchParams(filtered.map(([key, value]) => [key, String(value)])).toString();
  },
  
  
  getErrorMessage: (error: any): string => {
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.message) return error.message;
    return '알 수 없는 오류가 발생했습니다.';
  },
  
  
  isAuthenticated: async (): Promise<boolean> => {
    try {
      await authAPI.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }
};
