"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import styles from "./vancouver.module.css";

type AlbumPhoto = { src: string; alt: string; width?: number; height?: number };
export type LandingAlbum = {
  id: string;
  title: string;
  subtitle: string;
  cover: AlbumPhoto;
  chapters: { title: string; photos: AlbumPhoto[] }[];
};

/** The same complete image sequences as /portfolio. Images inside a book are
 * only mounted when it opens, so the initial page pays for covers alone. */
export default function AlbumBrowser({ albums, label, compact = false }: { albums: LandingAlbum[]; label: string; compact?: boolean }) {
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
    try { track("Wedding Album Opened", { page: window.location.pathname, album: album.id }); } catch { /* Browsing never depends on analytics. */ }
  }

  function book() {
    setSelected(null);
    requestAnimationFrame(() => {
      const heading = document.getElementById("booking-title");
      document.getElementById("book-a-call")?.scrollIntoView({ behavior: "instant", block: "start" });
      heading?.focus({ preventScroll: true });
    });
  }

  return <>
    <div className={compact ? styles.styleAlbums : styles.weddingAlbums} aria-label={label}>
      {albums.map((album, index) => {
        const count = album.chapters.reduce((sum, chapter) => sum + chapter.photos.length, 0);
        return <button type="button" key={album.id} className={styles.albumCard} onClick={(event) => open(album, event.currentTarget)} aria-haspopup="dialog" aria-label={`Open ${album.title} album, ${count} photographs`}>
          <span className={styles.albumImage}><Image src={album.cover.src} alt={album.cover.alt} fill quality={75} sizes={compact ? "(max-width: 600px) 65vw, (max-width: 1000px) 30vw, 18vw" : "(max-width: 600px) 85vw, 30vw"} /><span className={styles.albumBadge}>View full album <span aria-hidden="true">↗</span></span></span>
          <span className={styles.albumTopline}><span>{String(index + 1).padStart(2, "0")}</span><span>{count} photographs</span></span>
          <span className={styles.albumTitle}>{album.title}</span>
          <span className={styles.albumSubtitle}>{album.subtitle}</span>
        </button>;
      })}
    </div>
    {selected && <dialog ref={dialog} className={styles.albumDialog} aria-labelledby={`album-title-${selected.id}`} onCancel={(event) => { event.preventDefault(); setSelected(null); }} onClick={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
      <div className={styles.dialogBar}><span>Arman Arai <span className={styles.dialogBarNote}>/ The albums</span></span><button type="button" onClick={() => setSelected(null)} aria-label="Close album">Close <span aria-hidden="true">×</span></button></div>
      <div className={styles.dialogContent}>
        <p className={styles.eyebrow}>From the portfolio</p><h2 id={`album-title-${selected.id}`}>{selected.title}</h2><p>{selected.subtitle}</p>
        {selected.chapters.map((chapter, index) => <section key={`${chapter.title}-${index}`} className={styles.albumChapter}>
          <h3>{chapter.title}</h3>
          <div className={styles.albumPhotos}>{chapter.photos.map((photo, photoIndex) => <figure key={`${photo.src}-${photoIndex}`}><Image src={photo.src} alt={photo.alt} width={photo.width ?? 1000} height={photo.height ?? 1400} quality={78} sizes="(max-width: 640px) 90vw, 44vw" loading="lazy" /></figure>)}</div>
        </section>)}
        <div className={styles.dialogEnd}><h3>Can you picture your day here?</h3><button type="button" className={styles.button} onClick={book}>Book a free consultation <span aria-hidden="true">↗</span></button><button type="button" className={styles.textButton} onClick={() => setSelected(null)}>Back to the page</button></div>
      </div>
    </dialog>}
  </>;
}
