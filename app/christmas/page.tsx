import type { Metadata } from "next";
import ChristmasExperience from "@/components/christmas/ChristmasExperience";
export const metadata: Metadata = {
  referrer: "no-referrer",
  title: "Christmas Family & Santa Photography in North Vancouver · 2026",
  description: "Christmas photos with Santa for families with kids in North Vancouver. $250 CAD plus GST ($262.50 total), 30 minutes, three Christmas sets and 10 edited digital photos. Only 50 family sessions, December 1–14, 2026. Reserve with a $50 deposit; Arman personally arranges your appointment. Optional printed albums available.",
  alternates: { canonical: "/christmas" },
  openGraph: { title: "Christmas photos with Santa · North Vancouver | Arman Arai", description: "For families with kids. 30 minutes, three Christmas sets and 10 edited digital photos. $250 CAD + GST ($262.50 total). Only 50 family sessions, December 1–14. Reserve with $50; schedule personally with Arman.", url: "/christmas", images: [{ url: "/christmas/family-window-2026.webp?v=clean-1", width: 1200, height: 900, alt: "A family together in the Christmas studio beside a snowy forest window" }] },
};
export default function ChristmasPage() { return <ChristmasExperience simple />; }
