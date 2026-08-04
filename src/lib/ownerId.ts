const STORAGE_KEY = 'bday-desktop-owner-id';

let cached: string | null = null;

/**
 * Returns a stable per-browser id, creating and storing one on first call.
 * Used for soft ownership — a guest can only edit windows carrying their id.
 */
export function getOwnerId(): string {
  if (cached) return cached;
  if (typeof localStorage === 'undefined') {
    cached = 'local';
    return cached;
  }

  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `owner-${Date.now()}-${Math.floor(Math.random() * 1e9).toString(36)}`;
    localStorage.setItem(STORAGE_KEY, id);
  }
  cached = id;
  return id;
}
