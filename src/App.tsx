import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Win95Window } from './components/Win95Window';
import { WinampPlayer } from './components/apps/WinampPlayer';
import { PaintApp } from './components/apps/PaintApp';
import { NotepadApp } from './components/apps/NotepadApp';
import { WordDoc } from './components/apps/WordDoc';
import { PhotoApp } from './components/apps/PhotoApp';
import { StickyNote } from './components/apps/StickyNote';
import { AboutWindow } from './components/apps/AboutWindow';
import { DesktopIcons } from './components/DesktopIcons';
import { Taskbar } from './components/Taskbar';
import { AppIcon, appRegistry } from './components/appRegistry';
import { useWindowManager } from './hooks/useWindowManager';
import { BIRTHDAY_GIRL, WALLPAPER } from './data/desktop';
import { isConfigured } from './lib/supabase';
import {
  PaintContent,
  PhotoContent,
  StickyContent,
  TxtContent,
  WindowContent,
  WindowInstance,
  WordContent } from
'./types/desktop';

interface AppBodyProps {
  win: WindowInstance;
  readOnly: boolean;
  onClose: () => void;
  onChange: (patch: WindowContent) => void;
  onUploadImage: (blob: Blob, ext: string) => Promise<string | null>;
}

function AppBody({ win, readOnly, onClose, onChange, onUploadImage }: AppBodyProps) {
  switch (win.kind) {
    case 'paint':
      return (
        <PaintApp
          content={win.content as unknown as PaintContent}
          readOnly={readOnly}
          onChange={onChange}
          onUploadImage={onUploadImage} />);

    case 'txt':
      return (
        <NotepadApp content={win.content as unknown as TxtContent} readOnly={readOnly} onChange={onChange} />);

    case 'word':
      return (
        <WordDoc content={win.content as unknown as WordContent} readOnly={readOnly} onChange={onChange} />);

    case 'photo':
      return (
        <PhotoApp
          content={win.content as unknown as PhotoContent}
          readOnly={readOnly}
          onChange={onChange}
          onUploadImage={onUploadImage} />);

    case 'winamp':
      return <WinampPlayer />;
    case 'about':
      return <AboutWindow onClose={onClose} />;
    default:
      return null;
  }
}

export function App() {
  const {
    windows,
    activeId,
    ownerId,
    open,
    close,
    minimize,
    focus,
    move,
    toggle,
    closeAll,
    patchContent,
    uploadImage
  } = useWindowManager();

  const empty = windows.length === 0;

  return (
    <main className="flex h-full w-full flex-col overflow-hidden bg-[#7dbb5a]">
      <div
        className="retro-scroll relative flex-1 overflow-auto bg-cover bg-center"
        style={{ backgroundImage: `url(${WALLPAPER})` }}>

        <div className="relative min-h-full">
          <p className="pixel-text absolute right-3 top-2 z-[2] text-right text-[12px] leading-tight text-white drop-shadow-[1px_1px_0_rgba(58,28,44,0.9)]">
            happy birthday {BIRTHDAY_GIRL}
            <br />
            <span className="text-cotton">♡ girlypop 98 ♡</span>
            {!isConfigured &&
            <>
              <br />
              <span className="text-lemon">offline — not saving</span>
            </>
            }
          </p>

          <DesktopIcons onOpen={open} />

          {empty &&
          <div className="pointer-events-none absolute left-1/2 top-1/2 w-[280px] -translate-x-1/2 -translate-y-1/2 bevel-out bg-chrome/95 p-4 text-center sm:w-[330px]">
              <h1 className="bubble-text text-[17px] leading-tight text-hotpink">
                leave {BIRTHDAY_GIRL} a birthday message ♡
              </h1>
              <p className="mt-2 text-[12px] leading-relaxed text-ink">
                Open an icon on the left (or hit <strong>start</strong>) to make a new
                drawing, text file, word card, photo, or sticky note. Drag ur windows
                anywhere on the desktop.
              </p>
              <p className="pixel-text mt-3 text-[11px] text-ink/60">
                tip: click an icon to open it
              </p>
            </div>
          }

          <AnimatePresence>
            {windows.map((win) => {
              const owned = win.ownerId === ownerId;
              return win.kind === 'sticky' ?
              <StickyNote
                key={win.id}
                x={win.x}
                y={win.y}
                z={win.z}
                minimized={win.minimized}
                readOnly={!owned}
                content={win.content as unknown as StickyContent}
                onChange={(patch) => patchContent(win.id, patch)}
                onFocus={() => focus(win.id)}
                onClose={() => close(win.id)}
                onMoved={(x, y) => move(win.id, x, y)} /> :


              <Win95Window
                key={win.id}
                title={win.title}
                accent={appRegistry[win.kind].accent}
                icon={<AppIcon kind={win.kind} className="h-3.5 w-3.5 text-white" />}
                x={win.x}
                y={win.y}
                width={win.w}
                z={win.z}
                active={activeId === win.id}
                minimized={win.minimized}
                readOnly={!owned}
                onFocus={() => focus(win.id)}
                onClose={() => close(win.id)}
                onMinimize={() => minimize(win.id)}
                onMoved={(x, y) => move(win.id, x, y)}>

                  <AppBody
                    win={win}
                    readOnly={!owned}
                    onClose={() => close(win.id)}
                    onChange={(patch) => patchContent(win.id, patch)}
                    onUploadImage={(blob, ext) => uploadImage(win.id, blob, ext)} />

                </Win95Window>;

            })}
          </AnimatePresence>
        </div>
      </div>

      <Taskbar
        windows={windows}
        activeId={activeId}
        onToggle={toggle}
        onOpen={open}
        onCloseAll={closeAll} />

    </main>);

}
