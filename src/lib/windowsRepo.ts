import { MEDIA_BUCKET, supabase } from './supabase';
import { AppKind, WindowContent, WindowInstance } from '../types/desktop';

/** Shape of a row in the `desktop_windows` table. */
interface WindowRow {
  id: string;
  owner_id: string;
  kind: AppKind;
  title: string;
  x: number;
  y: number;
  w: number;
  z: number;
  content: WindowContent | null;
}

function rowToWindow(row: WindowRow): WindowInstance {
  return {
    id: row.id,
    ownerId: row.owner_id,
    kind: row.kind,
    title: row.title,
    x: row.x,
    y: row.y,
    w: row.w,
    z: row.z,
    minimized: false, // viewer-local, never comes from the DB
    content: row.content ?? {}
  };
}

/** Columns we persist. `minimized` is intentionally excluded (viewer-local). */
function windowToRow(win: WindowInstance): WindowRow {
  return {
    id: win.id,
    owner_id: win.ownerId,
    kind: win.kind,
    title: win.title,
    x: Math.round(win.x),
    y: Math.round(win.y),
    w: Math.round(win.w),
    z: win.z,
    content: win.content
  };
}

/** Maps a partial window patch to DB column names. */
function patchToRow(patch: Partial<WindowInstance>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.x !== undefined) row.x = Math.round(patch.x);
  if (patch.y !== undefined) row.y = Math.round(patch.y);
  if (patch.w !== undefined) row.w = Math.round(patch.w);
  if (patch.z !== undefined) row.z = patch.z;
  if (patch.content !== undefined) row.content = patch.content;
  return row;
}

export async function list(): Promise<WindowInstance[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('desktop_windows')
    .select('*')
    .order('z', { ascending: true });
  if (error) {
    console.error('[windowsRepo] list failed', error);
    return [];
  }
  return (data as WindowRow[]).map(rowToWindow);
}

export async function insert(win: WindowInstance): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('desktop_windows').insert(windowToRow(win));
  if (error) console.error('[windowsRepo] insert failed', error);
}

export async function update(id: string, patch: Partial<WindowInstance>): Promise<void> {
  if (!supabase) return;
  const row = patchToRow(patch);
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase.from('desktop_windows').update(row).eq('id', id);
  if (error) console.error('[windowsRepo] update failed', error);
}

export async function remove(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('desktop_windows').delete().eq('id', id);
  if (error) console.error('[windowsRepo] remove failed', error);
}

export async function removeAllForOwner(ownerId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('desktop_windows').delete().eq('owner_id', ownerId);
  if (error) console.error('[windowsRepo] removeAllForOwner failed', error);
}

/**
 * Uploads an image blob to the media bucket and returns its public URL,
 * or null on failure. Path is `${ownerId}/${windowId}.${ext}` (upserted).
 */
export async function uploadImage(
  ownerId: string,
  windowId: string,
  blob: Blob,
  ext: string
): Promise<string | null> {
  if (!supabase) return null;
  const path = `${ownerId}/${windowId}.${ext}`;
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, blob, { upsert: true, contentType: blob.type || `image/${ext}` });
  if (error) {
    console.error('[windowsRepo] uploadImage failed', error);
    return null;
  }
  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  // Cache-bust so overwritten images refresh across clients.
  return `${data.publicUrl}?v=${Date.now()}`;
}

export interface RealtimeHandlers {
  onInsert: (win: WindowInstance) => void;
  onUpdate: (win: WindowInstance) => void;
  onDelete: (id: string) => void;
}

/** Subscribes to table changes. Returns an unsubscribe function. */
export function subscribe(handlers: RealtimeHandlers): () => void {
  const client = supabase;
  if (!client) return () => undefined;
  const channel = client
    .channel('desktop_windows_changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'desktop_windows' },
      (payload) => handlers.onInsert(rowToWindow(payload.new as WindowRow))
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'desktop_windows' },
      (payload) => handlers.onUpdate(rowToWindow(payload.new as WindowRow))
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'desktop_windows' },
      (payload) => {
        const oldRow = payload.old as { id?: string };
        if (oldRow.id) handlers.onDelete(oldRow.id);
      }
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}
