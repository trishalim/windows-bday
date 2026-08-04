# Supabase Persistence for the Shared Birthday Desktop

**Date:** 2026-08-04
**Status:** Approved design — pending implementation plan

## Summary

The app is a Windows 95–styled birthday desktop (for "sofia") where guests open
draggable windows — sticky notes, notepad, word cards, paint drawings, photos —
and leave messages. Today every window and its content live only in React state
and vanish on refresh.

This design makes the desktop a **single shared, anonymous, realtime guestbook**
backed by Supabase. Every guest sees and contributes to the same board. Window
content, position, and images persist; changes broadcast live to all connected
guests. A per-browser id provides soft ownership so guests can only edit/move/
delete the windows they created.

## Decisions (locked)

| Decision | Choice |
|---|---|
| Sharing model | One shared desktop (guestbook) — everyone sees everyone's windows |
| Content scope | Everything, including images (Paint drawings + Photo uploads) |
| Save trigger | Auto-save as you type & drag (debounced); ✕ deletes from the DB |
| Live updates | Yes — Supabase Realtime subscriptions |
| Ownership | Soft ownership via a random browser id in localStorage |

## Architecture

One Supabase table holds every window; one Storage bucket holds paint/photo
images. The React app hydrates from the table on load and subscribes via
Supabase Realtime, so all guests share one live board.

**Data flow:** `open / type / drag / close` → local state updates instantly
(optimistic) → debounced write to Supabase → Realtime broadcasts to all clients
→ other clients reconcile the change into their state by row `id`.

Singleton windows with no user content (`winamp`, `about`) are **not** persisted —
they remain local-only UI.

## Data Model

### Table `desktop_windows`

| column | type | notes |
|---|---|---|
| `id` | uuid pk | default `gen_random_uuid()` |
| `owner_id` | text | browser id (soft ownership) |
| `kind` | text | `paint` \| `txt` \| `word` \| `photo` \| `sticky` |
| `title` | text | window title bar text |
| `x` | int | left position |
| `y` | int | top position |
| `w` | int | width |
| `z` | int | stacking order |
| `minimized` | bool | |
| `content` | jsonb | per-kind payload (below) |
| `created_at` | timestamptz | default `now()` |
| `updated_at` | timestamptz | auto-bumped on update (trigger) |

### `content` payload per kind

- `sticky`: `{ text, bg }`
- `txt`: `{ text }`
- `word`: `{ heading, body, signature, font, size, bold, italic, underline, center }`
- `photo`: `{ imageUrl, caption }`
- `paint`: `{ imageUrl }`

### Storage bucket `desktop-media`

- Public read.
- Holds PNG exports from Paint and uploaded photos.
- Path convention: `${owner_id}/${window_id}.<ext>`.
- External photo URLs (the "From link" option) are stored as-is in
  `content.imageUrl`; no upload happens for those.

### SQL (provided to the user to run once)

```sql
create table public.desktop_windows (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null,
  kind text not null check (kind in ('paint','txt','word','photo','sticky')),
  title text not null default '',
  x int not null default 0,
  y int not null default 0,
  w int not null default 320,
  z int not null default 10,
  minimized boolean not null default false,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- auto-bump updated_at
create or replace function public.touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger desktop_windows_touch
  before update on public.desktop_windows
  for each row execute function public.touch_updated_at();

-- realtime
alter publication supabase_realtime add table public.desktop_windows;

-- RLS: public read + insert; update/delete allowed at DB level
-- (ownership enforced in the client — see "Ownership & Write Semantics")
alter table public.desktop_windows enable row level security;
create policy "public read"   on public.desktop_windows for select using (true);
create policy "public insert" on public.desktop_windows for insert with check (true);
create policy "public update" on public.desktop_windows for update using (true);
create policy "public delete" on public.desktop_windows for delete using (true);

-- storage bucket (public read)
insert into storage.buckets (id, name, public) values ('desktop-media','desktop-media', true);
create policy "media public read"   on storage.objects for select using (bucket_id = 'desktop-media');
create policy "media public insert" on storage.objects for insert with check (bucket_id = 'desktop-media');
```

## Components / Changes

