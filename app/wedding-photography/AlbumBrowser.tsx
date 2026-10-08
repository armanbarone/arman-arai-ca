"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { isPublicTrackingPath } from "@/lib/analytics";
import styles from "./vancouver.module.css";

const PortfolioBook = dynamic(() => import("./PortfolioBook"), { ssr: false });

type AlbumPhoto = { src: string; alt: string; width?: number; height?: number };
export type LandingAlbum = {
  id: string;
  title: string;
  subtitle: string;
  description?: string;
  bookSubtitle?: string;
  bookFormat?: "portrait" | "wide";
  cover: AlbumPhoto;
  chapters: { title: string; photos: AlbumPhoto[] }[];
};

/** Images inside each album are mounted when it opens, so the initial page
 * loads the covers alone. */
export default function AlbumBrowser({ albums, label, compact = false, inquiryAction, classes = styles, imageQuality = 68, viewer = "photos", badgeLabel = "View full album" }: { albums: LandingAlbum[]; label: string; compact?: boolean; inquiryAction?: { id: string; label: string; headingId?: string }; classes?: Record<string, string>; imageQuality?: number; viewer?: "photos" | "book"; badgeLabel?: string }) {
  const [selected, setSelected] = useState<LandingAlbum | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!selected || !dialog.current) return;
    const node = dialog.current;
    const previousOverflow = document.body.style.overflow;
    node.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      node.close();
      document.body.style.overflow = previousOverflow;
      opener.current?.focus({ preventScroll: true });
    };
  }, [selected]);

  function open(album: LandingAlbum, button: HTMLButtonElement) {
    opener.current = button;
    setSelected(album);
    try {
      if (isPublicTrackingPath(window.location.pathname)) track("Wedding Album Opened", { page: window.location.pathname, album: album.id });
    } catch { /* Browsing never depends on analytics. */ }
  }

  function book() {
    setSelected(null);
    requestAnimationFrame(() => {
      const heading = document.getElementById(inquiryAction?.headingId ?? (inquiryAction ? "inq-names" : "booking-title"));
      document.getElementById(inquiryAction?.id ?? "book-a-call")?.scrollIntoView({ behavior: "instant", block: "start" });
      heading?.focus({ preventScroll: true });
    });
  }

  return <>
    <div className={compact ? classes.styleAlbums : classes.weddingAlbums} aria-label={label}>
      {albums.map((album, index) => {
        const count = album.chapters.reduce((sum, chapter) => sum + chapter.photos.length, 0);
        return <button type="button" key={album.id} className={classes.albumCard} onClick={(event) => open(album, event.currentTarget)} aria-haspopup="dialog" aria-label={`Open ${album.title} album, ${count} photographs`}>
          <span className={classes.albumImage}><Image src={album.cover.src} alt={album.cover.alt} fill quality={imageQuality} sizes={viewer === "book" ? "(max-width: 760px) 44vw, (max-width: 1000px) 28vw, (max-width: 1600px) 17vw, 272px" : classes !== styles ? "(max-width: 760px) 90vw, (max-width: 1200px) 44vw, 552px" : compact ? "(max-width: 760px) 65vw, (max-width: 1000px) 30vw, (max-width: 1600px) 17vw, 272px" : "(max-width: 760px) 78vw, (max-width: 1600px) 28vw, 448px"} /><span className={classes.albumBadge}>{badgeLabel} <span aria-hidden="true">↗</span></span></span>
          <span className={classes.albumTopline}><span>{String(index + 1).padStart(2, "0")}</span><span>{count} photographs</span></span>
          <span className={classes.albumTitle}>{album.title}</span>
          <span className={classes.albumSubtitle}>{album.subtitle}</span>
          {album.description ? <span className={classes.albumDescription}>{album.description}</span> : null}
        </button>;
      })}
    </div>
    {selected && <dialog ref={dialog} className={classes.albumDialog} aria-labelledby={`album-title-${selected.id}`} onCancel={(event) => { event.preventDefault(); setSelected(null); }} onClick={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
      <div className={classes.dialogBar}><span>Arman Arai <span className={classes.dialogBarNote}>/ The albums</span></span><button type="button" onClick={() => setSelected(null)} aria-label="Close album">Close <span aria-hidden="true">×</span></button></div>
      <div className={classes.dialogContent}>
        <p className={classes.eyebrow}>From the portfolio</p><h2 id={`album-title-${selected.id}`}>{selected.title}</h2><p>{selected.subtitle}</p>
        {selected.description ? <p>{selected.description}</p> : null}
        {viewer === "book" ? <PortfolioBook key={selected.id} album={selected} /> : selected.chapters.map((chapter, index) => <section key={`${chapter.title}-${index}`} className={classes.albumChapter}>
          <h3>{chapter.title}</h3>
          <div className={classes.albumPhotos}>{chapter.photos.map((photo, photoIndex) => <figure key={`${photo.src}-${photoIndex}`}><Image src={photo.src} alt={photo.alt} width={photo.width ?? 1000} height={photo.height ?? 1400} quality={imageQuality === 68 ? 78 : imageQuality} sizes={classes !== styles ? "(max-width: 760px) 90vw, (max-width: 1200px) 44vw, 512px" : "(max-width: 640px) 90vw, 44vw"} loading="lazy" /></figure>)}</div>
        </section>)}
        <div className={classes.dialogEnd}><h3>Can you picture your day here?</h3><button type="button" className={classes.button} onClick={book}>{inquiryAction?.label ?? "Book a free consultation"} <span aria-hidden="true">↗</span></button><button type="button" className={classes.textButton} onClick={() => setSelected(null)}>Back to the page</button></div>
      </div>
    </dialog>}
  </>;
}
