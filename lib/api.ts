const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      ...options,
    };

    // 토큰-> Authorization 헤더 추가
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
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

  delete(endpoint: string, options: RequestInit = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }
}

export const apiClient = new ApiClient();

// 인증 API
export const authAPI = {
  getCurrentUser: () => apiClient.get('/api/v1/auth/me'),
  logout: () => apiClient.post('/api/v1/auth/logout'),
  handleCallback: () => apiClient.get('/api/v1/auth/callback'),
};

// 족보 API
export const studyMaterialAPI = {
  upload: (data: any) => apiClient.post('/api/v1/study-materials', data),
  getAll: (params?: Record<string, any>) => {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return apiClient.get(`/api/v1/study-materials?${queryString}`);
  },
  getById: (id: string) => apiClient.get(`/api/v1/study-materials/${id}`),
  getMine: () => apiClient.get('/api/v1/study-materials/my'),
  delete: (id: string) => apiClient.delete(`/api/v1/study-materials/${id}`),
  getSubjects: () => apiClient.get('/api/v1/study-materials/subjects'),
  getExamTypes: () => apiClient.get('/api/v1/study-materials/exam-types'),
};

// 매칭 API
export const matchAPI = {
  request: (data: any) => apiClient.post('/api/v1/match/request', data),
  getPotentialPartners: (materialId: string) => 
    apiClient.get(`/api/v1/match/potential/${materialId}`),
  accept: (matchId: string) => apiClient.put(`/api/v1/match/${matchId}/accept`),
  reject: (matchId: string) => apiClient.put(`/api/v1/match/${matchId}/reject`),
  complete: (matchId: string) => apiClient.put(`/api/v1/match/${matchId}/complete`),
  getReceived: () => apiClient.get('/api/v1/match/received'),
  getSent: () => apiClient.get('/api/v1/match/sent'),
  getMine: () => apiClient.get('/api/v1/match/my'),
  getActive: () => apiClient.get('/api/v1/match/active'),
  cleanup: () => apiClient.post('/api/v1/match/cleanup'),
};
