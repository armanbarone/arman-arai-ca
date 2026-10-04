import Link from "next/link";
import type { Booking } from "@/lib/portal/types";
import { weddingData, visibleDocuments } from "@/lib/portal/wedding";
import { Card, Eyebrow, buttonCls } from "./Shell";
import { formatDate } from "@/lib/portal/money";
export default function WeddingDelivery({
  booking: b,
  preview = false,
}: {
  booking: Booking;
  preview?: boolean;
}) {
  const w = weddingData(b),
    docs = visibleDocuments(b).filter((d) =>
      ["album", "delivery"].includes(d.templateKey),
    ),
    safe = (url?: string) => {
      try {
        return !!url && new URL(url).protocol === "https:" ? url : undefined;
      } catch {
        return undefined;
      }
    };
  const gallery = safe(w.galleryUrl),
    films = safe(w.filmUrl);
  return (
    <>
      <Eyebrow>Your wedding story</Eyebrow>
      <h1>Photos & films</h1>
      <p className="wp-lead">
        Your finished photographs, films and album approvals live here.
      </p>
      <div style={{ marginTop: 30 }} className="wp-doc-grid">
        <Card>
          <h2>Your photographs</h2>
          <p style={{ margin: "15px 0 20px" }}>
            {gallery
              ? "Your gallery is ready. Download the high resolution set and keep two copies."
              : "Your gallery will appear here when it is ready. Your signed agreement contains the delivery dates."}
          </p>
          {gallery && (
            <a
              className={buttonCls}
              href={gallery}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open your gallery ↗
            </a>
          )}
          {w.galleryExpires && (
            <p style={{ marginTop: 15 }}>
              Access expires {formatDate(w.galleryExpires)}.
            </p>
          )}
        </Card>
        <Card>
          <h2>Your films</h2>
          <p style={{ margin: "15px 0 20px" }}>
            {films
              ? "Download every film and verify that it plays correctly."
              : "If your agreement includes films, your private download link will appear here."}
          </p>
          {films && (
            <a
              className={buttonCls}
              href={films}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open your films ↗
            </a>
          )}
        </Card>
        {docs.map((d) => (
          <Card key={d.id}>
            <h2>{d.title}</h2>
            <p style={{ margin: "15px 0 20px" }}>
              Review the exact delivery or proof version and record your
              approval.
            </p>
            <Link
              className={buttonCls}
              href={`${preview ? "/portal/preview" : `/portal/${b.ref}`}/documents/${d.id}`}
            >
              Review →
            </Link>
          </Card>
        ))}
      </div>
    </>
  );
}
