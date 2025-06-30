// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

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

    // 데이터 변경 작업에만 CSRF 토큰 추가
    const isModifyingRequest = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    const isLogoutRequest = endpoint.includes('/logout');
    if (isModifyingRequest && !isLogoutRequest) {
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
      credentials: 'include',
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (response.status === 401 && !endpoint.includes('/logout')) {
        
        throw new Error('Unauthorized');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
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
  logout: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });
      
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  },
  handleCallback: () => apiClient.get('/api/v1/auth/callback'),
  getCsrfToken: () => apiClient.get('/api/v1/auth/csrf-token'),
};

export const studyMaterialAPI = {
  upload: (data: any) => apiClient.post('/api/v1/study-materials', data),
  
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
  // ✅ 수정: POST /api/v1/match/request/{materialId}
  request: (materialId: string, data: any) => {
    console.log('🔥 API 함수 - materialId:', materialId);
    console.log('🔥 API 함수 - data:', data);
    return apiClient.post('/api/v1/match/request/' + materialId, data);
  },
  
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
