import type { Metadata } from "next";
import { getCart } from "@/lib/christmas/cart";
import { dateLabel } from "@/lib/christmas/catalog";
export const metadata: Metadata = { title: "Continue planning your Christmas visit", robots: { index: false, follow: false }, referrer: "no-referrer" };
export const dynamic = "force-dynamic";
export default async function ReturnToCart({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const p = await searchParams, cart = p.id && p.token ? await getCart(p.id, p.token) : null;
  const date = cart?.slotId.split("_")[0];
  return <main style={{ maxWidth: 560, margin: "80px auto", padding: 24, fontFamily: "Georgia,serif", color: "#294534" }}><p>CHRISTMAS AT ARMAN’S</p><h1>Let’s find your Christmas moment.</h1>{date && <p>You were planning a visit on {dateLabel(date)}{cart?.albums ? ` with ${cart.albums} printed album${cart.albums > 1 ? "s" : ""}` : ""}.</p>}<p>Your earlier checkout has ended. Please check current availability and choose a new checkout window. The original appointment may have been taken.</p><p><a href={cart ? `/christmas?date=${date}&albums=${cart.albums}#booking` : "/christmas#booking"}>Check current availability ↗</a></p><p>Already paid? Use the confirmation link in your booking email. Contact <a href="mailto:i@armanarai.com">Arman</a> before paying again.</p></main>;
}
