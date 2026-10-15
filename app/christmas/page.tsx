import type { Metadata } from "next";
import ChristmasExperience from "@/components/christmas/ChristmasExperience";
export const metadata: Metadata = {
  title: "Christmas Family & Santa Photography in Vancouver · 2026",
  description: "A cozy Christmas photography experience in Vancouver. Family sessions CAD $300 or a private Santa visit CAD $400, plus tax. Choose your package and time, and book directly.",
  alternates: { canonical: "/christmas" },
  openGraph: { title: "Christmas feels better together | Arman Arai", description: "Vancouver Christmas photography. $300 family sessions or $400 with Santa, plus tax.", url: "/christmas", images: [{ url: "/christmas/family-fireside.webp", width: 1536, height: 1024, alt: "AI-generated Christmas set styling concept" }] },
};
export default function ChristmasPage() { return <ChristmasExperience />; }
