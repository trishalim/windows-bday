import React from 'react';
import {
  AlignCenterIcon,
  AlignLeftIcon,
  BoldIcon,
  ItalicIcon,
  PrinterIcon,
  SaveIcon,
  UnderlineIcon } from
'lucide-react';
import { MenuBar } from '../Win95Window';
import { BIRTHDAY_GIRL } from '../../data/desktop';
import { WordContent } from '../../types/desktop';

const fonts = ['Comic Sans MS', 'Times New Roman', 'Courier New', 'Tahoma'];
const sizes = [12, 14, 18, 24];

interface WordDocProps {
  content: WordContent;
  readOnly?: boolean;
  onChange: (patch: Partial<WordContent>) => void;
}

export function WordDoc({ content, readOnly = false, onChange }: WordDocProps) {
  const {
    heading = '',
    body = '',
    signature = '',
    font = fonts[0],
    size = 14,
    bold = false,
    italic = false,
    underline = false,
    center = false
  } = content;

  const bodyStyle: React.CSSProperties = {
    fontFamily: `"${font}", cursive`,
    fontSize: size,
    fontWeight: bold ? 700 : 400,
    fontStyle: italic ? 'italic' : 'normal',
    textDecoration: underline ? 'underline' : 'none',
    textAlign: center ? 'center' : 'left'
  };

  const toggles = [
  { label: 'Bold', icon: BoldIcon, on: bold, set: () => onChange({ bold: !bold }) },
  { label: 'Italic', icon: ItalicIcon, on: italic, set: () => onChange({ italic: !italic }) },
  { label: 'Underline', icon: UnderlineIcon, on: underline, set: () => onChange({ underline: !underline }) },
  {
    label: center ? 'Align left' : 'Center text',
    icon: center ? AlignLeftIcon : AlignCenterIcon,
    on: center,
    set: () => onChange({ center: !center })
  }];


  return (
    <div>
      <MenuBar items={['File', 'Edit', 'View', 'Insert', 'Format', 'Tools']} />
      <div className="flex flex-wrap items-center gap-1 border-b-2 border-b-white/70 bg-chrome px-1 py-1">
        <label className="sr-only" htmlFor="word-font">
          Font
        </label>
        <select
          id="word-font"
          value={font}
          disabled={readOnly}
          onChange={(e) => onChange({ font: e.target.value })}
          className="bevel-in bg-white px-1 py-[1px] text-[11px] text-ink outline-none">

          {fonts.map((f) =>
          <option key={f} value={f}>
              {f}
            </option>
          )}
        </select>
        <label className="sr-only" htmlFor="word-size">
          Font size
        </label>
        <select
          id="word-size"
          value={size}
          disabled={readOnly}
          onChange={(e) => onChange({ size: Number(e.target.value) })}
          className="bevel-in bg-white px-1 py-[1px] text-[11px] text-ink outline-none">

          {sizes.map((s) =>
          <option key={s} value={s}>
              {s}
            </option>
          )}
        </select>
        {[
        { label: 'Save', icon: SaveIcon },
        { label: 'Print', icon: PrinterIcon }].
        map(({ label, icon: Icon }) =>
        <button
          key={label}
          type="button"
          aria-label={label}
          className="bevel-btn grid h-6 w-6 place-items-center text-ink">

            <Icon className="h-3.5 w-3.5" />
          </button>
        )}
        {toggles.map(({ label, icon: Icon, on, set }) =>
        <button
          key={label}
          type="button"
          aria-label={label}
          aria-pressed={on}
          data-pressed={on}
          disabled={readOnly}
          onClick={set}
          className="bevel-btn grid h-6 w-6 place-items-center text-ink">

            <Icon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="bevel-in retro-scroll h-[288px] overflow-y-auto bg-[#9c8a95] p-3">
        <article className="mx-auto max-w-[420px] bg-white px-6 py-5 shadow-[3px_3px_0_rgba(0,0,0,0.35)]">
          <label className="sr-only" htmlFor="word-heading">
            Card title
          </label>
          <input
            id="word-heading"
            value={heading}
            readOnly={readOnly}
            onChange={(e) => onChange({ heading: e.target.value })}
            placeholder={`happy birthday ${BIRTHDAY_GIRL}!`}
            className="bubble-text w-full border-b border-dashed border-cotton bg-transparent pb-1 text-center text-[19px] text-hotpink outline-none placeholder:text-hotpink/40" />

          <label className="sr-only" htmlFor="word-body">
            Card body
          </label>
          <textarea
            id="word-body"
            value={body}
            readOnly={readOnly}
            onChange={(e) => onChange({ body: e.target.value })}
            placeholder="write the long, sappy version here — memories, inside jokes, the whole thing..."
            style={bodyStyle}
            className="mt-3 block h-[150px] w-full resize-none bg-transparent leading-relaxed text-ink outline-none placeholder:text-ink/30" />

          <label className="sr-only" htmlFor="word-signature">
            Signed by
          </label>
          <input
            id="word-signature"
            value={signature}
            readOnly={readOnly}
            onChange={(e) => onChange({ signature: e.target.value })}
            placeholder="— love, ur name"
            className="bubble-text mt-2 w-full bg-transparent text-right text-[14px] text-ink outline-none placeholder:text-ink/30" />

        </article>
      </div>
      <p className="flex justify-between px-1 pt-[2px] text-[11px] text-ink/70">
        <span>Page 1 / 1</span>
        <span>{body.trim() ? `${body.trim().split(/\s+/).length} words` : '0 words'}</span>
        <span>ENG</span>
      </p>
    </div>);

}
