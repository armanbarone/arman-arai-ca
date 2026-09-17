"use client";

import { useActionState } from "react";
import { requestLinkAction } from "../actions";
import { buttonCls, inputCls, labelCls } from "@/components/portal/Shell";

export default function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(requestLinkAction, null);

  if (state?.sent) {
    return (
      <div className="rounded-sm border border-dust bg-parchment p-6 text-sm leading-relaxed text-blush">
        If that address is on a booking, a sign-in link is on its way. It works once and expires in 15 minutes. Check your spam folder if it has not arrived in a couple of minutes.
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className={labelCls}>Email address</label>
        <input id="email" name="email" type="email" required autoComplete="email" className={inputCls} />
      </div>
      <button className={buttonCls} disabled={pending}>{pending ? "Sending…" : "Email me a sign-in link"}</button>
    </form>
  );
}
