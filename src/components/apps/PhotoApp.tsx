import React, { useRef, useState } from 'react';
import { ImagePlusIcon, LinkIcon, RotateCcwIcon, UploadIcon } from 'lucide-react';
import { MenuBar } from '../Win95Window';

export function PhotoApp() {
  const [src, setSrc] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [urlDraft, setUrlDraft] = useState('');
  const [showUrl, setShowUrl] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadFile = (file?: File | null) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setSrc(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <MenuBar items={['File', 'Edit', 'View', 'Help']} />
      <div className="flex items-center gap-1 border-b-2 border-b-white/70 bg-chrome px-1 py-1">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="bevel-btn flex items-center gap-1 px-2 py-[3px] text-[12px] text-ink">
          
          <UploadIcon className="h-3.5 w-3.5" />
          Open...
        </button>
        <button
          type="button"
          onClick={() => setShowUrl((v) => !v)}
          data-pressed={showUrl}
          className="bevel-btn flex items-center gap-1 px-2 py-[3px] text-[12px] text-ink">
          
          <LinkIcon className="h-3.5 w-3.5" />
          From link
        </button>
        <button
          type="button"
          onClick={() => {
            setSrc(null);
            setCaption('');
          }}
          aria-label="Remove photo"
          className="bevel-btn ml-auto grid h-6 w-6 place-items-center text-ink">
          
          <RotateCcwIcon className="h-3.5 w-3.5" />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => loadFile(e.target.files?.[0])} />
        
      </div>

      {showUrl &&
      <form
        className="flex gap-1 bg-chrome px-1 pb-1 pt-1"
        onSubmit={(e) => {
          e.preventDefault();
          if (urlDraft.trim()) setSrc(urlDraft.trim());
        }}>
        
          <label className="sr-only" htmlFor="photo-url">
            Image address
          </label>
          <input
          id="photo-url"
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          placeholder="paste an image address (http://...)"
          className="bevel-in min-w-0 flex-1 bg-white px-1 py-[2px] text-[12px] text-ink outline-none placeholder:text-ink/35" />
        
          <button type="submit" className="bevel-btn px-2 py-[2px] text-[12px] font-bold text-ink">
            Go
          </button>
        </form>
      }

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          loadFile(e.dataTransfer.files?.[0]);
        }}
        className={`bevel-in mt-1 grid min-h-[236px] place-items-center p-3 ${
        dragOver ? 'bg-cotton' : 'bg-[#6b4a5c]'}`
        }>
        
        {src ?
        <figure className="bg-white p-2 pb-3 shadow-[3px_3px_0_rgba(0,0,0,0.35)]">
            <img
            src={src}
            alt={caption || 'Uploaded photo'}
            className="mx-auto block max-h-[210px] w-auto max-w-full object-contain" />
          
            <figcaption>
              <label className="sr-only" htmlFor="photo-caption">
                Caption
              </label>
              <input
              id="photo-caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="write a caption ♡"
              className="bubble-text mt-2 w-full bg-transparent text-center text-[13px] text-ink outline-none placeholder:text-ink/35" />
            
            </figcaption>
          </figure> :

        <div className="text-center">
            <span className="bevel-out mx-auto grid h-11 w-11 place-items-center bg-cotton text-ink">
              <ImagePlusIcon className="h-5 w-5" />
            </span>
            <p className="pixel-text mt-2 text-[13px] text-white">drop a photo here</p>
            <p className="mt-1 text-[11px] text-cotton">
              or hit <strong>Open...</strong> to pick one from ur computer
            </p>
          </div>
        }
      </div>
    </div>);

}