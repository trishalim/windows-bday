export type AppKind = 'paint' | 'txt' | 'word' | 'photo' | 'sticky' | 'winamp' | 'about';

export type Accent = 'pink' | 'purple' | 'blue';

export interface WindowInstance {
  id: string;
  kind: AppKind;
  title: string;
  x: number;
  y: number;
  w: number;
  z: number;
  minimized: boolean;
}

export interface Track {
  title: string;
  artist: string;
  duration: string;
}