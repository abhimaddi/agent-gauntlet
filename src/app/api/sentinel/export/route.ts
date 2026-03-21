import { NextResponse } from 'next/server';
import {
  exportSessionsCsv,
  exportSessionsJson,
  exportSessionsShareGptJsonl,
} from '@/lib/sentinel/exporters';
import { listSessions } from '@/lib/sentinel/store';

export async function GET(request: Request) {
  const sessions = await listSessions();
  const url = new URL(request.url);
  const format = (url.searchParams.get('format') ?? 'json').toLowerCase();

  if (format === 'csv') {
    return new NextResponse(exportSessionsCsv(sessions), {
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': 'attachment; filename="sentinel-dataset.csv"',
      },
    });
  }

  if (format === 'sharegpt') {
    return new NextResponse(exportSessionsShareGptJsonl(sessions), {
      headers: {
        'content-type': 'application/x-ndjson; charset=utf-8',
        'content-disposition': 'attachment; filename="sentinel-dataset.jsonl"',
      },
    });
  }

  return new NextResponse(exportSessionsJson(sessions), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': 'attachment; filename="sentinel-dataset.json"',
    },
  });
}
