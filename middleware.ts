// middleware.ts 수정
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const protectedPaths = ['/materials', '/matches', '/upload'];
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

    if (pathname.startsWith('/auth/callback')) {
        return NextResponse.next();
    }
    if (isProtectedPath) {
        const authToken = request.cookies.get('auth-token');


        if (!authToken || !authToken.value) {
            console.log('미들웨어: 쿠키 없음');
            return NextResponse.redirect(new URL('/login', request.url));
        }

        try {
            const response = await fetch(`/api/v1/auth/me`, {
                method: 'GET',
                headers: {
                    'Cookie': `auth-token=${authToken.value}`,
                    'Accept': 'application/json',
                },
                cache: 'no-store' // 캐시 방지
            });

            if (!response.ok) {
                console.log('🔍 미들웨어: 백엔드 인증 실패', response.status);
                return NextResponse.redirect(new URL('/login', request.url));
            }

            console.log('미들웨어: 인증 성공');
        } catch (error) {
            console.log('미들웨어: 인증 에러', error);
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|login|auth).*)',
    ],
};
