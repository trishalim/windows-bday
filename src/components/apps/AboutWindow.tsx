import React from 'react';
import { HeartIcon } from 'lucide-react';
import { BIRTHDAY_GIRL } from '../../data/desktop';

export function AboutWindow({ onClose }: {onClose: () => void;}) {
  return (
    <div className="bg-chrome p-3">
      <div className="flex gap-3">
        <span className="bevel-out grid h-12 w-12 shrink-0 place-items-center bg-cotton">
          <HeartIcon className="h-6 w-6 fill-hotpink text-hotpink" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="pixel-text text-[15px] text-ink">Girlypop 98</p>
          <p className="text-[12px] text-ink/80">Birthday Edition ♡ v{new Date().getFullYear()}</p>
          <p className="mt-2 text-[12px] leading-relaxed text-ink">
            Registered to: <strong>{BIRTHDAY_GIRL}</strong>
            <br />
            64 MB RAM · 1 burned CD · ∞ birthday wishes
          </p>
        </div>
      </div>
      <div className="mt-3 bevel-in bg-white p-2 text-[12px] leading-relaxed text-ink">
        <p>
          How 2 use: pick an icon on the desktop to make a new drawing, note, card, photo,
          or sticky. Fill it in, drag it wherever looks cute, and leave it open on the
          desktop.
        </p>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="bevel-btn px-4 py-[3px] text-[12px] text-ink">
          
          Cancel
        </button>
        <button
          type="button"
          onClick={onClose}
          className="bevel-btn bg-bubblegum px-5 py-[3px] text-[12px] font-bold text-white">
          
          OK
        </button>
      </div>
    </div>);

}