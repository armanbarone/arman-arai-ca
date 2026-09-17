"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendInviteAction } from "@/app/admin/actions";
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
      {msg && <span className="text-sm text-blush">{msg}</span>}
    </div>
  );
}
