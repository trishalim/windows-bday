import React, { useState } from 'react';
import { MonitorIcon, Trash2Icon } from 'lucide-react';
import { AppKind } from '../types/desktop';
import { appRegistry, creatableKinds } from './appRegistry';

interface DesktopIconsProps {
  onOpen: (kind: AppKind) => void;
}

export function DesktopIcons({ onOpen }: DesktopIconsProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const items: {id: string;label: string;kind?: AppKind;}[] = [
  { id: 'my-computer', label: 'My Computer' },
  ...creatableKinds.map((kind) => ({
    id: kind,
    label: appRegistry[kind].label,
    kind
  })),
  { id: 'winamp', label: 'Winamp', kind: 'winamp' as AppKind },
  { id: 'recycle', label: 'Recycle Bin' }];


  return (
    <ul className="absolute left-2 top-2 z-[5] grid w-[80px] gap-1 sm:left-3 sm:top-3">
      {items.map((item) => {
        const Icon = item.kind ? appRegistry[item.kind].icon : item.id === 'my-computer' ? MonitorIcon : Trash2Icon;
        const isSelected = selected === item.id;
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => {
                setSelected(item.id);
                if (item.kind) onOpen(item.kind);
              }}
              className="no-select flex w-full flex-col items-center gap-[3px] px-1 py-1 text-center">
              
              <span
                className={`grid h-9 w-9 place-items-center bevel-out ${
                isSelected ? 'bg-hotpink text-white' : 'bg-cotton text-ink'}`
                }>
                
                <Icon className="h-5 w-5" />
              </span>
              <span
                className={`pixel-text text-[11px] leading-tight ${
                isSelected ?
                'bg-hotpink text-white' :
                'text-white drop-shadow-[1px_1px_0_rgba(58,28,44,0.9)]'}`
                }>
                
                {item.label}
              </span>
            </button>
          </li>);

      })}
    </ul>);

}