### New modules
- **`src/lib/supabase.ts`** — creates the Supabase client from
  `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`. Exports `null` (and an
  `isConfigured` flag) when env vars are absent so the app can run local-only.
- **`src/lib/ownerId.ts`** — `getOwnerId()` reads a random id from localStorage,
  creating and storing one on first call. Stable across reloads.
- **`src/lib/windowsRepo.ts`** — the **only** module that talks to Supabase.
  Responsibilities:
  - `list()` — fetch all windows on load.
  - `insert(window)` / `update(id, patch)` / `remove(id)`.
  - `uploadImage(ownerId, id, blob, ext)` → returns public URL.
  - `subscribe(handlers)` → Realtime channel for insert/update/delete.

### Modified
- **`useWindowManager`** — becomes Supabase-backed:
  - Hydrate from `windowsRepo.list()` on mount.
  - Subscribe to Realtime; reconcile remote changes by `id`; ignore echoes of
    the client's own writes to avoid cursor/position jumps.
  - New `move(id, x, y)` action.
  - Debounce content + position writes (e.g. ~400ms).
  - Gate `close` / edit / `move` on ownership (`owner_id === getOwnerId()`).
  - `closeAll` deletes only the current browser's windows.
  - Stamp each created window with `owner_id`.
- **`Win95Window`** and **`StickyNote`** — add `onDragEnd` that reports the final
  `x, y` back up (they currently drag visually via framer-motion but never write
  position back to state). Render read-only (drag disabled, ✕ hidden) when the
  window isn't owned by the current browser.
- **App content components** (`StickyNote`, `NotepadApp`, `WordDoc`, `PhotoApp`,
  `PaintApp`) — lift local content state into props + a debounced `onChange` so
  it can be persisted and hydrated. Disable inputs when not owned.
  - **Paint**: export canvas → PNG on pointer-up (throttled), upload via
    `windowsRepo.uploadImage`, store the returned URL in `content.imageUrl`. On
    hydrate, draw the stored image onto the canvas.
  - **Photo**: on file upload, push the blob to Storage and store the URL; for
    "From link", store the external URL directly.

## Ownership & Write Semantics

`owner_id` is enforced **client-side**: windows the current browser doesn't own
render read-only (no drag, inputs disabled, ✕ hidden), and the UI never issues
update/delete for them. RLS permits public update/delete at the DB level for
simplicity.

This is **soft** protection — a determined user could spoof another `owner_id`
or call the API directly. That trade-off is acceptable for a birthday keepsake
board (no sensitive data, no accounts). It is explicitly **not** hardened auth.
The `closeAll` / "clear" control only removes the current browser's own windows,
so nobody can wipe the whole board at once.

## Error Handling

- **Missing env vars** → app runs in local-only mode (no persistence, no crash),
  with a small unobtrusive "offline" indicator.
- **Failed writes** → keep optimistic local state, retry once, log; never block
  typing or dragging.
- **Realtime reconciliation** keyed by row `id`; the client ignores broadcasts
  that echo its own recent writes to avoid cursor/position jumps.
- **Image upload failure** → keep the local data-URL/preview and surface a small
  inline error; the window still works locally.

## Testing

- **`windowsRepo`** — unit tests against a mocked Supabase client: CRUD payload
  shape, per-kind `content` mapping, and the storage upload path convention.
- **`ownerId`** — returns a stable id across repeated calls; persists in
  localStorage.
- **Manual (two browsers side by side):**
  - Open / type / drag / close in browser A appears live in browser B.
  - Windows created by A are read-only in B (no drag, no ✕, disabled inputs).
  - Refresh restores the full board from Supabase.
  - "Clear" in A removes only A's windows.

## One-Time Setup (user)

1. Create a Supabase project.
2. Run the SQL above (table + trigger + RLS + Storage bucket).
3. Add to `.env`:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```

Implementation will add `@supabase/supabase-js`, gitignore `.env`, and ship the
SQL as a checked-in migration/setup file.

## Notes / Risks

- Paint/photo image handling (Storage bucket + uploads + canvas export/redraw)
  is the most complex part; everything else is plain JSON.
- Auto-save on a shared board means near-real-time visibility of in-progress
  typing to other guests — accepted per the chosen save model.
- Soft ownership is spoofable by design; acceptable for this use case.
