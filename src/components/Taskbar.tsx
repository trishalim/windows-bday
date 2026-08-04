import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  HeartIcon,
  InfoIcon,
  MusicIcon,
  PowerIcon,
  SettingsIcon,
  Volume2Icon } from
'lucide-react';
import { AppKind, WindowInstance } from '../types/desktop';
import { appRegistry, creatableKinds } from './appRegistry';

function WinLogo() {
  return (
    <span className="grid h-4 w-4 grid-cols-2 gap-[1px]" aria-hidden="true">
      <span className="bg-hotpink" />
      <span className="bg-lilac" />
      <span className="bg-sky" />
      <span className="bg-lemon" />
    </span>);

}

interface TaskbarProps {
  windows: WindowInstance[];
  activeId: string | null;
  onToggle: (id: string) => void;
  onOpen: (kind: AppKind) => void;
  onCloseAll: () => void;
}

export function Taskbar({ windows, activeId, onToggle, onOpen, onCloseAll }: TaskbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 15000);
    return () => window.clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  const menuGroups: {items: {label: string;kind?: AppKind;action?: () => void;icon?: React.ComponentType<{className?: string;}>;}[];}[] = [
  {
    items: creatableKinds.map((kind) => ({
      label: appRegistry[kind].label,
      kind,
      icon: appRegistry[kind].icon
    }))
  },
  {
    items: [
    { label: 'Winamp', kind: 'winamp' as AppKind, icon: MusicIcon },
    { label: 'About this PC', kind: 'about' as AppKind, icon: InfoIcon }]

  },
  {
    items: [{ label: 'Shut Down...', action: onCloseAll, icon: PowerIcon }]
  }];


  return (
    <div className="relative z-[9000] shrink-0">
      <AnimatePresence>
        {menuOpen &&
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.14 }}
          className="absolute bottom-full left-1 mb-1 flex w-[236px] bevel-out bg-chrome">
          
            <div className="titlebar-purple flex w-6 shrink-0 items-end justify-center pb-3">
              <span
              className="pixel-text text-[12px] font-bold tracking-widest text-white"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              
                Girlypop 98
              </span>
            </div>
            <ul className="flex-1 p-1">
              {menuGroups.map((group, groupIndex) =>
            <React.Fragment key={groupIndex}>
                  {groupIndex > 0 &&
              <li className="my-1 border-t-2 border-t-chromeDark/40" aria-hidden="true" />
              }
                  {group.items.map(({ label, kind, action, icon: Icon = HeartIcon }) =>
              <li key={label}>
                      <button
                  type="button"
                  onClick={() => {
                    if (kind) onOpen(kind);
                    action?.();
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-2 py-[6px] text-left text-[13px] text-ink hover:bg-hotpink hover:text-white">
                  
                        <Icon className="h-4 w-4" />
                        {label}
                      </button>
                    </li>
              )}
                </React.Fragment>
            )}
            </ul>
          </motion.div>
        }
      </AnimatePresence>

      <div className="flex items-center gap-1 border-t-2 border-t-white bg-chrome px-1 py-1">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          data-pressed={menuOpen}
          aria-expanded={menuOpen}
          className="bevel-btn flex shrink-0 items-center gap-1 px-2 py-[3px] text-[13px] font-bold text-ink">
          
          <WinLogo />
          start
        </button>
        <span className="mx-1 h-6 w-[2px] shrink-0 bg-chromeDark/50" aria-hidden="true" />
        <ul className="retro-scroll flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {windows.map((win) => {
            const Icon = appRegistry[win.kind].icon;
            const isActive = activeId === win.id && !win.minimized;
            return (
              <li key={win.id} className="min-w-0 shrink-0">
                <button
                  type="button"
                  onClick={() => onToggle(win.id)}
                  data-pressed={isActive}
                  className={`bevel-btn flex w-[120px] items-center gap-1 px-2 py-[3px] text-[12px] text-ink ${
                  isActive ? 'bg-cotton' : ''}`
                  }>
                  
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{win.title.split(' \u2014 ')[0]}</span>
                </button>
              </li>);

          })}
        </ul>
        <span className="bevel-in ml-auto flex shrink-0 items-center gap-2 bg-chrome px-2 py-[3px] text-[12px] text-ink">
          <SettingsIcon className="h-3.5 w-3.5" aria-hidden="true" />
          <Volume2Icon className="h-3.5 w-3.5" aria-hidden="true" />
          <HeartIcon className="h-3.5 w-3.5 fill-hotpink text-hotpink" aria-hidden="true" />
          <time dateTime={now.toISOString()}>{time}</time>
        </span>
      </div>
    </div>);

}