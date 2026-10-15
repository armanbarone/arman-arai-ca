"use client";
import { useEffect, useRef, useState } from "react";

function Sleigh() {
  return <svg viewBox="0 0 220 66" className="xm-sleigh-silhouette" aria-hidden="true">
    <defs><g id="xm-reindeer"><path d="M6 34l8-9 13-2 12 4 6-9 3-10 4 1-1 9 7 4-2 5-10-1-8 11-10 1-8-1-10 9-6 1 9-14-5-3zM24 35l9 12 8 6-3 3-11-6-11-12zM36 33l11 8 12 2-1 4-14-1-13-9zM17 30L7 25l-3-4-4 2 3 7 10 5z"/><path d="M49 14l-5-7 1-6M47 9l-7-3M51 17l8-9 1-7M56 11l9-4M59 7l-4-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></g></defs>
    <g fill="currentColor"><use href="#xm-reindeer" x="154" y="0"/><use href="#xm-reindeer" x="100" y="7"/><use href="#xm-reindeer" x="46" y="13"/><path d="M3 42h34l-4 12H10zM2 39l4-3 4 7H5zM2 58h35q8 0 10-7l3 1q-2 11-14 11H4zM16 41l1-15 9-2 7 7-3 11zM19 24l-1-6 6-7 9 10-7 2zM19 17l11 4-1 4-13-3zM28 34l11 3-1 3-14-2z"/></g><path d="M36 46l24-4M88 34l24-4M141 27l24-4" stroke="currentColor" strokeWidth=".7" fill="none"/>
  </svg>;
}

