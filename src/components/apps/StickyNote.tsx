import React, { useEffect } from 'react';
import { motion, useDragControls, useMotionValue } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { StickyContent } from '../../types/desktop';

interface StickyNoteProps {
  x: number;
  y: number;
  z: number;
  minimized?: boolean;
  readOnly?: boolean;
  content: StickyContent;
  onChange: (patch: Partial<StickyContent>) => void;
  onFocus: () => void;
  onClose: () => void;
  onMoved: (x: number, y: number) => void;
}

const colors = [
{ name: 'lemon', bg: '#fff6a8' },
{ name: 'bubblegum', bg: '#ffd9f0' },
{ name: 'lilac', bg: '#e4d6ff' },
{ name: 'mint', bg: '#d4ffe4' }];


export function StickyNote({
  x,
  y,
  z,
  minimized = false,
  readOnly = false,
  content,
  onChange,
  onFocus,
  onClose,
  onMoved
}: StickyNoteProps) {
  const controls = useDragControls();
  const mx = useMotionValue(x);
  const my = useMotionValue(y);

  // Sync motion values when position changes from a realtime update.
  useEffect(() => {
    mx.set(x);
    my.set(y);
  }, [x, y, mx, my]);

  const text = content.text ?? '';
  const bg = content.bg ?? colors[0].bg;

  return (
    <motion.aside
      drag={!readOnly}
      dragListener={false}
      dragControls={controls}
      dragMomentum={false}
      dragElastic={0}
      onDragEnd={() => onMoved(mx.get(), my.get())}
      initial={{ opacity: 0, rotate: -6, scale: 0.95 }}
      animate={{ opacity: 1, rotate: -3, scale: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
      onPointerDown={(event) => {
        onFocus();
        if (readOnly) return;
        const target = event.target as HTMLElement;
        if (target.closest('button') || target.closest('textarea')) return;
        controls.start(event);
      }}
      aria-label="Sticky note"
      aria-hidden={minimized}
      className={`absolute left-0 top-0 w-[200px] touch-none p-3 shadow-[4px_5px_0_rgba(74,47,61,0.35)] ${
      readOnly ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`
      }
      style={{ x: mx, y: my, zIndex: z, backgroundColor: bg, display: minimized ? 'none' : 'block' }}>

      <span
        className="absolute -top-2 left-1/2 h-5 w-14 -translate-x-1/2 -rotate-2 bg-bubblegum/60"
        aria-hidden="true" />

      {!readOnly &&
      <button
        type="button"
        onClick={onClose}
        aria-label="Close sticky note"
        className="absolute right-1 top-1 grid h-4 w-4 place-items-center text-ink/50 hover:text-hotpink">

        <XIcon className="h-3 w-3" strokeWidth={3} />
      </button>
      }
      <label className="sr-only" htmlFor={`sticky-${z}`}>
        Sticky note text
      </label>
      <textarea
        id={`sticky-${z}`}
        value={text}
        readOnly={readOnly}
        onChange={(e) => onChange({ text: e.target.value })}
        placeholder={'quick note...\nhbd!! ur the best ♡'}
        className="bubble-text mt-2 block h-[112px] w-full resize-none bg-transparent text-[13px] leading-snug text-ink outline-none placeholder:text-ink/35" />

      <div className="mt-1 flex items-center justify-between border-t border-dashed border-ink/30 pt-1">
        <span className="flex gap-1">
          {colors.map((c) =>
          <button
            key={c.name}
            type="button"
            disabled={readOnly}
            aria-label={`${c.name} note`}
            aria-pressed={bg === c.bg}
            onClick={() => onChange({ bg: c.bg })}
            className={`h-3.5 w-3.5 border ${bg === c.bg ? 'border-ink' : 'border-ink/30'} ${
            readOnly ? 'cursor-default' : ''}`
            }
            style={{ backgroundColor: c.bg }} />

          )}
        </span>
        <span className="text-[11px] italic text-ink/60">♡ drag me</span>
      </div>
    </motion.aside>);

}
