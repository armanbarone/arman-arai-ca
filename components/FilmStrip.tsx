import { FILM_STRIP } from "@/lib/images";
import { at } from "@/lib/images";

/* The 35mm strip that divides the homepage. A server component on purpose: the
 * scroll is a CSS keyframe, so this ships zero JavaScript. Frames are 200x130
 * on screen, so they are requested at 400px and never larger. */
export default function FilmStrip() {
  const frames = [...FILM_STRIP, ...FILM_STRIP]; // duplicated for the seamless loop

  const sprocket = {
    height: "22px",
    background: "#141210",
    backgroundImage:
      "repeating-linear-gradient(90deg, transparent 0px, transparent 10px, #080704 10px, #080704 22px, transparent 22px, transparent 32px)",
    backgroundSize: "32px 100%",
    position: "relative" as const,
    zIndex: 2,
  };

  return (
    <div style={{ background: "#141210", overflow: "hidden", position: "relative", userSelect: "none" }} aria-hidden>
      <div style={sprocket} />

      <div className="film-strip-track">
        {frames.map((frame, i) => (
          <div key={i} className="film-frame" style={{ background: "#0A0806", position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={at(frame.src, 400)}
              alt=""
              aria-hidden
              draggable={false}
              loading="lazy"
              decoding="async"
              width={200}
              height={130}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                pointerEvents: "none",
                userSelect: "none",
                filter: "sepia(0.18) contrast(0.9) brightness(0.88)",
              }}
            />
            <div className="film-frame-scanline" />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(ellipse at center, transparent 40%, rgba(8,7,4,0.55) 100%)",
                pointerEvents: "none",
                zIndex: 2,
              }}
            />
            {frame.label && <div className="film-frame-label">{frame.label}</div>}
          </div>
        ))}
      </div>

      <div style={sprocket} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: "linear-gradient(to right, #141210 0%, transparent 8%, transparent 92%, #141210 100%)",
          zIndex: 3,
        }}
      />
    </div>
  );
}
