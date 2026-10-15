import type { Metadata } from "next";
import ChristmasExperience from "@/components/christmas/ChristmasExperience";
export const metadata: Metadata = { title: "Christmas sessions · Design preview", robots: { index: false, follow: false }, alternates: { canonical: "/christmas" } };
export default function ChristmasPreviewPage() { return <ChristmasExperience preview />; }
