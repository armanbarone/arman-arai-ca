"use client";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Booking } from "@/lib/portal/types";
import type { WeddingMedia } from "@/lib/portal/wedding";
import {
  saveWeddingCreativeDirection,
  removeWeddingImage,
} from "@/app/portal/contract-actions";
import { useWeddingBooking, useWeddingPreview } from "./WeddingPreviewProvider";
import { previewImage } from "./preview-images";
import { buttonCls, ghostButtonCls } from "./Shell";
function PortraitPlaceholder() {
  return (
    <svg
      className="wp-portrait-placeholder"
      viewBox="0 0 160 180"
      aria-hidden="true"
    >
      <circle cx="80" cy="60" r="26" />
      <path d="M27 159c0-42 24-61 53-61s53 19 53 61" />
    </svg>
  );
}
export default function WeddingMoodboard({
  booking,
  preview = false,
  compact = false,
}: {
  booking: Booking;
  preview?: boolean;
  compact?: boolean;
}) {
  const b = useWeddingBooking(booking, preview),
    context = useWeddingPreview(),
    router = useRouter();
  const [media, setMedia] = useState<WeddingMedia[]>(b.wedding?.media || []),
    [urls, setUrls] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState({
    direction: b.wedding?.creative?.direction || "",
    palette: b.wedding?.creative?.palette || "",
    priorities: b.wedding?.creative?.priorities || "",
    avoid: b.wedding?.creative?.avoid || "",
  });
  const [revision, setRevision] = useState(
      b.wedding?.creative?.updatedAt || null,
    ),
    [dirty, setDirty] = useState(false),
    [caption, setCaption] = useState(""),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [uploading, setUploading] = useState(""),
    [pending, start] = useTransition();
  useEffect(() => {
    setMedia(b.wedding?.media || []);
    if (!dirty) {
      const c = b.wedding?.creative;
      setNotes({
        direction: c?.direction || "",
        palette: c?.palette || "",
        priorities: c?.priorities || "",
        avoid: c?.avoid || "",
      });
      setRevision(c?.updatedAt || null);
    }
  }, [b, dirty]);
  useEffect(() => {
    if (!preview) return;
    let active = true;
    const created: string[] = [];
    Promise.all(
      media
        .filter((m) => !m.removedAt)
        .map(async (m) => {
          const image = await previewImage(m.id);
          if (!image) return null;
          const url = URL.createObjectURL(image);
          created.push(url);
          return [m.id, url] as const;
        }),
    )
      .then((items) => {
        if (active)
          setUrls(Object.fromEntries(items.filter((v) => v !== null)));
      })
      .catch(() => {});
    return () => {
      active = false;
      for (const url of created) URL.revokeObjectURL(url);
    };
  }, [media, preview]);
  const src = (m: WeddingMedia) =>
    preview
      ? urls[m.id]
      : `/api/portal/wedding-media?ref=${encodeURIComponent(b.ref)}&id=${encodeURIComponent(m.id)}`;
  async function upload(kind: WeddingMedia["kind"], file?: File) {
    if (!file) return;
    setError("");
    setMessage("");
    if (
      !/^image\/(jpeg|png|webp)$/.test(file.type) ||
      file.size > 3 * 1024 * 1024
    ) {
      setError("Choose a JPG, PNG or WebP up to 3 MB.");
      return;
    }
    setUploading(kind);
    try {
      let image: WeddingMedia;
      if (preview && context) {
        if (
          kind === "moodboard" &&
          media.filter((m) => m.kind === kind && !m.removedAt).length >= 24
        )
          throw new Error("Remove a moodboard image before adding another.");
        const id = crypto.randomUUID(),
          at = new Date().toISOString();
        await previewImage(id, file);
        image = {
          id,
          kind,
          key: "",
          caption: kind === "moodboard" ? caption : "",
          contentType: file.type,
          uploadedBy: context.email,
          createdAt: at,
        };
        context.update((next) => {
          const list = (next.wedding!.media ??= []);
          if (kind !== "moodboard")
            for (const m of list) if (m.kind === kind) m.removedAt = at;
          list.push(image);
        });
      } else {
        const body = new FormData();
        body.append("file", file);
        body.append("kind", kind);
        body.append("caption", kind === "moodboard" ? caption : "");
        const response = await fetch(
          `/api/portal/wedding-media?ref=${encodeURIComponent(b.ref)}`,
          { method: "POST", body },
        );
        const data = await response.json();
        if (!response.ok)
          throw new Error(
            data.error ||
              "Upload failed. Sign in again or try a different image.",
          );
        image = data.image;
        setMedia((old) => [
          ...old.map((m) =>
            kind !== "moodboard" && m.kind === kind
              ? { ...m, removedAt: image.createdAt }
              : m,
          ),
          image,
        ]);
        router.refresh();
      }
      setCaption("");
      setMessage(
        preview
          ? "Photo added to this browser's sample preview. No real booking was changed."
          : "Photo added. Shared privately with you, your partner and Arman.",
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "The photo could not be uploaded. Please try again.",
      );
    } finally {
      setUploading("");
    }
  }
  function remove(id: string) {
    setError("");
    if (preview && context) {
      context.update((next) => {
        const m = next.wedding!.media?.find((m) => m.id === id);
        if (m) m.removedAt = new Date().toISOString();
      });
      return;
    }
    start(async () => {
      const r = await removeWeddingImage(b.ref, id);
      if (!r.ok) setError(r.error);
      else {
        setMedia((old) => old.filter((m) => m.id !== id));
        setMessage(r.message);
        router.refresh();
      }
    });
  }
  function save() {
    setError("");
    setMessage("");
    if (preview && context) {
      const at = new Date().toISOString();
      context.update((next) => {
        next.wedding!.creative = {
          ...notes,
          updatedAt: at,
          actor: context.email,
        };
      });
      setRevision(at);
      setDirty(false);
      setMessage("Creative direction saved in the sample preview.");
      return;
    }
    start(async () => {
      const r = await saveWeddingCreativeDirection(b.ref, notes, revision);
      if (!r.ok) setError(r.error);
      else {
        setRevision(r.updatedAt || null);
        setDirty(false);
        setMessage(r.message);
        router.refresh();
      }
    });
  }
  function picker(kind: WeddingMedia["kind"], label: string) {
    return (
      <label className={`${ghostButtonCls} wp-upload-label`}>
        {uploading === kind ? "Uploading…" : label}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={!!uploading || pending}
          aria-label={label}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            void upload(kind, file);
          }}
        />
      </label>
    );
  }
  return (
    <div className={`wp-moodboard ${compact ? "wp-moodboard-compact" : ""}`}>
      {!compact && (
        <>
          <p className="wp-eyebrow">Made around the two of you</p>
          <h1>Your people & moodboard</h1>
          <p className="wp-lead">
            Introduce yourselves, collect what you love and give Arman a feel
            for your wedding.
          </p>
        </>
      )}
      <section className="wp-builder-section">
        <h2>The two of you</h2>
        <p className="wp-muted">
          Add a photo of each of you. These are private planning references.
        </p>
        <div className="wp-people-grid">
          {b.clients.map((c, i) => {
            const kind = `portrait-${i + 1}` as WeddingMedia["kind"],
              image = media.find((m) => m.kind === kind && !m.removedAt);
            return (
              <div className="wp-card wp-person-card" key={c.id}>
                <div className="wp-person-photo">
                  {image && src(image) ? (
                    <img
                      src={src(image)}
                      alt={`${c.preferredName || c.legalName}, wedding planning reference`}
                    />
                  ) : (
                    <PortraitPlaceholder />
                  )}
                </div>
                <h3>{c.preferredName || c.legalName || `Partner ${i + 1}`}</h3>
                <p>{c.legalName}</p>
                <div className="wp-toolbar">
                  {picker(
                    kind,
                    image
                      ? `Replace ${c.preferredName || "partner"}'s photo`
                      : `Upload ${c.preferredName || "partner"}'s photo`,
                  )}
                  {image && (
                    <button
                      className="wp-text-button"
                      onClick={() => remove(image.id)}
                    >
                      Remove photo
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
      {!compact && (
        <>
          <section className="wp-card wp-builder-section">
            <div className="wp-section-title">
              <h2>Your shared moodboard</h2>
              <span className="wp-badge">
                {
                  media.filter((m) => m.kind === "moodboard" && !m.removedAt)
                    .length
                }{" "}
                / 24 images
              </span>
            </div>
            <p>
              Light, colour, portraits, details or a feeling you love. Add your
              own images and a note about what draws you to them.
            </p>
            <div className="wp-moodboard-upload">
              <label className="wp-label">
                Note for your next image
                <input
                  className="wp-input"
                  maxLength={500}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="For example, the soft light or relaxed composition"
                />
              </label>
              {picker("moodboard", "Add moodboard image")}
            </div>
            <p className="wp-muted">
              JPG, PNG or WebP · up to 3 MB each. Shared with you, your partner
              and Arman.
            </p>
            <div className="wp-moodboard-grid">
              {media
                .filter((m) => m.kind === "moodboard" && !m.removedAt)
                .map((m) => (
                  <figure className="wp-moodboard-tile" key={m.id}>
                    {src(m) ? (
                      <img
                        src={src(m)}
                        alt={m.caption || "Couple's moodboard reference"}
                      />
                    ) : (
                      <div className="wp-photo-empty">Your reference</div>
                    )}
                    <figcaption>{m.caption || "Creative reference"}</figcaption>
                    <button
                      className="wp-text-button"
                      disabled={pending}
                      onClick={() => remove(m.id)}
                      aria-label={`Remove reference ${m.caption || m.id}`}
                    >
                      Remove from board
                    </button>
                  </figure>
                ))}
              {!media.some((m) => m.kind === "moodboard" && !m.removedAt) &&
                ["The light", "The feeling", "The details"].map((title) => (
                  <div className="wp-moodboard-tile wp-photo-empty" key={title}>
                    <span>＋</span>
                    <h3>{title}</h3>
                    <p>Add an image you love.</p>
                  </div>
                ))}
            </div>
          </section>
          <section className="wp-card wp-builder-section">
            <h2>Your creative direction</h2>
            <div className="wp-form-grid" style={{ marginTop: 20 }}>
              {(
                [
                  ["direction", "The overall feeling"],
                  ["palette", "Colours and textures"],
                  ["priorities", "People and moments that matter"],
                  ["avoid", "Anything you want to avoid"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="wp-label">
                  {label}
                  <textarea
                    className="wp-input"
                    rows={3}
                    maxLength={5000}
                    value={notes[key]}
                    onChange={(e) => {
                      setDirty(true);
                      setNotes((old) => ({ ...old, [key]: e.target.value }));
                    }}
                  />
                </label>
              ))}
            </div>
            <button
              className={buttonCls}
              disabled={pending || !dirty}
              onClick={save}
            >
              {pending ? "Saving…" : "Save creative direction"}
            </button>
          </section>
        </>
      )}
      {message && (
        <div className="wp-message" role="status">
          {message}
        </div>
      )}
      {error && (
        <div className="wp-message wp-message-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
