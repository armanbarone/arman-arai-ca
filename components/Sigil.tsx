/**
 * The sigil set.
 *
 * The design handoff shipped exactly one mark, a crescent, and it clipped every
 * time it rendered: the SVG was left `display:inline`, so it sat on the text
 * baseline and whatever wrapper it landed in cropped the bottom. Every mark
 * here is `display:block` with its artwork inset to roughly 4px inside a 48
 * viewBox, so there is nothing near an edge to lose.
 *
 * Six marks, because the work is about land and one moon cannot carry it:
 * crescent, sun, mountains, river, bloom, elder tree. All single colour via
 * `currentColor` so a parent decides whether a mark is read (rose-text) or
 * ghosted (dust).
 */

export type SigilName =
  | "crescent"
  | "sun"
  | "mountains"
  | "river"
  | "bloom"
  | "tree";

export const SIGIL_NAMES: SigilName[] = [
  "crescent",
  "sun",
  "mountains",
  "river",
  "bloom",
  "tree",
];

type Props = {
  name?: SigilName;
  size?: number;
  className?: string;
  /** Marks are decorative by default. Pass a title to expose one to a11y. */
  title?: string;
};

const S = 1.3; // one stroke weight across the set, so no mark reads heavier

function Art({ name }: { name: SigilName }) {
  switch (name) {
    case "crescent":
      return (
        <>
          <path
            d="M18 7a15 15 0 100 30 11.5 15 0 110-30z"
            stroke="currentColor"
            strokeWidth={S}
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
          />
          <path
            d="M35 10l1.5 4.5 4.5 1.5-4.5 1.5L35 22l-1.5-4.5L29 16l4.5-1.5z"
            fill="currentColor"
          />
          <circle cx="41" cy="29" r="1.3" fill="currentColor" />
          <circle cx="31" cy="34" r="1" fill="currentColor" />
        </>
      );

    case "sun":
      return (
        <g stroke="currentColor" strokeWidth={S} vectorEffect="non-scaling-stroke" strokeLinecap="round">
          <circle cx="24" cy="24" r="8" />
          <path d="M36 24h5M24 36v5M12 24H7M24 12V7" />
          <path d="M32.5 32.5l3.5 3.5M15.5 32.5L12 36M15.5 15.5L12 12M32.5 15.5L36 12" />
        </g>
      );

    case "mountains":
      return (
        <g stroke="currentColor" strokeWidth={S} vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 37l14-23 9 13 6-7 11 17" />
          <path d="M13.5 22.5l4.5-8.5 4.5 8.5-4.5-2.2z" />
          <path d="M4 41h40" opacity="0.5" />
        </g>
      );

    case "river":
      return (
        <g stroke="currentColor" strokeWidth={S} vectorEffect="non-scaling-stroke" strokeLinecap="round">
          <path d="M24 5c-7 7 7 11 0 18s7 11 0 18" />
          <path d="M13 15h-4M39 24h4M13 36H9" opacity="0.55" />
        </g>
      );

    case "bloom":
      return (
        <>
          <g stroke="currentColor" strokeWidth={S} vectorEffect="non-scaling-stroke">
            {[0, 72, 144, 216, 288].map((deg) => (
              <ellipse
                key={deg}
                cx="24"
                cy="15"
                rx="4.6"
                ry="8.5"
                transform={`rotate(${deg} 24 24)`}
              />
            ))}
          </g>
          <circle cx="24" cy="24" r="2.6" fill="currentColor" />
        </>
      );

    case "tree":
      return (
        <g stroke="currentColor" strokeWidth={S} vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round">
          <path d="M24 24c-8 0-13-5-13-11S17 4 24 4s13 3 13 9-5 11-13 11z" />
          <path d="M24 43V22" />
          <path d="M24 31c-3-2-5-5-5.5-8M24 35c3-2 5-5 5.5-8" opacity="0.7" />
          <path d="M17 44.5c2.5-2 4.5-2.5 7-2.5s4.5.5 7 2.5" opacity="0.7" />
        </g>
      );
  }
}

export default function Sigil({
  name = "crescent",
  size = 26,
  className,
  title,
}: Props) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      className={className}
      style={{ display: "block", flexShrink: 0 }}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <Art name={name} />
    </svg>
  );
}

/**
 * Hairline, mark, hairline. Replaces the plain 280px rule.
 *
 * `node="ring"` is the bare circle from the reference: a hairline that swells
 * into an O at the centre and carries on. It is the quietest of the set, which
 * is why it is the default for stacking dividers between sections.
 */
export function SigilDivider({
  name,
  node = "sigil",
  size = 26,
  className = "",
}: {
  name?: SigilName;
  node?: "sigil" | "ring";
  size?: number;
  className?: string;
}) {
  return (
    <div className={`dr-divider ${className}`} aria-hidden="true">
      <span className="dr-divider-rule" />
      {node === "ring" ? (
        <span className="dr-divider-ring" />
      ) : (
        <Sigil name={name} size={size} className="dr-divider-mark" />
      )}
      <span className="dr-divider-rule" />
    </div>
  );
}

/**
 * The paired name plate.
 *
 * Left: the name on the map. Right: the name the place already had, or the
 * nations who hold it. Both underlined, same register, so neither reads as a
 * footnote to the other.
 *
 * `held` is deliberately typed as required. A plate with an empty right side is
 * worse than no plate, and two of the four mountain towns have no safely
 * documented place name, so those pass the nations instead.
 */
export function LandPlate({
  placed,
  held,
  note,
}: {
  /** The colonial name, lowercase. */
  placed: string;
  /** The Indigenous name, or the nations. Emphasised. */
  held: string;
  /** Optional qualifier, e.g. which language, or that a name is the mountain's. */
  note?: string;
}) {
  return (
    <div className="dr-plate">
      <SigilDivider node="ring" />
      <div className="dr-plate-row">
        <span className="dr-plate-side dr-plate-left">
          <span className="dr-plate-label">on the map, {placed}</span>
        </span>
        <span className="dr-plate-side dr-plate-right">
          <span className="dr-plate-label">
            held as <strong>{held}</strong>
          </span>
        </span>
      </div>
      {note ? <p className="dr-plate-note">{note}</p> : null}
    </div>
  );
}
