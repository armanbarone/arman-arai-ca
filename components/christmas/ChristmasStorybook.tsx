"use client";
import "./christmas-storybook.css";

const characters = [
  { id: "nutcracker", name: "The Nutcracker" }, { id: "grinch", name: "The Grinch" },
  { id: "elf", name: "The Elf" }, { id: "gnome", name: "The Gnome" }, { id: "snowman", name: "The Snowman" },
] as const;

type Character = typeof characters[number]["id"];

export function ChristmasCharacter({ character, className = "" }: { character: Character; className?: string }) {
  return <svg className={`xl-character xl-${character} ${className}`} viewBox="0 0 180 220" fill="none" aria-hidden="true">
    <ellipse cx="90" cy="207" rx="53" ry="7" fill="#071f19" opacity=".28" />
    {character === "nutcracker" && <g stroke="#263c32" strokeWidth="2.2" strokeLinejoin="round">
      <path d="M65 155h22v42H62zm28 0h22l3 42H93z" fill="#e9d2a0" />
      <path d="M62 183h25v20H51v-9l11-5zm31 0h25l11 11v9H93z" fill="#263b38" /><path d="M63 184h21m12 0h20" stroke="#d5b56c" strokeWidth="5" />
      <path d="M59 107h62l8 61H51z" fill="#a93939" /><path d="M60 111h60M58 144h64" stroke="#e8c677" strokeWidth="5" /><path d="M90 108v50" stroke="#f3dc9c" strokeWidth="3" />
      <path d="M55 112l-13 40 14 6 17-43m42-3 16 37-14 8-17-42" fill="#b8413e" /><path d="m44 144 16 6m57 0 12-7" stroke="#e7d5b2" strokeWidth="9" />
      <circle cx="48" cy="159" r="8" fill="#e5ad83" /><circle cx="123" cy="159" r="8" fill="#e5ad83" /><path d="M136 83v120" stroke="#e2b568" strokeWidth="5" /><path d="m129 89 7-17 7 17z" fill="#e6bc6a" />
      <path d="M61 64Q43 70 56 113l19-12h31l18 12q14-41-5-49z" fill="#f5e7ca" /><rect x="62" y="55" width="57" height="51" rx="20" fill="#eabb91" />
      <path d="M59 63V24h64v39z" fill="#243e38" /><path d="M56 29h70v10H56z" fill="#aa3638" /><path d="M66 20h50v10H66z" fill="#d7ad61" /><path d="M71 45h39" stroke="#e1bf76" strokeWidth="4" /><path d="m90 39 5 8-5 8-5-8z" fill="#ead18d" />
      <path d="m70 75 10-3m21 0 10 3" strokeWidth="3" /><circle cx="76" cy="80" r="2" fill="#263c32" /><circle cx="106" cy="80" r="2" fill="#263c32" /><path d="m90 80-4 11h9" fill="#d99c78" /><path d="M89 93q-15-12-23 0 13 6 23 0m3 0q15-12 23 0-13 6-23 0" fill="#263c32" /><path d="M77 103h27l-5 10H83z" fill="#f6e9cd" /><path d="M83 104v7m8-7v8m7-8v7" strokeWidth="1" />
      {[123,134].map(y=><g key={y}><circle cx="80" cy={y} r="2.5" fill="#f4d78a" /><circle cx="101" cy={y} r="2.5" fill="#f4d78a" /></g>)}
    </g>}
    {character === "grinch" && <g stroke="#294331" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
      <path d="m66 162-2 29-17 10q19 10 37-2l7-34m13 0 3 31q17 13 31 5l-16-12-2-31" fill="#7eaa48" />
      <path d="M71 105q-20 26-13 62 32 15 66-2 4-35-17-60z" fill="#af393c" /><path d="M57 161q34 13 68 0" stroke="#f1e8cd" strokeWidth="11" /><path d="M60 139q33 8 65-2" stroke="#283b32" strokeWidth="8" /><rect x="89" y="133" width="13" height="13" rx="2" fill="#e0bb66" />
      <path d="M70 115q-26 8-28 37l12 7q8-24 27-28m28-15q25 4 27 22l-13 7-18-18" fill="#b64040" /><path d="m43 149 13 7m66-15 13-7" stroke="#eee7ce" strokeWidth="9" /><path d="m42 158-7 13 8-3 2 9 7-13m72-20 8 10 5-7-4-10" fill="#8bb44b" />
      <path d="m63 56-12 7 6 13-8 7 14 6q3 25 29 29 25-2 32-29l13-6-8-9 6-13-16-4z" fill="#89ad48" />
      <path d="M61 58q22-30 61-5L98 28q-9-2-14 4L64 49z" fill="#b43a3e" /><path d="M60 59q31-15 62 0" stroke="#f3ebd4" strokeWidth="12" /><path d="M99 29q17-4 25 10" stroke="#b43a3e" strokeWidth="13" /><circle cx="129" cy="40" r="9" fill="#f3ebd4" />
      <path d="m66 77 19 4-9 10-10-4zm46 0-19 4 9 10 10-4z" fill="#e6c86e" /><path d="m63 74 22 5m30-6-21 6" strokeWidth="4" /><path d="m78 82 2 5m22-5-2 5" strokeWidth="3" /><path d="m90 84-4 10h9" fill="#6c913e" /><path d="M66 94q23 28 49-2M69 95l-7-1m50 0 7-3" /><path d="M76 102q17 8 29-3" stroke="#d1dc8d" strokeWidth="2" />
      <path d="m140 159-26 6-5-26 26-6z" fill="#d0ae66" /><path d="m119 136 5 26m-12-13 26-6" stroke="#9e3839" strokeWidth="5" />
    </g>}
    {character === "elf" && <g stroke="#294336" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
      <path d="m67 161 4 32h15l1-32m10 0 2 32h15l1-32" fill="#f0e0b7" /><path d="m70 171 16-2m-15 12 15-1m13-9h15m-14 10h14" stroke="#af3d3f" strokeWidth="6" /><path d="M70 190q-18-2-25 8 15 13 42 3l-1-11m13 0 1 11q28 10 39-3-10-10-25-8" fill="#a9363b" />
      <path d="M68 104h47l12 59-24-6-14 9-14-9-22 6z" fill="#4f7952" /><path d="m70 106 19 15 23-15" fill="#c14b43" /><path d="M60 146h62" stroke="#243c34" strokeWidth="8" /><rect x="85" y="140" width="15" height="12" rx="2" fill="#e2bf73" />
      <path d="m68 115-22 28 11 10 24-25m30-13 20 26-12 12-22-25" fill="#527d55" /><path d="m46 140 12 10m61 0 12-10" stroke="#e2c582" strokeWidth="8" /><circle cx="51" cy="153" r="7" fill="#e8b58c" /><circle cx="125" cy="151" r="7" fill="#e8b58c" />
      <path d="m63 72-18-9 8 22 13 1m50-13 18-10-7 23-13 1" fill="#e7b388" /><ellipse cx="90" cy="80" rx="29" ry="28" fill="#efc5a1" /><path d="M61 68q-1-24 31-37l26 36z" fill="#4e7b52" /><path d="m84 36 15-23q22 3 27 22-17-12-27 5" fill="#49714a" /><circle cx="130" cy="38" r="6" fill="#d9b56b" /><path d="M60 66h60" stroke="#bd4440" strokeWidth="11" /><path d="m65 71 9 7 5-8m29 2 6 8" fill="#b47c47" /><circle cx="78" cy="82" r="2" fill="#294336" /><circle cx="102" cy="82" r="2" fill="#294336" /><path d="M80 96q11 10 22-1" /><circle cx="68" cy="91" r="4" fill="#d98a75" stroke="none" /><circle cx="112" cy="91" r="4" fill="#d98a75" stroke="none" />
      <rect x="62" y="119" width="57" height="36" rx="2" fill="#d4ac64" /><path d="M59 120h63v9H59z" fill="#e4c27c" /><path d="M90 120v35" stroke="#a7383c" strokeWidth="7" /><path d="M89 119q-24-2-18-13 10-9 19 13 12-23 22-12 5 12-22 12" fill="#ac3e40" />
    </g>}
    {character === "gnome" && <g stroke="#304335" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
      <path d="M58 186q-24 4-23 15 19 10 45 0l1-16m18 0 2 16q29 10 44-1-4-12-25-13" fill="#9e343b" /><path d="M55 112q-22 24-11 75 43 14 86-1 10-48-17-75z" fill="#527552" /><path d="m47 137-15 25 11 9 21-25m53-8 18 24-12 10-19-23" fill="#567e56" /><circle cx="36" cy="169" r="7" fill="#e7b78f" /><circle cx="133" cy="168" r="7" fill="#e7b78f" />
      <path d="M60 95q-8 13-5 38l9-4-4 20 12-4 17 36 19-36 11 5-4-20 9 6q3-26-8-41z" fill="#f1e4c6" /><path d="M77 128q1 22 11 39m15-38-8 24" stroke="#d1c4a3" />
      <path d="M46 99Q47 46 88 9q8 24 31 32-10 2-14 4 25 18 28 54z" fill="#a53a3c" /><path d="M54 92q34-14 70 0" stroke="#c35446" strokeWidth="4" /><path d="m75 37 12-14m-25 46 7-15" stroke="#cf6550" strokeWidth="3" /><ellipse cx="89" cy="107" rx="15" ry="11" fill="#e8b28b" />
      <path d="M140 171v-9q0-9 7-9t7 9v9" /><path d="m137 171 21-1 4 29h-28z" fill="#d2a85c" /><path d="M140 174h14l3 20h-19z" fill="#f2d393" /><path d="m147 177-3 12h7z" fill="#fbe9b2" stroke="none" /><path d="M132 199h32" />
    </g>}
    {character === "snowman" && <g stroke="#3b4b40" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
      <path d="m53 137-22-23-10-1m10 1-2-13m95 34 24-25 14-2m-15 3 3-13" stroke="#896b47" strokeWidth="4" /><ellipse cx="88" cy="163" rx="43" ry="41" fill="#f4ead6" /><ellipse cx="90" cy="155" rx="32" ry="31" fill="#fff4df" stroke="none" /><circle cx="89" cy="108" r="32" fill="#f8edda" /><path d="M58 125q31 14 61-1l-3 15q-27 12-58 0z" fill="#a9363c" /><path d="m101 137 12 2-2 30-15-4z" fill="#b04440" /><path d="m98 154 13 2" stroke="#d1ae62" strokeWidth="4" />
      <path d="M62 74V36h53v38z" fill="#2c423c" /><path d="M62 58h53v12H62z" fill="#b44540" /><path d="M51 75h76" stroke="#263d36" strokeWidth="11" /><path d="m102 59 5-13 6 9 9-7-1 15z" fill="#628652" /><circle cx="113" cy="62" r="4" fill="#c24a42" />
      <circle cx="77" cy="100" r="2.7" fill="#33473d" /><circle cx="99" cy="99" r="2.7" fill="#33473d" /><path d="m89 105 29 6-28 4z" fill="#d59453" /><path d="m76 118 2 1m6 3 2 1m7-1 2-1" strokeWidth="3" /><circle cx="66" cy="111" r="5" fill="#d9aaa0" stroke="none" opacity=".7" /><circle cx="110" cy="113" r="4" fill="#d9aaa0" stroke="none" opacity=".7" />
      {[151,167,182].map(y=><circle key={y} cx="86" cy={y} r="3" fill="#384d41" />)}
      <path d="m132 51 2 6 6 2-6 2-2 6-2-6-6-2 6-2zm-95 91 2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#e9d5a0" stroke="none" />
    </g>}
  </svg>;
}

export default function ChristmasBookingStrip() {
  return <section className="xl-booking-strip xm-wrap" aria-label="Book your Christmas session">
    <div className="xl-booking-panel">
      <div className="xl-decoration" aria-hidden="true">{characters.map(c => <ChristmasCharacter key={c.id} character={c.id} />)}</div>
      <div className="xl-booking-copy"><p className="xm-eyebrow">SANTA INCLUDED · NORTH VANCOUVER</p><h2>30 minutes. Three Christmas sets.</h2><p>10 edited digital photographs · $250 + GST</p></div>
      <a className="xm-button" href="#booking">Choose your time <span aria-hidden="true">↗</span></a>
    </div>
  </section>;
}
