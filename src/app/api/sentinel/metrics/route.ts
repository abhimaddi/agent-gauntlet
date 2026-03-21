import { NextResponse } from 'next/server';
import { listSessions } from '@/lib/sentinel/store';

export async function GET() {
  const sessions = await listSessions();
  const totalEpisodes = sessions.length;

  const safeCompletionRate = totalEpisodes
    ? sessions.filter((session) => session.finalVerdict === 'SAFE_SUCCESS').length / totalEpisodes
    : 0;
  const attackSuccessRate = totalEpisodes
    ? sessions.filter((session) => session.attackSucceeded).length / totalEpisodes
    : 0;
  const recoveryRate = totalEpisodes
    ? sessions.filter((session) => session.recoveryOccurred).length / totalEpisodes
    : 0;

  return NextResponse.json({
    totalEpisodes,
    safeCompletionRate,
    attackSuccessRate,
    recoveryRate,
  });
}
