/* A looping video clip for the galleries page.
 *
 * SERVER COMPONENT ON PURPOSE. A muted autoplaying loop needs no JavaScript at
 * all, so this ships zero bytes of client bundle. Do not add "use client", do
 * not add an IntersectionObserver: the browser already defers autoplay for
 * offscreen video, and `preload="none"` means nothing but the poster is
 * fetched until the clip is actually on screen.
 *
 * Its CSS lives here rather than in globals.css. Both sites run
 * `experimental.inlineCss`, which inlines the whole stylesheet into every
 * page's HTML, so a rule added to globals.css is paid for on every route.
 * A <style> in this component is only present in the HTML of pages that
 * actually render a clip.
 *
 * Why video and not GIF: an 8 MB GIF is roughly three times the weight of this
 * site's entire homepage and decodes on the main thread. The same loop as
 * WebM/MP4 is 200-600 KB and decodes on the GPU.
 */

const CDN = "https://cdn.armanarai.ca";

export type ClipSpec = {
  /** Object key in the `canadian-wedding` bucket, e.g. "clips/noor-kenji.webm". */
  webm: string;
  /** Optional H.264 fallback for older Safari. Same folder, .mp4. */
  mp4?: string;
  /** An image key to show before the video loads. Transformed, so keep it real. */
  poster: string;
  /** Described for a screen reader and printed under the clip. */
  label: string;
  /** CSS aspect-ratio. Reserve the right box or the page shifts when it loads. */
  ratio?: string;
};

const posterUrl = (key: string, width = 1200) =>
  `${CDN}/cdn-cgi/image/format=auto,quality=76,width=${width},fit=scale-down/${key}`;

export default function Clip({
  webm,
  mp4,
  poster,
  label,
  ratio = "16 / 9",
}: ClipSpec) {
  return (
    <figure className="clip">
      <style>{CSS}</style>
      <video
        className="clip-video"
        style={{ aspectRatio: ratio }}
        poster={posterUrl(poster)}
        aria-label={label}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        disablePictureInPicture
      >
        <source src={`${CDN}/${webm}`} type="video/webm" />
        {mp4 && <source src={`${CDN}/${mp4}`} type="video/mp4" />}
      </video>
      <figcaption className="clip-cap">{label}</figcaption>
    </figure>
  );
}

const CSS = `
.clip { margin: 0; }
.clip-video {
  display: block; width: 100%; height: auto;
  object-fit: cover; background: #050403;
  border: 0.5px solid #221d17;
}
.clip-cap {
  font-family: var(--font-jost), sans-serif; font-size: 0.6rem;
  letter-spacing: 0.22em; text-transform: uppercase; color: #857060;
  margin-top: 0.8rem;
}
@media (prefers-reduced-motion: reduce) {
  /* The poster stays; the motion does not. */
  .clip-video { animation: none; }
}
`;
