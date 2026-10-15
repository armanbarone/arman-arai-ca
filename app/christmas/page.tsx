import type { Metadata } from "next";
import ChristmasExperience from "@/components/christmas/ChristmasExperience";
export const metadata: Metadata = {
  title: "Christmas Family & Santa Photography in Vancouver · 2026",
  description: "Private Christmas family portraits and Santa sessions in Vancouver. Choose your collection and appointment, then reserve directly with secure Stripe checkout. From CAD $249 plus tax.",
  alternates: { canonical: "/christmas" },
  openGraph: { title: "A little Christmas. A lot of you. | Arman Arai", description: "Christmas family and Santa sessions in Vancouver. Collections from CAD $249 plus tax.", url: "/christmas", images: [{ url: "/christmas/family-fireside.webp", width: 1536, height: 1024, alt: "AI-generated Christmas set styling concept" }] },
};
export default function ChristmasPage() { return <ChristmasExperience />; }