export default function ChristmasAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const [sound, setSound] = useState(true);
  const [motion, setMotion] = useState(true);
  function toggleSound() {
    const next = !sound;
    try { localStorage.setItem("xm:sound:v1", next ? "on" : "off"); } catch { /* Optional preference. */ }
    setSound(next);
  }
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { if (reduced.matches) setMotion(false); };
    update(); reduced.addEventListener("change", update);
    try { if (localStorage.getItem("xm:sound:v1") === "off") setSound(false); } catch { /* Preferences are optional. */ }
    return () => reduced.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    function click(e: MouseEvent) {
      const target = e.target instanceof Element ? e.target.closest<HTMLElement>("button,a,select") : null;
      if (!sound || !target?.closest(".xm") || target.hasAttribute("disabled") || target.closest("[data-sound-control]")) return;
      try {
        const context = audioRef.current ?? new AudioContext(); audioRef.current = context;
        void context.resume().then(() => {
          const now = context.currentTime;
          // A short, quiet sleigh-bell chord, synthesized only after a click.
          [1046.5, 1568, 2093].forEach((frequency, i) => {
            const oscillator = context.createOscillator(), gain = context.createGain();
            oscillator.type = "sine"; oscillator.frequency.setValueAtTime(frequency, now);
            const start = now + i * .028;
            gain.gain.setValueAtTime(0, now); gain.gain.setValueAtTime(.0001, start);
            gain.gain.exponentialRampToValueAtTime(i ? .016 : .025, start + .006);
            gain.gain.exponentialRampToValueAtTime(.0001, start + .28);
            oscillator.connect(gain); gain.connect(context.destination); oscillator.start(start); oscillator.stop(start + .32);
          });
        }).catch(() => {});
      } catch { /* The booking still works if audio is unavailable. */ }
    }
    document.addEventListener("click", click, { capture: true });
    return () => document.removeEventListener("click", click, { capture: true });
  }, [sound]);
  useEffect(() => () => { void audioRef.current?.close(); }, []);
  useEffect(() => {
    const canvas = canvasRef.current, ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    if (!motion) { ctx.clearRect(0, 0, canvas.width, canvas.height); return; }
    let width = 0, height = 0, frame = 0, last = 0;
    const flakes = Array.from({ length: window.innerWidth < 620 ? 65 : 125 }, () => ({ x: Math.random(), y: Math.random(), depth: Math.random(), drift: Math.random() * Math.PI * 2 }));
    const embers = Array.from({ length: 16 }, () => ({ x: Math.random(), y: Math.random(), speed: .5 + Math.random(), phase: Math.random() * 6 }));
    function resize() { if (!canvas || !ctx) return; width = window.innerWidth; height = window.innerHeight; const dpr = Math.min(window.devicePixelRatio || 1, 1.5); canvas.width = width * dpr; canvas.height = height * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function draw(time: number) {
      frame = requestAnimationFrame(draw);
      if (document.hidden || time - last < 32) return;
      const dt = Math.min((time - (last || time)) / 1000, .07); last = time;
      ctx!.clearRect(0, 0, width, height);
      for (const f of flakes) {
        f.y += dt * (.018 + f.depth * .038); f.x += dt * (.004 + Math.sin(time / 4000 + f.drift) * .009);
        if (f.y > 1.02) { f.y = -.02; f.x = Math.random(); } if (f.x > 1.02) f.x = -.02; if (f.x < -.02) f.x = 1.02;
        ctx!.beginPath(); ctx!.fillStyle = `rgba(255,249,230,${.18 + f.depth * .52})`; ctx!.arc(f.x * width, f.y * height, .6 + f.depth * 2, 0, Math.PI * 2); ctx!.fill();
      }
      for (const e of embers) {
        e.y += dt * .13 * e.speed; if (e.y > 1) { e.y = 0; e.x = Math.random(); }
        const y = height - e.y * Math.min(height * .45, 370), x = width * (.15 + e.x * .7) + Math.sin(time / 1400 + e.phase) * 25;
        ctx!.beginPath(); ctx!.fillStyle = `rgba(255,${Math.round(140 + e.x * 65)},79,${(1 - e.y) * .65})`; ctx!.arc(x, y, .6 + e.speed * .65, 0, Math.PI * 2); ctx!.fill();
      }
    }
    resize(); frame = requestAnimationFrame(draw); window.addEventListener("resize", resize, { passive: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); ctx.clearRect(0, 0, width, height); };
  }, [motion]);
  return <>
    <div className={`xm-atmosphere ${motion ? "" : "xm-atmosphere-paused"}`} aria-hidden="true"><div className="xm-night-sky"/><div className="xm-hearth-glow"/><div className="xm-firelight"/>
      <svg className="xm-hearth-flames" viewBox="0 0 1100 250" preserveAspectRatio="none"><defs><linearGradient id="xm-flame-color" x1="0" x2="0" y1="1" y2="0"><stop offset="0" stopColor="#ffdd7d"/><stop offset=".5" stopColor="#ff9c36"/><stop offset="1" stopColor="#df5525" stopOpacity="0"/></linearGradient><path id="xm-flame-tongue" d="M0 250C-10 200 30 160 12 95C55 140 40 65 78 0C64 102 132 127 108 196C140 161 153 214 135 250Z"/></defs><g fill="url(#xm-flame-color)">{[5,130,260,390,520,650,780,910,1030].map((x,i)=><use key={x} href="#xm-flame-tongue" x={x} y={i%2?18:0} style={{animationDelay:`-${i*.7}s`}}/>)}</g></svg>
      <div className="xm-flying-sleigh"><Sleigh/></div><div className="xm-shooting-star"/></div><canvas ref={canvasRef} className="xm-snow" aria-hidden="true"/>
    <div className="xm-effects-controls" role="group" aria-label="Christmas atmosphere controls"><button type="button" data-sound-control aria-pressed={sound} onClick={toggleSound} title={sound ? "Mute button sounds" : "Enable button sounds"}><span aria-hidden="true">{sound ? "♫" : "♪"}</span> {sound ? "Sound on" : "Sound off"}</button><button type="button" aria-pressed={motion} onClick={() => setMotion(v => !v)}><span aria-hidden="true">✧</span> {motion ? "Pause magic" : "Play magic"}</button></div>
  </>;
}
