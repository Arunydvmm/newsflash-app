import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import AdSlot from '@/models/AdSlot'
import { getAuthFromCookies } from '@/lib/auth'
import { withCors, getCorsHeaders } from '@/lib/cors'

async function GET_handler() {
  await connectDB()
  const slots = await AdSlot.find().lean()
  return NextResponse.json(slots)
}

async function PUT_handler(req: NextRequest) {
  const auth = getAuthFromCookies()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await connectDB()
  const slots = await req.json() as Array<{ slotId: string; enabled: boolean; script: string }>
  const updates = await Promise.all(
    slots.map(s =>
      AdSlot.findOneAndUpdate({ slotId: s.slotId }, { enabled: s.enabled, script: s.script }, { new: true })
    )
  )
  return NextResponse.json(updates)
}

export const GET = withCors(GET_handler)
export const PUT = withCors(PUT_handler)
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(req) })
}
