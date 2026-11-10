"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { emailDraftScopeAction, sendInviteAction } from "@/app/admin/actions";
import { ghostButtonCls } from "@/components/portal/Shell";

export default function InviteButtons({ bookingRef, emails }: { bookingRef: string; emails: string[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <div className="flex flex-wrap items-center gap-3">
      {emails.map((email) => (
        <button
          key={email}
          className={ghostButtonCls}
          disabled={pending}
          onClick={() => start(async () => {
            const res = await sendInviteAction(bookingRef, email);
            setMsg(res.ok ? `Invite sent to ${email}` : res.error ?? "Failed");
            if (res.ok) router.refresh();
          })}
        >
          Invite {email}
        </button>
      ))}
      {/* The commercial half of the contract, for a couple to read before
          anything is issued. Confirmed because it reaches the client. */}
      <button
        className={ghostButtonCls}
        disabled={pending || emails.length === 0}
        onClick={() => {
          if (
            !confirm(
              `Email the draft collection, scope, price and payment schedule to ${emails.join(" and ")}? It says plainly that nothing is agreed.`,
            )
          )
            return;
          start(async () => {
            const res = await emailDraftScopeAction(bookingRef);
            setMsg(res.ok ? (res.message ?? "Sent") : (res.error ?? "Failed"));
            if (res.ok) router.refresh();
          });
        }}
      >
        Email the draft for review
      </button>
      {msg && <span className="text-sm text-blush">{msg}</span>}
    </div>
  );
}
