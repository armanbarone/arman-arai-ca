import type { Metadata } from "next";
import ChristmasExperience from "@/components/christmas/ChristmasExperience";
export const metadata: Metadata = {
  referrer: "no-referrer",
  title: "Christmas Family & Santa Photography in North Vancouver · 2026",
  description: "A cozy Christmas photography experience in North Vancouver. One $300 CAD session with Santa included, plus GST, with three styled sets, a mailed Santa letter and printed keepsake. Approximately 45 minutes. November 9–December 20. Optional 10-page albums with 20 photographs, hand-delivered.",
  alternates: { canonical: "/christmas" },
  openGraph: { title: "Christmas feels better together | Arman Arai", description: "North Vancouver Christmas photography. $300 with Santa included, plus $15 GST ($315 total).", url: "/christmas", images: [{ url: "/christmas/family-window-2026.webp?v=protected-1", width: 1200, height: 900, alt: "A family together in the Christmas studio beside a snowy forest window" }] },
};
export default function ChristmasPage() { return <ChristmasExperience />; }
