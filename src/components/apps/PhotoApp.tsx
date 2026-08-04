import React, { useRef, useState } from 'react';
import { ImagePlusIcon, LinkIcon, RotateCcwIcon, UploadIcon } from 'lucide-react';
import { MenuBar } from '../Win95Window';
import { PhotoContent } from '../../types/desktop';
import { downscaleImage } from '../../lib/downscaleImage';

// Reject truly huge files before we even try to decode them.
const MAX_INPUT_BYTES = 25 * 1024 * 1024; // 25 MB

interface PhotoAppProps {
  content: PhotoContent;
  readOnly?: boolean;
  onChange: (patch: Partial<PhotoContent>) => void;
  onUploadImage: (blob: Blob, ext: string) => Promise<string | null>;
}

export function PhotoApp({ content, readOnly = false, onChange, onUploadImage }: PhotoAppProps) {
  const [urlDraft, setUrlDraft] = useState('');
  const [showUrl, setShowUrl] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const src = content.imageUrl ?? pendingPreview;
  const caption = content.caption ?? '';

  const loadFile = async (file?: File | null) => {
    if (readOnly || !file || !file.type.startsWith('image/')) return;
    setUploadError(false);
    setSizeError(false);

    if (file.size > MAX_INPUT_BYTES) {
      setSizeError(true);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPendingPreview(String(reader.result));
    reader.readAsDataURL(file);

    setBusy(true);
    // Shrink + compress so big camera photos don't bloat storage or slow the board.
    const { blob, ext } = await downscaleImage(file);
    const url = await onUploadImage(blob, ext);
    setBusy(false);
    if (url) {
      onChange({ imageUrl: url });
      setPendingPreview(null);
    } else {
      setUploadError(true); // keep the local preview so it still shows
    }
  };

  return (
    <div>
      <MenuBar items={['File', 'Edit', 'View', 'Help']} />
      {!readOnly &&
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
            onChange({ imageUrl: null, caption: '' });
            setPendingPreview(null);
            setUploadError(false);
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
          onChange={(e) => void loadFile(e.target.files?.[0])} />

      </div>
      }

      {showUrl && !readOnly &&
      <form
        className="flex gap-1 bg-chrome px-1 pb-1 pt-1"
        onSubmit={(e) => {
          e.preventDefault();
          if (urlDraft.trim()) {
            onChange({ imageUrl: urlDraft.trim() });
            setPendingPreview(null);
            setUploadError(false);
          }
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
          if (readOnly) return;
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          if (readOnly) return;
          e.preventDefault();
          setDragOver(false);
          void loadFile(e.dataTransfer.files?.[0]);
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
              readOnly={readOnly}
              onChange={(e) => onChange({ caption: e.target.value })}
              placeholder="write a caption ♡"
              className="bubble-text mt-2 w-full bg-transparent text-center text-[13px] text-ink outline-none placeholder:text-ink/35" />

            </figcaption>
            {busy &&
            <p className="mt-1 text-center text-[10px] text-ink/60">optimizing photo…</p>
            }
            {uploadError &&
            <p className="mt-1 text-center text-[10px] text-red-600">
                couldn't save to the cloud — shown locally only
              </p>
            }
          </figure> :

        <div className="text-center">
            <span className="bevel-out mx-auto grid h-11 w-11 place-items-center bg-cotton text-ink">
              <ImagePlusIcon className="h-5 w-5" />
            </span>
            <p className="pixel-text mt-2 text-[13px] text-white">
              {readOnly ? 'no photo yet' : 'drop a photo here'}
            </p>
            {!readOnly &&
            <p className="mt-1 text-[11px] text-cotton">
                or hit <strong>Open...</strong> to pick one from ur computer
              </p>
            }
            {sizeError &&
            <p className="mt-2 text-[11px] font-bold text-lemon">
                that image is too big (max 25MB) — try a smaller one ♡
              </p>
            }
          </div>
        }
      </div>
    </div>);

}
