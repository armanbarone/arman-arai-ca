"use client";
import { memo, useEffect, useRef, type CSSProperties } from "react";

function Sleigh() {
  return <svg viewBox="0 0 280 88" className="xm-sleigh-silhouette" aria-hidden="true">
    <g className="xm-sleigh-reins" fill="none" stroke="currentColor" strokeWidth=".85"><path d="M61 54Q92 66 109 42T164 35T222 28"/><path d="M62 56Q94 61 110 44T165 37T223 30"/></g>
    <g className="xm-sleigh-cargo" fill="currentColor">
      <path d="M4 49h58l-6 16H15zM4 45l5-6 11 16H9zM9 70h55q14 0 17-12l4 2q-3 17-23 17H12zM42 49V31l9-3 12 9-4 13zM44 27l-2-8 10-8 12 13-12 3zM44 18l12 2 5 6-18 2zM54 41l16 4-1 4-17-3zM14 47q-8-21 4-24l7 1q13 8 8 23z"/>
      <rect x="29" y="29" width="13" height="18" rx="1"/><rect x="17" y="17" width="12" height="12" rx="1"/>
      <path d="M35 29v18M18 23h10M23 18v10" stroke="#a54236" strokeWidth="1.5"/>
      <path d="M10 70h53q13 0 17-11" fill="none" stroke="#fff2bf" strokeWidth="1.1"/>
    </g>
    {[0,1,2].map(i=><g key={i} transform={`translate(${80+i*57} ${14-i*6})`}>
      <g className="xm-deer-gallop" style={{"--lag":`${-i*.17}s`} as CSSProperties} fill="currentColor">
        <g className="xm-deer-leg xm-deer-leg-back"><path d="M20 36l-7 11-9 4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></g>
        <g className="xm-deer-leg xm-deer-leg-front"><path d="M37 34l6 12 10 2" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></g>
        <g className="xm-deer-leg xm-deer-leg-far"><path d="M22 36l4 12 9 5M36 35l-4 11-9 3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></g>
        <path d="M9 34C11 23 22 24 34 27l9-10 3-11 5 2-1 11 7 4-3 5-9-2-9 13-17 2-8-3zM13 31L4 25l-3 1 3 5 9 5zM46 18l-6-5 2 6z"/>
        <path d="M49 14l-5-7 1-6M47 9l-7-3M51 17l8-9 1-7M56 11l9-4M59 7l-4-4" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round"/>
        {i===2 && <circle className="xm-rudolph-nose" cx="56" cy="24" r="1.8" fill="#ff6554"/>}
      </g>
    </g>)}
  </svg>;
}
function FlyingSleigh({ index }: { index: number }) {
  return <div className={`xm-flying-sleigh xm-flight-${index}`}><div className="xm-sleigh-swing">
    <div className="xm-stardust">{Array.from({length:28},(_,i)=><i key={i} style={{"--dust-y":`${-7+(i*7)%19}px`,"--dust-size":`${.5+(i%4)*.2}px`,"--dust-duration":`${1.1+(i%5)*.19}s`,"--dust-delay":`${-i*.137}s`,"--dust-drift":`${-9+(i*13)%19}px`} as CSSProperties}/>)}</div>
    <Sleigh/>
  </div></div>;
}

