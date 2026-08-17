"use client";

import { ReactNode, CSSProperties } from "react";
import { useLightbox } from "./LightboxProvider";

/**
 * Thin clickable wrapper. The children (a server-rendered <Image> plus caption)
 * are passed straight through, so only this tiny click handler hydrates; the
 * image itself paints from server HTML.
 */
export default function LightboxTrigger({
  images,
  index,
  className,
  style,
  children,
}: {
  images: string[];
  index: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const { open } = useLightbox();
  return (
    <div className={className} style={{ cursor: "pointer", ...style }} onClick={() => open(images, index)}>
      {children}
    </div>
  );
}
