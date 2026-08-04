import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BrushIcon,
  DropletIcon,
  EraserIcon,
  PencilIcon,
  SparklesIcon,
  SprayCanIcon,
  Trash2Icon } from
'lucide-react';
import { MenuBar } from '../Win95Window';

const palette = [
'#000000', '#7a5c6e', '#ff2fa0', '#ff7ec9', '#ffd9f0', '#c9a7ff',
'#7c3aed', '#bfe4ff', '#3b82f6', '#7dffb0', '#22c55e', '#fff6a8',
'#facc15', '#fb923c', '#ef4444', '#ffffff'];


const tools = [
{ id: 'pencil', label: 'Pencil', icon: PencilIcon, size: 3 },
{ id: 'brush', label: 'Brush', icon: BrushIcon, size: 10 },
{ id: 'spray', label: 'Spray can', icon: SprayCanIcon, size: 18 },
{ id: 'sparkle', label: 'Sparkle brush', icon: SparklesIcon, size: 6 },
{ id: 'fill', label: 'Fat marker', icon: DropletIcon, size: 22 },
{ id: 'eraser', label: 'Eraser', icon: EraserIcon, size: 20 }] as
const;

type ToolId = (typeof tools)[number]['id'];

export function PaintApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [tool, setTool] = useState<ToolId>('brush');
  const [color, setColor] = useState('#ff2fa0');
  const [touched, setTouched] = useState(false);

  const resetCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setTouched(false);
  }, []);

  useEffect(() => {
    resetCanvas();
  }, [resetCanvas]);

  const paintAt = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width * canvas.width;
    const y = (event.clientY - rect.top) / rect.height * canvas.height;
    const active = tools.find((t) => t.id === tool)!;
    const stroke = tool === 'eraser' ? '#ffffff' : color;
    setTouched(true);

    if (tool === 'spray') {
      ctx.fillStyle = stroke;
      for (let i = 0; i < 14; i += 1) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * active.size;
        ctx.fillRect(x + Math.cos(a) * r, y + Math.sin(a) * r, 1.6, 1.6);
      }
      return;
    }

    if (tool === 'sparkle') {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1.5;
      const s = 6 + Math.random() * 5;
      ctx.beginPath();
      ctx.moveTo(x - s, y);
      ctx.lineTo(x + s, y);
      ctx.moveTo(x, y - s);
      ctx.lineTo(x, y + s);
      ctx.stroke();
      return;
    }

    ctx.lineTo(x, y);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = active.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  return (
    <div>
      <MenuBar items={['File', 'Edit', 'View', 'Image', 'Options']} />
      <div className="flex gap-1 pt-1">
        <div className="grid w-[52px] shrink-0 grid-cols-2 content-start gap-1">
          {tools.map(({ id, label, icon: Icon }) =>
          <button
            key={id}
            type="button"
            aria-label={label}
            aria-pressed={tool === id}
            data-pressed={tool === id}
            onClick={() => setTool(id)}
            className="bevel-btn grid h-6 w-6 place-items-center text-ink">
            
              <Icon className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            aria-label="Clear canvas"
            onClick={resetCanvas}
            className="bevel-btn col-span-2 grid h-6 place-items-center text-ink">
            
            <Trash2Icon className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={420}
              height={260}
              onPointerDown={(e) => {
                drawing.current = true;
                e.currentTarget.setPointerCapture(e.pointerId);
                canvasRef.current?.getContext('2d')?.beginPath();
                paintAt(e);
              }}
              onPointerMove={(e) => {
                if (drawing.current) paintAt(e);
              }}
              onPointerUp={() => {
                drawing.current = false;
                canvasRef.current?.getContext('2d')?.beginPath();
              }}
              onPointerLeave={() => {
                drawing.current = false;
              }}
              className="bevel-in block w-full touch-none bg-white"
              style={{ cursor: 'crosshair', aspectRatio: '420 / 260' }}
              aria-label="Drawing canvas — click and drag to draw" />
            
            {!touched &&
            <p className="bubble-text pointer-events-none absolute inset-0 grid place-items-center text-center text-[13px] text-ink/35">
                draw me something ♡
              </p>
            }
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span
              className="bevel-in h-6 w-6 shrink-0"
              style={{ backgroundColor: color }}
              aria-hidden="true" />
            
            <div className="grid flex-1 grid-cols-8 gap-[2px]">
              {palette.map((swatch) =>
              <button
                key={swatch}
                type="button"
                aria-label={`Color ${swatch}`}
                aria-pressed={color === swatch}
                onClick={() => setColor(swatch)}
                className={`h-[13px] border ${
                color === swatch ? 'border-ink' : 'border-chromeDark/60'}`
                }
                style={{ backgroundColor: swatch }} />

              )}
            </div>
          </div>
        </div>
      </div>
      <p className="px-1 pt-1 text-[11px] text-ink/70">
        {tools.find((t) => t.id === tool)?.label} selected — drag on the canvas 2 draw
      </p>
    </div>);

}