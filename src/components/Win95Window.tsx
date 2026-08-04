import React, { ReactNode, useEffect } from 'react';
import { motion, useDragControls, useMotionValue } from 'framer-motion';
import { MinusIcon, SquareIcon, XIcon } from 'lucide-react';
import { Accent } from '../types/desktop';

interface Win95WindowProps {
  title: string;
  icon?: ReactNode;
  x: number;
  y: number;
  width: number;
  z: number;
  active: boolean;
  accent?: Accent;
  minimized?: boolean;
  /** When true the window can't be dragged or closed (not owned by viewer). */
  readOnly?: boolean;
  children: ReactNode;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMoved: (x: number, y: number) => void;
}

const accentClass: Record<Accent, string> = {
  pink: 'titlebar-pink',
  purple: 'titlebar-purple',
  blue: 'titlebar-blue'
};

export function Win95Window({
  title,
  icon,
  x,
  y,
  width,
  z,
  active,
  accent = 'pink',
  minimized = false,
  readOnly = false,
  children,
  onFocus,
  onClose,
  onMinimize,
  onMoved
}: Win95WindowProps) {
  const controls = useDragControls();
  // Position lives in motion values so dragging never fights the left/top prop.
  const mx = useMotionValue(x);
  const my = useMotionValue(y);

  // Keep the motion values in sync when position changes from outside a drag
  // (e.g. a realtime update moving another guest's window). No-op for our own
  // drags since state already matches the motion value.
  useEffect(() => {
    mx.set(x);
    my.set(y);
  }, [x, y, mx, my]);

  return (
    <motion.section
      drag={!readOnly}
      dragListener={false}
      dragControls={controls}
      dragMomentum={false}
      dragElastic={0}
      onDragEnd={() => onMoved(mx.get(), my.get())}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      onPointerDown={onFocus}
      aria-label={title}
      aria-hidden={minimized}
      className="absolute left-0 top-0 bevel-out bg-chrome max-w-[calc(100%-12px)]"
      style={{
        x: mx,
        y: my,
        width,
        zIndex: z,
        display: minimized ? 'none' : 'block'
      }}>

      <header
        onPointerDown={(event) => {
          if (readOnly) return;
          const target = event.target as HTMLElement;
          if (target.closest('button')) return;
          controls.start(event);
        }}
        className={`flex touch-none items-center gap-2 px-1.5 py-1 no-select ${
        readOnly ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'} ${
        active ? accentClass[accent] : 'titlebar-idle'}`
        }>

        <span className="flex min-w-0 flex-1 items-center gap-1.5">
          {icon}
          <h2 className="truncate text-[13px] font-bold text-white drop-shadow-[1px_1px_0_rgba(0,0,0,0.35)]">
            {title}
          </h2>
        </span>
        <span className="flex items-center gap-1">
          <button
            type="button"
            aria-label={`Minimize ${title}`}
            onClick={onMinimize}
            className="bevel-btn grid h-[18px] w-[18px] place-items-end pb-[2px] text-ink">

            <MinusIcon className="h-3 w-3" strokeWidth={3} />
          </button>
          <button
            type="button"
            aria-label={`Maximize ${title}`}
            className="bevel-btn hidden h-[18px] w-[18px] place-items-center text-ink sm:grid">

            <SquareIcon className="h-2.5 w-2.5" strokeWidth={3} />
          </button>
          {!readOnly &&
          <button
            type="button"
            aria-label={`Close ${title}`}
            onClick={onClose}
            className="bevel-btn grid h-[18px] w-[18px] place-items-center text-ink">

            <XIcon className="h-3 w-3" strokeWidth={3} />
          </button>
          }
        </span>
      </header>
      <div className="p-[3px]">{children}</div>
    </motion.section>);

}

export function MenuBar({ items }: {items: string[];}) {
  return (
    <nav
      aria-label="Menu"
      className="flex gap-3 border-b-2 border-b-white/70 bg-chrome px-2 py-[3px] text-[12px] text-ink no-select">

      {items.map((item) =>
      <button key={item} type="button" className="px-1 hover:bg-hotpink hover:text-white">
          <span className="underline decoration-dotted decoration-1 underline-offset-2">
            {item.charAt(0)}
          </span>
          {item.slice(1)}
        </button>
      )}
    </nav>);

}
