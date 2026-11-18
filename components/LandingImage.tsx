import Image from "next/image";
import type { ComponentPropsWithoutRef } from "react";
import cloudflareLoader from "@/cloudflareLoader";

export const LANDING_MOBILE_WIDTH = 640;
export const LANDING_DESKTOP_WIDTH = 1200;
export const LANDING_MOBILE_MEDIA = "(max-width: 760px)";

type LandingImageProps = Omit<ComponentPropsWithoutRef<"img">, "src" | "srcSet" | "alt" | "width" | "height"> & {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  twoSizes?: boolean;
};

export default function LandingImage({ twoSizes, ...props }: LandingImageProps) {
  if (!twoSizes) return <Image {...props} />;

  const { src, quality, sizes, fill, priority, fetchPriority, loading, width, height, style, ...imageProps } = props;

  return (
    <picture style={{ display: "contents" }}>
      <source media={LANDING_MOBILE_MEDIA} srcSet={cloudflareLoader({ src, width: LANDING_MOBILE_WIDTH, quality })} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...imageProps}
        src={cloudflareLoader({ src, width: LANDING_DESKTOP_WIDTH, quality })}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        style={fill ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...style } : style}
        loading={priority ? "eager" : loading ?? "lazy"}
        fetchPriority={priority ? "high" : fetchPriority}
        decoding="async"
      />
    </picture>
  );
}
