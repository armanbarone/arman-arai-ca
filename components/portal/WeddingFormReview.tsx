"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reviewWeddingForm } from "@/app/portal/wedding-actions";
import { buttonCls } from "./Shell";
export default function WeddingFormReview({
  bookingRef,
  formKey,
}: {
  bookingRef: string;
  formKey: string;
}) {
  const router = useRouter(),
    [message, setMessage] = useState(""),
    [pending, start] = useTransition();
  return (
    <>
      <button
        className={buttonCls}
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await reviewWeddingForm(bookingRef, formKey);
            setMessage(r.ok ? r.message || "Reviewed" : r.error);
            if (r.ok) router.refresh();
          })
        }
      >
        {pending ? "Saving…" : "Mark reviewed"}
      </button>
      {message && <p role="status">{message}</p>}
    </>
  );
}
