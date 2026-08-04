import React from 'react';
import {
  FileTextIcon,
  ImageIcon,
  InfoIcon,
  MusicIcon,
  PaintbrushIcon,
  StickyNoteIcon,
  TypeIcon } from
'lucide-react';
import { AppKind, Accent } from '../types/desktop';

interface AppDefinition {
  /** Label used on desktop icons + start menu */
  label: string;
  /** Base file name for new documents */
  fileName: string;
  suffix: string;
  width: number;
  accent: Accent;
  singleton?: boolean;
  creatable?: boolean;
  icon: React.ComponentType<{className?: string;}>;
}

export const appRegistry: Record<AppKind, AppDefinition> = {
  paint: {
    label: 'New Drawing',
    fileName: 'untitled',
    suffix: 'Paint',
    width: 470,
    accent: 'blue',
    creatable: true,
    icon: PaintbrushIcon
  },
  txt: {
    label: 'New Text File',
    fileName: 'message',
    suffix: 'Notepad',
    width: 372,
    accent: 'pink',
    creatable: true,
    icon: FileTextIcon
  },
  word: {
    label: 'New Word File',
    fileName: 'birthday_card',
    suffix: 'Word',
    width: 472,
    accent: 'pink',
    creatable: true,
    icon: TypeIcon
  },
  photo: {
    label: 'New Photo',
    fileName: 'photo',
    suffix: 'Photo Viewer',
    width: 380,
    accent: 'purple',
    creatable: true,
    icon: ImageIcon
  },
  sticky: {
    label: 'New Sticky Note',
    fileName: 'note',
    suffix: 'Sticky',
    width: 200,
    accent: 'pink',
    creatable: true,
    icon: StickyNoteIcon
  },
  winamp: {
    label: 'Winamp',
    fileName: 'dreaming.mp3',
    suffix: 'Winamp',
    width: 340,
    accent: 'purple',
    singleton: true,
    icon: MusicIcon
  },
  about: {
    label: 'About this PC',
    fileName: 'About this PC',
    suffix: '',
    width: 350,
    accent: 'purple',
    singleton: true,
    icon: InfoIcon
  }
};

export const creatableKinds = (Object.keys(appRegistry) as AppKind[]).filter(
  (kind) => appRegistry[kind].creatable
);

export function AppIcon({ kind, className }: {kind: AppKind;className?: string;}) {
  const Icon = appRegistry[kind].icon;
  return <Icon className={className} />;
}