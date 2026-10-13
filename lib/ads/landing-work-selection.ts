import type { Photo } from "../images";

// The existing first-photo omission applies before any album ordering.
// Vancouver's former displayed frames 06 and 12 are identified by filename,
// so future source ordering cannot remove a different photograph by mistake.
const VANCOUVER_REMOVED = new Set(["vancouver-new-08.webp", "vancouver-new-05.webp"]);
const VANCOUVER_OPENING = ["vancouver-new-15.webp", "vancouver-new-01.webp"];
const filename = (photo: Photo) => photo.src.slice(photo.src.lastIndexOf("/") + 1);

export function landingWorkPhotos<T extends Photo>(city: string, source: T[]): T[] {
  const photos = source.slice(1);
  if (city !== "vancouver") return photos;
  const remaining = photos.filter((photo) => !VANCOUVER_REMOVED.has(filename(photo)));
  const opening = VANCOUVER_OPENING.map((name) => {
    const photo = remaining.find((item) => filename(item) === name);
    if (!photo) throw new Error(`Missing Vancouver album opening: ${name}`);
    return photo;
  });
  return [...opening, ...remaining.filter((photo) => !VANCOUVER_OPENING.includes(filename(photo)))];
}
