export type AppKind = 'paint' | 'txt' | 'word' | 'photo' | 'sticky' | 'winamp' | 'about';

export type Accent = 'pink' | 'purple' | 'blue';

/** Per-window user content, stored as JSON in Supabase. Shapes vary by kind. */
export type WindowContent = Record<string, unknown>;

export interface StickyContent {
  text: string;
  bg: string;
}

export interface TxtContent {
  text: string;
}

export interface WordContent {
  heading: string;
  body: string;
  signature: string;
  font: string;
  size: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  center: boolean;
}

export interface PhotoContent {
  imageUrl: string | null;
  caption: string;
}

export interface PaintContent {
  imageUrl: string | null;
}

export const STICKY_DEFAULT_BG = '#fff6a8';

/** Fresh content payload for a newly-opened window of the given kind. */
export function defaultContent(kind: AppKind): WindowContent {
  switch (kind) {
    case 'sticky':
      return { text: '', bg: STICKY_DEFAULT_BG };
    case 'txt':
      return { text: '' };
    case 'word':
      return {
        heading: '',
        body: '',
        signature: '',
        font: 'Comic Sans MS',
        size: 14,
        bold: false,
        italic: false,
        underline: false,
        center: false
      };
    case 'photo':
      return { imageUrl: null, caption: '' };
    case 'paint':
      return { imageUrl: null };
    default:
      return {};
  }
}

export interface WindowInstance {
  id: string;
  /** Browser id of the guest who created the window (soft ownership). */
  ownerId: string;
  kind: AppKind;
  title: string;
  x: number;
  y: number;
  w: number;
  z: number;
  /** Viewer-local only — each guest controls their own minimize; not persisted. */
  minimized: boolean;
  content: WindowContent;
}

export interface Track {
  title: string;
  artist: string;
  duration: string;
}
