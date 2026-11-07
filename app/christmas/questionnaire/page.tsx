import type { Metadata } from "next";
import FamilyQuestionnaire from "@/components/christmas/FamilyQuestionnaire";
export const metadata: Metadata = { title: "Your family questionnaire", robots: { index: false, follow: false, nocache: true }, referrer: "no-referrer" };
export default function Page() { return <FamilyQuestionnaire />; }
