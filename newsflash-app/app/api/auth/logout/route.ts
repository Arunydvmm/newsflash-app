import { NextRequest, NextResponse } from 'next/server'
import { AUTH_COOKIE } from '@/lib/auth'
import { withCors, getCorsHeaders } from '@/lib/cors'

async function POST_handler() {
  const res = NextResponse.json({ success: true })
  res.cookies.set(AUTH_COOKIE, '', { maxAge: 0, path: '/' })
  return res
}

export const POST = withCors(POST_handler)
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(req) })
}
