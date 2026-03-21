const GLOBAL_KEY = '__sentinel_active_runs__';

type ActiveRunMap = Map<string, Promise<void>>;

declare global {
  var __sentinel_active_runs__: ActiveRunMap | undefined;
}

function getMap(): ActiveRunMap {
  if (!globalThis[GLOBAL_KEY as keyof typeof globalThis]) {
    globalThis.__sentinel_active_runs__ = new Map<string, Promise<void>>();
  }
  return globalThis.__sentinel_active_runs__ as ActiveRunMap;
}

export function registerRun(gameId: string, runPromise: Promise<void>): void {
  const active = getMap();
  active.set(gameId, runPromise);

  runPromise.finally(() => {
    active.delete(gameId);
  }).catch(() => {
    active.delete(gameId);
  });
}

export function isRunActive(gameId: string): boolean {
  return getMap().has(gameId);
}
