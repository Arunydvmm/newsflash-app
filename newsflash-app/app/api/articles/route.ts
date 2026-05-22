import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Article from '@/models/Article'
import { getAuthFromCookies } from '@/lib/auth'
import { withCors, getCorsHeaders } from '@/lib/cors'

async function GET_handler(req: NextRequest) {
  await connectDB()
  const { searchParams } = req.nextUrl
  const page     = parseInt(searchParams.get('page')  || '1')
  const limit    = parseInt(searchParams.get('limit') || '20')
  const category = searchParams.get('category') || ''
  const search   = searchParams.get('search')   || ''
  const status   = searchParams.get('status')   || 'published'

  const query: Record<string, unknown> = { status }
  if (category) query.category = category
  if (search)   query.$text = { $search: search }

  const [articles, total] = await Promise.all([
    Article.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-content')
      .lean(),
    Article.countDocuments(query),
  ])

  return NextResponse.json({ articles, total, page, pages: Math.ceil(total / limit) })
}

async function POST_handler(req: NextRequest) {
  const auth = getAuthFromCookies()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const body = await req.json()
  const article = await Article.create({ ...body, author: body.author || auth.username })
  return NextResponse.json(article, { status: 201 })
}

export const GET    = withCors(GET_handler)
export const POST   = withCors(POST_handler)
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(req) })
}
