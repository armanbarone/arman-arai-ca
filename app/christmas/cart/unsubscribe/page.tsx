import type { Metadata } from "next";
import { getCart, unsubscribeCart } from "@/lib/christmas/cart";
import { redirect } from "next/navigation";
export const metadata: Metadata = { title: "Checkout reminder preferences", robots: { index: false, follow: false }, referrer: "no-referrer" };
export const dynamic = "force-dynamic";
async function unsubscribe(form: FormData) {
  "use server";
  await unsubscribeCart(String(form.get("id") || ""), String(form.get("token") || ""));
  redirect("/christmas/cart/unsubscribe?done=1");
}
export default async function Unsubscribe({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const p = await searchParams, cart = p.id && p.token ? await getCart(p.id, p.token) : null;
  return <main style={{ maxWidth: 560, margin: "80px auto", padding: 24, fontFamily: "Georgia,serif", color: "#294534" }}><p>CHRISTMAS AT ARMAN’S</p><h1>{p.done === "1" ? "Reminders switched off." : "Stop checkout reminders?"}</h1>{p.done === "1" ? <p>You won’t receive more Christmas checkout reminders for this email. Booking confirmations and receipts are unaffected.</p> : cart?.email ? <form action={unsubscribe}><p>Stop all Christmas checkout reminder emails. Your booking status will stay the same.</p><input type="hidden" name="id" value={p.id} /><input type="hidden" name="token" value={p.token} /><button style={{ padding: 14, background: "#294534", color: "white", border: 0 }}>Unsubscribe from reminders</button></form> : <p>Open the unsubscribe link in your reminder email, or contact <a href="mailto:i@armanarai.com">i@armanarai.com</a>.</p>}<p><a href="/christmas">Back to Christmas sessions ↗</a></p></main>;
}
