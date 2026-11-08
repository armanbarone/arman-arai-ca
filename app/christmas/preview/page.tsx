import type { Metadata } from "next";
import ChristmasExperience from "@/components/christmas/ChristmasExperience";
export const metadata: Metadata = {
  title: "Christmas with Santa · North Vancouver · Design preview",
  description: "Christmas session design preview. North Vancouver family and Santa photography, November 9–December 20. Mon–Fri 9–5, Saturday 10–4, Sunday noon–3. Sample bookings only.",
  robots: { index: false, follow: false }, alternates: { canonical: "/christmas" },
  openGraph: { title: "Christmas with Santa · North Vancouver", description: "$250 CAD with Santa included, plus $12.50 GST ($262.50 total). Private design preview.", images: [{ url: "/christmas/family-window-2026.webp?v=clean-1", alt: "A family together beside a snowy forest window" }] },
};
export default function ChristmasPreviewPage() { return <ChristmasExperience preview storybook />; }
