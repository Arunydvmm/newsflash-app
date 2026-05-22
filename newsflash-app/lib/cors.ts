import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL,          // e.g. https://newsflash-app-svmz.onrender.com
  process.env.FRONTEND_URL,                  // optional second origin
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean) as string[]

export function getCorsHeaders(req: NextRequest): Record<string, string> {
  const origin = req.headers.get('origin') || ''
  const allowed =
    ALLOWED_ORIGINS.includes(origin) ||
    ALLOWED_ORIGINS.includes('*')
      ? origin
      : ALLOWED_ORIGINS[0] || '*'

  return {
    'Access-Control-Allow-Origin':      allowed,
    'Access-Control-Allow-Methods':     'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':     'Content-Type, Authorization, Cookie',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age':           '86400',
  }
}

/** Wrap a route handler with CORS — handles OPTIONS preflight automatically */
export function withCors(
  handler: (req: NextRequest, ctx?: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, ctx?: any): Promise<NextResponse> => {
    const corsHeaders = getCorsHeaders(req)

    // Preflight
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: corsHeaders })
    }

    const res = await handler(req, ctx)

    // Attach CORS headers to every real response
    Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v))
    return res
  }
}
