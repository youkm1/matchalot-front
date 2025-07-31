const API_BASE_URL = 'https://api.match-a-lot.store';

interface ExtendedRequestInit extends RequestInit {
  retryWithNewCsrf?: boolean;
}

class ApiClient {
  
  private csrfToken: string | null = null;
  private csrfTokenPromise: Promise<string> | null = null;

  

  // CSRF 토큰 가져오기 (캐싱 지원)
  private async getCsrfToken(): Promise<string> {
    // 이미 토큰이 있으면 재사용
    if (this.csrfToken) {
      return this.csrfToken;
    }

    // 이미 요청 중이면 대기
    if (this.csrfTokenPromise) {
      return this.csrfTokenPromise;
    }

    // 새로운 토큰 요청
    this.csrfTokenPromise = this.fetchCsrfToken();
    
    try {
      this.csrfToken = await this.csrfTokenPromise;
      return this.csrfToken;
    } finally {
      this.csrfTokenPromise = null;
    }
  }

  private async fetchCsrfToken(): Promise<string> {
    try {
      console.log('🔒 CSRF 토큰 요청 중...');
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/csrf-token`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        const token = data.token || '';
        console.log('🔒 CSRF 토큰 획득:', token ? '성공' : '실패');
        return token;
      }
      console.warn('🔒 CSRF 토큰 요청 실패:', response.status);
      return '';
    } catch (error) {
      console.warn('🔒 CSRF 토큰 획득 에러:', error);
      return '';
    }
  }

  // CSRF 토큰 초기화 (에러 시 재시도용)
  private resetCsrfToken() {
    this.csrfToken = null;
    this.csrfTokenPromise = null;
  }

  async request(endpoint: string, options: ExtendedRequestInit = {}): Promise<any> {
    const url = endpoint.startsWith('http') ? endpoint : endpoint;
    const method = (options.method || 'GET').toUpperCase();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // 🔒 POST/PUT/DELETE 요청에 CSRF 토큰 추가
    const isModifyingRequest = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    const isAuthRequest = endpoint.includes('/auth/');
    
    if (isModifyingRequest && !isAuthRequest) {
      try {
        const csrfToken = await this.getCsrfToken();
        if (csrfToken) {
          headers['X-XSRF-TOKEN'] = csrfToken;
          console.log(`🔒 ${method} 요청에 CSRF 토큰 추가:`, endpoint);
        } else {
          console.warn(`🔒 ${method} 요청이지만 CSRF 토큰이 없음:`, endpoint);
        }
      } catch (error) {
        console.warn('🔒 CSRF 토큰 획득 실패:', error);
      }
    }

    // 🔧 retryWithNewCsrf 제거한 config 생성
    const { retryWithNewCsrf, ...restOptions } = options;
    const config: RequestInit = {
      method,
      headers,
      credentials: 'include',
      ...restOptions,
    };
    

    try {
      console.log(`📡 API 요청: ${method} ${endpoint}`);
      const response = await fetch(url, config);
      
      // 401 에러 시 인증 실패
      if (response.status === 401 && !endpoint.includes('/logout')) {
        console.error('🚫 인증 실패:', endpoint);
        throw new Error('Unauthorized');
      }

      // 403 에러 시 CSRF 토큰 재시도
      if (response.status === 403 && isModifyingRequest) {
        console.warn('🔒 403 에러 - CSRF 토큰 재시도:', endpoint);
        this.resetCsrfToken();
        
        // 한 번만 재시도
        if (!retryWithNewCsrf) {
          return this.request(endpoint, { ...options, retryWithNewCsrf: true });
        }
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`📡 API 에러: ${response.status}`, errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const result = await response.json();
        console.log(`📡 API 성공: ${method} ${endpoint}`);
        return result;
      }
      
      return await response.text();
    } catch (error) {
      console.error('📡 API 요청 실패:', error);
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

// 🔒 CSRF 토큰을 사용하지 않는 auth API들
export const authAPI = {
  getCurrentUser: () => {
    return fetch(`${API_BASE_URL}/api/v1/auth/me`,{
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      }
    }).then(res => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return res.json();
    });
  },
  
  // 로그아웃은 별도 처리 (CSRF 토큰 포함)
  logout: async () => {
    try {
      console.log('🚪 로그아웃 요청...');
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
      console.error('🚪 로그아웃 실패:', error);
      throw error;
    }
  },
  deleteAccount: async () => {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {

    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error('계정 삭제 실패');
  }
  
  return response.json();
},
  
  handleCallback: () => {
    return fetch(`${API_BASE_URL}/api/v1/auth/callback`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      }
    }).then(res => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return res.json();
    });
  },

  getCsrfToken: () => {
    return fetch(`${API_BASE_URL}/api/v1/auth/csrf-token`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      }
    }).then(res => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return res.json();
    });
  },
};

// 🔒 CSRF 토큰이 자동으로 포함되는 API들
export const studyMaterialAPI = {
  upload: (data: any) => {
    console.log('📚 족보 업로드 요청:', data);
    return apiClient.post('/api/v1/study-materials', data);
  },
  
  getAll: (params?: Record<string, any>) => {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return apiClient.get(`/api/v1/study-materials${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: (id: string) => apiClient.get(`/api/v1/study-materials/${id}`),
  getMine: () => apiClient.get('/api/v1/study-materials/my'),
  
  update: (id: string, data: any) => {
    console.log('📚 족보 수정 요청:', id, data);
    return apiClient.put(`/api/v1/study-materials/${id}`, data);
  },
  
  delete: (id: string) => {
    console.log('📚 족보 삭제 요청:', id);
    return apiClient.delete(`/api/v1/study-materials/${id}`);
  },
  
  getSubjects: () => apiClient.get('/api/v1/study-materials/subjects'),
  getExamTypes: () => apiClient.get('/api/v1/study-materials/exam-types'),
};

export const matchAPI = {
  request: (materialId: string, data: any) => {
    console.log('🤝 매칭 요청:', materialId, data);
    return apiClient.post(`/api/v1/match/request/${materialId}`, data);
  },
  
  getPotentialPartners: (materialId: string) => 
    apiClient.get(`/api/v1/match/potential/${materialId}`),
  
  accept: (matchId: string) => {
    console.log('🤝 매칭 수락:', matchId);
    return apiClient.put(`/api/v1/match/${matchId}/accept`);
  },
  
  reject: (matchId: string) => {
    console.log('🤝 매칭 거절:', matchId);
    return apiClient.put(`/api/v1/match/${matchId}/reject`);
  },
  
  complete: (matchId: string) => {
    console.log('🤝 매칭 완료:', matchId);
    return apiClient.put(`/api/v1/match/${matchId}/complete`);
  },
  
  getReceived: () => apiClient.get('/api/v1/match/received'),
  getSent: () => apiClient.get('/api/v1/match/sent'),
  getMine: () => apiClient.get('/api/v1/match/my'),
  getActive: () => apiClient.get('/api/v1/match/active'),
  
  cleanup: () => {
    console.log('🤝 매칭 정리 요청');
    return apiClient.post('/api/v1/match/cleanup');
  },
};

// 유틸리티들
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

// 🔒 관리자 API - CSRF 토큰이 자동으로 포함됨
export const adminAPI = {
  // 대시보드 통계 (GET - CSRF 불필요)
  getDashboard: () => {
    console.log('👑 관리자 대시보드 조회');
    return apiClient.get('/api/v1/admin/dashboard');
  },
  
  // 승인 대기 족보 목록 (GET - CSRF 불필요)
  getPendingMaterials: () => {
    console.log('👑 승인 대기 족보 목록 조회');
    return apiClient.get('/api/v1/admin/materials/pending');
  },
  
  // 족보 승인 (PUT - CSRF 필요) - number도 받도록 수정
  approveMaterial: (materialId: string | number) => {
    console.log('👑 족보 승인:', materialId);
    return apiClient.put(`/api/v1/admin/materials/${materialId}/approve`);
  },
  
  // 족보 거절 (PUT - CSRF 필요) - number도 받도록 수정
  rejectMaterial: (materialId: string | number, reason?: string) => {
    console.log('👑 족보 거절:', materialId, reason);
    return apiClient.put(`/api/v1/admin/materials/${materialId}/reject`, {
      reason: reason || '승인 기준에 부합하지 않습니다.'
    });
  },
  
  // 전체 사용자 목록 (GET - CSRF 불필요)
  getAllUsers: (role?: string) => {
    console.log('👑 사용자 목록 조회:', role);
    const query = role ? `?role=${role}` : '';
    return apiClient.get(`/api/v1/admin/users${query}`);
  },
  
  // 사용자 강제 탈퇴 (DELETE - CSRF 필요) - number도 받도록 수정
  forceDeleteUser: (userId: string | number, reason: string) => {
    return apiClient.delete(`/api/v1/admin/users/${userId}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason })
    });
  },
  
  // 신고 목록 조회 (GET - CSRF 불필요)
  getAllReports: (status?: string) => {
    console.log('👑 신고 목록 조회:', status);
    const query = status ? `?status=${status}` : '';
    return apiClient.get(`/api/v1/admin/reports${query}`);
  },
  
  // 신고 해결 처리 (POST - CSRF 필요) - number도 받도록 수정
  resolveReport: (reportId: string | number, note?: string) => {
    console.log('👑 신고 해결 처리:', reportId, note);
    return apiClient.post(`/api/v1/admin/reports/${reportId}/resolve`, {
      note: note || '처리 완료'
    });
  },
  
  // 신고 기각 처리 (POST - CSRF 필요) - number도 받도록 수정
  rejectReport: (reportId: string | number, note?: string) => {
    console.log('👑 신고 기각 처리:', reportId, note);
    return apiClient.post(`/api/v1/admin/reports/${reportId}/reject`, {
      note: note || '신고 기각'
    });
  },
};

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
