import type { Metadata } from "next";
import ChristmasExperience from "@/components/christmas/ChristmasExperience";
export const metadata: Metadata = {
  title: "Christmas with Santa · North Vancouver · Design preview",
  description: "Private design preview: one $300 CAD Christmas session with Santa, plus $15 GST and $21 PST ($336 total). North Vancouver. Every day 11 am–8 pm, November 1–December 20.",
  robots: { index: false, follow: false }, alternates: { canonical: "/christmas" },
  openGraph: { title: "Christmas with Santa · North Vancouver", description: "$300 CAD with Santa included, plus $15 GST and $21 PST ($336 total). Private design preview.", images: [{ url: "/christmas/family-fireside.webp", alt: "AI-generated Christmas styling concept" }] },
};
export default function ChristmasPreviewPage() { return <ChristmasExperience preview />; }
