import { NextResponse } from 'next/server';
import { getSession } from '@/lib/sentinel/store';

interface Params {
  params: Promise<{ gameId: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  const { gameId } = await params;
  const session = await getSession(gameId);

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  return NextResponse.json({ session });
}
