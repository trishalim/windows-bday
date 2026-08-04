import React from 'react';
import { MenuBar } from '../Win95Window';
import { BIRTHDAY_GIRL } from '../../data/desktop';
import { TxtContent } from '../../types/desktop';

interface NotepadAppProps {
  content: TxtContent;
  readOnly?: boolean;
  onChange: (patch: Partial<TxtContent>) => void;
}

export function NotepadApp({ content, readOnly = false, onChange }: NotepadAppProps) {
  const text = content.text ?? '';

  return (
    <div>
      <MenuBar items={['File', 'Edit', 'Search', 'Help']} />
      <label className="sr-only" htmlFor="notepad-body">
        Birthday message
      </label>
      <textarea
        id="notepad-body"
        value={text}
        readOnly={readOnly}
        onChange={(e) => onChange({ text: e.target.value })}
        spellCheck={false}
        placeholder={`happy birthday ${BIRTHDAY_GIRL} ...\n\ntype ur message here !!`}
        className="bevel-in retro-scroll block h-[210px] w-full resize-none bg-white p-2 text-[13px] leading-relaxed text-ink outline-none placeholder:text-ink/35"
        style={{ fontFamily: '"Lucida Console", Consolas, monospace' }} />

      <div className="flex items-center justify-between px-1 pt-1">
        <p className="text-[11px] text-ink/70">
          Ln {text.split('\n').length}, Col 1 &nbsp;·&nbsp; {text.length} chars
        </p>
        <span className="text-[11px] italic text-ink/60">
          {readOnly ? 'read only ♡' : 'auto-saved ♡'}
        </span>
      </div>
    </div>);

}
