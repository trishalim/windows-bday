import { useCallback, useEffect, useRef, useState } from 'react';
import { AppKind, WindowContent, WindowInstance, defaultContent } from '../types/desktop';
import { appRegistry } from '../components/appRegistry';
import { getOwnerId } from '../lib/ownerId';
import * as windowsRepo from '../lib/windowsRepo';

const extensions: Record<AppKind, string> = {
  paint: '.bmp',
  txt: '.txt',
  word: '.doc',
  photo: '.jpg',
  sticky: '',
  winamp: '',
  about: ''
};

function buildTitle(kind: AppKind, index: number) {
  const def = appRegistry[kind];
  if (kind === 'winamp') return 'Winamp — dreaming.mp3';
  if (kind === 'about') return 'About this PC';
  const name = `${def.fileName}-${index}${extensions[kind]}`;
  return def.suffix ? `${name} — ${def.suffix}` : name;
}

const DEBOUNCE_MS = 400;

export function useWindowManager() {
  const ownerId = useRef(getOwnerId());
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const windowsRef = useRef<WindowInstance[]>([]);
  const topZ = useRef(10);

  // Per-window debounced write buffers.
  const pending = useRef<Map<string, Partial<WindowInstance>>>(new Map());
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const commit = useCallback((next: WindowInstance[]) => {
    windowsRef.current = next;
    setWindows(next);
  }, []);

  const isOwner = useCallback(
    (id: string) => {
      const win = windowsRef.current.find((w) => w.id === id);
      return !!win && win.ownerId === ownerId.current;
    },
    []
  );

  const schedulePersist = useCallback((id: string, patch: Partial<WindowInstance>) => {
    const merged = { ...pending.current.get(id), ...patch };
    pending.current.set(id, merged);
    const existing = timers.current.get(id);
    if (existing) clearTimeout(existing);
    timers.current.set(
      id,
      setTimeout(() => {
        const toWrite = pending.current.get(id);
        pending.current.delete(id);
        timers.current.delete(id);
        if (toWrite) void windowsRepo.update(id, toWrite);
      }, DEBOUNCE_MS)
    );
  }, []);

  // Hydrate + subscribe to realtime.
  useEffect(() => {
    let cancelled = false;
    const timersMap = timers.current;
    void windowsRepo.list().then((loaded) => {
      if (cancelled) return;
      const maxZ = loaded.reduce((m, w) => Math.max(m, w.z), 10);
      topZ.current = maxZ;
      commit(loaded);
    });

    const unsubscribe = windowsRepo.subscribe({
      onInsert: (win) => {
        if (win.ownerId === ownerId.current) return; // our own echo
        if (windowsRef.current.some((w) => w.id === win.id)) return;
        topZ.current = Math.max(topZ.current, win.z);
        commit([...windowsRef.current, win]);
      },
      onUpdate: (win) => {
        if (win.ownerId === ownerId.current) return; // we own the truth
        topZ.current = Math.max(topZ.current, win.z);
        commit(
          windowsRef.current.map((w) =>
            // preserve this viewer's local minimize state
            w.id === win.id ? { ...win, minimized: w.minimized } : w
          )
        );
      },
      onDelete: (id) => {
        commit(windowsRef.current.filter((w) => w.id !== id));
        setActiveId((cur) => (cur === id ? null : cur));
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
      timersMap.forEach((t) => clearTimeout(t));
    };
  }, [commit]);

  const focus = useCallback(
    (id: string) => {
      topZ.current += 1;
      const z = topZ.current;
      commit(
        windowsRef.current.map((win) =>
          win.id === id ? { ...win, z, minimized: false } : win
        )
      );
      setActiveId(id);
      if (isOwner(id)) schedulePersist(id, { z });
    },
    [commit, isOwner, schedulePersist]
  );

  const open = useCallback(
    (kind: AppKind) => {
      const def = appRegistry[kind];
      if (def.singleton) {
        const existing = windowsRef.current.find((win) => win.kind === kind);
        if (existing) {
          focus(existing.id);
          return;
        }
      }

      const index = windowsRef.current.filter((w) => w.kind === kind).length + 1;
      const step = windowsRef.current.length % 6;
      topZ.current += 1;

      const viewport = typeof window === 'undefined' ? 1200 : window.innerWidth;
      const compact = viewport < 760;
      const width = Math.min(def.width, viewport - 32);
      const baseX = compact ? 16 : 132;
      const maxX = Math.max(baseX, viewport - width - 24);

      const instance: WindowInstance = {
        id:
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `${kind}-${index}-${Date.now()}`,
        ownerId: ownerId.current,
        kind,
        title: buildTitle(kind, index),
        x: Math.min(baseX + step * (compact ? 12 : 34), maxX),
        y: (compact ? 12 : 24) + step * 30,
        w: width,
        z: topZ.current,
        minimized: false,
        content: defaultContent(kind)
      };

      commit([...windowsRef.current, instance]);
      setActiveId(instance.id);

      // Singletons (winamp/about) are local-only UI; everything else persists.
      if (def.creatable) void windowsRepo.insert(instance);
    },
    [commit, focus]
  );

  const close = useCallback(
    (id: string) => {
      if (!isOwner(id)) return; // can only close your own
      commit(windowsRef.current.filter((win) => win.id !== id));
      setActiveId((cur) => (cur === id ? null : cur));
      pending.current.delete(id);
      const t = timers.current.get(id);
      if (t) {
        clearTimeout(t);
        timers.current.delete(id);
      }
      void windowsRepo.remove(id);
    },
    [commit, isOwner]
  );

  // Minimize is viewer-local — never persisted, allowed on any window.
  const minimize = useCallback(
    (id: string) => {
      commit(
        windowsRef.current.map((win) =>
          win.id === id ? { ...win, minimized: true } : win
        )
      );
      setActiveId((cur) => (cur === id ? null : cur));
    },
    [commit]
  );

  const move = useCallback(
    (id: string, x: number, y: number) => {
      if (!isOwner(id)) return;
      commit(
        windowsRef.current.map((win) => (win.id === id ? { ...win, x, y } : win))
      );
      schedulePersist(id, { x, y });
    },
    [commit, isOwner, schedulePersist]
  );

  const patchContent = useCallback(
    (id: string, contentPatch: WindowContent) => {
      if (!isOwner(id)) return;
      let nextContent: WindowContent = {};
      commit(
        windowsRef.current.map((win) => {
          if (win.id !== id) return win;
          nextContent = { ...win.content, ...contentPatch };
          return { ...win, content: nextContent };
        })
      );
      schedulePersist(id, { content: nextContent });
    },
    [commit, isOwner, schedulePersist]
  );

  const uploadImage = useCallback(
    (id: string, blob: Blob, ext: string) =>
      windowsRepo.uploadImage(ownerId.current, id, blob, ext),
    []
  );

  const toggle = useCallback(
    (id: string) => {
      const win = windowsRef.current.find((w) => w.id === id);
      if (!win) return;
      if (!win.minimized && activeId === id) minimize(id);
      else focus(id);
    },
    [activeId, focus, minimize]
  );

  const closeAll = useCallback(() => {
    const mine = new Set(
      windowsRef.current.filter((w) => w.ownerId === ownerId.current).map((w) => w.id)
    );
    commit(windowsRef.current.filter((w) => !mine.has(w.id)));
    setActiveId(null);
    void windowsRepo.removeAllForOwner(ownerId.current);
  }, [commit]);

  return {
    windows,
    activeId,
    ownerId: ownerId.current,
    open,
    close,
    minimize,
    focus,
    move,
    toggle,
    closeAll,
    patchContent,
    uploadImage
  };
}
