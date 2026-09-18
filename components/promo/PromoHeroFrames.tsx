"use client";

import HeroCycler from "@/components/home/HeroCycler";

/* ────────────────────────────────────────────────────────────────────────────
   The homepage's rotating hero, on a landing page.

   It reuses HeroCycler rather than reimplementing it, so all three frames ride
   the same module-level conveyor: the big frame's photograph leaves, the second
   moves into it, the third moves into the second, and a new one enters the
   third. One clock, one beat, nothing random.

   ── One DOM tree, not two ─────────────────────────────────────────────────

   This renders a single tree and changes the layout with grid-template-areas.
   The obvious alternative, a phone layout and a desktop layout side by side
   with CSS hiding one, is a performance trap: both are real <img> elements, so
   a phone downloads every hero photograph in both trees to show three of them.

   ── Why `sizes` is written the way it is ──────────────────────────────────

   object-cover scales an image until it covers its frame, and these albums are
   mixed orientation, so the width a photograph actually renders at is
   max(frameWidth, frameHeight x itsAspectRatio). `sizes` has to describe that
   or landscape frames arrive at half the resolution they are drawn at.

   The lead frame is deliberately landscape on a phone. In a portrait frame a
   3:2 photograph has to be scaled to the frame's height, which means asking for
   a 1200px file to fill a 412px box; landscape, the same photograph covers at
   the frame's own width, so an honest `sizes` is 100vw and the file drops back
   to the 800px rung. Sharpness is unchanged, because nothing is upscaled
   either way.

   This site's HeroCycler takes one focal point per frame rather than one per
   photograph, and carries no blur placeholders. Both are deliberate on the
   homepage and neither is worth forking the component for here.
   ──────────────────────────────────────────────────────────────────────────── */

export default function PromoHeroFrames({
  pool,
  alts,
  threeUp,
  startDelayMs = 9000,
}: {
  pool: string[];
  alts: string[];
  /** Held back so the conveyor never becomes the measured LCP. See HeroCycler. */
  startDelayMs?: number;
  /**
   * Show all three frames on a phone instead of the lead one alone.
   *
   * The default is one, because three photographs competing for a slow mobile
   * connection is what puts a hero like this two seconds behind a single-
   * photograph page. Only turn it on where the frames are sized for the 400px
   * rung.
   */
  threeUp?: boolean;
}) {
  const alt = (i: number) => alts[i] ?? "A Canadian wedding photographed by Arman Arai";

  return (
    <div className={threeUp ? "fc-hf fc-hf-3up" : "fc-hf"}>
      <div className="fc-hf-a">
        <HeroCycler
          pool={pool}
          position={0}
          alt={alt(0)}
          sizes="(max-width: 1023px) 100vw, 60vw"
          priority
          objectPosition="center 42%"
          startDelayMs={startDelayMs}
        />
      </div>
      <div className="fc-hf-b">
        <HeroCycler pool={pool} position={1} alt={alt(1)} sizes="(max-width: 1023px) 50vw, 42vw" startDelayMs={startDelayMs} />
      </div>
      <div className="fc-hf-c">
        <HeroCycler pool={pool} position={2} alt={alt(2)} sizes="(max-width: 1023px) 50vw, 42vw" startDelayMs={startDelayMs} />
      </div>
    </div>
  );
}
