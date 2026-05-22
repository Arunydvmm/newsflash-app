import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Article from '@/models/Article'
import { getAuthFromCookies } from '@/lib/auth'
import { withCors, getCorsHeaders } from '@/lib/cors'

type Ctx = { params: { id: string } }

async function GET_handler(_req: NextRequest, ctx?: Ctx) {
  await connectDB()
  const article = await Article.findById(ctx!.params.id).lean()
  if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(article)
}

async function PATCH_handler(req: NextRequest, ctx?: Ctx) {
  const auth = getAuthFromCookies()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await connectDB()
  const body = await req.json()
  const article = await Article.findByIdAndUpdate(ctx!.params.id, body, { new: true })
  if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(article)
}

async function DELETE_handler(_req: NextRequest, ctx?: Ctx) {
  const auth = getAuthFromCookies()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (auth.role !== 'SuperAdmin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await connectDB()
  await Article.findByIdAndDelete(ctx!.params.id)
  return NextResponse.json({ success: true })
}

export const GET    = withCors(GET_handler)
export const PATCH  = withCors(PATCH_handler)
export const DELETE = withCors(DELETE_handler)
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(req) })
}
