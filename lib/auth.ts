import { cookies } from "next/headers";

export async function getCurrentUser() {
    const cookieStore = await cookies(); //promise 반환하므로 await
    const authToken = cookieStore.get('auth-token');
    
    if (!authToken?.value) {
        return null;
    }
    
    try {
        // 서버에서 사용자 정보 가져오기
        const response = await fetch(`http://app:8080/api/v1/auth/me`, {
            headers: { 
                'Cookie': `auth-token=${authToken.value}`,
                'Accept': 'application/json',
            },
        });
        
        if (!response.ok) {
            console.error('Failed to get current user:', response.status);
            return null;
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}
