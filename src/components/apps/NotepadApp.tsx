import React, { useState } from 'react';
import { MenuBar } from '../Win95Window';
import { BIRTHDAY_GIRL } from '../../data/desktop';

export function NotepadApp() {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);

  return (
    <div>
      <MenuBar items={['File', 'Edit', 'Search', 'Help']} />
      <label className="sr-only" htmlFor="notepad-body">
        Birthday message
      </label>
      <textarea
        id="notepad-body"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setSaved(false);
        }}
        spellCheck={false}
        placeholder={`happy birthday ${BIRTHDAY_GIRL} ...\n\ntype ur message here !!`}
        className="bevel-in retro-scroll block h-[210px] w-full resize-none bg-white p-2 text-[13px] leading-relaxed text-ink outline-none placeholder:text-ink/35"
        style={{ fontFamily: '"Lucida Console", Consolas, monospace' }} />
      
      <div className="flex items-center justify-between px-1 pt-1">
        <p className="text-[11px] text-ink/70">
          Ln {text.split('\n').length}, Col 1 &nbsp;·&nbsp; {text.length} chars
        </p>
        <button
          type="button"
          onClick={() => setSaved(true)}
          className="bevel-btn px-3 py-[3px] text-[12px] font-bold text-ink">
          
          {saved ? 'saved ♡' : 'Save'}
        </button>
      </div>
    </div>);

}