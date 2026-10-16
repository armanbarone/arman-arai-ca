import type { Metadata } from "next";
import ChristmasExperience from "@/components/christmas/ChristmasExperience";
export const metadata: Metadata = {
  title: "Christmas Family & Santa Photography in North Vancouver · 2026",
  description: "A cozy Christmas photography experience in North Vancouver. One $300 CAD session with Santa included, plus GST/PST, with three styled sets, a mailed Santa letter and printed keepsake. Daily 11 am–8 pm, November 1–December 20.",
  alternates: { canonical: "/christmas" },
  openGraph: { title: "Christmas feels better together | Arman Arai", description: "North Vancouver Christmas photography. $300 with Santa included, plus $15 GST and $21 PST ($336 total).", url: "/christmas", images: [{ url: "/christmas/family-fireside.webp", width: 1536, height: 1024, alt: "AI-generated Christmas set styling concept" }] },
};
export default function ChristmasPage() { return <ChristmasExperience />; }
