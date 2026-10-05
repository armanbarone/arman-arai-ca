"use client";
import { useState, useTransition } from "react";
import { saveWeddingDelivery } from "@/app/portal/wedding-actions";
export default function WeddingDeliveryEditor({
  bookingRef,
  initial,
}: {
  bookingRef: string;
  initial: {
    galleryUrl?: string;
    filmUrl?: string;
    galleryExpires?: string;
    deliveryDate?: string;
  };
}) {
  const [data, setData] = useState({
      galleryUrl: initial.galleryUrl || "",
      filmUrl: initial.filmUrl || "",
      galleryExpires: initial.galleryExpires || "",
      deliveryDate: initial.deliveryDate || "",
    }),
    [message, setMessage] = useState(""),
    [pending, start] = useTransition();
  return (
    <div className="wp-card">
      <h2>Gallery & film delivery</h2>
      <div className="wp-form-grid" style={{ marginTop: 20 }}>
        {(
          [
            ["galleryUrl", "Gallery link"],
            ["filmUrl", "Film link"],
            ["galleryExpires", "Gallery access expires"],
            ["deliveryDate", "Actual delivery date"],
          ] as const
        ).map(([k, label]) => (
          <label key={k} className="wp-label">
            {label}
            <input
              type={
                k.includes("Date") || k === "galleryExpires" ? "date" : "url"
              }
              className="wp-input"
              value={data[k]}
              onChange={(e) => setData((v) => ({ ...v, [k]: e.target.value }))}
            />
          </label>
        ))}
      </div>
      <button
        className="wp-button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await saveWeddingDelivery(bookingRef, data);
            setMessage(r.ok ? r.message || "Saved" : r.error);
          })
        }
      >
        Save delivery links
      </button>
      {message && (
        <p className="wp-message" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
