"use client";

import Image from "next/image";
import { useState } from "react";
import InquireButton from "@/components/InquireButton";
import Lightbox from "@/components/Lightbox";

// Updated images — all new
const HERO_IMG = "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003e06a3dd25aa2af1de54.png";
const SWAPPED  = "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003ca7939c0e5f200db414.png";

const DEST_GRID = [
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003d68939c0e5f200dc62e.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003d68939c0e5f200dc62d.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003d68f8231fbf0b19f067.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003d68939c0e5f200dc630.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a00e5c643d11507db66bb3d.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003d68f8231fbf0b19f06b.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a00dff1a3dd25aa2a06da33.png", // pic 7 — updated
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003d68f8231fbf0b19f068.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a0046020f3ad81fbdf1f1ea.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003d68939c0e5f200dc62f.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003d68a3dd25aa2af1ceaa.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003d680f3ad81fbdf13134.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003d68f8231fbf0b19f069.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003d68bc1f77cc35528315.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003c67bc1f77cc35526a43.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003ee30f3ad81fbdf15432.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a00dfaa43d11507db65cc4c.png", // new
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a00df73939c0e5f2022ab7b.png", // new
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a00def9bc1f77cc35676caf.png", // new
];

// All clickable images (hero + swapped + grid)
const ALL_IMGS = [HERO_IMG, SWAPPED, ...DEST_GRID];

const faqs = [
  { q:"What makes a destination wedding different from a local one?", a:"Everything. The light is unfamiliar, the architecture carries centuries, the landscape doesn't look like anything from your daily life. A destination wedding is not just a wedding in a beautiful place. It is a ceremony shaped by that place: the smell of the air, the color of the stone, the particular gold of the light at that latitude. When I photograph a destination wedding, I treat the location as a character, not a backdrop." },
  { q:"Why hire a dedicated destination wedding photographer?", a:"Because most local photographers in destination cities are generalists. They know the spots. I know the light. I arrive early, scout on foot, find the corner of the courtyard that catches the afternoon sun at exactly the right angle, the hallway that turns golden at 6pm, the terrace that nobody else is using. A destination wedding requires someone who treats every location as if they've never photographed there before: with the eye of an explorer and the patience of a documentarian." },
  { q:"Do you travel internationally?", a:"Always. I am based between Medellín and Vancouver and regularly photograph weddings in Colombia, Mexico, Canada, the UAE, Italy, Spain, and beyond. Travel is included in all destination proposals. I build every quote around the specific location and logistical context of your wedding." },
  { q:"How far in advance should we book?", a:"For destination weddings, I recommend 12 to 18 months in advance. I accept a limited number of destination commissions per year. The earlier you reach out, the more time we have to plan coverage that truly honors the scale and complexity of your day." },
  { q:"Will you do a site visit before the wedding?", a:"For multi-day destination weddings and particularly complex locations, a pre-wedding site visit is part of my process. For most destination weddings, I arrive at least one full day early, spend time scouting, and build a light and movement plan before your day begins." },
  { q:"Do you shoot film as well as digital?", a:"Yes. I work with both 35mm film and medium format film alongside digital. Film adds something irreplaceable to destination weddings: a grain, a softness, a quality of light that feels closer to memory than documentation. Film integration is available for all destination commissions." },
  { q:"What is your editing style for destination weddings?", a:"Cinematic and location-aware. I edit to honor the actual light of the place: the warmth of a Cartagena afternoon, the blue-hour cool of a Montréal winter, the particular green of Colombian jungle light. I never apply a generic preset. Every gallery is graded to the specific color world of your wedding." },
  { q:"How does pricing work for destination weddings?", a:"Every destination wedding is quoted individually based on location, coverage duration, travel logistics, and scope. Wedding photography collections begin at $8,000, with most destination couples investing between $10,000 and $18,000 for full weekend coverage. Custom proposals are created after a conversation about the scale and rhythm of your wedding." },
];

