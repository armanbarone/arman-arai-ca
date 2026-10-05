export const MAX_WEDDING_IMAGE_BYTES = 3 * 1024 * 1024;
export const MAX_MOODBOARD_IMAGES = 24;
export const IMAGE_KINDS = ["portrait-1", "portrait-2", "moodboard"] as const;
export function validateWeddingImage(bytes: Uint8Array, declaredType: string) {
  if (bytes.length < 24 || bytes.length > MAX_WEDDING_IMAGE_BYTES)
    throw new Error("Choose an image up to 3 MB.");
  const b = Buffer.from(bytes);
  const type =
    b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff
      ? "image/jpeg"
      : b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
        ? "image/png"
        : b.subarray(0, 4).toString() === "RIFF" &&
            b.subarray(8, 12).toString() === "WEBP"
          ? "image/webp"
          : "";
  if (!type || (declaredType && declaredType !== type))
    throw new Error("Upload a JPG, PNG or WebP image.");
  return type;
}
