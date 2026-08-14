import type { ClipSpec } from "@/components/Clip";

/* Looping clips shown on /galleries, keyed by gallery slug.
 *
 * This map is EMPTY on purpose. Until a real .webm exists in R2, the galleries
 * page renders no clip section at all, which means this feature currently costs
 * both sites exactly nothing.
 *
 * To add one:
 *
 *   1. Export a short silent loop, 6-12 seconds, no audio track.
 *      WebM/VP9 at ~1280px wide, target 200-600 KB:
 *        ffmpeg -i in.mov -an -c:v libvpx-vp9 -b:v 0 -crf 34 -vf scale=1280:-2 out.webm
 *      Optional MP4/H.264 fallback for older Safari:
 *        ffmpeg -i in.mov -an -c:v libx264 -crf 26 -vf scale=1280:-2 -movflags +faststart out.mp4
 *
 *   2. Upload to the `canadian-wedding` bucket under clips/, with the right
 *      content type or the browser will refuse to play it:
 *        ContentType "video/webm" (or "video/mp4")
 *        CacheControl "public, max-age=31536000, immutable"
 *
 *   3. Add an entry below. `poster` is an existing image key in the same
 *      bucket; it gets Cloudflare-transformed, so point it at a real still.
 *
 *   4. Check the size you actually shipped:
 *        curl -sI -A "Mozilla/5.0" https://cdn.armanarai.ca/clips/<name>.webm
 *      Anything over about 1 MB, re-encode. That is the whole point of this.
 */

export const CLIPS: Record<string, ClipSpec> = {
  // "anastasia-daniil": {
  //   webm: "clips/anastasia-daniil.webm",
  //   mp4: "clips/anastasia-daniil.mp4",
  //   poster: "galleries/anastasia-daniil/6a13d548b3e0c02fe7eb9fb3.png",
  //   label: "Anastasia & Daniil — the first dance",
  //   ratio: "16 / 9",
  // },
};

export const hasClips = Object.keys(CLIPS).length > 0;
