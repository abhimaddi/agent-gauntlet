export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString();
}

export function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) {
    return '0s';
  }

  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) {
    return `${s}s`;
  }
  return `${m}m ${s}s`;
}
