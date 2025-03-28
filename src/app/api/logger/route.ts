import { serverLogger } from '@/utils/logger'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const logs = serverLogger.flush()
  return NextResponse.json(logs)
}

export async function POST(req: NextRequest) {
  const { message, category } = await req.json()
  serverLogger.add(message, category)
  return NextResponse.json({ success: true })
}
