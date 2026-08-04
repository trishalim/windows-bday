import React, { useEffect, useMemo, useState } from 'react';
import {
  PauseIcon,
  PlayIcon,
  Repeat2Icon,
  ShuffleIcon,
  SkipBackIcon,
  SkipForwardIcon,
  Volume2Icon } from
'lucide-react';
import { ALBUM_ART, playlist } from '../../data/desktop';

const BAR_COUNT = 22;

export function WinampPlayer() {
  const [playing, setPlaying] = useState(true);
  const [current, setCurrent] = useState(0);
  const [seconds, setSeconds] = useState(42);
  const [levels, setLevels] = useState<number[]>(() =>
  Array.from({ length: BAR_COUNT }, () => 0.3)
  );

  const track = playlist[current];
  const total = useMemo(() => {
    const [m, s] = track.duration.split(':').map(Number);
    return m * 60 + s;
  }, [track.duration]);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setSeconds((prev) => prev + 1 >= total ? 0 : prev + 1);
      setLevels(Array.from({ length: BAR_COUNT }, () => 0.15 + Math.random() * 0.85));
    }, 900);
    return () => window.clearInterval(id);
  }, [playing, total]);

  const time = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(
    seconds % 60
  ).padStart(2, '0')}`;

  const step = (dir: number) => {
    setCurrent((prev) => (prev + dir + playlist.length) % playlist.length);
    setSeconds(0);
  };

  return (
    <div className="bg-chrome">
      <div className="bevel-in scanlines relative bg-[#2b0a1f] p-2">
        <div className="flex gap-2">
          <img
            src={ALBUM_ART}
            alt={`Album art for ${track.title}`}
            className="bevel-in h-[74px] w-[74px] shrink-0 object-cover" />
          
          <div className="min-w-0 flex-1">
            <p className="crt-text truncate text-[20px] leading-none text-[#7dffb0]">
              {current + 1}. {track.title}
            </p>
            <p className="crt-text truncate text-[16px] leading-tight text-[#ff9fd8]">
              by {track.artist}
            </p>
            <div className="mt-1 flex items-end gap-[2px]" aria-hidden="true">
              {levels.map((level, i) =>
              <span
                key={i}
                className="w-[4px] bg-[#ff2fa0] transition-[height] duration-700 ease-out"
                style={{
                  height: `${(playing ? level : 0.08) * 30}px`,
                  backgroundColor: i % 3 === 0 ? '#7dffb0' : '#ff2fa0'
                }} />

              )}
            </div>
          </div>
          <div className="crt-text shrink-0 text-right text-[18px] leading-none text-[#7dffb0]">
            <p>{time}</p>
            <p className="text-[#ff9fd8]">{track.duration}</p>
            <p className="mt-1 text-[13px] text-[#c9a7ff]">128kbps</p>
            <p className="text-[13px] text-[#c9a7ff]">44khz</p>
          </div>
        </div>
      </div>

      <div className="mt-2 bevel-in relative h-[14px] bg-[#e8cfe0]">
        <div
          className="h-full bg-hotpink"
          style={{ width: `${seconds / total * 100}%` }} />
        
        <span
          className="absolute top-[-3px] h-[20px] w-[9px] bevel-btn bg-cotton"
          style={{ left: `calc(${seconds / total * 100}% - 4px)` }}
          aria-hidden="true" />
        
      </div>

      <div className="mt-2 flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous track"
          onClick={() => step(-1)}
          className="bevel-btn grid h-7 w-8 place-items-center text-ink">
          
          <SkipBackIcon className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label={playing ? 'Pause' : 'Play'}
          onClick={() => setPlaying((p) => !p)}
          className="bevel-btn grid h-7 w-11 place-items-center bg-bubblegum text-white">
          
          {playing ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
        </button>
        <button
          type="button"
          aria-label="Next track"
          onClick={() => step(1)}
          className="bevel-btn grid h-7 w-8 place-items-center text-ink">
          
          <SkipForwardIcon className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label="Shuffle"
          className="bevel-btn grid h-7 w-8 place-items-center text-ink">
          
          <ShuffleIcon className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label="Repeat"
          className="bevel-btn grid h-7 w-8 place-items-center text-ink">
          
          <Repeat2Icon className="h-3.5 w-3.5" />
        </button>
        <span className="ml-auto flex items-center gap-1 pr-1">
          <Volume2Icon className="h-3.5 w-3.5 text-ink" aria-hidden="true" />
          <span className="bevel-in flex h-[12px] w-16 items-center bg-[#e8cfe0]">
            <span className="h-full w-2/3 bg-lilac" />
          </span>
        </span>
      </div>

      <ul className="mt-2 bevel-in retro-scroll max-h-[132px] overflow-y-auto bg-white">
        {playlist.map((t, i) =>
        <li key={t.title}>
            <button
            type="button"
            onClick={() => {
              setCurrent(i);
              setSeconds(0);
              setPlaying(true);
            }}
            aria-current={i === current}
            className={`flex w-full items-center gap-2 px-2 py-[3px] text-left text-[12px] ${
            i === current ? 'bg-hotpink text-white' : 'text-ink hover:bg-cotton'}`
            }>
            
              <span className="crt-text w-4 text-[14px] opacity-70">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="flex-1 truncate">{t.title}</span>
              <span className="opacity-70">{t.duration}</span>
            </button>
          </li>
        )}
      </ul>
    </div>);

}