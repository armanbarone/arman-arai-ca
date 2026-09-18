"use client";

import { useEffect, useState } from "react";
import InquireButton from "@/components/InquireButton";

const IN = "#e8dfd0";
const AC = "#B8956A";
const DIM = "rgba(232,223,208,.42)";

/**
 * The mobile price bar.
 *
 * It used to be pinned from the first paint, which meant the very first thing
 * a phone showed was a hero full of type with a call-to-action already covering
 * the bottom of it. It now waits until the hero is behind you, so the opening
 * frame is the photograph and the price, and the bar arrives once you have
 * started reading.
 */
export default function PromoStickyBar({
  price,
  strikethrough,
  badge,
}: {
  price: string;
  strikethrough?: string;
  badge?: string;
}) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Roughly one screen: past the hero, into the film strip or the timeline.
      setShown(window.scrollY > window.innerHeight * 0.85);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="fc-sticky"
      data-shown={shown ? "1" : "0"}
      style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 50,
        background: "rgba(8,7,4,.97)", borderTop: `1px solid rgba(184,149,106,.42)`,
        padding: "0.7rem 0.9rem", alignItems: "center", justifyContent: "space-between", gap: "0.7rem",
        backdropFilter: "blur(8px)",
        transform: shown ? "translateY(0)" : "translateY(110%)",
        transition: "transform .28s ease",
      }}
    >
      <div style={{ fontFamily: "var(--font-jost)", minWidth: 0, flex: "1 1 auto" }}>
        <div style={{ color: IN, fontSize: "1rem", fontWeight: 500, whiteSpace: "nowrap" }}>
          {price}
          {strikethrough && <s style={{ color: DIM, fontSize: "0.78rem", marginLeft: "0.4rem" }}>{strikethrough}</s>}
        </div>
        {badge && (
          // One line, always. The hero badge is a full marketing sentence on
          // some pages, and letting it wrap turned this bar into three lines
          // that squeezed the button down to nothing.
          <div style={{
            color: AC, fontSize: "0.56rem", letterSpacing: "0.14em", textTransform: "uppercase",
            marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {badge}
          </div>
        )}
      </div>
      <InquireButton
        style={{
          background: AC, color: "#080704", padding: "0.9rem 1.5rem", fontSize: "0.62rem",
          letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "var(--font-jost)",
          border: "none", cursor: "pointer", whiteSpace: "nowrap", fontWeight: 600, flex: "0 0 auto",
        }}
      >
        Start the conversation
      </InquireButton>
    </div>
  );
}
