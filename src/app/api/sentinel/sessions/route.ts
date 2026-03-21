import { NextResponse } from 'next/server';
import { listSessions } from '@/lib/sentinel/store';

export async function GET() {
  const sessions = await listSessions();
  return NextResponse.json({ sessions });
}
