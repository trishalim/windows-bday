export interface DownscaleResult {
  blob: Blob;
  ext: string;
}

interface DownscaleOptions {
  /** Longest edge, in pixels, the output is capped to. */
  maxDimension?: number;
  /** JPEG quality, 0–1. */
  quality?: number;
}

async function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('could not decode image'));
      img.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Shrinks and re-compresses an uploaded image so big camera photos don't bloat
 * storage or slow the shared board. Animated GIFs are passed through untouched
 * (canvas would flatten them to one frame). Falls back to the original file if
 * anything goes wrong.
 */
export async function downscaleImage(
  file: File,
  { maxDimension = 1600, quality = 0.82 }: DownscaleOptions = {}
): Promise<DownscaleResult> {
  if (file.type === 'image/gif') {
    return { blob: file, ext: 'gif' };
  }

  try {
    const img = await loadImage(file);
    const longest = Math.max(img.naturalWidth, img.naturalHeight);
    const scale = Math.min(1, maxDimension / longest);
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { blob: file, ext: extForType(file.type) };

    // Flatten any transparency onto white (JPEG has no alpha).
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality)
    );

    // If re-encoding somehow produced something bigger, keep the original.
    if (!blob || blob.size >= file.size) {
      return { blob: file, ext: extForType(file.type) };
    }
    return { blob, ext: 'jpg' };
  } catch {
    return { blob: file, ext: extForType(file.type) };
  }
}

function extForType(mime: string): string {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  if (mime === 'image/gif') return 'gif';
  return 'jpg';
}
