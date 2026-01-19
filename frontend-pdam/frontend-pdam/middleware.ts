import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server' // Perbaikan di sini

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function middleware(request: NextRequest) {
    // Biarkan request lewat untuk saat ini
    return NextResponse.next()
}

export const config = {
    matcher: ['/user/:path*', '/kasir/:path*', '/manager/:path*'],
}