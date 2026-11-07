import type { Metadata } from "next";
import ChristmasConfirmation from "@/components/christmas/ChristmasConfirmation";
export const metadata: Metadata = { title: "Sample after-payment page", robots: { index: false, follow: false, nocache: true }, referrer: "no-referrer" };
export default function Page() { return <ChristmasConfirmation preview />; }
