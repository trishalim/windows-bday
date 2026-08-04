import { useCallback, useRef, useState } from 'react';
import { AppKind, WindowInstance } from '../types/desktop';
import { appRegistry } from '../components/appRegistry';

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
  if (kind === 'winamp') return 'Winamp \u2014 dreaming.mp3';
  if (kind === 'about') return 'About this PC';
  const name = `${def.fileName}-${index}${extensions[kind]}`;
  return def.suffix ? `${name} \u2014 ${def.suffix}` : name;
}

export function useWindowManager() {
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const windowsRef = useRef<WindowInstance[]>([]);
  const openedCount = useRef(0);
  const perKindCount = useRef<Record<string, number>>({});
  const topZ = useRef(10);

  const commit = useCallback((next: WindowInstance[]) => {
    windowsRef.current = next;
    setWindows(next);
  }, []);

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
    },
    [commit]
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

      perKindCount.current[kind] = (perKindCount.current[kind] ?? 0) + 1;
      const step = openedCount.current % 6;
      openedCount.current += 1;
      topZ.current += 1;

      const viewport = typeof window === 'undefined' ? 1200 : window.innerWidth;
      const compact = viewport < 760;
      const width = Math.min(def.width, viewport - 32);
      const baseX = compact ? 16 : 132;
      const maxX = Math.max(baseX, viewport - width - 24);

      const instance: WindowInstance = {
        id: `${kind}-${perKindCount.current[kind]}-${Date.now()}`,
        kind,
        title: buildTitle(kind, perKindCount.current[kind]),
        x: Math.min(baseX + step * (compact ? 12 : 34), maxX),
        y: (compact ? 12 : 24) + step * 30,
        w: width,
        z: topZ.current,
        minimized: false
      };

      commit([...windowsRef.current, instance]);
      setActiveId(instance.id);
    },
    [commit, focus]
  );

  const close = useCallback(
    (id: string) => {
      commit(windowsRef.current.filter((win) => win.id !== id));
      setActiveId((cur) => cur === id ? null : cur);
    },
    [commit]
  );

  const minimize = useCallback(
    (id: string) => {
      commit(
        windowsRef.current.map((win) => win.id === id ? { ...win, minimized: true } : win)
      );
      setActiveId((cur) => cur === id ? null : cur);
    },
    [commit]
  );

  const toggle = useCallback(
    (id: string) => {
      const win = windowsRef.current.find((w) => w.id === id);
      if (!win) return;
      if (!win.minimized && activeId === id) minimize(id);else
      focus(id);
    },
    [activeId, focus, minimize]
  );

  const closeAll = useCallback(() => {
    commit([]);
    setActiveId(null);
  }, [commit]);

  return { windows, activeId, open, close, minimize, focus, toggle, closeAll };
}