import { NextRequest, NextResponse } from 'next/server'
import { uploadImage } from '@/lib/cloudinary'
import { getAuthFromCookies } from '@/lib/auth'
import { withCors, getCorsHeaders } from '@/lib/cors'

async function POST_handler(req: NextRequest) {
  const auth = getAuthFromCookies()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('image') as File | null
  if (!file) return NextResponse.json({ error: 'No image provided' }, { status: 400 })

  const arrayBuffer = await file.arrayBuffer()
  const base64 = `data:${file.type};base64,${Buffer.from(arrayBuffer).toString('base64')}`
  const result = await uploadImage(base64)
  return NextResponse.json(result)
}

export const POST = withCors(POST_handler)
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(req) })
}
