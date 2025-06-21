import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const {pathname} = request.nextUrl;

    const protectedPaths=['/materials','/matches','/upload'];
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

    if (isProtectedPath) {
        const authToken = request.cookies.get('auth-token');

        if (!authToken || !authToken.value) {
            return NextResponse.redirect(new URL('/login',request.url));

        }
    }
    return NextResponse.next();
}
