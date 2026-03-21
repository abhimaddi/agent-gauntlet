import { promises as fs } from 'fs';
import path from 'path';
import type { SentinelSession } from './types';

const DATA_ROOT = path.join(process.cwd(), '.sentinel-data');
const SESSIONS_DIR = path.join(DATA_ROOT, 'sessions');
const SCREENSHOTS_DIR = path.join(process.cwd(), 'public', 'sentinel-screens');

async function ensureDirs(): Promise<void> {
  await Promise.all([
    fs.mkdir(DATA_ROOT, { recursive: true }),
    fs.mkdir(SESSIONS_DIR, { recursive: true }),
    fs.mkdir(SCREENSHOTS_DIR, { recursive: true }),
  ]);
}

function sessionFile(gameId: string): string {
  return path.join(SESSIONS_DIR, `${gameId}.json`);
}

export function screenshotDir(gameId: string): string {
  return path.join(SCREENSHOTS_DIR, gameId);
}

export async function saveSession(session: SentinelSession): Promise<void> {
  await ensureDirs();
  await fs.writeFile(sessionFile(session.gameId), JSON.stringify(session, null, 2), 'utf8');
}

export async function getSession(gameId: string): Promise<SentinelSession | null> {
  await ensureDirs();
  try {
    const raw = await fs.readFile(sessionFile(gameId), 'utf8');
    return JSON.parse(raw) as SentinelSession;
  } catch {
    return null;
  }
}

export async function updateSession(
  gameId: string,
  updater: (session: SentinelSession) => SentinelSession,
): Promise<SentinelSession | null> {
  const current = await getSession(gameId);
  if (!current) {
    return null;
  }
  const next = updater(current);
  await saveSession(next);
  return next;
}

export async function listSessions(): Promise<SentinelSession[]> {
  await ensureDirs();
  const files = await fs.readdir(SESSIONS_DIR);
  const sessions: SentinelSession[] = [];

  for (const file of files) {
    if (!file.endsWith('.json')) {
      continue;
    }

    try {
      const raw = await fs.readFile(path.join(SESSIONS_DIR, file), 'utf8');
      sessions.push(JSON.parse(raw) as SentinelSession);
    } catch {
      // Skip invalid file.
    }
  }

  return sessions.sort((a, b) => {
    const aTs = new Date(a.startedAt).getTime();
    const bTs = new Date(b.startedAt).getTime();
    return bTs - aTs;
  });
}

export async function removeAllSessions(): Promise<void> {
  await ensureDirs();
  const files = await fs.readdir(SESSIONS_DIR);

  await Promise.all(
    files
      .filter((file) => file.endsWith('.json'))
      .map((file) => fs.unlink(path.join(SESSIONS_DIR, file))),
  );
}
