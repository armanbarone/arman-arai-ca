import type { Metadata } from "next";
import ChristmasConfirmation from "@/components/christmas/ChristmasConfirmation";
export const metadata: Metadata = { title: "Christmas booking confirmation", robots: { index: false, follow: false, nocache: true }, referrer: "no-referrer" };
export default function ConfirmationPage() { return <ChristmasConfirmation />; }
