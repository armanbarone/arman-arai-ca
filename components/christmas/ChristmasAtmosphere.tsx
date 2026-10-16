"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";

function Sleigh({ suffix }: { suffix: number }) {
  const deer = `xm-reindeer-${suffix}`;
  return <svg viewBox="0 0 260 80" className="xm-sleigh-silhouette" aria-hidden="true">
    <defs><g id={deer}><path d="M6 34l8-9 13-2 12 4 6-9 3-10 4 1-1 9 7 4-2 5-10-1-8 11-10 1-8-1-10 9-6 1 9-14-5-3zM24 35l9 12 8 6-3 3-11-6-11-12zM36 33l11 8 12 2-1 4-14-1-13-9zM17 30L7 25l-3-4-4 2 3 7 10 5z"/><path d="M49 14l-5-7 1-6M47 9l-7-3M51 17l8-9 1-7M56 11l9-4M59 7l-4-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></g></defs>
    <g fill="currentColor"><use href={`#${deer}`} x="191" y="0"/><use href={`#${deer}`} x="135" y="7"/><use href={`#${deer}`} x="79" y="14"/>
      {/* Curled sleigh runners, Santa, gift sack and stacked parcel cargo. */}
      <path d="M4 49h58l-6 16H15zM4 45l5-6 11 16H9zM9 70h55q14 0 17-12l4 2q-3 17-23 17H12zM42 49V31l9-3 12 9-4 13zM44 27l-2-8 10-8 12 13-12 3zM44 18l12 2 5 6-18 2zM54 41l16 4-1 4-17-3zM14 47q-8-21 4-24l7 1q13 8 8 23z"/>
      <rect x="29" y="29" width="13" height="18" rx="1"/><rect x="17" y="17" width="12" height="12" rx="1"/>
    </g><path d="M35 29v18M18 23h10M64 51l27-5M122 40l24-6M178 31l26-6" stroke="currentColor" strokeWidth="1.4" fill="none"/>
  </svg>;
}

export default function ChristmasAtmosphere() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [sound, setSound] = useState(true), [motion, setMotion] = useState(true);
  const [audioError, setAudioError] = useState("");
  function playBells() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = .5; audio.currentTime = 0;
    void audio.play().then(() => setAudioError("")).catch(() => setAudioError("Tap Test bells to enable audio."));
  }
  function setSoundPreference(next: boolean) {
    setSound(next);
    try { localStorage.setItem("xm:sound:v2", next ? "on" : "off"); } catch { /* Optional preference. */ }
  }
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    setMotion(!reduced.matches);
    const update = () => setMotion(!reduced.matches);
    reduced.addEventListener("change", update);
    try { if (localStorage.getItem("xm:sound:v2") === "off") setSound(false); } catch { /* Optional preference. */ }
    return () => reduced.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const root = audioRef.current?.closest<HTMLElement>(".xm");
    if (root) root.dataset.motion = motion ? "on" : "off";
  }, [motion]);
  useEffect(() => {
    function click(e: MouseEvent) {
      const target = e.target instanceof Element ? e.target.closest<HTMLElement>("button,a,select,summary") : null;
      if (sound && target?.closest(".xm") && !target.hasAttribute("disabled") && !target.closest("[data-sound-control]")) playBells();
    }
    document.addEventListener("click", click, { capture: true });
    return () => document.removeEventListener("click", click, { capture: true });
  }, [sound]);
  return <>
    <audio ref={audioRef} src="/christmas/sleigh-bells.wav" preload="auto" />
    <div className="xm-atmosphere" aria-hidden="true"><div className="xm-night-sky"/><div className="xm-hearth-glow"/><div className="xm-firelight"/>
      <svg className="xm-hearth-flames" viewBox="0 0 1100 250" preserveAspectRatio="none"><defs><linearGradient id="xm-flame-color" x1="0" x2="0" y1="1" y2="0"><stop offset="0" stopColor="#ffe6a0"/><stop offset=".5" stopColor="#ff9c36"/><stop offset="1" stopColor="#df5525" stopOpacity="0"/></linearGradient><path id="xm-flame-tongue" d="M0 250C-10 200 30 160 12 95C55 140 40 65 78 0C64 102 132 127 108 196C140 161 153 214 135 250Z"/></defs><g fill="url(#xm-flame-color)">{[5,130,260,390,520,650,780,910,1030].map((x,i)=><use key={x} href="#xm-flame-tongue" x={x} y={i%2?18:0} style={{animationDelay:`-${i*.7}s`}}/>)}</g></svg>
    </div>
    <div className="xm-sky-effects" aria-hidden="true">
      {[0,1].map(i=><div key={i} className={`xm-flying-sleigh xm-flight-${i}`}><Sleigh suffix={i}/></div>)}
      {[0,1,2].map(i=><div key={i} className={`xm-shooting-star xm-star-${i}`}/>)}
      <div className="xm-snow">{Array.from({length:72},(_,i)=><i key={i} style={{"--x":`${(i*37.73)%100}%`,"--size":`${1+(i%4)}px`,"--duration":`${11+(i%13)}s`,"--delay":`-${(i*3.7)%24}s`,"--drift":`${-25+(i*13)%85}px`,"--alpha":.25+(i%5)*.12} as CSSProperties}/>)}</div>
      <div className="xm-embers">{Array.from({length:12},(_,i)=><i key={i} style={{left:`${15+i*6}%`,animationDelay:`-${i*.7}s`}}/>)}</div>
    </div>
    <div className="xm-effects-controls" role="group" aria-label="Christmas atmosphere controls">
      <button type="button" data-sound-control onClick={()=>{setSoundPreference(true);playBells();}} title="Play the Christmas chi-chi-chi sleigh bells"><span aria-hidden="true">♬</span> Test bells</button>
      <button type="button" data-sound-control aria-pressed={sound} onClick={()=>{const next=!sound;setSoundPreference(next);if(next)playBells();else audioRef.current?.pause();}}>{sound?"Sound on":"Sound off"}</button>
      <button type="button" aria-pressed={motion} onClick={()=>setMotion(v=>!v)}>{motion?"Pause magic":"Play magic"}</button>
    </div>
    {audioError && <span className="xm-audio-status" role="status">{audioError}</span>}
  </>;
}
