export async function getCsrfToken(): Promise<string> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/auth/csrf-token`, {
            method: 'GET',
            credentials: 'include', // 쿠키 포함
            headers: {
                'Accept': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to get CSRF token');
        }
        
        const data = await response.json();
        return data.token;
    } catch (error) {
        console.error('Error getting CSRF token:', error);
        throw error;
    }
}

// 보안 API 호출 함수
export async function secureApiCall(url: string, options: RequestInit = {}) {
    try {
        const csrfToken = await getCsrfToken();
        
        return fetch(url, {
            ...options,
            credentials: 'include', // 쿠키 자동 포함
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken, // CSRF 토큰 포함
                ...options.headers,
            },
        });
    } catch (error) {
        console.error('Error in secure API call:', error);
        throw error;
    }
}
