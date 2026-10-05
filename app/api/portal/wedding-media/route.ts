import sharp from "sharp";
import { requireBookingAccess } from "@/lib/portal/auth";
import { readFile, writeFile, updateBooking, remove } from "@/lib/portal/store";
import { ensureWedding, type WeddingMedia } from "@/lib/portal/wedding";
import { randomId } from "@/lib/portal/token";
import {
  IMAGE_KINDS,
  MAX_MOODBOARD_IMAGES,
  MAX_WEDDING_IMAGE_BYTES,
  validateWeddingImage,
} from "@/lib/portal/wedding-media";
export const runtime = "nodejs";
export async function GET(req: Request) {
  const url = new URL(req.url),
    ref = url.searchParams.get("ref") || "",
    id = url.searchParams.get("id");
  const { booking } = await requireBookingAccess(ref);
  const image = booking.wedding?.media?.find(
    (m) => m.id === id && !m.removedAt,
  );
  if (!image) return new Response("Not found", { status: 404 });
  const file = await readFile(image.key);
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(file.stream, {
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
    },
  });
}
export async function POST(req: Request) {
  const url = new URL(req.url),
    ref = url.searchParams.get("ref") || "";
  const origin = req.headers.get("origin");
  let sameOrigin = false;
  try {
    sameOrigin = !!origin && new URL(origin).origin === url.origin;
  } catch {}
  if (!sameOrigin)
    return Response.json(
      { error: "Upload from your wedding portal." },
      { status: 403 },
    );
  if (
    Number(req.headers.get("content-length") || 0) >
    MAX_WEDDING_IMAGE_BYTES + 100_000
  )
    return Response.json(
      { error: "Choose an image up to 3 MB." },
      { status: 413 },
    );
  const { booking, session } = await requireBookingAccess(ref);
  let createdKey = "";
  try {
    if (booking.status === "cancelled")
      throw new Error("Contact Arman before updating a cancelled booking.");
    const reader = req.body?.getReader(),
      chunks: Uint8Array[] = [];
    let size = 0;
    if (!reader) throw new Error("Choose a photo.");
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > MAX_WEDDING_IMAGE_BYTES + 100_000) {
        await reader.cancel();
        return Response.json(
          { error: "Choose an image up to 3 MB." },
          { status: 413 },
        );
      }
      chunks.push(value);
    }
    const safeRequest = new Request(req.url, {
      method: "POST",
      headers: { "Content-Type": req.headers.get("content-type") || "" },
      body: Buffer.concat(chunks),
    });
    const body = await safeRequest.formData(),
      file = body.get("file"),
      kind = body.get("kind"),
      caption = body.get("caption") || "";
    if (
      !(file instanceof File) ||
      typeof kind !== "string" ||
      !IMAGE_KINDS.includes(kind as (typeof IMAGE_KINDS)[number]) ||
      typeof caption !== "string" ||
      caption.length > 500
    )
      throw new Error("Choose a photo and a short caption.");
    if (file.size > MAX_WEDDING_IMAGE_BYTES)
      throw new Error("Choose an image up to 3 MB.");
    const input = new Uint8Array(await file.arrayBuffer());
    validateWeddingImage(input, file.type);
    const pipeline = sharp(input, { limitInputPixels: 60_000_000 }),
      metadata = await pipeline.metadata();
    if ((metadata.pages || 1) > 1)
      throw new Error("Choose a still photograph.");
    // Re-encoding strips location/device metadata and prevents active or disguised uploads.
    const bytes = await pipeline
      .rotate()
      .resize({
        width: 2000,
        height: 2000,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 88 })
      .toBuffer();
    const id = randomId(16),
      at = new Date().toISOString();
    createdKey = `wedding-media/${ref}/${id}.webp`;
    await writeFile(createdKey, bytes, "image/webp");
    const image: WeddingMedia = {
      id,
      key: createdKey,
      kind: kind as WeddingMedia["kind"],
      contentType: "image/webp",
      caption: caption.trim(),
      createdAt: at,
      uploadedBy: session.email,
    };
    await updateBooking(ref, (b) => {
      if (
        b.status === "cancelled" ||
        (session.role !== "admin" &&
          !b.clients.some((c) => c.email === session.email))
      )
        throw new Error("Booking access changed. Reload before uploading.");
      const w = ensureWedding(b),
        media = (w.media ??= []);
      if (
        kind === "moodboard" &&
        media.filter((m) => m.kind === kind && !m.removedAt).length >=
          MAX_MOODBOARD_IMAGES
      )
        throw new Error(
          "Your moodboard has 24 images. Remove one before adding another.",
        );
      if (kind !== "moodboard")
        for (const old of media)
          if (old.kind === kind && !old.removedAt) old.removedAt = at;
      media.push(image);
      b.events.push({
        at,
        type: "wedding_image_uploaded",
        actor: session.email,
        detail: { id, kind },
      });
    });
    return Response.json(
      { image: { ...image, key: "" } },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (e) {
    if (createdKey) {
      try {
        await remove(createdKey);
      } catch {
        /* A private unattached file can be cleaned up later. */
      }
    }
    return Response.json(
      {
        error:
          e instanceof Error &&
          /Choose|Upload|Contact|Reload|Booking access|moodboard|still photograph/.test(
            e.message,
          )
            ? e.message
            : "This image could not be uploaded. Try a different JPG, PNG or WebP.",
      },
      { status: 400 },
    );
  }
}
