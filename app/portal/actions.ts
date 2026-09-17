"use server";

import { redirect } from "next/navigation";
import { consumeLoginToken, requestLoginLink, safeNext, signOut } from "@/lib/portal/auth";

export async function requestLinkAction(_prev: { sent: boolean } | null, form: FormData): Promise<{ sent: boolean }> {
  const email = String(form.get("email") || "");
  const next = safeNext(String(form.get("next") || ""));
  try {
    await requestLoginLink(email, next);
  } catch (err) {
    // Never reveal failures that could hint whether an address is on file.
    console.error("login link failed", err instanceof Error ? err.message : err);
  }
  return { sent: true };
}

export async function consumeLinkAction(form: FormData) {
  const token = String(form.get("t") || "");
  const dest = await consumeLoginToken(token);
  redirect(dest ?? "/portal/login?expired=1");
}

export async function signOutAction() {
  await signOut();
  redirect("/portal/login");
}
