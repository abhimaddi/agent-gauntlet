import { NextResponse } from 'next/server';
import {
  exportSessionCsv,
  exportSessionJson,
  exportSessionShareGptJsonl,
} from '@/lib/sentinel/exporters';
import { getSession } from '@/lib/sentinel/store';

interface Params {
  params: Promise<{ gameId: string }>;
}

export async function GET(request: Request, { params }: Params) {
  const { gameId } = await params;
  const session = await getSession(gameId);

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const url = new URL(request.url);
  const format = (url.searchParams.get('format') ?? 'json').toLowerCase();

  if (format === 'csv') {
    return new NextResponse(exportSessionCsv(session), {
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="sentinel-session-${gameId}.csv"`,
      },
    });
  }

  if (format === 'sharegpt') {
    return new NextResponse(exportSessionShareGptJsonl(session), {
      headers: {
        'content-type': 'application/x-ndjson; charset=utf-8',
        'content-disposition': `attachment; filename="sentinel-session-${gameId}.jsonl"`,
      },
    });
  }

  return new NextResponse(exportSessionJson(session), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': `attachment; filename="sentinel-session-${gameId}.json"`,
    },
  });
}
