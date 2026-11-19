// Saved progress for the Leonida Legend tracker: earned trophies and per-trophy
// counters live in localStorage only, and can be exported to a file and imported back.
export const PROGRESS_KEY = 'leonida-legend-progress-v1';
export const COUNTERS_KEY = 'leonida-legend-counters-v1';

export function loadEarned() {
  try {
    const raw = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '[]');
    return new Set(Array.isArray(raw) ? raw.filter((n) => typeof n === 'string') : []);
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned].sort()));
}

export function loadCounters() {
  try {
    const raw = JSON.parse(localStorage.getItem(COUNTERS_KEY) ?? '{}');
    return raw && typeof raw === 'object' ? raw : {};
  } catch {
    return {};
  }
}

export function saveCounters(counters) {
  localStorage.setItem(COUNTERS_KEY, JSON.stringify(counters));
}

export function exportProgress(earned, counters) {
  const payload = {
    app: 'leonida-legend-gta6-trophies',
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort(),
    counters,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'gta6-trophy-progress.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

export async function importProgressFile(file) {
  const parsed = JSON.parse(await file.text());
  const earned = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed.earned)
      ? parsed.earned
      : null;
  if (!earned) throw new Error('That file has no earned-trophy list in it.');
  const counters =
    parsed && typeof parsed === 'object' && parsed.counters && typeof parsed.counters === 'object'
      ? parsed.counters
      : {};
  return { earned: new Set(earned.filter((n) => typeof n === 'string')), counters };
}