function ChristmasAtmosphere() {
  const audioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    const audio = audioRef.current, root = audio?.closest<HTMLElement>(".xm");
    if (!audio || !root) return;
    const controller = new AbortController();
    let context: AudioContext | undefined, buffer: AudioBuffer | undefined, disposed = false;
    let voice: AudioBufferSourceNode | undefined;
    // Decode a tiny local recording once. Resuming inside the click gesture
    // unlocks audio on mobile Safari/Chrome; no ambient audio or extra controls.
    try {
      context = new AudioContext();
      const decoder = context;
      void fetch(audio.currentSrc || audio.src, { signal: controller.signal })
        .then(response => { if (!response.ok) throw Error("Audio unavailable"); return response.arrayBuffer(); })
        .then(data => decoder.decodeAudioData(data))
        .then(decoded => { if (!disposed) buffer = decoded; })
        .catch(() => { /* The native audio element remains a fallback. */ });
    } catch { /* Native audio supports browsers without Web Audio. */ }
    function nativePlayback() {
      if (disposed) return;
      audio!.volume = .42;
      try { audio!.currentTime = 0; } catch { /* Some mobile browsers seek only after loading. */ }
      void audio!.play().catch(() => { /* Playback never blocks a booking. */ });
    }
    function playBells() {
      const player = context, sample = buffer;
      if (!player || !sample) { nativePlayback(); return; }
      // Call resume synchronously during the trusted tap/click. Keyboard
      // activation dispatches the same click, without duplicate touch handlers.
      void player.resume().then(() => {
        if (disposed) return;
        voice?.stop();
        const source = player.createBufferSource(), gain = player.createGain();
        source.buffer = sample; gain.gain.value = .42;
        source.connect(gain); gain.connect(player.destination);
        source.onended = () => { source.disconnect(); gain.disconnect(); if (voice === source) voice = undefined; };
        voice = source; source.start();
      }).catch(nativePlayback);
    }
    function click(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const button = event.target.closest<HTMLElement>('button,a.xm-button,a.xm-nav-cta,[role="button"]');
      if (button && root!.contains(button) && !button.matches(':disabled,[aria-disabled="true"]')) playBells();
    }
    function visibility() {
      root!.dataset.effectsActive = document.hidden ? "false" : "true";
      if (document.hidden) { audio!.pause(); if (context?.state === "running") void context.suspend().catch(() => {}); }
    }
    visibility();
    document.addEventListener("visibilitychange", visibility);
    root.addEventListener("click", click, { capture: true, passive: true });
    return () => {
      disposed = true; controller.abort(); audio.pause(); voice?.stop();
      void context?.close().catch(() => {});
      document.removeEventListener("visibilitychange", visibility);
      root.removeEventListener("click", click, { capture: true });
      delete root.dataset.effectsActive;
    };
  }, []);
  return <>
    <audio ref={audioRef} src="/christmas/sleigh-bells-click.mp3" preload="auto" aria-hidden="true" />
    <div className="xm-atmosphere" aria-hidden="true"><div className="xm-night-sky"/><div className="xm-hearth-glow"/><div className="xm-firelight"/>
      <svg className="xm-hearth-flames" viewBox="0 0 1100 250" preserveAspectRatio="none"><defs><linearGradient id="xm-flame-color" x1="0" x2="0" y1="1" y2="0"><stop offset="0" stopColor="#ffe6a0"/><stop offset=".5" stopColor="#ff9c36"/><stop offset="1" stopColor="#df5525" stopOpacity="0"/></linearGradient><path id="xm-flame-tongue" d="M0 250C-10 200 30 160 12 95C55 140 40 65 78 0C64 102 132 127 108 196C140 161 153 214 135 250Z"/></defs><g fill="url(#xm-flame-color)">{[5,130,260,390,520,650,780,910,1030].map((x,i)=><use key={x} href="#xm-flame-tongue" x={x} y={i%2?18:0} style={{animationDelay:`-${i*.7}s`}}/>)}</g></svg>
    </div>
    <div className="xm-sky-effects" aria-hidden="true">
      {[0,1].map(i=><FlyingSleigh key={i} index={i}/>)}
      {[0,1,2].map(i=><div key={i} className={`xm-shooting-star xm-star-${i}`}/>)}
      <div className="xm-wish-sparkles">{Array.from({length:18},(_,i)=><i key={i} style={{left:`${(i*43.7)%100}%`,top:`${(i*29.3)%85}%`,animationDelay:`-${i*.63}s`}}/>)}</div>
      <div className="xm-snow">{Array.from({length:48},(_,i)=><i key={i} style={{"--x":`${(i*37.73)%100}%`,"--size":`${1+(i%4)}px`,"--duration":`${11+(i%13)}s`,"--delay":`-${(i*3.7)%24}s`,"--drift":`${-25+(i*13)%85}px`,"--alpha":.25+(i%5)*.12} as CSSProperties}/>)}</div>
      <div className="xm-embers">{Array.from({length:12},(_,i)=><i key={i} style={{left:`${15+i*6}%`,animationDelay:`-${i*.7}s`}}/>)}</div>
    </div>
  </>;
}
export default memo(ChristmasAtmosphere);