export default function Destination() {
  const [lb, setLb] = useState<{ open: boolean; idx: number }>({ open: false, idx: 0 });
  const openLB = (idx: number) => setLb({ open: true, idx });

  return (
    <>
      {lb.open && (
        <Lightbox
          images={ALL_IMGS}
          current={lb.idx}
          onClose={() => setLb({ open: false, idx: 0 })}
          onPrev={() => setLb(l => ({ ...l, idx: Math.max(0, l.idx - 1) }))}
          onNext={() => setLb(l => ({ ...l, idx: Math.min(ALL_IMGS.length - 1, l.idx + 1) }))}
        />
      )}
      {/* ── HEADER ── */}
      <section className="pt-36 md:pt-40 pb-16 md:pb-20 bg-ivory text-cream relative overflow-hidden">
        <div
          className="absolute right-4 top-6 font-script pointer-events-none select-none"
          style={{ fontSize:"clamp(5rem,14vw,16rem)", opacity:0.05, lineHeight:1, color:"#C9A89A" }}
          aria-hidden
        >Destination</div>
        <div className="page-w page-px relative z-10">
          <p className="text-[0.6rem] tracking-[0.32em] uppercase text-blush mb-4">Photography Beyond Borders</p>
          <h1 className="font-serif font-light leading-tight" style={{ fontSize:"clamp(2.8rem,5vw,5rem)", color:"#FAF7F2" }}>
            Your location is<br />
            not the <em className="italic text-rose">backdrop.</em><br />
            It is the story.
          </h1>
        </div>
      </section>

      {/* ── HERO IMAGE ── */}
      <div className="relative w-full cursor-pointer" style={{ height:"clamp(280px,50vw,600px)" }}
           onClick={() => openLB(0)}>
        <Image src={HERO_IMG} alt="Destination wedding photography" fill className="object-cover" sizes="100vw" priority />
      </div>

      {/* ── STORYTELLING ── */}
      <section className="bg-parchment py-16 md:py-24">
        <div className="page-w page-px">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            <div>
              <p className="text-[0.6rem] tracking-[0.32em] uppercase text-blush mb-4">The difference</p>
              <h2 className="font-serif font-light text-cream mb-6" style={{ fontSize:"clamp(1.8rem,3vw,3rem)" }}>
                What makes a destination wedding <em className="italic text-rose">extraordinary</em>
              </h2>
              <p className="text-slate text-sm leading-relaxed mb-5">
                A destination wedding is not simply a wedding held somewhere beautiful. It is a ceremony shaped by place: the particular warmth of that latitude, the texture of stone that has stood for centuries, the color of light at 6pm in a city you love but do not live in.
              </p>
              <p className="text-slate text-sm leading-relaxed mb-5">
                When you choose to marry somewhere that matters, you are saying something about who you are. You are choosing meaning over convenience, beauty over familiarity, and experience over tradition. That choice deserves a photographer who treats your location with the same intention you did when you chose it.
              </p>
              <p className="text-slate text-sm leading-relaxed">
                I arrive early. I scout on foot. I find the hallway that turns golden at late afternoon, the courtyard no one else is using, the rooftop where the city spreads out behind you like a painting. I build a light and movement plan for your day before your day begins.
              </p>
            </div>
            <div className="relative overflow-hidden cursor-pointer" style={{ height:"clamp(300px,45vw,500px)" }}
                 onClick={() => openLB(1)}>
              <Image src={SWAPPED} alt="Destination wedding" fill className="object-cover" sizes="(max-width:1023px) 100vw, 45vw" />
            </div>
          </div>
        </div>
      </section>

      {/* ── NEW IMAGES GRID ── */}
      <section className="bg-ivory py-4 px-2 md:px-4">
        <div className="page-w mx-auto">
          {/* First row: 3 images */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 mb-1">
            {DEST_GRID.slice(0,3).map((src, i) => (
              <div key={i} className="relative overflow-hidden cursor-pointer" style={{ height:"clamp(200px,28vw,360px)" }}
                   onClick={() => openLB(i + 2)}>
                <Image src={src} alt={`Destination wedding ${i+1}`} fill className="object-cover hover:scale-[1.03] transition-transform duration-700" sizes="(max-width:768px) 100vw, 33vw" />
              </div>
            ))}
          </div>
          {/* Second row: 2 wide + 1 */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-1 mb-1">
            <div className="md:col-span-3 relative overflow-hidden cursor-pointer" style={{ height:"clamp(200px,30vw,380px)" }}
                 onClick={() => openLB(5)}>
              <Image src={DEST_GRID[3]} alt="Destination wedding 4" fill className="object-cover hover:scale-[1.03] transition-transform duration-700" sizes="(max-width:768px) 100vw, 60vw" />
            </div>
            <div className="md:col-span-2 relative overflow-hidden cursor-pointer" style={{ height:"clamp(200px,30vw,380px)" }}
                 onClick={() => openLB(6)}>
              <Image src={DEST_GRID[4]} alt="Destination wedding 5" fill className="object-cover hover:scale-[1.03] transition-transform duration-700" sizes="(max-width:768px) 100vw, 40vw" />
            </div>
          </div>
          {/* Third row: 3 images */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 mb-1">
            {DEST_GRID.slice(5,8).map((src, i) => (
              <div key={i} className="relative overflow-hidden cursor-pointer" style={{ height:"clamp(200px,28vw,360px)" }}
                   onClick={() => openLB(i + 7)}>
                <Image src={src} alt={`Destination wedding ${i+6}`} fill className="object-cover hover:scale-[1.03] transition-transform duration-700" sizes="(max-width:768px) 100vw, 33vw" />
              </div>
            ))}
          </div>
          {/* Final grid: remaining images */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 mt-1">
            {DEST_GRID.slice(8).map((src, i) => (
              <div key={i} className="relative overflow-hidden cursor-pointer" style={{ height:"clamp(200px,28vw,360px)" }}
                   onClick={() => openLB(i + 10)}>
                <Image src={src} alt={`Wedding moment ${i+1}`} fill className="object-cover hover:scale-[1.03] transition-transform duration-700" sizes="(max-width:768px) 100vw, 33vw" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHERE I GO ── */}
      <section className="bg-parchment py-16 md:py-20">
        <div className="page-w page-px">
          <div className="text-center mb-10 md:mb-12">
            <p className="text-[0.6rem] tracking-[0.32em] uppercase text-blush mb-4">Where I go</p>
            <h2 className="font-serif font-light text-cream" style={{ fontSize:"clamp(1.8rem,3vw,3rem)" }}>
              Home is wherever <em className="italic text-rose">you are</em>
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-px bg-parchment/40">
            {[
              { place:"Medellín", note:"Colombia" }, { place:"Cartagena", note:"Colombia" }, { place:"Bogotá", note:"Colombia" }, { place:"Vancouver", note:"Canada" },
              { place:"Toronto", note:"Canada" }, { place:"Montréal", note:"Canada" }, { place:"Los Cabos", note:"Mexico" }, { place:"Buenos Aires", note:"Argentina" },
              { place:"Dubai", note:"UAE" }, { place:"Tuscany", note:"Italy" }, { place:"Andalusia", note:"Spain" }, { place:"Everywhere", note:"Destination" },
            ].map(({ place, note }) => (
              <div key={place} className="bg-ivory px-4 py-6 md:px-6 md:py-8">
                <p className="font-serif font-light text-cream text-base md:text-lg">{place}</p>
                <p className="text-[0.62rem] tracking-wider text-slate mt-0.5">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-parchment py-16 md:py-24">
        <div className="page-w page-px">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-[0.6rem] tracking-[0.32em] uppercase text-blush mb-4">Common questions</p>
            <h2 className="font-serif font-light text-cream" style={{ fontSize:"clamp(1.8rem,3vw,3rem)" }}>
              Everything you want to <em className="italic text-rose">know</em>
            </h2>
          </div>
          <div className="max-w-2xl mx-auto space-y-8 md:space-y-10">
            {faqs.map(({ q, a }) => (
              <div key={q} className="border-b border-dust pb-8 md:pb-10">
                <h3 className="font-serif font-light text-cream mb-3" style={{ fontSize:"1.15rem" }}>{q}</h3>
                <p className="text-slate text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-parchment py-16 md:py-24 text-center">
        <div className="page-w page-px">
          <p className="text-[0.6rem] tracking-[0.32em] uppercase text-blush mb-5">Begin here</p>
          <h2 className="font-serif font-light mb-8" style={{ fontSize:"clamp(2rem,3vw,3rem)", color:"#FAF7F2" }}>
            Tell me where in the world <em className="italic text-rose">you&rsquo;re getting married</em>
          </h2>
          <InquireButton className="inline-block bg-rose text-cream text-[0.62rem] tracking-[0.2em] uppercase px-10 py-4 hover:bg-rose-dark transition-colors duration-300 cursor-pointer border-none">
            Inquire for Availability
          </InquireButton>
        </div>
      </section>
    </>
  );
}
